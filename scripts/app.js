// app.js - Arquivo principal que coordena toda a aplicação

class ScreenshotBlurApp {
    constructor() {
        this.imageHandler = null;
        this.blurProcessor = null;
        this.exportManager = null;
        
        this.init();
    }

    init() {
        // Aguardar carregamento completo do DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        try {
            console.log('🚀 Inicializando Screenshot Blur Tool...');
            
            // Verificar suporte do navegador
            this.checkBrowserSupport();
            
            // Inicializar módulos
            this.initializeModules();
            
            // Configurar eventos globais
            this.setupGlobalEvents();
            
            // Mostrar informações de debug no console
            this.logDebugInfo();
            
            console.log('✅ Screenshot Blur Tool carregado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar aplicação:', error);
            this.showFatalError('Erro ao inicializar a aplicação. Recarregue a página.');
        }
    }

    checkBrowserSupport() {
        const required = {
            canvas: !!document.createElement('canvas').getContext,
            fileReader: !!window.FileReader,
            dragDrop: 'draggable' in document.createElement('div'),
            localStorage: !!window.localStorage
        };

        const missing = Object.entries(required)
            .filter(([key, supported]) => !supported)
            .map(([key]) => key);

        if (missing.length > 0) {
            throw new Error(`Recursos não suportados: ${missing.join(', ')}`);
        }

        // Avisos para recursos opcionais
        if (!navigator.clipboard) {
            console.warn('⚠️ Clipboard API não disponível - funcionalidade de copy limitada');
        }

        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
            console.warn('⚠️ HTTPS recomendado para melhor funcionamento do clipboard');
        }
    }

    initializeModules() {
        // Inicializar ImageHandler primeiro
        this.imageHandler = new ImageHandler();
        
        // Inicializar BlurProcessor
        this.blurProcessor = new BlurProcessor(this.imageHandler);
        
        // Inicializar ExportManager
        this.exportManager = new ExportManager(this.imageHandler);
        
        // Conectar módulos
        this.connectModules();
    }

    connectModules() {
        // Adicionar botão "Nova Imagem"
        document.getElementById('newImageBtn').addEventListener('click', () => {
            this.resetApplication();
        });

        // Adicionar eventos de teclado
        this.setupKeyboardShortcuts();
    }

    setupGlobalEvents() {
        // Prevenir comportamento padrão de drag&drop na página toda
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // Handler para redimensionamento da janela
        window.addEventListener('resize', this.debounce(() => {
            this.handleWindowResize();
        }, 250));

        // Handler para mudança de visibilidade da página
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseOperations();
            } else {
                this.resumeOperations();
            }
        });

        // Handler para erros globais
        window.addEventListener('error', (event) => {
            console.error('Erro global capturado:', event.error);
            this.handleGlobalError(event.error);
        });

        // Handler para erros de Promise não capturadas
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promise rejeitada não capturada:', event.reason);
            this.handleGlobalError(event.reason);
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Ctrl/Cmd + V = Paste
            if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
                // O handler de paste já está configurado no ImageHandler
                return;
            }

            // Ctrl/Cmd + Z = Undo
            if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
                event.preventDefault();
                if (this.blurProcessor) {
                    this.blurProcessor.undo();
                }
                return;
            }

            // Ctrl/Cmd + C = Copy to clipboard
            if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
                const editorVisible = document.getElementById('editorContainer').style.display !== 'none';
                if (editorVisible && this.exportManager) {
                    event.preventDefault();
                    this.exportManager.copyToClipboard();
                }
                return;
            }

            // Escape = Clear current selection
            if (event.key === 'Escape') {
                if (this.blurProcessor && this.blurProcessor.isDrawing) {
                    this.blurProcessor.cancelSelection();
                }
                return;
            }

            // Delete = Clear all selections
            if (event.key === 'Delete') {
                if (this.blurProcessor) {
                    this.blurProcessor.clearAllSelections();
                }
                return;
            }
        });
    }

    handleWindowResize() {
        // Reajustar canvas se necessário
        const originalImage = this.imageHandler?.getOriginalImage();
        if (originalImage) {
            this.imageHandler.setupCanvas(originalImage);
            this.imageHandler.drawImageOnCanvas(originalImage);
            
            // Reaplicar blurs
            if (this.blurProcessor) {
                this.blurProcessor.redrawCanvas();
            }
        }
    }

    pauseOperations() {
        // Pausar operações quando a página não está visível
        console.log('🔄 Pausando operações...');
    }

    resumeOperations() {
        // Retomar operações quando a página volta a ficar visível
        console.log('▶️ Retomando operações...');
    }

    handleGlobalError(error) {
        // Log do erro
        console.error('Erro global:', error);
        
        // Não mostrar erros menores ao usuário
        if (error.name === 'NetworkError' || error.message.includes('Loading chunk')) {
            return;
        }
        
        // Mostrar erro ao usuário apenas se for crítico
        if (error.message.includes('Canvas') || error.message.includes('Image')) {
            this.showMessage('Ocorreu um erro inesperado. Tente recarregar a página.', 'error');
        }
    }

    resetApplication() {
        try {
            // Reset do ImageHandler
            if (this.imageHandler) {
                this.imageHandler.reset();
            }
            
            // Reset do BlurProcessor
            if (this.blurProcessor) {
                this.blurProcessor.clearAllSelections();
            }
            
            // Limpar mensagens
            const statusMessage = document.getElementById('statusMessage');
            if (statusMessage) {
                statusMessage.style.display = 'none';
            }
            
            console.log('🔄 Aplicação resetada');
            
        } catch (error) {
            console.error('Erro ao resetar aplicação:', error);
            this.showMessage('Erro ao resetar. Recarregue a página.', 'error');
        }
    }

    // Utilitários
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    showMessage(message, type) {
        const statusDiv = document.getElementById('statusMessage');
        if (statusDiv) {
            statusDiv.textContent = message;
            statusDiv.className = `status-message ${type}`;
            
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 5000);
        }
    }

    showFatalError(message) {
        // Mostrar erro crítico que impede o funcionamento
        const container = document.querySelector('.app-container');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: white;">
                    <h2>⚠️ Erro Crítico</h2>
                    <p>${message}</p>
                    <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #fff; color: #333; border: none; border-radius: 4px; cursor: pointer;">
                        Recarregar Página
                    </button>
                </div>
            `;
        }
    }

    logDebugInfo() {
        if (console.group) {
            console.group('🔍 Debug Info - Screenshot Blur Tool');
            console.log('Browser:', navigator.userAgent);
            console.log('Canvas support:', !!document.createElement('canvas').getContext);
            console.log('Clipboard API:', !!navigator.clipboard);
            console.log('Secure context:', window.isSecureContext);
            console.log('Protocol:', location.protocol);
            console.log('StackBlur loaded:', typeof StackBlur !== 'undefined');
            
            if (this.exportManager) {
                console.log('Debug info:', this.exportManager.getDebugInfo());
            }
            
            console.groupEnd();
        }
    }

    // Métodos públicos para debug/testing
    getVersion() {
        return '1.0.0';
    }

    getModules() {
        return {
            imageHandler: this.imageHandler,
            blurProcessor: this.blurProcessor,
            exportManager: this.exportManager
        };
    }

    exportDebugData() {
        const debugData = {
            version: this.getVersion(),
            timestamp: new Date().toISOString(),
            browser: navigator.userAgent,
            modules: Object.keys(this.getModules()),
            capabilities: {
                canvas: !!document.createElement('canvas').getContext,
                clipboard: !!navigator.clipboard,
                fileReader: !!window.FileReader,
                stackBlur: typeof StackBlur !== 'undefined'
            }
        };

        console.log('Debug data:', debugData);
        return debugData;
    }
}

// Inicializar aplicação quando script for carregado
const app = new ScreenshotBlurApp();

// Tornar a instância da app disponível globalmente para debug
window.ScreenshotBlurApp = app;

// Service Worker para cache (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Registrar service worker seria implementado aqui se necessário
        console.log('Service Worker support disponível');
    });
}