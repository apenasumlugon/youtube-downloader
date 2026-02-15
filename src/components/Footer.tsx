"use client";

import { Github, Heart } from "lucide-react";

export default function Footer() {
    return (
        <footer className="mt-20 pb-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <div
                    className="h-px w-full mb-8"
                    style={{
                        background:
                            "linear-gradient(90deg, transparent, var(--color-border), transparent)",
                    }}
                />
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p
                        className="text-xs flex items-center gap-1.5"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        Feito com
                        <Heart
                            size={12}
                            fill="var(--color-error)"
                            style={{ color: "var(--color-error)" }}
                        />
                        usando Next.js, yt-dlp & Supabase
                    </p>
                    <div className="flex items-center gap-4">
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors duration-200"
                            style={{ color: "var(--color-text-muted)" }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.color = "var(--color-text-primary)")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.color = "var(--color-text-muted)")
                            }
                        >
                            <Github size={18} />
                        </a>
                        <span
                            className="text-xs"
                            style={{ color: "var(--color-text-muted)" }}
                        >
                            v1.0.0
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
