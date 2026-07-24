
window.App = {
    canvas: null,
    currentImage: null,
    
    init() {
        this.canvas = new fabric.Canvas('main-canvas', {
            selection: false,
            preserveObjectStacking: true
        });

        this.bindEvents();
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.generateQRCode();

        setInterval(() => {
            document.getElementById('status-mem').innerText = `Memória: ${Utils.getMemoryUsage()}`;
        }, 2000);
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

        const inputs = ['poster-w', 'poster-h', 'poster-unit', 'paper-size', 'overlap', 'margin'];
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
            if (!this.currentImage) return alert("Importe uma imagem primeiro!");
            const grid = this.getCurrentGrid();
            const drawNumbering = document.getElementById('numbering').checked;
            const drawCropMarks = document.getElementById('crop-marks').checked;
            PDFEngine.generatePosterPDF(this.currentImage.getElement(), grid, 'download', drawNumbering, drawCropMarks);
        });

        document.getElementById('btn-print').addEventListener('click', () => {
            if (!this.currentImage) return alert("Importe uma imagem primeiro!");
            const grid = this.getCurrentGrid();
            const drawNumbering = document.getElementById('numbering').checked;
            const drawCropMarks = document.getElementById('crop-marks').checked;
            PDFEngine.generatePosterPDF(this.currentImage.getElement(), grid, 'print', drawNumbering, drawCropMarks);
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
                
                const scale = Math.min(
                    (this.canvas.width * 0.8) / img.width,
                    (this.canvas.height * 0.8) / img.height
                );
                
                img.set({ scaleX: scale, scaleY: scale });
                this.canvas.add(img);
                this.canvas.centerObject(img);
                img.setControlsVisibility({ mt: false, mb: false, ml: false, mr: false });
                
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
