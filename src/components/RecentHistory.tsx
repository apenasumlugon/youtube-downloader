"use client";

import { useEffect, useState } from "react";
import { History, ExternalLink, Clock, Film } from "lucide-react";
import { supabase, type Download } from "@/lib/supabase";

export default function RecentHistory() {
    const [history, setHistory] = useState<Download[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        if (!supabase) {
            setLoading(false);
            return;
        }
        try {
            const { data, error } = await supabase
                .from("downloads")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(10);

            if (error) {
                console.error("Supabase error:", error);
                return;
            }

            setHistory(data || []);
        } catch {
            console.error("Failed to fetch history");
        } finally {
            setLoading(false);
        }
    };

    const timeAgo = (dateStr: string): string => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60_000);
        if (mins < 1) return "agora mesmo";
        if (mins < 60) return `${mins}min atrás`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h atrás`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d atrás`;
        return new Date(dateStr).toLocaleDateString("pt-BR");
    };

    if (loading) {
        return (
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 mt-16">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-5 h-5 rounded animate-shimmer" />
                    <div className="h-6 w-40 rounded-lg animate-shimmer" />
                </div>
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 rounded-xl animate-shimmer" />
                    ))}
                </div>
            </div>
        );
    }

    if (history.length === 0) return null;

    return (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 mt-16 animate-fade-in-up">
            <div className="flex items-center gap-2.5 mb-6">
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(99, 102, 241, 0.12)" }}
                >
                    <History size={16} style={{ color: "var(--color-accent)" }} />
                </div>
                <h2
                    className="text-xl font-bold"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Histórico Recente
                </h2>
            </div>

            <div className="space-y-2">
                {history.map((item, i) => (
                    <div
                        key={item.id}
                        className="glass rounded-xl p-4 flex items-center justify-between gap-4 transition-all duration-200 animate-slide-in-right"
                        style={{
                            animationDelay: `${i * 0.05}s`,
                            opacity: 0,
                            animationFillMode: "forwards",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "var(--color-bg-card-hover)";
                            e.currentTarget.style.transform = "translateX(4px)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "";
                            e.currentTarget.style.transform = "translateX(0)";
                        }}
                    >
                        <div className="flex items-center gap-4 min-w-0">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: "var(--color-bg-input)" }}
                            >
                                <Film size={18} style={{ color: "var(--color-text-muted)" }} />
                            </div>
                            <div className="min-w-0">
                                <p
                                    className="text-sm font-semibold truncate"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    {item.video_title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Clock size={12} style={{ color: "var(--color-text-muted)" }} />
                                    <span
                                        className="text-xs"
                                        style={{ color: "var(--color-text-muted)" }}
                                    >
                                        {timeAgo(item.created_at)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <a
                            href={item.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
                            style={{
                                background: "var(--color-bg-input)",
                                border: "1px solid var(--color-border)",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = "var(--color-accent)";
                                e.currentTarget.style.background = "rgba(99, 102, 241, 0.1)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = "var(--color-border)";
                                e.currentTarget.style.background = "var(--color-bg-input)";
                            }}
                        >
                            <ExternalLink size={14} style={{ color: "var(--color-accent)" }} />
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}
