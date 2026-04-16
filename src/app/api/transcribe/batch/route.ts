import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { apiMiddleware, sendWebhook, optionsResponse, corsHeaders } from "@/lib/api-utils";
import { downloadAudio, getVideoInfo } from "@/lib/server-download-utils";
import { incrementUsage, saveTranscription } from "@/lib/usage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
    if (!_openai) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("Missing OPENAI_API_KEY");
        }
        _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return _openai;
}



async function transcribeAudio(audioBuffer: Buffer, filename: string) {
    const uint8Array = new Uint8Array(audioBuffer);
    const file = new File([uint8Array], filename, { type: "audio/webm" });

    const result = await getOpenAI().audio.transcriptions.create({
        model: "whisper-1",
        file: file,
        response_format: "verbose_json",
    });

    const segments = (result.segments || []).map((seg: any) => ({
        start: Math.round(seg.start * 100) / 100,
        end: Math.round(seg.end * 100) / 100,
        text: seg.text?.trim() || "",
    }));

    const fullText = result.text?.trim() || "";

    const paragraphs: string[] = [];
    let currentPara: string[] = [];
    let lastEnd = 0;

    for (const seg of segments) {
        currentPara.push(seg.text);
        if (seg.end - lastEnd > 15 || (seg.text && ".!?".includes(seg.text.slice(-1)))) {
            paragraphs.push(currentPara.join(" "));
            currentPara = [];
            lastEnd = seg.end;
        }
    }
    if (currentPara.length > 0) {
        paragraphs.push(currentPara.join(" "));
    }

    if (paragraphs.length === 0 && fullText) {
        const sentences = fullText.split(/(?<=[.!?])\s+/);
        for (let i = 0; i < sentences.length; i += 3) {
            paragraphs.push(sentences.slice(i, i + 3).join(" "));
        }
    }

    return { full_text: fullText, paragraphs, segments };
}

async function processUrl(url: string) {
    try {
        const info = await getVideoInfo(url);
        const { buffer: audioBuffer, filename } = await downloadAudio(url);
        const result = await transcribeAudio(audioBuffer, filename);

        return {
            url,
            title: info.title,
            success: true,
            ...result,
        };
    } catch (error: any) {
        return {
            url,
            title: "Error",
            success: false,
            error: error.message || "Failed to transcribe",
        };
    }
}

export async function POST(request: NextRequest) {
    // Apply middleware (auth + usage limits)
    const middleware = await apiMiddleware(request);
    if (!middleware.ok) {
        return middleware.error;
    }

    try {
        const body = await request.json();
        const { urls, webhook_url, webhook_secret } = body;

        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return NextResponse.json(
                { error: "URLs array is required and must not be empty" },
                { status: 400, headers: corsHeaders() }
            );
        }

        // Limit batch size to prevent abuse
        const maxBatchSize = parseInt(process.env.MAX_BATCH_SIZE || "10");
        if (urls.length > maxBatchSize) {
            return NextResponse.json(
                { error: `Batch size exceeds maximum of ${maxBatchSize}` },
                { status: 400, headers: corsHeaders() }
            );
        }

        // Check if user has enough quota for the batch
        if (middleware.usage && middleware.usage.remaining !== -1 && urls.length > middleware.usage.remaining) {
            return NextResponse.json(
                {
                    error: `Not enough quota. You have ${middleware.usage.remaining} transcriptions remaining but requested ${urls.length}.`,
                    code: "INSUFFICIENT_QUOTA",
                    usage: middleware.usage,
                },
                { status: 429, headers: corsHeaders() }
            );
        }

        // Process URLs sequentially to avoid overwhelming the API
        const results = [];
        for (const url of urls) {
            const result = await processUrl(url);
            results.push(result);

            // Increment usage and save for each successful transcription
            if (result.success && 'full_text' in result) {
                if (middleware.user) {
                    await incrementUsage({ type: "user", userId: middleware.user.id });
                    await saveTranscription(middleware.user.id, {
                        url,
                        title: result.title,
                        full_text: result.full_text || "",
                        paragraphs: result.paragraphs,
                        segments: result.segments,
                    });
                } else {
                    await incrementUsage({ type: "anonymous", ip: middleware.ip });
                }
            }
        }

        const responseData = {
            success: true,
            total: urls.length,
            completed: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results,
        };

        // Send webhook if provided
        if (webhook_url) {
            const webhookResult = await sendWebhook(
                webhook_url,
                {
                    event: "batch_transcription.completed",
                    timestamp: new Date().toISOString(),
                    data: responseData,
                },
                webhook_secret
            );

            if (!webhookResult.success) {
                console.error("Webhook failed:", webhookResult.error);
            }
        }

        return NextResponse.json(responseData, { headers: corsHeaders() });
    } catch (error: any) {
        console.error("Batch transcription error:", error);

        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to process batch",
            },
            { status: 500, headers: corsHeaders() }
        );
    }
}

export async function OPTIONS() {
    return optionsResponse();
}
