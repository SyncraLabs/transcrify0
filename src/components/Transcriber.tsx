"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles, Copy, Loader2, Link as LinkIcon, Check, Plus, X,
    Download, FileText, FileCode, FileType, Trash2, Package, ArrowUpRight, UserPlus
} from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";

interface TranscriptionResult {
    url: string;
    title: string;
    ai_title?: string;
    author?: string;
    success: boolean;
    full_text?: string;
    paragraphs?: string[];
    segments?: { start: number; end: number; text: string }[];
    error?: string;
}

interface UsageInfo {
    authenticated: boolean;
    plan: string;
    used: number;
    limit: number;
    remaining: number;
}

import { downloadAllAsMergedMarkdown } from "@/lib/downloadUtils";

export default function Transcriber() {
    const { user } = useAuth();
    const [urls, setUrls] = useState<string[]>([""]);
    const [results, setResults] = useState<TranscriptionResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState<number | null>(null);
    const [currentProcessing, setCurrentProcessing] = useState<string>("");
    const [usage, setUsage] = useState<UsageInfo | null>(null);
    const [showLimitBanner, setShowLimitBanner] = useState(false);

    // Fetch usage on mount and after each transcription
    const fetchUsage = () => {
        fetch("/api/usage")
            .then((r) => r.json())
            .then((data) => {
                setUsage(data);
                if (data.remaining === 0) setShowLimitBanner(true);
            })
            .catch(console.error);
    };

    useEffect(() => {
        fetchUsage();
    }, [user]);

    const addUrl = () => {
        setUrls([...urls, ""]);
    };

    const removeUrl = (index: number) => {
        if (urls.length > 1) {
            setUrls(urls.filter((_, i) => i !== index));
        }
    };

    const updateUrl = (index: number, value: string) => {
        const newUrls = [...urls];
        newUrls[index] = value;
        setUrls(newUrls);
    };

    const handleTranscribe = async () => {
        const validUrls = urls.filter(u => u.trim() !== "");
        if (validUrls.length === 0) return;

        setLoading(true);
        setError("");
        setResults([]); // Clear previous results to show progress

        try {
            for (let i = 0; i < validUrls.length; i++) {
                const url = validUrls[i];
                setCurrentProcessing(`Processing ${i + 1}/${validUrls.length}...`);

                try {
                    // Process one by one client-side for better progress tracking
                    const response = await axios.post("/api/transcribe", { url });

                    const result: TranscriptionResult = {
                        url,
                        success: true,
                        ...response.data
                    };

                    setResults(prev => [...prev, result]);
                } catch (err: any) {
                    console.error(`Failed to transcribe ${url}:`, err);

                    // Check if limit was reached
                    if (err.response?.status === 429) {
                        setShowLimitBanner(true);
                        fetchUsage();
                        break; // Stop processing remaining URLs
                    }

                    const errorResult: TranscriptionResult = {
                        url,
                        title: "Error",
                        author: "Unknown",
                        success: false,
                        error: err.response?.data?.error || err.message || "Failed"
                    };
                    setResults(prev => [...prev, errorResult]);
                }
            }
        } catch (err: any) {
            console.error(err);
            setError("Batch processing encountered an unexpected error.");
        } finally {
            setLoading(false);
            setCurrentProcessing("");
            fetchUsage(); // Refresh usage after transcription
        }
    };

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopied(index);
        setTimeout(() => setCopied(null), 2000);
    };

    const sanitizeFilename = (title: string) => {
        return title.replace(/[<>:"/\\|?*]/g, '').substring(0, 50);
    };

    const downloadFile = (content: string, filename: string, type: string) => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const downloadAsTxt = (result: TranscriptionResult) => {
        const header = `Title: ${result.title}\nAuthor: ${result.author || "Unknown"}\nSource: ${result.url}\n\n`;
        const content = header + (result.paragraphs?.join("\n\n") || result.full_text || "");
        downloadFile(content, `${sanitizeFilename(result.title)}.txt`, "text/plain");
    };

    const downloadAsMd = (result: TranscriptionResult) => {
        let content = `# ${result.title}\n\n**Author:** ${result.author || "Unknown"}\n\n**Source:** ${result.url}\n\n---\n\n`;
        if (result.paragraphs) {
            result.paragraphs.forEach((p) => {
                content += `${p}\n\n`;
            });
        } else {
            content += result.full_text || "";
        }
        downloadFile(content, `${sanitizeFilename(result.title)}.md`, "text/markdown");
    };

    const downloadAsSrt = (result: TranscriptionResult) => {
        if (!result.segments) return;

        const formatTime = (seconds: number) => {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = Math.floor(seconds % 60);
            const ms = Math.round((seconds % 1) * 1000);
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
        };

        let content = "";
        result.segments.forEach((seg, i) => {
            content += `${i + 1}\n`;
            content += `${formatTime(seg.start)} --> ${formatTime(seg.end)}\n`;
            content += `${seg.text}\n\n`;
        });

        downloadFile(content, `${sanitizeFilename(result.title)}.srt`, "application/x-subrip");
    };

    const downloadAsJson = (result: TranscriptionResult) => {
        const content = JSON.stringify(result, null, 2);
        downloadFile(content, `${sanitizeFilename(result.title)}.json`, "application/json");
    };

    // Download ALL transcriptions as a single document
    const downloadAllAsTxt = () => {
        const successfulResults = results.filter(r => r.success);
        let content = "";
        successfulResults.forEach((result, i) => {
            content += `${"=".repeat(60)}\n`;
            content += `${result.ai_title || result.title}\n`;
            content += `Author: ${result.author || "Unknown"}\n`;
            content += `Source: ${result.url}\n`;
            content += `${"=".repeat(60)}\n\n`;
            content += (result.paragraphs?.join("\n\n") || result.full_text || "") + "\n\n\n";
        });
        downloadFile(content, `all_transcriptions.txt`, "text/plain");
    };

    const downloadAllAsMd = () => {
        const successfulResults = results.filter(r => r.success);
        downloadAllAsMergedMarkdown(successfulResults as any);
    };

    const downloadAllAsJson = () => {
        const successfulResults = results.filter(r => r.success);
        const content = JSON.stringify({
            generated_at: new Date().toISOString(),
            count: successfulResults.length,
            transcriptions: successfulResults
        }, null, 2);
        downloadFile(content, `all_transcriptions.json`, "application/json");
    };

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-3xl px-4 py-8 space-y-8">

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-2"
            >
                <div className="flex items-center justify-center space-x-2">
                    <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
                    <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                        Transcrify
                    </h1>
                </div>
                <p className="text-zinc-400">Instantly transcribe TikToks, Reels, and Shorts. Powered by OpenAI Whisper.</p>
            </motion.div>

            {/* Usage Badge */}
            {usage && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-sm"
                >
                    <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium border",
                        usage.remaining === 0
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : usage.remaining <= 1
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    )}>
                        {usage.remaining === -1 ? "Unlimited" : `${usage.remaining} transcription${usage.remaining !== 1 ? "s" : ""} remaining`}
                    </span>
                    {!usage.authenticated && (
                        <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 transition-colors">
                            <UserPlus className="w-3 h-3" /> Sign up for more
                        </Link>
                    )}
                    {usage.authenticated && usage.plan === "free" && (
                        <Link href="/pricing" className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 transition-colors">
                            <ArrowUpRight className="w-3 h-3" /> Upgrade
                        </Link>
                    )}
                </motion.div>
            )}

            {/* Limit Reached Banner */}
            <AnimatePresence>
                {showLimitBanner && usage?.remaining === 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="w-full overflow-hidden"
                    >
                        <div className={cn(
                            "rounded-xl border p-5 text-center",
                            !usage.authenticated
                                ? "bg-blue-950/30 border-blue-500/20"
                                : "bg-purple-950/30 border-purple-500/20"
                        )}>
                            {!usage.authenticated ? (
                                <>
                                    <p className="text-white font-medium mb-1">You&apos;ve used your 3 free transcriptions today</p>
                                    <p className="text-neutral-400 text-sm mb-3">Create a free account to get 5 transcriptions per day + save your history</p>
                                    <Link href="/auth/signup">
                                        <button className="px-6 py-2 bg-[#0079da] hover:bg-[#0069c0] text-white font-medium rounded-lg text-sm transition-colors">
                                            Sign up free
                                        </button>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <p className="text-white font-medium mb-1">Daily limit reached</p>
                                    <p className="text-neutral-400 text-sm mb-3">Upgrade to Basic ($5/mo) for 30 transcriptions/day or Pro ($15/mo) for unlimited</p>
                                    <Link href="/pricing">
                                        <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg text-sm transition-colors hover:brightness-110">
                                            View Plans
                                        </button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="w-full relative group"
            >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-zinc-900 rounded-xl p-6 ring-1 ring-zinc-800/50 shadow-2xl space-y-4">

                    {/* URL Inputs */}
                    <AnimatePresence mode="popLayout">
                        {urls.map((url, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center space-x-2 overflow-hidden"
                            >
                                <div className="flex items-center flex-1 space-x-3 bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50 focus-within:border-purple-500/50 transition-colors">
                                    <LinkIcon className="w-4 h-4 text-zinc-400 shrink-0" />
                                    <input
                                        type="text"
                                        placeholder={`Video URL ${index + 1}...`}
                                        className="bg-transparent border-none text-white placeholder-zinc-500 focus:outline-none w-full text-sm"
                                        value={url}
                                        onChange={(e) => updateUrl(index, e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleTranscribe()}
                                    />
                                </div>
                                {urls.length > 1 && (
                                    <motion.button
                                        whileHover={{ scale: 1.1, color: "#f87171" }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => removeUrl(index)}
                                        className="p-2 text-zinc-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </motion.button>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Add URL Button */}
                    <motion.button
                        whileHover={{ scale: 1.01, backgroundColor: "rgba(168, 85, 247, 0.05)" }}
                        whileTap={{ scale: 0.99 }}
                        onClick={addUrl}
                        className="flex items-center justify-center w-full py-2 text-zinc-400 hover:text-purple-400 border border-dashed border-zinc-700 hover:border-purple-500/50 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add another URL
                    </motion.button>

                    {/* Transcribe Button */}
                    <motion.button
                        whileHover={!loading && !urls.every(u => !u.trim()) ? { scale: 1.02 } : {}}
                        whileTap={!loading && !urls.every(u => !u.trim()) ? { scale: 0.98 } : {}}
                        onClick={handleTranscribe}
                        disabled={loading || urls.every(u => !u.trim())}
                        className={cn(
                            "w-full py-4 rounded-lg font-bold text-white shadow-lg transform transition-all",
                            "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500",
                            "focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-purple-500",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            loading ? "cursor-wait" : ""
                        )}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center space-x-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>{currentProcessing || "Processing..."}</span>
                            </span>
                        ) : `Transcribe ${urls.filter(u => u.trim()).length > 1 ? `(${urls.filter(u => u.trim()).length} videos)` : "Now"}`}
                    </motion.button>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="text-red-400 text-sm text-center pt-2"
                        >
                            {error}
                        </motion.p>
                    )}
                </div>
            </motion.div>

            {/* Download All Button (when multiple results) */}
            <AnimatePresence>
                {results.filter(r => r.success).length > 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="w-full overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-4">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center space-x-2">
                                    <Package className="w-5 h-5 text-purple-400" />
                                    <span className="text-zinc-200 font-medium">Download All ({results.filter(r => r.success).length} transcriptions)</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={downloadAllAsTxt}
                                        className="flex items-center px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition-colors"
                                    >
                                        <FileText className="w-4 h-4 mr-1" /> .txt
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={downloadAllAsMd}
                                        className="flex items-center px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition-colors"
                                    >
                                        <FileCode className="w-4 h-4 mr-1" /> .md
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={downloadAllAsJson}
                                        className="flex items-center px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition-colors"
                                    >
                                        <FileCode className="w-4 h-4 mr-1" /> .json
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results */}
            <AnimatePresence mode="popLayout">
                {results.map((result, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                            delay: index * 0.1
                        }}
                        className="w-full relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent rounded-xl blur-xl pointer-events-none" />
                        <div className="relative bg-zinc-800/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl">

                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-zinc-100 font-semibold text-lg truncate">
                                        {result.ai_title || result.title || `Result ${index + 1}`}
                                    </h3>
                                    <div className="flex flex-col space-y-1 mt-1">
                                        <p className="text-zinc-400 text-sm font-medium">by {result.author || "Unknown"}</p>
                                        <p className="text-zinc-500 text-xs truncate">{result.url}</p>
                                    </div>
                                </div>

                                {result.success && (
                                    <div className="flex items-center space-x-1 ml-4">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                            onClick={() => copyToClipboard(result.paragraphs?.join("\n\n") || result.full_text || "", index)}
                                            className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg relative"
                                            title="Copy to clipboard"
                                        >
                                            <AnimatePresence mode="wait">
                                                {copied === index ? (
                                                    <motion.div
                                                        key="check"
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        exit={{ scale: 0 }}
                                                    >
                                                        <Check className="w-4 h-4 text-green-400" />
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="copy"
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        exit={{ scale: 0 }}
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.button>

                                        {/* Download dropdown */}
                                        <div className="relative group/download">
                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg">
                                                <Download className="w-4 h-4" />
                                            </motion.button>
                                            <AnimatePresence>
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    className="absolute right-0 top-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl opacity-0 invisible group-hover/download:opacity-100 group-hover/download:visible transition-all z-10 min-w-[120px]"
                                                >
                                                    <button onClick={() => downloadAsTxt(result)} className="flex items-center w-full px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 rounded-t-lg">
                                                        <FileText className="w-4 h-4 mr-2" /> .txt
                                                    </button>
                                                    <button onClick={() => downloadAsMd(result)} className="flex items-center w-full px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700">
                                                        <FileCode className="w-4 h-4 mr-2" /> .md
                                                    </button>
                                                    <button onClick={() => downloadAsSrt(result)} className="flex items-center w-full px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700">
                                                        <FileType className="w-4 h-4 mr-2" /> .srt
                                                    </button>
                                                    <button onClick={() => downloadAsJson(result)} className="flex items-center w-full px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 rounded-b-lg">
                                                        <FileCode className="w-4 h-4 mr-2" /> .json
                                                    </button>
                                                </motion.div>
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            {result.success ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="max-h-96 overflow-y-auto pr-2 custom-scrollbar space-y-4"
                                >
                                    {result.paragraphs?.map((para, pIndex) => (
                                        <motion.p
                                            key={pIndex}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * pIndex }}
                                            className="text-zinc-100 leading-relaxed"
                                        >
                                            {para}
                                        </motion.p>
                                    ))}
                                </motion.div>
                            ) : (
                                <p className="text-red-400 text-sm">{result.error}</p>
                            )}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Clear Results */}
            {results.length > 0 && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setResults([]); setUrls([""]); }}
                    className="flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear all & start fresh
                </motion.button>
            )}
        </div>
    );
}
