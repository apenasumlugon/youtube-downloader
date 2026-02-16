# 📺 YouTube Downloader (Web App)

Aplicativo web moderno para baixar vídeos do YouTube em MP3 ou MP4, construído com **Python**, **Streamlit** e **yt-dlp**.

![Badge Streamlit](https://static.streamlit.io/badges/streamlit_badge_black_white.svg)

## 🚀 Funcionalidades

- **Preview do Vídeo:** Exibe thumbnail, título, canal e duração antes de baixar.
- **Formatos:** Escolha entre MP4 (Vídeo) ou MP3 (Áudio).
- **Processamento no Servidor:** O download e a conversão são feitos na nuvem, e o arquivo final é disponibilizado para você.
- **Limpeza Automática:** Arquivos temporários são removidos após o download.

---

## 🛠️ Como Rodar Localmente

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
    cd youtube-downloader
    ```

2.  **Instale as dependências:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Instale o FFmpeg:**
    - Baixe no site oficial: [ffmpeg.org](https://ffmpeg.org/download.html)
    - Adicione a pasta `bin` às Variáveis de Ambiente do sistema.
    - Teste com `ffmpeg -version` no terminal.

4.  **Rode o App:**
    ```bash
    streamlit run app.py
    ```

---

## ☁️ Como Fazer Deploy (Colocar Online Grátis)

A maneira mais fácil e gratuita é usar o **Streamlit Community Cloud**.

### Passo 1: Subir para o GitHub
1.  Crie um novo repositório no [GitHub](https://github.com/new).
2.  Faça o upload dos arquivos do projeto (`app.py`, `utils.py`, `requirements.txt`, `packages.txt`).
    - **Importante:** O arquivo `packages.txt` é essencial! Ele diz ao servidor para instalar o FFmpeg.

### Passo 2: Configurar no Streamlit Cloud
1.  Crie uma conta em [share.streamlit.io](https://share.streamlit.io/).
2.  Clique em **"New app"**.
3.  Selecione seu repositório do GitHub.
4.  Em **"Main file path"**, verifique se está `app.py`.
5.  Clique em **"Deploy!"**.

### Passo 3: Aguarde a Instalação
O Streamlit vai ler o `requirements.txt` (para bibliotecas Python) e o `packages.txt` (para o FFmpeg). Em 1 ou 2 minutos, seu app estará online! 🚀

---

## 📦 Estrutura de Arquivos

- `app.py`: Interface do usuário (Frontend).
- `utils.py`: Lógica de download e conversão (Backend).
- `requirements.txt`: Lista de bibliotecas Python.
- `packages.txt`: Lista de dependências do sistema Linux (FFmpeg).
