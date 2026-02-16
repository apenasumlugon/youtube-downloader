import yt_dlp
import sys

print(f"Python Executable: {sys.executable}")
print(f"yt-dlp version: {yt_dlp.version.__version__}")

# ID do usuário (problemático)
user_video_id = "-MXd1fzccdE"
user_url = f"https://www.youtube.com/watch?v={user_video_id}"

# ID de controle (conhecido por funcionar - Me at the zoo)
control_video_id = "jNQXAC9IVRw"
control_url = f"https://www.youtube.com/watch?v={control_video_id}"

ydl_opts = {
    'quiet': True,
    'no_warnings': True,
}

print(f"\n--- TESTE 1: Vídeo de Controle (Me at the zoo) ---")
try:
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(control_url, download=False)
        print(f"✅ SUCESSO! Título: {info.get('title')}")
except Exception as e:
    print(f"❌ FALHA NO CONTROLE: {e}")

print(f"\n--- TESTE 2: Vídeo do Usuário ({user_video_id}) ---")
try:
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(user_url, download=False)
        print(f"✅ SUCESSO! Título: {info.get('title')}")
except Exception as e:
    print(f"❌ FALHA NO VÍDEO DO USUÁRIO: {e}")
