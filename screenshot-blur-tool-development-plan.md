# 📸 Screenshot Blur Tool - Plano de Desenvolvimento

## 🎯 Visão Geral do Projeto

**Nome**: Screenshot Blur Tool  
**Objetivo**: Web app para aplicar desfoque em regiões específicas de imagens sem necessidade de backend ou configurações complexas.

---

## 📋 Passo a Passo de Desenvolvimento

### 1. Estrutura de Pastas
```
screenshot-blur-tool/
├── index.html
├── styles/
│   ├── main.css
│   └── components.css
├── scripts/
│   ├── app.js
│   ├── imageHandler.js
│   ├── blurProcessor.js
│   └── exportManager.js
├── assets/
│   ├── icons/
│   └── placeholders/
└── README.md
```

### 2. Componentes Principais
- **ImageUploader**: Gerencia drag&drop, paste e upload de arquivos
- **CanvasEditor**: Área de edição com seleção de regiões
- **BlurController**: Aplicação de efeitos de desfoque
- **ExportManager**: Download e copy-to-clipboard
- **UIControls**: Toolbar com opções de desfoque

### 3. Rotas/Estados da Aplicação
- **Estado Inicial**: Interface vazia com área de upload
- **Estado de Edição**: Imagem carregada com ferramentas ativas
- **Estado de Preview**: Visualização da imagem processada
- **Estado de Exportação**: Opções de download/copy

### 4. Framework e Tecnologias

#### Framework Sugerido: **Vanilla JavaScript + HTML5 Canvas**
```javascript
// Estrutura base da aplicação
const ScreenshotBlurApp = {
    canvas: null,
    context: null,
    originalImage: null,
    blurredImage: null,
    selections: [],
    
    init() {
        this.setupCanvas();
        this.bindEvents();
        this.setupDropZone();
    }
};
```

**Alternativa com React** (se preferir framework):
```jsx
// Componente principal
function App() {
    const [image, setImage] = useState(null);
    const [selections, setSelections] = useState([]);
    const [blurredImage, setBlurredImage] = useState(null);
    
    return (
        <div className="app">
            <ImageUploader onImageLoad={setImage} />
            <CanvasEditor image={image} onSelectionChange={setSelections} />
            <ExportControls blurredImage={blurredImage} />
        </div>
    );
}
```

---

## 🔧 Handlers Principais - Pseudocódigo

### Handler de Upload de Imagem
```javascript
// Pseudocódigo para imageHandler.js
function handleImageUpload(file) {
    if (!validateImageFile(file)) {
        showError("Formato de arquivo não suportado");
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            resizeCanvasToImage(img);
            drawImageOnCanvas(img);
            enableEditingMode();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function handlePaste(event) {
    const items = event.clipboardData.items;
    for (let item of items) {
        if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            handleImageUpload(file);
            break;
        }
    }
}

function handleDragDrop(event) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        handleImageUpload(files[0]);
    }
}
```

### Handler de Desenho de Máscara
```javascript
// Pseudocódigo para seleção de regiões
function handleMouseDown(event) {
    isDrawing = true;
    currentSelection = {
        startX: event.offsetX,
        startY: event.offsetY,
        endX: event.offsetX,
        endY: event.offsetY
    };
}

function handleMouseMove(event) {
    if (!isDrawing) return;
    
    currentSelection.endX = event.offsetX;
    currentSelection.endY = event.offsetY;
    
    redrawCanvas();
    drawSelectionRect(currentSelection);
}

function handleMouseUp(event) {
    isDrawing = false;
    selections.push({...currentSelection});
    applyBlurToSelection(currentSelection);
}
```

### Handler de Aplicação de Blur
```javascript
// Pseudocódigo para blurProcessor.js
function applyBlurToSelection(selection) {
    const imageData = context.getImageData(
        selection.startX, 
        selection.startY,
        selection.width, 
        selection.height
    );
    
    const blurredData = applyGaussianBlur(imageData, blurIntensity);
    
    context.putImageData(
        blurredData, 
        selection.startX, 
        selection.startY
    );
}

function applyGaussianBlur(imageData, radius) {
    // Implementação do filtro Gaussiano
    // Ou utilizar biblioteca como StackBlur.js
    return StackBlur.imageDataRGB(imageData, 0, 0, imageData.width, imageData.height, radius);
}
```

### Handler de Exportação
```javascript
// Pseudocódigo para exportManager.js
function copyToClipboard() {
    canvas.toBlob(function(blob) {
        const item = new ClipboardItem({ "image/png": blob });
        navigator.clipboard.write([item]).then(() => {
            showSuccessMessage("Imagem copiada para área de transferência");
        }).catch(() => {
            showFallbackCopyMethod();
        });
    });
}

function downloadImage(format = 'png') {
    const link = document.createElement('a');
    link.download = `blurred-screenshot.${format}`;
    
    if (format === 'jpeg') {
        link.href = canvas.toDataURL('image/jpeg', 0.9);
    } else {
        link.href = canvas.toDataURL('image/png');
    }
    
    link.click();
}
```

---

## 📚 Bibliotecas JavaScript Recomendadas

### Bibliotecas Essenciais
1. **StackBlur.js** - Blur eficiente para canvas
   ```html
   <script src="https://cdn.jsdelivr.net/npm/stackblur-canvas@2.5.0/dist/stackblur.min.js"></script>
   ```

2. **HTML5 Canvas API** (nativo) - Manipulação de imagens

### Bibliotecas Opcionais (para funcionalidades avançadas)
3. **Fabric.js** - Se precisar de seleções mais complexas
   ```javascript
   // Alternativa mais robusta para seleções
   const canvas = new fabric.Canvas('canvas');
   const rect = new fabric.Rect({
       left: 100, top: 100, fill: 'transparent',
       stroke: 'red', strokeWidth: 2
   });
   ```

4. **Cropper.js** - Para redimensionamento de imagens
   ```javascript
   // Apenas se implementar funcionalidade de crop
   const cropper = new Cropper(image, {
       aspectRatio: 16 / 9,
       crop(event) { /* handler */ }
   });
   ```

### Bibliotecas de UI (opcional)
5. **Tailwind CSS** - Para estilização rápida
6. **Lucide Icons** - Ícones minimalistas

---

## 🎨 Estrutura da Interface

### HTML Base
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Screenshot Blur Tool</title>
    <link rel="stylesheet" href="styles/main.css">
</head>
<body>
    <div class="app-container">
        <header class="app-header">
            <h1>Screenshot Blur Tool</h1>
        </header>
        
        <main class="app-main">
            <div class="drop-zone" id="dropZone">
                <p>Arraste uma imagem aqui ou clique para selecionar</p>
                <input type="file" id="fileInput" accept="image/*" hidden>
            </div>
            
            <div class="editor-container" id="editorContainer" style="display: none;">
                <div class="toolbar">
                    <button id="undoBtn">Desfazer</button>
                    <input type="range" id="blurRange" min="1" max="20" value="10">
                    <button id="clearBtn">Limpar Seleções</button>
                </div>
                
                <canvas id="mainCanvas"></canvas>
                
                <div class="export-controls">
                    <button id="copyBtn">Copiar para Área de Transferência</button>
                    <button id="downloadPngBtn">Baixar PNG</button>
                    <button id="downloadJpgBtn">Baixar JPEG</button>
                </div>
            </div>
        </main>
    </div>
    
    <script src="scripts/app.js"></script>
</body>
</html>
```

### CSS Responsivo
```css
/* styles/main.css */
.app-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.drop-zone {
    border: 2px dashed #ccc;
    border-radius: 10px;
    padding: 60px 20px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.3s;
}

.drop-zone:hover,
.drop-zone.drag-over {
    border-color: #007bff;
    background-color: #f8f9fa;
}

.editor-container {
    margin-top: 20px;
}

.toolbar {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    padding: 10px;
    background: #f5f5f5;
    border-radius: 5px;
}

#mainCanvas {
    max-width: 100%;
    border: 1px solid #ddd;
    cursor: crosshair;
}

.export-controls {
    margin-top: 20px;
    display: flex;
    gap: 10px;
}

/* Responsividade */
@media (max-width: 768px) {
    .toolbar {
        flex-direction: column;
    }
    
    .export-controls {
        flex-direction: column;
    }
}
```

---

## ✅ Sugestões de Testes e Validações

### 1. Testes de Funcionalidade
```javascript
// Testes a implementar
const tests = [
    {
        name: "Upload de imagem por drag&drop",
        test: () => {
            // Simular drag&drop de arquivo
            // Verificar se imagem aparece no canvas
        }
    },
    {
        name: "Paste de imagem do clipboard",
        test: () => {
            // Simular Ctrl+V com imagem
            // Verificar carregamento
        }
    },
    {
        name: "Seleção de região para blur",
        test: () => {
            // Simular clique e arrastar
            // Verificar se retângulo de seleção aparece
        }
    },
    {
        name: "Aplicação de blur",
        test: () => {
            // Verificar se região selecionada fica desfocada
        }
    },
    {
        name: "Copy para clipboard",
        test: () => {
            // Verificar se navigator.clipboard.write funciona
        }
    },
    {
        name: "Download de imagem",
        test: () => {
            // Verificar se download inicia
        }
    }
];
```

### 2. Validações de Usabilidade
- **Performance**: Testar com imagens de diferentes tamanhos (1MB, 5MB, 10MB)
- **Responsividade**: Verificar funcionamento em mobile, tablet e desktop
- **Acessibilidade**: Adicionar atributos ARIA e navegação por teclado
- **Compatibilidade**: Testar em Chrome, Firefox, Safari, Edge

### 3. Validações de Input
```javascript
function validateImageFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    if (!allowedTypes.includes(file.type)) {
        throw new Error('Formato não suportado. Use PNG, JPEG ou WebP.');
    }
    
    if (file.size > maxSize) {
        throw new Error('Arquivo muito grande. Máximo 50MB.');
    }
    
    return true;
}
```

### 4. Testes de Edge Cases
- Imagens muito pequenas (< 100px)
- Imagens muito grandes (> 4K)
- Múltiplas seleções sobrepostas
- Desfazer várias operações
- Clipboard sem permissão
- Browser sem suporte a Canvas

---

## ⚠️ Checklist de Compatibilidade

### ✅ Funcionalidades Verificadas
- **Canvas API**: Suportado em todos os navegadores modernos
- **File API**: Chrome 6+, Firefox 3.6+, Safari 6+, Edge 12+
- **Clipboard API**: Chrome 66+, Firefox 63+, Safari 13.1+, Edge 79+
- **Drag & Drop**: Universalmente suportado

### ⚠️ Permissões e Limitações
- **Clipboard**: Requer HTTPS em produção e permissão do usuário
- **File Size**: Limite do browser (~200MB no Chrome)
- **Canvas Memory**: Limite de ~268MB por canvas

### 🔧 Configurações Extras Necessárias
1. **HTTPS**: Para clipboard API funcionar
2. **Content Security Policy**: Se usando CDN para bibliotecas
3. **Service Worker**: Para funcionamento offline (opcional)

---

## 📊 Métricas de Sucesso Sugeridas

### Métricas Técnicas
- Tempo de carregamento de imagem < 2s
- Aplicação de blur < 1s para regiões de até 500x500px
- Taxa de sucesso de copy/download > 95%

### Métricas de Uso
- Número de regiões borradas por sessão
- Tempo médio entre upload e exportação
- Taxa de retenção na sessão

---

## 🚀 Próximos Passos

1. **Setup inicial**: Criar estrutura de pastas e arquivos base
2. **Implementar upload**: Drag&drop e paste functionality
3. **Canvas setup**: Configurar área de edição
4. **Seleção de regiões**: Implementar mouse events
5. **Aplicar blur**: Integrar biblioteca de blur
6. **Exportação**: Copy e download
7. **Polish UI**: Melhorar interface e responsividade
8. **Testes**: Validar em diferentes browsers e dispositivos

---

**Tempo estimado de desenvolvimento**: 2-3 dias para MVP funcional