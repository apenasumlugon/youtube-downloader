import streamlit as st
import utils
import os

st.set_page_config(
    page_title="YouTube Downloader",
    page_icon="📺",
    layout="centered"
)

# --- Configuração de Cookies (Bypass Bloqueios) ---
# Tenta carregar cookies das Secrets do Streamlit Cloud
if "YOUTUBE_COOKIES" in st.secrets:
    with open("cookies.txt", "w") as f:
        f.write(st.secrets["YOUTUBE_COOKIES"])
    st.sidebar.success("🍪 Cookies carregados com sucesso!")
elif os.path.exists("cookies.txt"):
    st.sidebar.info("🍪 Arquivo local cookies.txt detectado.")
else:
    st.sidebar.warning("⚠️ Sem cookies configurados. Bloqueios podem ocorrer.")

st.title("📺 YouTube Downloader")
st.markdown("---")

# Input de URL
url = st.text_input("🔗 Cole o link do YouTube aqui:", placeholder="https://www.youtube.com/watch?v=...")

if url:
    # Mostra um spinner enquanto busca as infos (rápido)
    with st.spinner("🔍 Buscando informações do vídeo..."):
        info = utils.get_video_info(url)

    if "error" in info:
        st.error(f"❌ Erro ao buscar vídeo: {info['error']}")
    else:
        # Layout de colunas para exibir thumbnail e detalhes
        col1, col2 = st.columns([1, 1.5])
        
        with col1:
            if info['thumbnail']:
                st.image(info['thumbnail'], use_container_width=True)
        
        with col2:
            st.subheader(info['title'])
            st.markdown(f"**👤 Canal:** {info['uploader']}")
            st.markdown(f"**⏱️ Duração:** {info['duration']} segundos")

        st.markdown("---")
        
        # Opções de Download
        option = st.radio(
            "Escolha o formato do download:",
            ["🎬 Vídeo (MP4)", "🎵 Áudio (MP3)"],
            horizontal=True
        )
        
        format_type = 'mp4' if 'Vídeo' in option else 'mp3'

        # Botão de Ação
        # Usamos um botão primário para destacar a ação
        if st.button("🚀 Baixar e Converter", type="primary"):
            with st.spinner("⚙️ Processando... (Isso pode levar alguns segundos dependendo do tamanho)"):
                try:
                    # Chama o backend
                    file_path = utils.download_media(url, format_type)
                    
                    if os.path.exists(file_path):
                        # Lê o arquivo para memória para permitir o download via Streamlit
                        with open(file_path, "rb") as file:
                            file_bytes = file.read()
                        
                        file_name = os.path.basename(file_path)
                        mime_type = "video/mp4" if format_type == 'mp4' else "audio/mpeg"

                        st.success("✅ Processamento concluído com sucesso!")
                        
                        # Botão de Download Real
                        st.download_button(
                            label="⬇️ Salvar Arquivo no Computador",
                            data=file_bytes,
                            file_name=file_name,
                            mime=mime_type
                        )
                        
                        # Limpeza do arquivo temporário no servidor
                        os.remove(file_path)
                    else:
                        st.error("Erro: O arquivo não foi encontrado após o download.")
                        
                except Exception as e:
                    st.error(f"Ocorreu um erro durante o processamento: {e}")

st.markdown("---")
st.caption("Desenvolvido com ❤️ usando Streamlit e yt-dlp")
