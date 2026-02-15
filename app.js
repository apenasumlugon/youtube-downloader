// ============================
// YTDown - YouTube Downloader PWA
// ============================

(function () {
    'use strict';

    // ---- Configuration ----
    // Use our own proxy endpoint to avoid CORS issues
    const API_ENDPOINT = '/api/download';

    // ---- DOM Elements ----
    const urlInput = document.getElementById('url-input');
    const pasteBtn = document.getElementById('paste-btn');
    const downloadBtn = document.getElementById('download-btn');
    const btnContent = downloadBtn.querySelector('.btn-content');
    const btnLoading = downloadBtn.querySelector('.btn-loading');
    const statusContainer = document.getElementById('status-container');
    const previewCard = document.getElementById('preview-card');
    const previewImg = document.getElementById('preview-img');
    const previewTitle = document.getElementById('preview-title');
    const previewAuthor = document.getElementById('preview-author');
    const tabVideo = document.getElementById('tab-video');
    const tabAudio = document.getElementById('tab-audio');
    const qualityVideo = document.getElementById('quality-video');
    const qualityAudio = document.getElementById('quality-audio');
    const particlesContainer = document.getElementById('particles');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    // ---- State ----
    let selectedFormat = 'video'; // 'video' or 'audio'
    let selectedQuality = '1080';
    let selectedBitrate = '256';
    let isProcessing = false;

    // ============================
    // Initialization
    // ============================
    function init() {
        createParticles();
        bindEvents();
        registerServiceWorker();
        setupPWAInstall();
        handleSharedUrl();
    }

    // ============================
    // Handle Shared URLs (Android Share Target)
    // ============================
    function handleSharedUrl() {
        const params = new URLSearchParams(window.location.search);
        const sharedUrl = params.get('url') || params.get('text');
        if (sharedUrl) {
            // Extract YouTube URL from shared text (might contain extra text)
            const ytMatch = sharedUrl.match(/(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=[\w-]+|youtu\.be\/[\w-]+|youtube\.com\/shorts\/[\w-]+)/);
            if (ytMatch) {
                urlInput.value = ytMatch[0].startsWith('http') ? ytMatch[0] : 'https://' + ytMatch[0];
            } else {
                urlInput.value = sharedUrl;
            }
            handleInputChange();
            // Clean the URL
            window.history.replaceState({}, '', window.location.pathname);
        }
    }

    // ============================
    // Background Particles
    // ============================
    function createParticles() {
        const count = window.innerWidth < 600 ? 15 : 25;
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            const size = Math.random() * 3 + 1;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDuration = `${Math.random() * 15 + 10}s`;
            particle.style.animationDelay = `${Math.random() * 10}s`;
            particle.style.opacity = `${Math.random() * 0.4 + 0.1}`;

            // Violet/pink/purple random colors
            const colors = ['#7c3aed', '#a855f7', '#ec4899', '#8b5cf6', '#c084fc'];
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];

            particlesContainer.appendChild(particle);
        }
    }

    // ============================
    // Event Binding
    // ============================
    function bindEvents() {
        // URL Input
        urlInput.addEventListener('input', handleInputChange);
        urlInput.addEventListener('paste', () => setTimeout(handleInputChange, 50));

        // Paste button
        pasteBtn.addEventListener('click', handlePaste);

        // Download button
        downloadBtn.addEventListener('click', handleDownload);

        // Format tabs
        tabVideo.addEventListener('click', () => setFormat('video'));
        tabAudio.addEventListener('click', () => setFormat('audio'));

        // Quality buttons
        document.querySelectorAll('#quality-video .quality-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#quality-video .quality-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedQuality = btn.dataset.quality;
            });
        });

        document.querySelectorAll('#quality-audio .quality-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#quality-audio .quality-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedBitrate = btn.dataset.bitrate;
            });
        });

        // Allow Enter key to trigger download
        urlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !downloadBtn.disabled) {
                handleDownload();
            }
        });
    }

    // ============================
    // Input Handling
    // ============================
    function handleInputChange() {
        const url = urlInput.value.trim();
        const isValid = isValidYouTubeUrl(url);
        downloadBtn.disabled = !isValid;

        if (isValid) {
            showVideoPreview(url);
        } else {
            hidePreview();
        }
    }

    function isValidYouTubeUrl(url) {
        if (!url) return false;
        const patterns = [
            /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+/,
            /^(https?:\/\/)?(www\.)?youtube\.com\/shorts\/[\w-]+/,
            /^(https?:\/\/)?youtu\.be\/[\w-]+/,
            /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/[\w-]+/,
            /^(https?:\/\/)?m\.youtube\.com\/watch\?v=[\w-]+/,
            /^(https?:\/\/)?(music\.)?youtube\.com\/watch\?v=[\w-]+/,
        ];
        return patterns.some(pattern => pattern.test(url));
    }

    function extractVideoId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]+)/,
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    }

    // ============================
    // Video Preview
    // ============================
    function showVideoPreview(url) {
        const videoId = extractVideoId(url);
        if (!videoId) return;

        previewImg.src = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
        previewImg.onerror = () => {
            previewImg.src = `https://i.ytimg.com/vi/${videoId}/default.jpg`;
        };
        previewTitle.textContent = 'Vídeo do YouTube';
        previewAuthor.textContent = `ID: ${videoId}`;
        previewCard.classList.remove('hidden');
    }

    function hidePreview() {
        previewCard.classList.add('hidden');
    }

    // ============================
    // Paste
    // ============================
    async function handlePaste() {
        try {
            const text = await navigator.clipboard.readText();
            urlInput.value = text;
            handleInputChange();
            showToast('Link colado!');
        } catch (err) {
            // Fallback for browsers that don't support clipboard API
            urlInput.focus();
            document.execCommand('paste');
            showToast('Use Ctrl+V para colar');
        }
    }

    // ============================
    // Format Selection
    // ============================
    function setFormat(format) {
        selectedFormat = format;

        tabVideo.classList.toggle('active', format === 'video');
        tabAudio.classList.toggle('active', format === 'audio');

        qualityVideo.classList.toggle('hidden', format !== 'video');
        qualityAudio.classList.toggle('hidden', format !== 'audio');

        // Update button text
        const btnText = btnContent.querySelector('span');
        btnText.textContent = format === 'video' ? 'Baixar Vídeo' : 'Baixar Áudio';
    }

    // ============================
    // Download Logic
    // ============================
    async function handleDownload() {
        if (isProcessing) return;

        const url = urlInput.value.trim();
        if (!isValidYouTubeUrl(url)) {
            showStatus('error', 'Link inválido. Cole um link do YouTube válido.');
            return;
        }

        setProcessing(true);
        clearStatus();
        showStatus('info', 'Processando seu download...');

        try {
            const result = await requestDownload(url);
            await processResult(result);
        } catch (error) {
            console.error('Download error:', error);
            showStatus('error', error.message || 'Erro ao processar o download. Tente novamente.');
        } finally {
            setProcessing(false);
        }
    }

    async function requestDownload(url) {
        const body = {
            url: url,
        };

        if (selectedFormat === 'video') {
            body.downloadMode = 'auto';
            body.videoQuality = selectedQuality;
            body.youtubeVideoCodec = 'h264';
            body.youtubeVideoContainer = 'mp4';
        } else {
            body.downloadMode = 'audio';
            body.audioFormat = 'mp3';
            body.audioBitrate = selectedBitrate;
        }

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMsg = errorData?.error?.code || `Erro HTTP ${response.status}`;
                throw new Error(translateError(errorMsg));
            }

            return await response.json();
        } catch (error) {
            if (error.name === 'TypeError') {
                throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
            }
            throw error;
        }
    }

    async function processResult(result) {
        switch (result.status) {
            case 'tunnel':
            case 'redirect':
                showStatus('success', 'Download pronto! Iniciando...');
                // Open download in a new tab/trigger download
                triggerDownload(result.url, result.filename);
                break;

            case 'picker':
                // Multiple items available, download the first one
                if (result.picker && result.picker.length > 0) {
                    showStatus('success', 'Arquivo encontrado! Iniciando download...');
                    triggerDownload(result.picker[0].url, 'video.mp4');
                } else {
                    throw new Error('Nenhum arquivo disponível para download.');
                }
                break;

            case 'error':
                throw new Error(translateError(result.error?.code || 'Erro desconhecido'));

            default:
                throw new Error('Resposta inesperada do servidor. Tente novamente.');
        }
    }

    function triggerDownload(url, filename) {
        // Create a temporary anchor to trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';

        if (filename) {
            a.download = filename;
        }

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        showToast('Download iniciado!');
    }

    // ============================
    // Error Translation
    // ============================
    function translateError(code) {
        const errors = {
            'error.api.link.invalid': 'Link inválido. Verifique o URL e tente novamente.',
            'error.api.link.unsupported': 'Este link não é suportado.',
            'error.api.fetch.fail': 'Não foi possível acessar o vídeo. Ele pode ser privado ou restrito.',
            'error.api.fetch.rate': 'Muitas requisições. Aguarde um momento e tente novamente.',
            'error.api.content.video.unavailable': 'Vídeo indisponível. Pode ter sido removido ou estar privado.',
            'error.api.content.video.live': 'Não é possível baixar transmissões ao vivo.',
            'error.api.content.video.age': 'Este vídeo tem restrição de idade.',
            'error.api.content.post.unavailable': 'Conteúdo indisponível.',
            'error.api.youtube.login': 'O YouTube requer autenticação para acessar este vídeo.',
            'error.api.youtube.decipher': 'Erro ao processar o vídeo. Tente novamente.',
            'error.api.youtube.token_expired': 'Sessão expirada. Tente novamente.',
        };

        return errors[code] || `Erro: ${code}. Tente novamente ou use outro link.`;
    }

    // ============================
    // UI State
    // ============================
    function setProcessing(state) {
        isProcessing = state;
        downloadBtn.disabled = state;
        btnContent.classList.toggle('hidden', state);
        btnLoading.classList.toggle('hidden', !state);
    }

    function showStatus(type, message) {
        const icons = {
            error: '<svg viewBox="0 0 24 24" fill="none" class="status-icon"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
            success: '<svg viewBox="0 0 24 24" fill="none" class="status-icon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            info: '<svg viewBox="0 0 24 24" fill="none" class="status-icon"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
        };

        statusContainer.innerHTML = `
            <div class="status-message ${type}">
                ${icons[type] || ''}
                <span>${message}</span>
            </div>
        `;
    }

    function clearStatus() {
        statusContainer.innerHTML = '';
    }

    function showToast(msg) {
        toastMessage.textContent = msg;
        toast.classList.remove('hidden');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
            toast.classList.add('hidden');
        }, 2500);
    }

    // ============================
    // Service Worker Registration
    // ============================
    async function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('sw.js');
                console.log('Service Worker registered');
            } catch (err) {
                console.log('Service Worker registration failed:', err);
            }
        }
    }

    // ============================
    // PWA Install Prompt
    // ============================
    let deferredPrompt = null;

    function setupPWAInstall() {
        const installBanner = document.getElementById('install-banner');
        const installAccept = document.getElementById('install-accept');
        const installDismiss = document.getElementById('install-dismiss');

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            installBanner.classList.remove('hidden');
        });

        installAccept.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    showToast('App instalado com sucesso!');
                }
                deferredPrompt = null;
                installBanner.classList.add('hidden');
            }
        });

        installDismiss.addEventListener('click', () => {
            installBanner.classList.add('hidden');
        });

        window.addEventListener('appinstalled', () => {
            installBanner.classList.add('hidden');
            deferredPrompt = null;
        });
    }

    // ---- Start the app ----
    init();
})();
