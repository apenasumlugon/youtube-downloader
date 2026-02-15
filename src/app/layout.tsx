import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "YT Snatch — YouTube Video Downloader",
    description:
        "Extract and download YouTube videos instantly. Paste a link and get direct streaming URLs with metadata.",
    keywords: ["youtube", "downloader", "video", "mp3", "mp4", "yt-dlp"],
    openGraph: {
        title: "YT Snatch — YouTube Video Downloader",
        description: "Paste a YouTube URL. Get direct download links instantly.",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="pt-BR">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="antialiased bg-grid">{children}</body>
        </html>
    );
}
