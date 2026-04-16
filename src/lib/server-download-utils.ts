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

// SSRF protection: reject non-http(s) schemes and private/loopback/link-local IPs
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

interface CobaltResponse {
    status: "stream" | "redirect" | "picker" | "error";
    url?: string;
    text?: string;
}

const COBALT_INSTANCES = [
    "https://dl01.yt-dl.click",
    "https://dl02.yt-dl.click",
    "https://cobalt.fariz.dev",
    "https://ytapi.edd1e.xyz",
    "http://135.181.27.83:9000",
    "https://nyc1.coapi.ggtyler.dev",
    "https://api.cobalt.tools"
];

export async function downloadWithCobalt(url: string, retryCount = 0, options = { isAudioOnly: true }): Promise<{ buffer: Buffer; filename: string }> {
    const baseUrl = COBALT_INSTANCES[retryCount % COBALT_INSTANCES.length];
    console.log(`[Cobalt] Trying ${baseUrl}... (Attempt ${retryCount + 1}/${COBALT_INSTANCES.length + 2})`);

    try {
        const response = await axios.post(`${baseUrl}/api/json`, {
            url,
            filenamePattern: "classic",
            aFormat: "mp3",
            isAudioOnly: options.isAudioOnly
        }, {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            timeout: 60000
        });

        if (response.data.status === "error" || (!response.data.url && response.data.status !== "picker")) {
            throw new Error(response.data.text || "Cobalt error");
        }

        const downloadUrl = response.data.url || (response.data.picker && response.data.picker[0] && response.data.picker[0].url);

        if (!downloadUrl) {
            throw new Error("No download URL found in Cobalt response");
        }

        const fileResponse = await axios.get(downloadUrl, { responseType: 'arraybuffer', timeout: 120000 });
        return { buffer: Buffer.from(fileResponse.data), filename: "audio.mp3" };
    } catch (error: any) {
        console.error(`[Cobalt] ${baseUrl} failed: ${error.message}`);
        if (retryCount < COBALT_INSTANCES.length * 2) {
            return downloadWithCobalt(url, retryCount + 1, options);
        }
        throw error;
    }
}

function runFfmpeg(args: string[]): Promise<void> {
    // Lazy require so Next.js server bundle leaves ffmpeg-static as external
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

// Whisper hard limit is 25MB. If file already fits, skip ffmpeg entirely.
// If too large, compress heavily to 16kHz mono 32kbps mp3.
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

export async function getVideoInfo(url: string) {
    const platform = detectPlatform(url);
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
    return { title: `Download from ${platform}`, author: "Unknown", duration: 0 };
}

export async function downloadAudio(url: string): Promise<{ buffer: Buffer; filename: string }> {
    await validatePublicUrl(url);
    const resolvedUrl = await expandUrl(url);
    const platform = detectPlatform(resolvedUrl);

    if (platform === "youtube") {
        try {
            console.log("[Audio] Attempting ytdl-core...");
            const info = await ytdl.getBasicInfo(resolvedUrl);
            const title = info.videoDetails.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

            const stream = ytdl(resolvedUrl, {
                filter: 'audioonly',
                quality: 'lowestaudio',
                requestOptions: {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                    }
                }
            });

            const buffer = await Promise.race([
                streamToBuffer(stream as unknown as Readable),
                new Promise<never>((_, reject) => setTimeout(() => reject(new Error("ytdl timeout")), 60000))
            ]);

            const optimizedBuffer = await optimizeAudio(buffer);
            return { buffer: optimizedBuffer, filename: `${title}.mp3` };
        } catch (error: any) {
            console.error(`[Audio] ytdl-core failed:`, error.message);
        }
    }

    console.log(`[Audio] Falling back to Cobalt...`);
    let cobaltResult;
    try {
        cobaltResult = await downloadWithCobalt(resolvedUrl, 0, { isAudioOnly: true });
    } catch {
        console.log(`[Audio] Cobalt audio-only failed, trying video mode...`);
        cobaltResult = await downloadWithCobalt(resolvedUrl, 0, { isAudioOnly: false });
    }

    const optimizedBuffer = await optimizeAudio(cobaltResult.buffer);
    return { buffer: optimizedBuffer, filename: cobaltResult.filename };
}
