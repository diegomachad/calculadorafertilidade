// blurProcessor.js - Gerencia seleção de regiões e aplicação de blur

class BlurProcessor {
    constructor(imageHandler) {
        this.imageHandler = imageHandler;
        this.canvas = imageHandler.getCanvas();
        this.ctx = imageHandler.getContext();
        this.blurRange = document.getElementById('blurRange');
        this.blurValue = document.getElementById('blurValue');
        
        this.isDrawing = false;
        this.selections = [];
        this.currentSelection = null;
        this.blurIntensity = 10;
        this.history = [];
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Canvas mouse events
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        
        // Touch events para mobile
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // Blur intensity control
        this.blurRange.addEventListener('input', this.updateBlurIntensity.bind(this));
        
        // Toolbar buttons
        document.getElementById('undoBtn').addEventListener('click', this.undo.bind(this));
        document.getElementById('clearBtn').addEventListener('click', this.clearAllSelections.bind(this));
    }

    handleMouseDown(event) {
        this.startSelection(this.getMousePosition(event));
    }

    handleMouseMove(event) {
        if (this.isDrawing) {
            this.updateSelection(this.getMousePosition(event));
        }
    }

    handleMouseUp(event) {
        if (this.isDrawing) {
            this.finishSelection(this.getMousePosition(event));
        }
    }

    handleMouseLeave(event) {
        if (this.isDrawing) {
            this.cancelSelection();
        }
    }

    // Touch events para suporte mobile
    handleTouchStart(event) {
        event.preventDefault();
        const touch = event.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const pos = {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
        this.startSelection(pos);
    }

    handleTouchMove(event) {
        event.preventDefault();
        if (this.isDrawing) {
            const touch = event.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const pos = {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top
            };
            this.updateSelection(pos);
        }
    }

    handleTouchEnd(event) {
        event.preventDefault();
        if (this.isDrawing) {
            this.finishSelection();
        }
    }

    getMousePosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    startSelection(pos) {
        this.isDrawing = true;
        this.currentSelection = {
            startX: pos.x,
            startY: pos.y,
            endX: pos.x,
            endY: pos.y
        };
        
        // Salvar estado atual no histórico
        this.saveToHistory();
    }

    updateSelection(pos) {
        if (!this.isDrawing || !this.currentSelection) return;
        
        this.currentSelection.endX = pos.x;
        this.currentSelection.endY = pos.y;
        
        this.redrawCanvas();
        this.drawSelectionRect(this.currentSelection);
    }

    finishSelection(pos) {
        if (!this.isDrawing || !this.currentSelection) return;
        
        this.isDrawing = false;
        
        if (pos) {
            this.currentSelection.endX = pos.x;
            this.currentSelection.endY = pos.y;
        }
        
        // Verificar se a seleção tem tamanho mínimo
        const minSize = 10;
        const width = Math.abs(this.currentSelection.endX - this.currentSelection.startX);
        const height = Math.abs(this.currentSelection.endY - this.currentSelection.startY);
        
        if (width < minSize || height < minSize) {
            this.cancelSelection();
            return;
        }
        
        // Normalizar coordenadas
        const selection = this.normalizeSelection(this.currentSelection);
        
        // Adicionar à lista de seleções
        this.selections.push(selection);
        
        // Aplicar blur
        this.applyBlurToSelection(selection);
        
        this.currentSelection = null;
    }

    cancelSelection() {
        this.isDrawing = false;
        this.currentSelection = null;
        this.redrawCanvas();
    }

    normalizeSelection(selection) {
        return {
            startX: Math.min(selection.startX, selection.endX),
            startY: Math.min(selection.startY, selection.endY),
            endX: Math.max(selection.startX, selection.endX),
            endY: Math.max(selection.startY, selection.endY),
            width: Math.abs(selection.endX - selection.startX),
            height: Math.abs(selection.endY - selection.startY)
        };
    }

    redrawCanvas() {
        // Redesenhar imagem original
        const originalImage = this.imageHandler.getOriginalImage();
        if (originalImage) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(originalImage, 0, 0, this.canvas.width, this.canvas.height);
            
            // Reaplicar todos os blurs
            this.selections.forEach(selection => {
                this.applyBlurToSelection(selection, false);
            });
        }
    }

    drawSelectionRect(selection) {
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        const width = selection.endX - selection.startX;
        const height = selection.endY - selection.startY;
        
        this.ctx.strokeRect(selection.startX, selection.startY, width, height);
        
        // Reset line dash
        this.ctx.setLineDash([]);
    }

    applyBlurToSelection(selection, showFeedback = true) {
        try {
            // Extrair dados da região
            const imageData = this.ctx.getImageData(
                selection.startX,
                selection.startY,
                selection.width,
                selection.height
            );
            
            // Aplicar blur usando StackBlur
            const blurredData = this.applyStackBlur(imageData, this.blurIntensity);
            
            // Colocar dados desfocados de volta no canvas
            this.ctx.putImageData(blurredData, selection.startX, selection.startY);
            
            if (showFeedback) {
                this.showMessage('Região desfocada aplicada!', 'success');
            }
        } catch (error) {
            console.error('Erro ao aplicar blur:', error);
            this.showMessage('Erro ao aplicar desfoque. Tente novamente.', 'error');
        }
    }

    applyStackBlur(imageData, radius) {
        // Verificar se StackBlur está disponível
        if (typeof StackBlur === 'undefined') {
            console.warn('StackBlur não disponível, usando blur alternativo');
            return this.applyFallbackBlur(imageData, radius);
        }

        // Criar canvas temporário para StackBlur
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = imageData.width;
        tempCanvas.height = imageData.height;
        
        tempCtx.putImageData(imageData, 0, 0);
        
        // Aplicar StackBlur
        StackBlur.canvasRGBA(tempCanvas, 0, 0, imageData.width, imageData.height, radius);
        
        return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
    }

    applyFallbackBlur(imageData, radius) {
        // Blur simples como fallback se StackBlur não estiver disponível
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const iterations = Math.min(3, Math.ceil(radius / 3));
        
        for (let i = 0; i < iterations; i++) {
            this.boxBlur(data, width, height, 1);
        }
        
        return imageData;
    }

    boxBlur(data, width, height, radius) {
        const temp = new Uint8ClampedArray(data);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0, a = 0, count = 0;
                
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const nx = x + dx;
                        const ny = y + dy;
                        
                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            const idx = (ny * width + nx) * 4;
                            r += temp[idx];
                            g += temp[idx + 1];
                            b += temp[idx + 2];
                            a += temp[idx + 3];
                            count++;
                        }
                    }
                }
                
                const idx = (y * width + x) * 4;
                data[idx] = r / count;
                data[idx + 1] = g / count;
                data[idx + 2] = b / count;
                data[idx + 3] = a / count;
            }
        }
    }

    updateBlurIntensity() {
        this.blurIntensity = parseInt(this.blurRange.value);
        this.blurValue.textContent = this.blurIntensity + 'px';
        
        // Reaplicar blur em todas as seleções com nova intensidade
        if (this.selections.length > 0) {
            this.redrawCanvas();
        }
    }

    saveToHistory() {
        // Salvar estado atual do canvas
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.history.push({
            imageData: imageData,
            selections: [...this.selections]
        });
        
        // Limitar histórico a 10 estados
        if (this.history.length > 10) {
            this.history.shift();
        }
    }

    undo() {
        if (this.history.length === 0) {
            this.showMessage('Nada para desfazer', 'info');
            return;
        }
        
        const lastState = this.history.pop();
        this.ctx.putImageData(lastState.imageData, 0, 0);
        this.selections = lastState.selections;
        
        this.showMessage('Ação desfeita', 'success');
    }

    clearAllSelections() {
        this.selections = [];
        this.history = [];
        this.redrawCanvas();
        this.showMessage('Todas as seleções removidas', 'info');
    }

    showMessage(message, type) {
        const statusDiv = document.getElementById('statusMessage');
        statusDiv.textContent = message;
        statusDiv.className = `status-message ${type}`;
        
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }

    // Getters para outros módulos
    getSelections() {
        return this.selections;
    }

    getBlurIntensity() {
        return this.blurIntensity;
    }
}

// Exportar para uso em outros módulos
window.BlurProcessor = BlurProcessor;