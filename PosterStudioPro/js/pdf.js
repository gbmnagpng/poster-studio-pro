
window.PDFEngine = {
    generatePosterPDF: async (imageElement, gridData, action = 'download', drawNumbering = true, drawCropMarks = true, qualitySetting = 'normal', progressCallback = null) => {
        const { PDFDocument, rgb, StandardFonts } = window.PDFLib;
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        
        let renderDPI = 300;
        let jpegQuality = 0.8;
        let usePica = false;

        if (qualitySetting === 'draft') {
            renderDPI = 150; 
            jpegQuality = 0.4; 
        } else if (qualitySetting === 'high') {
            renderDPI = 300; 
            jpegQuality = 1.0; 
            usePica = true; 
        }

        const pica = window.pica ? window.pica() : null;
        if (usePica && !pica) usePica = false;

        const tempCanvas = document.createElement('canvas');
        const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });
        
        const printW_px = Utils.physicalToPx(gridData.printW_mm, 'mm', renderDPI);
        const printH_px = Utils.physicalToPx(gridData.printH_mm, 'mm', renderDPI);
        tempCanvas.width = printW_px;
        tempCanvas.height = printH_px;

        const sourceCanvas = document.createElement('canvas');
        const sourceCtx = sourceCanvas.getContext('2d');

        const scaleX = imageElement.naturalWidth / gridData.totalW_mm;
        const scaleY = imageElement.naturalHeight / gridData.totalH_mm;

        let pageCount = 0;
        const pt = 2.83465;
        const marginPt = gridData.marginMm * pt;

        for (let row = 0; row < gridData.rows; row++) {
            for (let col = 0; col < gridData.cols; col++) {
                
                if (progressCallback) progressCallback(pageCount + 1, gridData.totalSheets);

                ctx.clearRect(0, 0, printW_px, printH_px);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, printW_px, printH_px);
                
                const sourceX = (col * gridData.usefulW_mm) * scaleX;
                const sourceY = (row * gridData.usefulH_mm) * scaleY;
                const sourceW = gridData.printW_mm * scaleX;
                const sourceH = gridData.printH_mm * scaleY;

                const actualSourceW = Math.max(0, Math.min(sourceW, imageElement.naturalWidth - sourceX));
                const actualSourceH = Math.max(0, Math.min(sourceH, imageElement.naturalHeight - sourceY));

                if (actualSourceW > 0 && actualSourceH > 0) {
                    const actualDestW = printW_px * (actualSourceW / sourceW);
                    const actualDestH = printH_px * (actualSourceH / sourceH);

                    if (usePica) {
                        sourceCanvas.width = actualSourceW;
                        sourceCanvas.height = actualSourceH;
                        sourceCtx.fillStyle = '#ffffff';
                        sourceCtx.fillRect(0, 0, actualSourceW, actualSourceH);
                        sourceCtx.drawImage(imageElement, sourceX, sourceY, actualSourceW, actualSourceH, 0, 0, actualSourceW, actualSourceH);
                        
                        const picaDestCanvas = document.createElement('canvas');
                        picaDestCanvas.width = actualDestW;
                        picaDestCanvas.height = actualDestH;
                        
                        await pica.resize(sourceCanvas, picaDestCanvas, {
                            alpha: false,
                            unsharpAmount: 80,
                            unsharpRadius: 0.6,
                            unsharpThreshold: 2
                        });

                        ctx.drawImage(picaDestCanvas, 0, 0);
                    } else {
                        ctx.drawImage(
                            imageElement,
                            sourceX, sourceY, actualSourceW, actualSourceH,
                            0, 0, actualDestW, actualDestH
                        );
                    }
                }

                const imgDataUrl = tempCanvas.toDataURL('image/jpeg', jpegQuality);
                const pdfImage = await pdfDoc.embedJpg(imgDataUrl);

                const page = pdfDoc.addPage([gridData.paperW_mm * pt, gridData.paperH_mm * pt]);
                
                page.drawImage(pdfImage, {
                    x: marginPt,
                    y: marginPt,
                    width: gridData.printW_mm * pt,
                    height: gridData.printH_mm * pt,
                });

                if (drawCropMarks) {
                    page.drawRectangle({
                        x: marginPt, y: marginPt, width: gridData.printW_mm * pt, height: gridData.printH_mm * pt,
                        borderColor: rgb(0.2, 0.2, 0.2), borderWidth: 0.5, color: undefined, 
                    });
                }

                if (drawNumbering) {
                    const rowLetter = String.fromCharCode(65 + (row % 26)); 
                    const colNumber = col + 1; 
                    const label = `${rowLetter}${colNumber}`;
                    const textSize = 12;
                    const textWidth = font.widthOfTextAtSize(label, textSize);
                    
                    const xPos = marginPt + (gridData.printW_mm * pt) - textWidth;
                    const yPos = marginPt > 10 ? (marginPt / 2) - (textSize / 2) : 5;

                    page.drawText(label, { x: xPos, y: yPos, size: textSize, font: font, color: rgb(0, 0, 0) });
                }

                pageCount++;
                await new Promise(resolve => setTimeout(resolve, 50)); 
            }
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        if (action === 'download') {
            const a = document.createElement('a');
            a.href = url;
            a.download = `Poster_${gridData.totalW_mm}x${gridData.totalH_mm}mm.pdf`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } else if (action === 'print') {
            const printWindow = window.open(url, '_blank');
            if (printWindow) {
                printWindow.onload = function() { printWindow.print(); };
            } else {
                alert("Por favor, permita pop-ups neste site para imprimir diretamente.");
            }
        }

        if (progressCallback) progressCallback('done');
    }
};
