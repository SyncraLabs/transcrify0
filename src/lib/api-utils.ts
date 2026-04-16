import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { checkAnonymousUsage, checkUserUsage } from "@/lib/usage";
import type { User } from "@supabase/supabase-js";

// ============================================
// API Key Authentication (backwards-compatible)
// ============================================

const API_KEYS = new Set(
    (process.env.API_KEYS || "").split(",").filter(Boolean)
);

function validateApiKey(request: NextRequest): boolean {
    if (API_KEYS.size === 0) return false; // No API keys configured
    const apiKey = request.headers.get("x-api-key");
    return apiKey ? API_KEYS.has(apiKey) : false;
}

// ============================================
// Webhook Notification
// ============================================

export async function sendWebhook(
    webhookUrl: string,
    data: Record<string, unknown>,
    secret?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (secret) {
            const encoder = new TextEncoder();
            const key = await crypto.subtle.importKey(
                "raw",
                encoder.encode(secret),
                { name: "HMAC", hash: "SHA-256" },
                false,
                ["sign"]
            );
            const signature = await crypto.subtle.sign(
                "HMAC",
                key,
                encoder.encode(JSON.stringify(data))
            );
            const signatureHex = Array.from(new Uint8Array(signature))
                .map(b => b.toString(16).padStart(2, "0"))
                .join("");
            headers["X-Webhook-Signature"] = `sha256=${signatureHex}`;
        }

        const response = await fetch(webhookUrl, {
            method: "POST",
            headers,
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            return {
                success: false,
                error: `Webhook returned ${response.status}`
            };
        }

        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return { success: false, error: message };
    }
}

// ============================================
// CORS Headers
// ============================================

export function corsHeaders() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    };
}

export function optionsResponse() {
    return new NextResponse(null, {
        status: 200,
        headers: corsHeaders(),
    });
}

// ============================================
// Combined Middleware (DB-backed usage limits)
// ============================================

export interface MiddlewareResult {
    ok: boolean;
    error?: NextResponse;
    user: User | null;
    ip: string;
    usage?: { used: number; limit: number; remaining: number };
}

export async function apiMiddleware(request: NextRequest): Promise<MiddlewareResult> {
    const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0] ||
        request.headers.get("x-real-ip") ||
        "unknown";

    // 1. Check API key (backwards-compatible, bypasses usage limits)
    if (validateApiKey(request)) {
        return { ok: true, user: null, ip };
    }

    // 2. Try to get authenticated user from cookies
    let user: User | null = null;
    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll() {},
                },
            }
        );
        const { data } = await supabase.auth.getUser();
        user = data.user;
    } catch {
        // No auth available, treat as anonymous
    }

    // 3. Check usage limits
    if (user) {
        const usage = await checkUserUsage(user.id);
        if (!usage.allowed) {
            return {
                ok: false,
                user,
                ip,
                usage: { used: usage.used, limit: usage.limit, remaining: 0 },
                error: NextResponse.json(
                    {
                        error: "Daily transcription limit reached. Upgrade your plan for more.",
                        code: "LIMIT_REACHED",
                        usage: { used: usage.used, limit: usage.limit, plan: usage.plan },
                        upgrade_url: "/pricing",
                    },
                    { status: 429, headers: corsHeaders() }
                ),
            };
        }
        return {
            ok: true,
            user,
            ip,
            usage: {
                used: usage.used,
                limit: usage.limit,
                remaining: usage.limit === -1 ? -1 : usage.limit - usage.used,
            },
        };
    }

    // 4. Anonymous user - check IP-based limits
    const usage = await checkAnonymousUsage(ip);
    if (!usage.allowed) {
        return {
            ok: false,
            user: null,
            ip,
            usage: { used: usage.used, limit: usage.limit, remaining: 0 },
            error: NextResponse.json(
                {
                    error: "Free daily limit reached. Sign up for more transcriptions!",
                    code: "ANONYMOUS_LIMIT_REACHED",
                    usage: { used: usage.used, limit: usage.limit },
                    signup_url: "/auth/signup",
                },
                { status: 429, headers: corsHeaders() }
            ),
        };
    }

    return {
        ok: true,
        user: null,
        ip,
        usage: { used: usage.used, limit: usage.limit, remaining: usage.limit - usage.used },
    };
}
