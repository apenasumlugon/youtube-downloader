"use client";

import { useState, useRef } from "react";
import {
    Search,
    Loader2,
    Download,
    Play,
    Music,
    Film,
    Clock,
    Eye,
    User,
    ExternalLink,
    AlertCircle,
    Sparkles,
    Youtube,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────────────────────── */
type Format = {
    format_id: string;
    ext: string;
    resolution: string;
    filesize: number | null;
    url: string;
    vcodec: string;
    acodec: string;
};

type VideoResult = {
    title: string;
    thumbnail: string;
    duration: number;
    duration_string: string;
    uploader: string;
    view_count: number;
    description: string;
    webpage_url: string;
    best_url: string | null;
    video_formats: Format[];
    audio_formats: Format[];
};

/* ── Helpers ───────────────────────────────────────────────────────────── */
function formatFileSize(bytes: number | null): string {
    if (!bytes) return "—";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatViews(n: number): string {
    if (!n) return "—";
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
}

function isYouTubeUrl(url: string): boolean {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|music\.youtube\.com)\/.+/.test(url);
}

/* ── Component ─────────────────────────────────────────────────────────── */
export default function VideoAnalyzer() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<VideoResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    const handleAnalyze = async () => {
        const trimmed = url.trim();
        if (!trimmed) return;

        if (!isYouTubeUrl(trimmed)) {
            setError("Por favor, insira uma URL válida do YouTube.");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: trimmed }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Erro ao processar o vídeo.");
            }

            setResult(data);

            // Scroll to result
            setTimeout(() => {
                resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Erro inesperado.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
            {/* ── Hero Section ────────────────────────────────────────────────── */}
            <div className="text-center mb-12 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6"
                    style={{
                        borderColor: "var(--color-border)",
                        background: "var(--gradient-card)",
                    }}
                >
                    <Sparkles size={14} style={{ color: "var(--color-accent)" }} />
                    <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                        Powered by yt-dlp
                    </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4">
                    <span className="gradient-text">YT Snatch</span>
                </h1>
                <p className="text-base sm:text-lg max-w-xl mx-auto" style={{ color: "var(--color-text-secondary)" }}>
                    Cole uma URL do YouTube e obtenha links diretos para download em segundos.
                </p>
            </div>

            {/* ── Search Bar ──────────────────────────────────────────────────── */}
            <div
                className="animate-fade-in-up"
                style={{ animationDelay: "0.15s", opacity: 0, animationFillMode: "forwards" }}
            >
                <div
                    className="glass rounded-2xl p-1.5 transition-all duration-300"
                    style={{
                        boxShadow: loading ? "var(--shadow-glow)" : "var(--shadow-card)",
                    }}
                >
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                            <Youtube
                                size={20}
                                className="absolute left-4 top-1/2 -translate-y-1/2"
                                style={{ color: "var(--color-text-muted)" }}
                            />
                            <input
                                id="url-input"
                                type="url"
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={url}
                                onChange={(e) => {
                                    setUrl(e.target.value);
                                    if (error) setError(null);
                                }}
                                onKeyDown={(e) => e.key === "Enter" && !loading && handleAnalyze()}
                                disabled={loading}
                                className="w-full h-14 pl-12 pr-4 rounded-xl text-sm sm:text-base outline-none transition-all duration-200"
                                style={{
                                    background: "var(--color-bg-input)",
                                    color: "var(--color-text-primary)",
                                    border: "1px solid transparent",
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = "var(--color-border-focus)";
                                    e.currentTarget.style.boxShadow = "0 0 0 3px var(--color-accent-glow)";
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = "transparent";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            />
                        </div>
                        <button
                            id="analyze-button"
                            onClick={handleAnalyze}
                            disabled={loading || !url.trim()}
                            className="h-14 px-8 rounded-xl font-semibold text-sm sm:text-base text-white transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                                background: loading ? "var(--color-bg-card)" : "var(--gradient-main)",
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) e.currentTarget.style.transform = "translateY(-1px)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                            }}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin-slow" />
                                    <span>Analisando…</span>
                                </>
                            ) : (
                                <>
                                    <Search size={18} />
                                    <span>Processar</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Error ───────────────────────────────────────────────────────── */}
            {error && (
                <div
                    className="mt-6 flex items-center gap-3 p-4 rounded-xl animate-fade-in"
                    style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.25)",
                    }}
                >
                    <AlertCircle size={20} style={{ color: "var(--color-error)", flexShrink: 0 }} />
                    <p className="text-sm" style={{ color: "var(--color-error)" }}>
                        {error}
                    </p>
                </div>
            )}

            {/* ── Loading Skeleton ────────────────────────────────────────────── */}
            {loading && (
                <div className="mt-10 space-y-4 animate-fade-in">
                    <div className="h-8 w-2/3 rounded-lg animate-shimmer" />
                    <div className="flex gap-4">
                        <div className="h-48 w-80 rounded-xl animate-shimmer" />
                        <div className="flex-1 space-y-3">
                            <div className="h-4 w-full rounded animate-shimmer" />
                            <div className="h-4 w-4/5 rounded animate-shimmer" />
                            <div className="h-4 w-3/5 rounded animate-shimmer" />
                        </div>
                    </div>
                </div>
            )}

            {/* ── Result ──────────────────────────────────────────────────────── */}
            {result && !loading && (
                <div ref={resultRef} className="mt-10 space-y-6 animate-fade-in-up">
                    {/* Video Info Card */}
                    <div
                        className="glass rounded-2xl overflow-hidden"
                        style={{ boxShadow: "var(--shadow-card)" }}
                    >
                        <div className="flex flex-col md:flex-row">
                            {/* Thumbnail */}
                            <div className="relative md:w-80 lg:w-96 flex-shrink-0 group">
                                <img
                                    src={result.thumbnail}
                                    alt={result.title}
                                    className="w-full h-full object-cover min-h-[200px]"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div
                                        className="w-16 h-16 rounded-full flex items-center justify-center"
                                        style={{ background: "var(--gradient-main)" }}
                                    >
                                        <Play size={28} className="text-white ml-1" />
                                    </div>
                                </div>
                                {result.duration_string && (
                                    <div
                                        className="absolute bottom-3 right-3 px-2 py-1 rounded-md text-xs font-semibold"
                                        style={{
                                            background: "rgba(0,0,0,0.8)",
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {result.duration_string}
                                    </div>
                                )}
                            </div>

                            {/* Meta */}
                            <div className="flex-1 p-6 flex flex-col justify-between">
                                <div>
                                    <h2
                                        className="text-xl sm:text-2xl font-bold mb-3 leading-tight"
                                        style={{ color: "var(--color-text-primary)" }}
                                    >
                                        {result.title}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-4 mb-4">
                                        <span
                                            className="flex items-center gap-1.5 text-sm"
                                            style={{ color: "var(--color-text-secondary)" }}
                                        >
                                            <User size={14} />
                                            {result.uploader}
                                        </span>
                                        <span
                                            className="flex items-center gap-1.5 text-sm"
                                            style={{ color: "var(--color-text-secondary)" }}
                                        >
                                            <Eye size={14} />
                                            {formatViews(result.view_count)} views
                                        </span>
                                        <span
                                            className="flex items-center gap-1.5 text-sm"
                                            style={{ color: "var(--color-text-secondary)" }}
                                        >
                                            <Clock size={14} />
                                            {result.duration_string}
                                        </span>
                                    </div>
                                    {result.description && (
                                        <p
                                            className="text-sm leading-relaxed line-clamp-3"
                                            style={{ color: "var(--color-text-muted)" }}
                                        >
                                            {result.description}
                                        </p>
                                    )}
                                </div>

                                <a
                                    href={result.webpage_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium transition-colors duration-200"
                                    style={{ color: "var(--color-accent)" }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.color = "var(--color-accent-hover)")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.color = "var(--color-accent)")
                                    }
                                >
                                    <ExternalLink size={14} />
                                    Abrir no YouTube
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* ── Download Options ─────────────────────────────────────────── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Video Formats */}
                        {result.video_formats.length > 0 && (
                            <div
                                className="glass rounded-2xl p-6"
                                style={{ boxShadow: "var(--shadow-card)" }}
                            >
                                <div className="flex items-center gap-2 mb-5">
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                                        style={{ background: "rgba(99, 102, 241, 0.15)" }}
                                    >
                                        <Film size={16} style={{ color: "var(--color-accent)" }} />
                                    </div>
                                    <h3 className="font-bold text-lg" style={{ color: "var(--color-text-primary)" }}>
                                        Vídeo
                                    </h3>
                                </div>
                                <div className="space-y-2">
                                    {result.video_formats.map((f, i) => (
                                        <a
                                            key={f.format_id + i}
                                            href={f.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-3 rounded-xl transition-all duration-200 group"
                                            style={{
                                                background: "var(--color-bg-input)",
                                                border: "1px solid var(--color-border)",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = "var(--color-bg-card-hover)";
                                                e.currentTarget.style.borderColor = "var(--color-accent)";
                                                e.currentTarget.style.transform = "translateX(4px)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = "var(--color-bg-input)";
                                                e.currentTarget.style.borderColor = "var(--color-border)";
                                                e.currentTarget.style.transform = "translateX(0)";
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className="px-2 py-0.5 rounded text-xs font-bold uppercase"
                                                    style={{
                                                        background: "rgba(99, 102, 241, 0.15)",
                                                        color: "var(--color-accent)",
                                                    }}
                                                >
                                                    {f.ext}
                                                </span>
                                                <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                                                    {f.resolution}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                                    {formatFileSize(f.filesize)}
                                                </span>
                                                <Download
                                                    size={16}
                                                    className="transition-transform duration-200 group-hover:scale-110"
                                                    style={{ color: "var(--color-accent)" }}
                                                />
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Audio Formats */}
                        {result.audio_formats.length > 0 && (
                            <div
                                className="glass rounded-2xl p-6"
                                style={{ boxShadow: "var(--shadow-card)" }}
                            >
                                <div className="flex items-center gap-2 mb-5">
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                                        style={{ background: "rgba(168, 85, 247, 0.15)" }}
                                    >
                                        <Music size={16} style={{ color: "#a855f7" }} />
                                    </div>
                                    <h3 className="font-bold text-lg" style={{ color: "var(--color-text-primary)" }}>
                                        Áudio
                                    </h3>
                                </div>
                                <div className="space-y-2">
                                    {result.audio_formats.map((f, i) => (
                                        <a
                                            key={f.format_id + i}
                                            href={f.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-3 rounded-xl transition-all duration-200 group"
                                            style={{
                                                background: "var(--color-bg-input)",
                                                border: "1px solid var(--color-border)",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = "var(--color-bg-card-hover)";
                                                e.currentTarget.style.borderColor = "#a855f7";
                                                e.currentTarget.style.transform = "translateX(4px)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = "var(--color-bg-input)";
                                                e.currentTarget.style.borderColor = "var(--color-border)";
                                                e.currentTarget.style.transform = "translateX(0)";
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className="px-2 py-0.5 rounded text-xs font-bold uppercase"
                                                    style={{
                                                        background: "rgba(168, 85, 247, 0.15)",
                                                        color: "#a855f7",
                                                    }}
                                                >
                                                    {f.ext}
                                                </span>
                                                <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                                                    {f.resolution || "Audio"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                                    {formatFileSize(f.filesize)}
                                                </span>
                                                <Download
                                                    size={16}
                                                    className="transition-transform duration-200 group-hover:scale-110"
                                                    style={{ color: "#a855f7" }}
                                                />
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
