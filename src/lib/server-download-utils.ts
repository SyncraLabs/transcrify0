import ytdl from "@distube/ytdl-core";
import { Readable } from "stream";
import axios from "axios";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import dns from "dns/promises";
import net from "net";

export async function streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
}

export type Platform = "youtube" | "instagram" | "tiktok" | "other";

export function detectPlatform(url: string): Platform {
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
    if (url.includes("instagram.com")) return "instagram";
    if (url.includes("tiktok.com")) return "tiktok";
    return "other";
}

function isPrivateIp(ip: string): boolean {
    if (net.isIP(ip) === 0) return false;
    if (net.isIP(ip) === 4) {
        const parts = ip.split(".").map(Number);
        const [a, b] = parts;
        if (a === 10) return true;
        if (a === 127) return true;
        if (a === 169 && b === 254) return true;
        if (a === 172 && b >= 16 && b <= 31) return true;
        if (a === 192 && b === 168) return true;
        if (a === 0) return true;
        if (a >= 224) return true;
        return false;
    }
    const lower = ip.toLowerCase();
    if (lower === "::1" || lower === "::") return true;
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
    if (lower.startsWith("fe80")) return true;
    if (lower.startsWith("::ffff:")) return isPrivateIp(lower.replace("::ffff:", ""));
    return false;
}

export async function validatePublicUrl(url: string): Promise<void> {
    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        throw new Error("Invalid URL");
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error("Only http/https URLs are allowed");
    }
    const hostname = parsed.hostname;
    if (!hostname || hostname === "localhost") {
        throw new Error("URL hostname is not allowed");
    }
    if (net.isIP(hostname) !== 0) {
        if (isPrivateIp(hostname)) {
            throw new Error("URL points to a private or loopback address");
        }
        return;
    }
    try {
        const addresses = await dns.lookup(hostname, { all: true });
        for (const addr of addresses) {
            if (isPrivateIp(addr.address)) {
                throw new Error("URL resolves to a private or loopback address");
            }
        }
    } catch (e: any) {
        if (e?.message?.includes("private")) throw e;
        throw new Error(`Failed to resolve hostname: ${hostname}`);
    }
}

export async function expandUrl(url: string): Promise<string> {
    if (!url.includes("vm.tiktok.com") && !url.includes("vt.tiktok.com") && !url.includes("youtu.be")) {
        return url;
    }

    try {
        const response = await axios.head(url, {
            maxRedirects: 10,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
        const finalUrl = response.request.res.responseUrl || url;
        if (finalUrl !== url) await validatePublicUrl(finalUrl);
        return finalUrl;
    } catch {
        return url;
    }
}

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Cobalt v11 API. Public instances typically require either Turnstile (browser-only)
// or an API key. For reliable production use, self-host Cobalt and set COBALT_API_URL
// (plus COBALT_API_KEY if you configured API_KEY_URL on your instance).
function getCobaltInstances(): string[] {
    const envUrl = process.env.COBALT_API_URL?.trim();
    const defaults = [
        "https://cobalt-backend.canine.tools",
        "https://cobalt-api.meowing.de",
        "https://capi.3kh0.net",
    ];
    if (envUrl) {
        return [envUrl.replace(/\/$/, ""), ...defaults.filter(d => d !== envUrl.replace(/\/$/, ""))];
    }
    return defaults;
}

interface CobaltV11Response {
    status: "tunnel" | "redirect" | "picker" | "error" | "local-processing";
    url?: string;
    filename?: string;
    picker?: Array<{ url?: string; type?: string }>;
    error?: { code?: string; context?: any };
}

export async function downloadWithCobalt(url: string, options = { isAudioOnly: true }): Promise<{ buffer: Buffer; filename: string }> {
    const instances = getCobaltInstances();
    const apiKey = process.env.COBALT_API_KEY?.trim();
    let lastError: Error | null = null;

    for (let i = 0; i < instances.length; i++) {
        const baseUrl = instances[i];
        console.log(`[Cobalt] Trying ${baseUrl} (${i + 1}/${instances.length})`);

        try {
            const headers: Record<string, string> = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "User-Agent": UA,
            };
            if (apiKey) headers["Authorization"] = `Api-Key ${apiKey}`;

            const payload = options.isAudioOnly
                ? { url, downloadMode: "audio", audioFormat: "mp3", filenameStyle: "basic" }
                : { url, downloadMode: "auto", filenameStyle: "basic" };

            const response = await axios.post<CobaltV11Response>(baseUrl + "/", payload, {
                headers,
                timeout: 60000,
                validateStatus: () => true,
            });

            if (response.status === 401 || response.status === 403) {
                lastError = new Error(`Cobalt auth required at ${baseUrl} (set COBALT_API_URL + COBALT_API_KEY to your self-hosted instance)`);
                continue;
            }

            const data = response.data;
            if (!data || data.status === "error") {
                lastError = new Error(`Cobalt error at ${baseUrl}: ${data?.error?.code || "unknown"}`);
                continue;
            }

            let downloadUrl: string | undefined;
            let suggestedName = "audio.mp3";

            if (data.status === "tunnel" || data.status === "redirect") {
                downloadUrl = data.url;
                if (data.filename) suggestedName = data.filename;
            } else if (data.status === "picker" && data.picker && data.picker.length > 0) {
                downloadUrl = data.picker[0].url;
            }

            if (!downloadUrl) {
                lastError = new Error(`Cobalt returned no download URL at ${baseUrl}`);
                continue;
            }

            const fileResponse = await axios.get(downloadUrl, {
                responseType: "arraybuffer",
                timeout: 120000,
                headers: { "User-Agent": UA },
            });

            return { buffer: Buffer.from(fileResponse.data), filename: suggestedName };
        } catch (error: any) {
            console.error(`[Cobalt] ${baseUrl} failed: ${error.message}`);
            lastError = error;
        }
    }

    throw lastError || new Error("All Cobalt instances failed");
}

// tikwm.com is a free public TikTok extractor (no auth). Used as primary TikTok path
// because Cobalt public instances now require API keys.
async function downloadFromTikwm(url: string): Promise<{ buffer: Buffer; filename: string; title?: string; author?: string }> {
    const apiResponse = await axios.get("https://www.tikwm.com/api/", {
        params: { url, hd: 1 },
        headers: { "User-Agent": UA },
        timeout: 30000,
    });

    const data = apiResponse.data?.data;
    if (!data) {
        throw new Error(`tikwm returned no data: ${apiResponse.data?.msg || "unknown"}`);
    }

    const mediaUrl: string | undefined = data.music || data.play || data.wmplay;
    if (!mediaUrl) {
        throw new Error("tikwm response missing media URL");
    }

    const fileResponse = await axios.get(mediaUrl, {
        responseType: "arraybuffer",
        timeout: 120000,
        headers: { "User-Agent": UA },
    });

    return {
        buffer: Buffer.from(fileResponse.data),
        filename: data.music ? "audio.mp3" : "video.mp4",
        title: data.title,
        author: data.author?.nickname || data.author?.unique_id,
    };
}

function runFfmpeg(args: string[]): Promise<void> {
    const ffmpegPath: string | null = require("ffmpeg-static");
    if (!ffmpegPath) {
        return Promise.reject(new Error("ffmpeg-static binary not found"));
    }
    return new Promise((resolve, reject) => {
        const proc = spawn(ffmpegPath, args, { stdio: "ignore" });
        proc.on("error", reject);
        proc.on("close", (code) => {
            if (code === 0) resolve();
            else reject(new Error(`ffmpeg exited with code ${code}`));
        });
    });
}

export async function optimizeAudio(buffer: Buffer): Promise<Buffer> {
    const MAX_BYTES = 24 * 1024 * 1024;
    if (buffer.length < MAX_BYTES) {
        return buffer;
    }

    const tempDir = os.tmpdir();
    const inputPath = path.join(tempDir, `input_${Date.now()}.bin`);
    const outputPath = path.join(tempDir, `output_${Date.now()}.mp3`);

    try {
        fs.writeFileSync(inputPath, buffer);
        console.log(`[Audio] Compressing large file: ${Math.round(buffer.length / 1024 / 1024)}MB`);
        await runFfmpeg(["-y", "-i", inputPath, "-vn", "-ar", "16000", "-ac", "1", "-ab", "32k", "-f", "mp3", outputPath]);
        const optimizedBuffer = fs.readFileSync(outputPath);
        console.log(`[Audio] Optimized size: ${Math.round(optimizedBuffer.length / 1024 / 1024)}MB`);
        return optimizedBuffer;
    } catch (error: any) {
        console.error("[Audio] Optimization failed:", error.message);
        return buffer;
    } finally {
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    }
}

async function getInfoFromYtdlpService(url: string) {
    const baseUrl = process.env.YTDLP_SERVICE_URL?.replace(/\/$/, "");
    const secret = process.env.YTDLP_SERVICE_SECRET || "";
    if (!baseUrl) return null;
    try {
        const response = await axios.post(
            baseUrl + "/info",
            { url },
            { timeout: 30000, headers: { "Content-Type": "application/json", "x-auth": secret } },
        );
        if (response.data && !response.data.error) {
            return {
                title: response.data.title || `Download from ${detectPlatform(url)}`,
                author: response.data.author || "Unknown",
                duration: response.data.duration || 0,
            };
        }
    } catch (e) {
        console.error("[Info] ytdlp service failed:", (e as Error).message);
    }
    return null;
}

export async function getVideoInfo(url: string) {
    const platform = detectPlatform(url);
    const fromService = await getInfoFromYtdlpService(url);
    if (fromService) return fromService;
    if (platform === "youtube") {
        try {
            const info = await ytdl.getBasicInfo(url);
            return {
                title: info.videoDetails.title,
                author: info.videoDetails.author.name,
                duration: parseInt(info.videoDetails.lengthSeconds) || 0,
            };
        } catch (e) {
            console.error("[Info] ytdl.getBasicInfo failed:", (e as Error).message);
        }
    }
    if (platform === "tiktok") {
        try {
            const resolved = await expandUrl(url);
            const apiResponse = await axios.get("https://www.tikwm.com/api/", {
                params: { url: resolved, hd: 1 },
                headers: { "User-Agent": UA },
                timeout: 15000,
            });
            const data = apiResponse.data?.data;
            if (data) {
                return {
                    title: data.title || "TikTok video",
                    author: data.author?.nickname || data.author?.unique_id || "Unknown",
                    duration: data.duration || 0,
                };
            }
        } catch (e) {
            console.error("[Info] tikwm failed:", (e as Error).message);
        }
    }
    return { title: `Download from ${platform}`, author: "Unknown", duration: 0 };
}

function normalizeAudioFilename(filename: string): string {
    const supported = ["flac", "m4a", "mp3", "mp4", "mpeg", "mpga", "oga", "ogg", "wav", "webm"];
    const dot = filename.lastIndexOf(".");
    const ext = dot >= 0 ? filename.slice(dot + 1).toLowerCase() : "";
    if (ext && supported.includes(ext)) return "audio." + ext;
    return "audio.mp3";
}

async function downloadViaYtdlpService(url: string): Promise<{ buffer: Buffer; filename: string }> {
    const baseUrl = process.env.YTDLP_SERVICE_URL?.replace(/\/$/, "");
    const secret = process.env.YTDLP_SERVICE_SECRET || "";
    if (!baseUrl) throw new Error("YTDLP_SERVICE_URL not configured");

    const response = await axios.post(
        baseUrl + "/download",
        { url },
        {
            responseType: "arraybuffer",
            timeout: 240000,
            validateStatus: () => true,
            headers: { "Content-Type": "application/json", "x-auth": secret },
        },
    );
    if (response.status !== 200) {
        let detail = "";
        try { detail = JSON.parse(Buffer.from(response.data).toString("utf8")).detail || ""; } catch {}
        throw new Error(`ytdlp service ${response.status}: ${detail.slice(0, 200)}`);
    }
    return { buffer: Buffer.from(response.data), filename: "audio.mp3" };
}

export async function downloadAudio(url: string): Promise<{ buffer: Buffer; filename: string }> {
    await validatePublicUrl(url);
    const resolvedUrl = await expandUrl(url);
    const platform = detectPlatform(resolvedUrl);
    const errors: string[] = [];
    const hasYtdlpService = !!process.env.YTDLP_SERVICE_URL?.trim();
    const hasSelfHostedCobalt = !!process.env.COBALT_API_URL?.trim();

    if (hasYtdlpService) {
        try {
            console.log("[Audio] Self-hosted yt-dlp service (primary)");
            const result = await downloadViaYtdlpService(resolvedUrl);
            const optimizedBuffer = await optimizeAudio(result.buffer);
            return { buffer: optimizedBuffer, filename: result.filename };
        } catch (error: any) {
            console.error("[Audio] yt-dlp service failed:", error.message);
            errors.push(`ytdlp-service: ${error.message}`);
        }
    }

    if (hasSelfHostedCobalt) {
        try {
            console.log("[Audio] Self-hosted Cobalt (secondary)");
            let cobaltResult;
            try {
                cobaltResult = await downloadWithCobalt(resolvedUrl, { isAudioOnly: true });
            } catch {
                console.log("[Audio] Cobalt audio-only failed, retrying with auto mode");
                cobaltResult = await downloadWithCobalt(resolvedUrl, { isAudioOnly: false });
            }
            const optimizedBuffer = await optimizeAudio(cobaltResult.buffer);
            return { buffer: optimizedBuffer, filename: normalizeAudioFilename(cobaltResult.filename) };
        } catch (error: any) {
            console.error("[Audio] Cobalt failed:", error.message);
            errors.push(`cobalt: ${error.message}`);
        }
    }

    if (platform === "youtube") {
        try {
            console.log("[Audio] YouTube → ytdl-core");
            const info = await ytdl.getBasicInfo(resolvedUrl);
            const title = info.videoDetails.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();

            const stream = ytdl(resolvedUrl, {
                filter: "audioonly",
                quality: "lowestaudio",
                requestOptions: {
                    headers: { "User-Agent": UA },
                },
            });

            const buffer = await Promise.race([
                streamToBuffer(stream as unknown as Readable),
                new Promise<never>((_, reject) => setTimeout(() => reject(new Error("ytdl timeout")), 60000)),
            ]);

            const optimizedBuffer = await optimizeAudio(buffer);
            return { buffer: optimizedBuffer, filename: `${title || "audio"}.mp3` };
        } catch (error: any) {
            console.error("[Audio] ytdl-core failed:", error.message);
            errors.push(`ytdl: ${error.message}`);
        }
    }

    if (platform === "tiktok") {
        try {
            console.log("[Audio] TikTok → tikwm");
            const result = await downloadFromTikwm(resolvedUrl);
            const optimizedBuffer = await optimizeAudio(result.buffer);
            return { buffer: optimizedBuffer, filename: normalizeAudioFilename(result.filename) };
        } catch (error: any) {
            console.error("[Audio] tikwm failed:", error.message);
            errors.push(`tikwm: ${error.message}`);
        }
    }

    if (!hasSelfHostedCobalt) {
        console.log("[Audio] Falling back to public Cobalt");
        try {
            let cobaltResult;
            try {
                cobaltResult = await downloadWithCobalt(resolvedUrl, { isAudioOnly: true });
            } catch {
                cobaltResult = await downloadWithCobalt(resolvedUrl, { isAudioOnly: false });
            }
            const optimizedBuffer = await optimizeAudio(cobaltResult.buffer);
            return { buffer: optimizedBuffer, filename: normalizeAudioFilename(cobaltResult.filename) };
        } catch (error: any) {
            errors.push(`cobalt-public: ${error.message}`);
        }
    }

    const hint = platform === "instagram"
        ? "Instagram extraction needs a self-hosted Cobalt instance. Set COBALT_API_URL in your env vars."
        : "All download strategies failed. If this is a private/deleted post, check the URL.";
    throw new Error(`Could not download audio. ${hint} [${errors.join(" | ")}]`);
}
