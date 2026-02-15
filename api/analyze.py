from http.server import BaseHTTPRequestHandler
import json
import os
import tempfile
import base64
import traceback

# ── yt-dlp ────────────────────────────────────────────────────────────────────
import yt_dlp

# ── Supabase ──────────────────────────────────────────────────────────────────
from supabase import create_client, Client

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

# ── YouTube Cookies (base64-encoded Netscape cookies.txt) ─────────────────────
YT_COOKIES_B64 = os.environ.get("YT_COOKIES_BASE64", "")


def _supabase() -> Client | None:
    """Return a Supabase client or None when envs are missing."""
    if SUPABASE_URL and SUPABASE_KEY:
        return create_client(SUPABASE_URL, SUPABASE_KEY)
    return None


def _cors_headers() -> dict:
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Content-Type": "application/json",
    }


def _get_cookies_path() -> str | None:
    """
    Decode the base64 cookies env var into a temp file
    and return its path. Returns None if no cookies configured.
    """
    if not YT_COOKIES_B64:
        return None
    try:
        raw = base64.b64decode(YT_COOKIES_B64)
        tmp = tempfile.NamedTemporaryFile(
            delete=False, suffix=".txt", mode="wb"
        )
        tmp.write(raw)
        tmp.close()
        return tmp.name
    except Exception:
        return None


def _extract(url: str) -> dict:
    """
    Use yt-dlp to extract metadata + direct streaming URLs.
    We do NOT download anything to disk — only extract info.
    """
    cookies_path = _get_cookies_path()

    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        # Prefer mp4 video + m4a audio (widely compatible)
        "format": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        # Use browser-like headers to reduce bot detection
        "http_headers": {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/131.0.0.0 Safari/537.36"
            ),
            "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        },
        # Try different player clients to avoid bot detection
        "extractor_args": {
            "youtube": {
                "player_client": ["ios", "web"],
            }
        },
    }

    # Add cookies if available
    if cookies_path:
        ydl_opts["cookiefile"] = cookies_path

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
    finally:
        # Clean up temp cookie file
        if cookies_path:
            try:
                os.unlink(cookies_path)
            except OSError:
                pass

    if info is None:
        raise ValueError("yt-dlp returned no info for this URL")

    # Build list of available formats for the user
    formats = []
    for f in (info.get("formats") or []):
        fmt = {
            "format_id": f.get("format_id"),
            "ext": f.get("ext"),
            "resolution": f.get("resolution") or f.get("format_note", ""),
            "filesize": f.get("filesize") or f.get("filesize_approx"),
            "url": f.get("url"),
            "vcodec": f.get("vcodec", "none"),
            "acodec": f.get("acodec", "none"),
        }
        # Only include formats that have a direct URL
        if fmt["url"]:
            formats.append(fmt)

    # Separate into video (with audio) and audio-only
    video_formats = []
    audio_formats = []
    for f in formats:
        has_video = f["vcodec"] != "none"
        has_audio = f["acodec"] != "none"
        if has_video:
            video_formats.append(f)
        elif has_audio:
            audio_formats.append(f)

    # Get the best combined format URL
    best_url = info.get("url") or (formats[-1]["url"] if formats else None)

    return {
        "title": info.get("title", "Untitled"),
        "thumbnail": info.get("thumbnail", ""),
        "duration": info.get("duration", 0),
        "duration_string": info.get("duration_string", "0:00"),
        "uploader": info.get("uploader", "Unknown"),
        "view_count": info.get("view_count", 0),
        "description": (info.get("description") or "")[:500],
        "webpage_url": info.get("webpage_url", url),
        "best_url": best_url,
        "video_formats": video_formats[-6:],  # last 6 (best quality)
        "audio_formats": audio_formats[-4:],  # last 4 (best quality)
    }


def _save_to_supabase(video_url: str, title: str, fmt: str, user_id: str | None = None):
    """Persist search to Supabase `downloads` table."""
    sb = _supabase()
    if sb is None:
        return
    row = {
        "video_url": video_url,
        "video_title": title,
        "format": fmt,
    }
    if user_id:
        row["user_id"] = user_id
    sb.table("downloads").insert(row).execute()


class handler(BaseHTTPRequestHandler):
    """Vercel Python Serverless Function handler."""

    def do_OPTIONS(self):
        self.send_response(204)
        for k, v in _cors_headers().items():
            self.send_header(k, v)
        self.end_headers()

    def do_GET(self):
        """Health-check / recent history."""
        self.send_response(200)
        for k, v in _cors_headers().items():
            self.send_header(k, v)
        self.end_headers()
        
        sb = _supabase()
        if sb:
            res = sb.table("downloads").select("*").order("created_at", desc=True).limit(20).execute()
            body = json.dumps({"history": res.data})
        else:
            body = json.dumps({"history": [], "warning": "Supabase not configured"})
        
        self.wfile.write(body.encode())

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length)
            data = json.loads(raw) if raw else {}
            url = data.get("url", "").strip()

            if not url:
                self._respond(400, {"error": "Missing 'url' field"})
                return

            result = _extract(url)

            # Save to Supabase (fire & forget)
            try:
                _save_to_supabase(
                    video_url=url,
                    title=result["title"],
                    fmt="info",
                    user_id=data.get("user_id"),
                )
            except Exception:
                pass  # don't fail the response if DB write fails

            self._respond(200, result)
        except Exception as exc:
            self._respond(500, {
                "error": str(exc),
                "trace": traceback.format_exc(),
            })

    # ── helpers ──────────────────────────────────────────────────────────────
    def _respond(self, code: int, body: dict):
        self.send_response(code)
        for k, v in _cors_headers().items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(json.dumps(body).encode())
