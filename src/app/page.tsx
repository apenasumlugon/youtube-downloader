import VideoAnalyzer from "@/components/VideoAnalyzer";
import RecentHistory from "@/components/RecentHistory";
import Footer from "@/components/Footer";

export default function Home() {
    return (
        <main className="min-h-screen relative">
            {/* Background Glow */}
            <div className="bg-radial-glow fixed inset-0 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 pt-16 sm:pt-24">
                <VideoAnalyzer />
                <RecentHistory />
                <Footer />
            </div>
        </main>
    );
}
