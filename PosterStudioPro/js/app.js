
window.App = {
    canvas: null,
    currentImage: null,
    currentTool: 'pan',
    
    init() {
        this.canvas = new fabric.Canvas('main-canvas', {
            selection: false,
            preserveObjectStacking: true,
            defaultCursor: 'grab'
        });

        this.bindEvents();
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.generateQRCode();

        setInterval(() => {
            document.getElementById('status-mem').innerText = `Memória: ${Utils.getMemoryUsage()}`;
        }, 2000);

        this.canvas.on('mouse:down', (opt) => {
            var evt = opt.e;
            if (this.currentTool === 'pan' || evt.altKey) {
                this.canvas.isDragging = true;
                this.canvas.selection = false;
                this.canvas.lastPosX = evt.clientX;
                this.canvas.lastPosY = evt.clientY;
            }
        });
        
        this.canvas.on('mouse:move', (opt) => {
            if (this.canvas.isDragging) {
                var e = opt.e;
                var vpt = this.canvas.viewportTransform;
                vpt[4] += e.clientX - this.canvas.lastPosX;
                vpt[5] += e.clientY - this.canvas.lastPosY;
                this.canvas.requestRenderAll();
                this.canvas.lastPosX = e.clientX;
                this.canvas.lastPosY = e.clientY;
            }
        });
        
        this.canvas.on('mouse:up', (opt) => {
            this.canvas.setViewportTransform(this.canvas.viewportTransform);
            this.canvas.isDragging = false;
        });

        this.canvas.on('mouse:wheel', (opt) => {
            var delta = opt.e.deltaY;
            var zoom = this.canvas.getZoom();
            zoom *= 0.999 ** delta;
            if (zoom > 20) zoom = 20;
            if (zoom < 0.05) zoom = 0.05;
            this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
            opt.e.preventDefault();
            opt.e.stopPropagation();
            document.getElementById('status-zoom').innerText = `Zoom: ${Math.round(zoom * 100)}%`;
        });
    },

    generateQRCode() {
        const qrContainer = document.getElementById("qrcode-github");
        if (qrContainer) {
            new QRCode(qrContainer, {
                text: "https://github.com/gbmnagpng",
                width: 90, height: 90,
                colorDark : "#000000", colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.L
            });
        }
    },

    resizeCanvas() {
        const container = document.querySelector('.canvas-area');
        this.canvas.setWidth(container.clientWidth);
        this.canvas.setHeight(container.clientHeight);
        if (this.currentImage) this.canvas.centerObject(this.currentImage);
        this.canvas.renderAll();
    },

    clearWorkspace() {
        if (this.currentImage) {
            this.canvas.remove(this.currentImage);
            this.currentImage = null;
        }
        document.getElementById('welcome-message').style.display = 'block';
        this.updateMetrics();
    },

    executeExport(action) {
        if (!this.currentImage) return alert("Importe uma imagem primeiro!");
        
        const grid = this.getCurrentGrid();
        const drawNumbering = document.getElementById('numbering').checked;
        const drawCropMarks = document.getElementById('crop-marks').checked;
        const qualitySetting = document.getElementById('export-quality').value;

        const overlay = document.getElementById('loading-overlay');
        const loadingText = document.getElementById('loading-text');
        
        overlay.classList.add('active');
        loadingText.innerText = "Iniciando processamento...";

        setTimeout(() => {
            PDFEngine.generatePosterPDF(
                this.currentImage.getElement(), 
                grid, 
                action, 
                drawNumbering, 
                drawCropMarks, 
                qualitySetting,
                (current, total) => {
                    if (current === 'done') {
                        overlay.classList.remove('active');
                    } else {
                        loadingText.innerText = `Processando folha ${current} de ${total}...`;
                    }
                }
            ).catch(err => {
                console.error(err);
                alert("Ocorreu um erro ao processar o PDF.");
                overlay.classList.remove('active');
            });
        }, 100);
    },

    bindEvents() {
        const dropZone = document.getElementById('drop-zone');
        dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.opacity = 0.5; });
        dropZone.addEventListener('dragleave', () => dropZone.style.opacity = 1);
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.style.opacity = 1;
            if (e.dataTransfer.files.length) this.loadImage(e.dataTransfer.files[0]);
        });

        window.addEventListener('paste', (e) => {
            if (e.clipboardData.files.length) this.loadImage(e.clipboardData.files[0]);
        });

        const fileInput = document.getElementById('file-input');
        document.getElementById('btn-import').addEventListener('click', () => { fileInput.click(); });
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) this.loadImage(e.target.files[0]);
            e.target.value = '';
        });

        const posterW = document.getElementById('poster-w');
        const posterH = document.getElementById('poster-h');
        const keepRatio = document.getElementById('keep-ratio');

        posterW.addEventListener('input', () => {
            if (this.currentImage && keepRatio.checked) {
                const ratio = this.currentImage.height / this.currentImage.width;
                posterH.value = (parseFloat(posterW.value) * ratio).toFixed(2);
            }
            this.updateMetrics();
        });

        posterH.addEventListener('input', () => {
            if (this.currentImage && keepRatio.checked) {
                const ratio = this.currentImage.width / this.currentImage.height;
                posterW.value = (parseFloat(posterH.value) * ratio).toFixed(2);
            }
            this.updateMetrics();
        });

        keepRatio.addEventListener('change', () => {
            if (keepRatio.checked && this.currentImage) {
                const ratio = this.currentImage.height / this.currentImage.width;
                posterH.value = (parseFloat(posterW.value) * ratio).toFixed(2);
                this.updateMetrics();
            }
        });

        const inputs = ['poster-unit', 'paper-size', 'overlap', 'margin', 'export-quality'];
        inputs.forEach(id => {
            document.getElementById(id).addEventListener('input', () => this.updateMetrics());
        });

        document.querySelectorAll('input[name="orientation"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateMetrics());
        });

        document.getElementById('btn-clear').addEventListener('click', () => {
            this.clearWorkspace();
        });

        document.getElementById('btn-export').addEventListener('click', () => {
            this.executeExport('download');
        });

        document.getElementById('btn-print').addEventListener('click', () => {
            this.executeExport('print');
        });
        
        const toolBtns = document.querySelectorAll('.toolbar button');
        
        toolBtns[0].addEventListener('click', () => {
            this.currentTool = 'pan';
            toolBtns.forEach(b => b.classList.remove('active'));
            toolBtns[0].classList.add('active');
            this.canvas.defaultCursor = 'grab';
        });

        toolBtns[1].addEventListener('click', () => {
            alert("✂️ A ferramenta de recorte livre será liberada na próxima versão!");
        });

        toolBtns[2].addEventListener('click', () => {
            if (!this.currentImage) return alert("Importe uma imagem primeiro para poder girar!");
            
            const elem = this.currentImage.getElement();
            const temp = document.createElement('canvas');
            temp.width = elem.naturalHeight;
            temp.height = elem.naturalWidth;
            
            const ctx = temp.getContext('2d');
            ctx.translate(temp.width / 2, temp.height / 2);
            ctx.rotate(90 * Math.PI / 180);
            ctx.drawImage(elem, -elem.naturalWidth / 2, -elem.naturalHeight / 2);
            
            const dataUrl = temp.toDataURL('image/jpeg', 1.0);
            
            fabric.Image.fromURL(dataUrl, (img) => {
                this.canvas.remove(this.currentImage);
                this.currentImage = img;
                const scale = Math.min((this.canvas.width * 0.8) / img.width, (this.canvas.height * 0.8) / img.height);
                img.set({ scaleX: scale, scaleY: scale });
                this.canvas.add(img);
                this.canvas.centerObject(img);
                img.selectable = false; 
                img.evented = false;
                
                if (keepRatio.checked) {
                    const ratio = img.height / img.width;
                    posterH.value = (parseFloat(posterW.value) * ratio).toFixed(2);
                }
                
                this.updateMetrics();
            });
        });

        toolBtns[3].addEventListener('click', () => {
            this.canvas.setViewportTransform([1,0,0,1,0,0]);
            this.resizeCanvas(); 
            document.getElementById('status-zoom').innerText = `Zoom: 100%`;
        });
    },

    loadImage(file) {
        if (!file.type.startsWith('image/')) return;
        document.getElementById('welcome-message').style.display = 'none';
        
        const reader = new FileReader();
        reader.onload = (f) => {
            fabric.Image.fromURL(f.target.result, (img) => {
                if (this.currentImage) this.canvas.remove(this.currentImage);
                this.currentImage = img;
                
                const keepRatio = document.getElementById('keep-ratio');
                if (keepRatio && keepRatio.checked) {
                    const ratio = img.height / img.width;
                    const w = parseFloat(document.getElementById('poster-w').value) || 100;
                    document.getElementById('poster-h').value = (w * ratio).toFixed(2);
                }

                const scale = Math.min(
                    (this.canvas.width * 0.8) / img.width,
                    (this.canvas.height * 0.8) / img.height
                );
                
                img.set({ scaleX: scale, scaleY: scale });
                this.canvas.add(img);
                this.canvas.centerObject(img);
                img.setControlsVisibility({ mt: false, mb: false, ml: false, mr: false });
                
                img.selectable = false;
                img.evented = false;
                
                this.updateMetrics();
            });
        };
        reader.readAsDataURL(file);
    },

    getCurrentGrid() {
        const w = parseFloat(document.getElementById('poster-w').value) || 0;
        const h = parseFloat(document.getElementById('poster-h').value) || 0;
        const unit = document.getElementById('poster-unit').value;
        const paper = document.getElementById('paper-size').value;
        const orient = document.querySelector('input[name="orientation"]:checked').value;
        const overlap = parseFloat(document.getElementById('overlap').value) || 0;
        const margin = parseFloat(document.getElementById('margin').value) || 0;

        return PosterEngine.calculateGrid(w, h, unit, paper, orient, overlap, margin);
    },

    updateMetrics() {
        if (!this.currentImage) {
            const ind = document.getElementById('quality-indicator');
            ind.innerText = '🟡 Aguardando Imagem';
            ind.style.color = 'var(--color-boa)';
            document.getElementById('metric-dpi').innerText = '-';
            document.getElementById('metric-sheets').innerText = '-';
            document.getElementById('metric-final-size').innerText = '-';
            document.getElementById('status-sheets').innerText = 'Folhas: 0';
            document.getElementById('status-dim').innerText = 'Dimensão: 0x0';
            return;
        }

        const grid = this.getCurrentGrid();
        const originalImg = this.currentImage.getElement();
        
        const quality = PosterEngine.analyzeQuality(originalImg.naturalWidth, originalImg.naturalHeight, grid.totalW_mm, grid.totalH_mm);
        
        const ind = document.getElementById('quality-indicator');
        ind.innerText = quality.status.text;
        ind.style.color = quality.status.color;

        document.getElementById('metric-dpi').innerText = `${quality.dpi} DPI`;
        document.getElementById('metric-sheets').innerText = `${grid.cols}x${grid.rows} (${grid.totalSheets} total)`;
        document.getElementById('metric-final-size').innerText = `${grid.totalW_mm}x${grid.totalH_mm} mm`;

        document.getElementById('status-sheets').innerText = `Folhas: ${grid.totalSheets}`;
        document.getElementById('status-dim').innerText = `Pôster: ${grid.totalW_mm}x${grid.totalH_mm}mm`;
    }
};

window.onload = () => App.init();
