# 📸 Screenshot Blur Tool - Protótipo Funcional

Um web app para aplicar desfoque em regiões específicas de imagens, protegendo dados sensíveis em capturas de tela.

## 🚀 Como Usar

### 1. **Carregar Imagem**
- **Arrastar & Soltar**: Arraste qualquer imagem para a área central
- **Clicar e Selecionar**: Clique no botão "clique para selecionar"
- **Colar (Ctrl+V)**: Cole uma imagem copiada diretamente

### 2. **Aplicar Desfoque**
- Clique e arraste no canvas para selecionar áreas
- Ajuste a intensidade do blur com o slider (1-20px)
- Múltiplas seleções são suportadas

### 3. **Exportar Resultado**
- **📋 Copiar**: Copia para área de transferência (requer HTTPS)
- **⬇️ Baixar PNG**: Download em alta qualidade
- **⬇️ Baixar JPEG**: Download comprimido

## ⌨️ Atalhos de Teclado

- `Ctrl+V` - Colar imagem
- `Ctrl+C` - Copiar imagem editada
- `Ctrl+Z` - Desfazer última ação
- `Esc` - Cancelar seleção atual
- `Delete` - Limpar todas as seleções

## 🛠️ Tecnologias Utilizadas

- **HTML5 Canvas** - Manipulação de imagens
- **StackBlur.js** - Algoritmo de blur otimizado
- **Vanilla JavaScript** - Zero dependências de framework
- **CSS Grid & Flexbox** - Layout responsivo
- **Clipboard API** - Copy para área de transferência

## 📁 Estrutura do Projeto

```
screenshot-blur-tool/
├── index.html              # Página principal
├── styles/
│   └── main.css            # Estilos responsivos
├── scripts/
│   ├── app.js              # Coordenador principal
│   ├── imageHandler.js     # Upload e carregamento
│   ├── blurProcessor.js    # Seleção e aplicação de blur
│   └── exportManager.js    # Download e clipboard
└── README.md               # Este arquivo
```

## 🧪 Testando o Protótipo

### Para testar localmente:

1. **Servidor HTTP simples:**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (com http-server)
   npx http-server
   ```

2. **Acessar:** `http://localhost:8000`

### Cenários de Teste:

✅ **Upload de Imagens**
- Teste com PNG, JPEG, WebP
- Imagens pequenas e grandes (até 50MB)
- Drag & drop from desktop/outros apps

✅ **Seleção de Regiões**
- Clique e arraste para criar seleções
- Múltiplas regiões sobrepostas
- Ajuste de intensidade em tempo real

✅ **Copy & Download**
- Copy para clipboard (funciona em HTTPS)
- Download PNG e JPEG
- Nomes de arquivo únicos com timestamp

## 🌐 Compatibilidade

### ✅ Navegadores Suportados
- **Chrome 66+** (Full support)
- **Firefox 63+** (Full support)  
- **Safari 13.1+** (Full support)
- **Edge 79+** (Full support)

### ⚠️ Limitações Conhecidas
- **Clipboard API**: Requer HTTPS em produção
- **File Size**: Recomendado até 50MB para performance
- **Mobile**: Touch events implementados, mas desktop é ideal

## 🎯 Funcionalidades Implementadas

- [x] Drag & Drop de imagens
- [x] Paste de imagens (Ctrl+V)
- [x] Seleção por clique e arrastar
- [x] Blur com StackBlur.js (fallback included)
- [x] Controle de intensidade de blur
- [x] Múltiplas seleções
- [x] Undo/Redo
- [x] Copy para clipboard
- [x] Download PNG/JPEG
- [x] Interface responsiva
- [x] Atalhos de teclado
- [x] Feedback visual e mensagens
- [x] Validação de arquivos
- [x] Error handling robusto

## 🐛 Debug & Desenvolvimento

Abra o **Console do Navegador** para ver:
- Logs de inicialização
- Informações de compatibilidade
- Debug de erros
- Estatísticas de performance

### Comandos de Debug:
```javascript
// Informações da aplicação
window.ScreenshotBlurApp.getVersion()

// Módulos carregados
window.ScreenshotBlurApp.getModules()

// Dados de debug completos
window.ScreenshotBlurApp.exportDebugData()
```

## 🔧 Próximos Melhoramentos

- [ ] Service Worker para cache offline
- [ ] Web Share API para compartilhamento nativo
- [ ] Mais formatos de export (WebP, AVIF)
- [ ] Shapes de seleção (círculo, polígono)
- [ ] Filtros adicionais (pixelização, blackout)
- [ ] Histórico persistente
- [ ] Batch processing

## 📄 Licença

Este é um protótipo demonstrativo. Código livre para uso e modificação.

---

**🎉 Protótipo Pronto!** 
Arraste uma imagem e comece a desfocar áreas sensíveis!