// imageHandler.js - Gerencia upload, drag&drop e paste de imagens

class ImageHandler {
    constructor() {
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('fileInput');
        this.selectFileBtn = document.getElementById('selectFileBtn');
        this.canvas = document.getElementById('mainCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.originalImage = null;
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Drag & Drop Events
        this.dropZone.addEventListener('dragover', this.handleDragOver.bind(this));
        this.dropZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.dropZone.addEventListener('drop', this.handleDrop.bind(this));
        
        // File Input Events
        this.selectFileBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        
        // Paste Event
        document.addEventListener('paste', this.handlePaste.bind(this));
        
        // Click na drop zone
        this.dropZone.addEventListener('click', () => this.fileInput.click());
    }

    handleDragOver(event) {
        event.preventDefault();
        this.dropZone.classList.add('drag-over');
    }

    handleDragLeave(event) {
        event.preventDefault();
        this.dropZone.classList.remove('drag-over');
    }

    handleDrop(event) {
        event.preventDefault();
        this.dropZone.classList.remove('drag-over');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    handlePaste(event) {
        const items = event.clipboardData?.items;
        if (!items) return;

        for (let item of items) {
            if (item.type.indexOf('image') !== -1) {
                event.preventDefault();
                const file = item.getAsFile();
                this.processFile(file);
                break;
            }
        }
    }

    processFile(file) {
        // Validar arquivo
        if (!this.validateFile(file)) {
            return;
        }

        // Mostrar loading
        this.showLoading();

        // Processar imagem
        const reader = new FileReader();
        reader.onload = (e) => {
            this.loadImage(e.target.result);
        };
        reader.onerror = () => {
            this.showError('Erro ao ler o arquivo. Tente novamente.');
            this.hideLoading();
        };
        reader.readAsDataURL(file);
    }

    validateFile(file) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 50 * 1024 * 1024; // 50MB

        if (!allowedTypes.includes(file.type)) {
            this.showError('Formato não suportado. Use PNG, JPEG ou WebP.');
            return false;
        }

        if (file.size > maxSize) {
            this.showError('Arquivo muito grande. Máximo 50MB.');
            return false;
        }

        return true;
    }

    loadImage(src) {
        const img = new Image();
        img.onload = () => {
            this.originalImage = img;
            this.setupCanvas(img);
            this.drawImageOnCanvas(img);
            this.showEditor();
            this.hideLoading();
            this.showSuccess('Imagem carregada! Clique e arraste para selecionar áreas.');
        };
        img.onerror = () => {
            this.showError('Erro ao carregar a imagem. Verifique se o arquivo não está corrompido.');
            this.hideLoading();
        };
        img.src = src;
    }

    setupCanvas(img) {
        // Calcular dimensões mantendo aspect ratio
        const maxWidth = Math.min(800, window.innerWidth - 100);
        const maxHeight = Math.min(600, window.innerHeight - 300);
        
        let { width, height } = this.calculateCanvasSize(img.width, img.height, maxWidth, maxHeight);
        
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        
        // Armazenar scale factor para cálculos posteriores
        this.scaleX = width / img.width;
        this.scaleY = height / img.height;
    }

    calculateCanvasSize(imgWidth, imgHeight, maxWidth, maxHeight) {
        let width = imgWidth;
        let height = imgHeight;

        // Redimensionar se necessário
        if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
        }

        if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
        }

        return { width: Math.round(width), height: Math.round(height) };
    }

    drawImageOnCanvas(img) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
    }

    showEditor() {
        document.getElementById('dropZone').style.display = 'none';
        document.getElementById('editorContainer').style.display = 'block';
        document.getElementById('editorContainer').classList.add('fade-in');
        
        // Esconder instruções após alguns segundos
        setTimeout(() => {
            const instructions = document.getElementById('canvasInstructions');
            if (instructions) {
                instructions.classList.add('hidden');
            }
        }, 5000);
    }

    showLoading() {
        this.dropZone.classList.add('loading');
        this.dropZone.style.pointerEvents = 'none';
    }

    hideLoading() {
        this.dropZone.classList.remove('loading');
        this.dropZone.style.pointerEvents = 'auto';
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showMessage(message, type) {
        const statusDiv = document.getElementById('statusMessage');
        statusDiv.textContent = message;
        statusDiv.className = `status-message ${type}`;
        
        // Auto-hide após 5 segundos
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);
    }

    // Método para resetar e carregar nova imagem
    reset() {
        this.originalImage = null;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        document.getElementById('editorContainer').style.display = 'none';
        document.getElementById('dropZone').style.display = 'block';
        document.getElementById('statusMessage').style.display = 'none';
        
        // Reset file input
        this.fileInput.value = '';
    }

    // Getters para outros módulos
    getOriginalImage() {
        return this.originalImage;
    }

    getCanvas() {
        return this.canvas;
    }

    getContext() {
        return this.ctx;
    }

    getScaleFactors() {
        return {
            scaleX: this.scaleX || 1,
            scaleY: this.scaleY || 1
        };
    }
}

// Exportar para uso em outros módulos
window.ImageHandler = ImageHandler;