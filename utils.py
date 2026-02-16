import yt_dlp
import os

def get_video_info(url):
    """
    Recupera informações básicas do vídeo sem baixar.
    """
    # Configuração anti-bloqueio
    ydl_opts_base = {
        'quiet': True,
        'no_warnings': True,
        # Simula um cliente Android para evitar bloqueios de IP de datacenter
        'extractor_args': {
            'youtube': {
                'player_client': ['android', 'web'],
            }
        },
        # Força IPv4 pois IPv6 do datacenter as vezes é bloqueado
        'source_address': '0.0.0.0', 
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts_base) as ydl:
            info = ydl.extract_info(url, download=False)
            return {
                "title": info.get('title'),
                "thumbnail": info.get('thumbnail'),
                "duration": info.get('duration'),
                "uploader": info.get('uploader')
            }
    except Exception as e:
        return {"error": str(e)}

def download_media(url, format_type='mp4'):
    """
    Baixa o vídeo ou áudio.
    format_type: 'mp4' (Vídeo) ou 'mp3' (Áudio)
    Retorna o caminho do arquivo baixado.
    """
    output_folder = "downloads"
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # Configuração base com estratégias anti-bloqueio
    ydl_opts = {
        'outtmpl': f'{output_folder}/%(title)s.%(ext)s',
        'quiet': True,
        'no_warnings': True,
        'extractor_args': {
            'youtube': {
                'player_client': ['android', 'web'],
            }
        },
        'source_address': '0.0.0.0',
    }

    if format_type == 'mp3':
        ydl_opts.update({
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        })
    else:  # mp4
        ydl_opts.update({
            'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        })

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)
            
            if format_type == 'mp3':
                # O pós-processador do yt-dlp muda a extensão automaticamente para .mp3
                filename = os.path.splitext(filename)[0] + '.mp3'
            
            return filename
    except Exception as e:
        raise Exception(f"Erro no download: {str(e)}")
