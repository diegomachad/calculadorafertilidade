// exportManager.js - Gerencia exportação de imagens (copy e download)

class ExportManager {
    constructor(imageHandler) {
        this.imageHandler = imageHandler;
        this.canvas = imageHandler.getCanvas();
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('copyBtn').addEventListener('click', this.copyToClipboard.bind(this));
        document.getElementById('downloadPngBtn').addEventListener('click', () => this.downloadImage('png'));
        document.getElementById('downloadJpgBtn').addEventListener('click', () => this.downloadImage('jpeg'));
    }

    async copyToClipboard() {
        try {
            // Verificar se a API de clipboard está disponível
            if (!navigator.clipboard || !navigator.clipboard.write) {
                this.fallbackCopyMethod();
                return;
            }

            // Verificar se estamos em contexto seguro (HTTPS)
            if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
                this.showMessage('Copy para clipboard requer HTTPS em produção', 'error');
                this.fallbackCopyMethod();
                return;
            }

            this.showMessage('Preparando imagem para clipboard...', 'info');

            // Converter canvas para blob
            const blob = await new Promise(resolve => {
                this.canvas.toBlob(resolve, 'image/png');
            });

            if (!blob) {
                throw new Error('Falha ao converter canvas para blob');
            }

            // Criar ClipboardItem
            const clipboardItem = new ClipboardItem({
                'image/png': blob
            });

            // Escrever no clipboard
            await navigator.clipboard.write([clipboardItem]);
            
            this.showMessage('✅ Imagem copiada para área de transferência!', 'success');
            
        } catch (error) {
            console.error('Erro ao copiar para clipboard:', error);
            
            if (error.name === 'NotAllowedError') {
                this.showMessage('Permissão negada. Clique no botão novamente e permita o acesso.', 'error');
            } else {
                this.showMessage('Erro ao copiar. Tentando método alternativo...', 'error');
                this.fallbackCopyMethod();
            }
        }
    }

    fallbackCopyMethod() {
        // Método alternativo: criar um link temporário para download
        try {
            const dataURL = this.canvas.toDataURL('image/png');
            
            // Criar textarea temporário com data URL
            const textArea = document.createElement('textarea');
            textArea.value = dataURL;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            
            textArea.select();
            textArea.setSelectionRange(0, 99999);
            
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (successful) {
                this.showMessage('📋 Data URL copiado! Cole em um editor de imagem.', 'info');
            } else {
                this.showMessage('Falha na cópia. Use o botão de download.', 'error');
            }
            
        } catch (error) {
            this.showMessage('Copiar não suportado. Use o botão de download.', 'error');
        }
    }

    downloadImage(format = 'png') {
        try {
            this.showMessage('Preparando download...', 'info');
            
            // Gerar nome do arquivo com timestamp
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
            const filename = `screenshot-blur-${timestamp}.${format}`;
            
            // Converter canvas para data URL
            let dataURL;
            if (format === 'jpeg') {
                dataURL = this.canvas.toDataURL('image/jpeg', 0.9);
            } else {
                dataURL = this.canvas.toDataURL('image/png');
            }
            
            // Criar link de download
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = filename;
            link.style.display = 'none';
            
            // Adicionar ao DOM, clicar e remover
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showMessage(`⬇️ Download iniciado: ${filename}`, 'success');
            
        } catch (error) {
            console.error('Erro no download:', error);
            this.showMessage('Erro ao fazer download. Tente novamente.', 'error');
        }
    }

    // Método para obter estatísticas da imagem
    getImageStats() {
        const originalImage = this.imageHandler.getOriginalImage();
        if (!originalImage) return null;

        return {
            originalWidth: originalImage.width,
            originalHeight: originalImage.height,
            canvasWidth: this.canvas.width,
            canvasHeight: this.canvas.height,
            fileSize: this.estimateFileSize(),
            format: 'PNG'
        };
    }

    estimateFileSize() {
        // Estimativa aproximada do tamanho do arquivo PNG
        const pixels = this.canvas.width * this.canvas.height;
        const bytesPerPixel = 4; // RGBA
        const compressionRatio = 0.6; // Estimativa de compressão PNG
        
        const sizeBytes = pixels * bytesPerPixel * compressionRatio;
        return this.formatFileSize(sizeBytes);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Método para exportar em diferentes qualidades
    downloadWithQuality(format, quality = 0.9) {
        try {
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
            const filename = `screenshot-blur-${timestamp}-q${Math.round(quality * 100)}.${format}`;
            
            let dataURL;
            if (format === 'jpeg') {
                dataURL = this.canvas.toDataURL('image/jpeg', quality);
            } else if (format === 'webp') {
                dataURL = this.canvas.toDataURL('image/webp', quality);
            } else {
                dataURL = this.canvas.toDataURL('image/png');
            }
            
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = filename;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showMessage(`Download ${format.toUpperCase()} iniciado!`, 'success');
            
        } catch (error) {
            console.error('Erro no download com qualidade:', error);
            this.showMessage('Erro no download. Tente o formato PNG.', 'error');
        }
    }

    // Método para verificar suporte a formatos
    getSupportedFormats() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        
        const formats = [];
        
        // Testar PNG (sempre suportado)
        formats.push('png');
        
        // Testar JPEG
        try {
            const jpegData = canvas.toDataURL('image/jpeg');
            if (jpegData.startsWith('data:image/jpeg')) {
                formats.push('jpeg');
            }
        } catch (e) {}
        
        // Testar WebP
        try {
            const webpData = canvas.toDataURL('image/webp');
            if (webpData.startsWith('data:image/webp')) {
                formats.push('webp');
            }
        } catch (e) {}
        
        return formats;
    }

    // Método para compartilhar via Web Share API (se disponível)
    async shareImage() {
        if (!navigator.share) {
            this.showMessage('Compartilhamento não suportado neste navegador', 'error');
            return;
        }

        try {
            const blob = await new Promise(resolve => {
                this.canvas.toBlob(resolve, 'image/png');
            });

            const file = new File([blob], 'screenshot-blur.png', { type: 'image/png' });

            await navigator.share({
                title: 'Screenshot Blur Tool',
                text: 'Imagem editada com Screenshot Blur Tool',
                files: [file]
            });

            this.showMessage('Compartilhamento iniciado!', 'success');

        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Erro ao compartilhar:', error);
                this.showMessage('Erro no compartilhamento', 'error');
            }
        }
    }

    showMessage(message, type) {
        const statusDiv = document.getElementById('statusMessage');
        statusDiv.textContent = message;
        statusDiv.className = `status-message ${type}`;
        
        setTimeout(() => {
            if (statusDiv.className.includes(type)) {
                statusDiv.style.display = 'none';
            }
        }, 4000);
    }

    // Método para debug/informações
    getDebugInfo() {
        return {
            canvasSize: `${this.canvas.width}x${this.canvas.height}`,
            clipboardSupport: !!navigator.clipboard,
            shareSupport: !!navigator.share,
            supportedFormats: this.getSupportedFormats(),
            isSecureContext: window.isSecureContext,
            protocol: location.protocol
        };
    }
}

// Exportar para uso em outros módulos
window.ExportManager = ExportManager;