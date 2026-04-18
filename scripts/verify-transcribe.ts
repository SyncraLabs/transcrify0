/**
 * Verify transcription pipeline for YouTube / TikTok / Instagram.
 *
 * Usage:
 *   npx tsx scripts/verify-transcribe.ts                   # hits $TARGET (default: prod)
 *   TARGET=http://localhost:3000 npx tsx scripts/verify-transcribe.ts
 *   npx tsx scripts/verify-transcribe.ts --unit            # exercises downloadAudio directly (local network)
 */

import axios from "axios";

const BASE_URL = process.env.TARGET?.replace(/\/$/, "") || "https://transcrify.vercel.app";
const UNIT_MODE = process.argv.includes("--unit");

type Target = { platform: string; url: string };

const TARGETS: Target[] = [
    { platform: "youtube (captura)", url: "https://www.youtube.com/watch?v=z9CwM-DAe5Q" },
    { platform: "youtube-shorts", url: "https://www.youtube.com/shorts/aqz-KE-bpKQ" },
    { platform: "tiktok", url: "https://www.tiktok.com/@scout2015/video/6718335390845095173" },
    { platform: "instagram", url: "https://www.instagram.com/reel/C5qLPhxLdHL/" },
];

type Result = {
    platform: string;
    url: string;
    ok: boolean;
    ms: number;
    httpStatus?: number;
    title?: string;
    author?: string;
    chars?: number;
    error?: string;
};

async function hitEndpoint(t: Target): Promise<Result> {
    const started = Date.now();
    try {
        const res = await axios.post(
            `${BASE_URL}/api/transcribe`,
            { url: t.url },
            { timeout: 180_000, validateStatus: () => true, headers: { "Content-Type": "application/json" } },
        );
        const ms = Date.now() - started;
        const data = res.data || {};
        if (res.status >= 200 && res.status < 300 && data.success) {
            return {
                platform: t.platform,
                url: t.url,
                ok: true,
                ms,
                httpStatus: res.status,
                title: data.title,
                author: data.author,
                chars: (data.full_text || "").length,
            };
        }
        return {
            platform: t.platform,
            url: t.url,
            ok: false,
            ms,
            httpStatus: res.status,
            error: data.error || `HTTP ${res.status}`,
        };
    } catch (e: any) {
        return {
            platform: t.platform,
            url: t.url,
            ok: false,
            ms: Date.now() - started,
            error: e.message || String(e),
        };
    }
}

async function runUnit(t: Target): Promise<Result> {
    const started = Date.now();
    try {
        const mod = await import("../src/lib/server-download-utils");
        const info = await mod.getVideoInfo(t.url);
        const dl = await mod.downloadAudio(t.url);
        return {
            platform: t.platform,
            url: t.url,
            ok: true,
            ms: Date.now() - started,
            title: info.title,
            author: info.author,
            chars: dl.buffer.length,
        };
    } catch (e: any) {
        return {
            platform: t.platform,
            url: t.url,
            ok: false,
            ms: Date.now() - started,
            error: e.message || String(e),
        };
    }
}

function fmt(r: Result): string {
    const icon = r.ok ? "✅" : "❌";
    const pad = r.platform.padEnd(20);
    const s = (r.ms / 1000).toFixed(1) + "s";
    if (r.ok) {
        return `${icon} ${pad} ${s.padStart(7)}  ${r.chars} ${UNIT_MODE ? "bytes" : "chars"}  "${r.title || ""}" — ${r.author || ""}`;
    }
    return `${icon} ${pad} ${s.padStart(7)}  HTTP ${r.httpStatus ?? "-"}  ${r.error}`;
}

async function main() {
    console.log(`\nVerifying transcriptions @ ${UNIT_MODE ? "LOCAL downloadAudio()" : BASE_URL}\n`);
    console.log(`Testing ${TARGETS.length} URLs sequentially...\n`);

    const results: Result[] = [];
    for (const t of TARGETS) {
        process.stdout.write(`→ ${t.platform.padEnd(20)} ${t.url.slice(0, 60)}... `);
        const r = UNIT_MODE ? await runUnit(t) : await hitEndpoint(t);
        results.push(r);
        console.log(r.ok ? `ok (${(r.ms / 1000).toFixed(1)}s)` : `FAIL: ${r.error}`);
    }

    console.log("\n─── Summary ───");
    for (const r of results) console.log(fmt(r));

    const passed = results.filter(r => r.ok).length;
    console.log(`\n${passed}/${results.length} passed`);
    process.exit(passed === results.length ? 0 : 1);
}

main().catch(e => {
    console.error(e);
    process.exit(2);
});
