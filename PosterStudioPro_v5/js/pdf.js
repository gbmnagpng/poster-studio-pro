
window.PDFEngine = {
    generatePosterPDF: async (imageElement, gridData, action = 'download', drawNumbering = true, drawCropMarks = true) => {
        const { PDFDocument, rgb, StandardFonts } = window.PDFLib;
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        
        const tempCanvas = document.createElement('canvas');
        const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });
        
        const printW_px = Utils.physicalToPx(gridData.printW_mm, 'mm', 300);
        const printH_px = Utils.physicalToPx(gridData.printH_mm, 'mm', 300);
        tempCanvas.width = printW_px;
        tempCanvas.height = printH_px;

        const scaleX = imageElement.naturalWidth / gridData.totalW_mm;
        const scaleY = imageElement.naturalHeight / gridData.totalH_mm;

        let pageCount = 0;
        const pt = 2.83465; // 1mm = 2.83465 points
        const marginPt = gridData.marginMm * pt;

        for (let row = 0; row < gridData.rows; row++) {
            for (let col = 0; col < gridData.cols; col++) {
                
                ctx.clearRect(0, 0, printW_px, printH_px);
                
                // CORREÇÃO DO FUNDO PRETO:
                // Preenche todo o fundo com branco antes de desenhar a imagem.
                // Isso evita que as sobras fiquem transparentes e virem pretas no JPEG.
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, printW_px, printH_px);
                
                const sourceX = (col * gridData.usefulW_mm) * scaleX;
                const sourceY = (row * gridData.usefulH_mm) * scaleY;
                const sourceW = gridData.printW_mm * scaleX;
                const sourceH = gridData.printH_mm * scaleY;

                ctx.drawImage(
                    imageElement,
                    sourceX, sourceY, sourceW, sourceH,
                    0, 0, printW_px, printH_px
                );

                const imgDataUrl = tempCanvas.toDataURL('image/jpeg', 0.9);
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
                        x: marginPt,
                        y: marginPt,
                        width: gridData.printW_mm * pt,
                        height: gridData.printH_mm * pt,
                        borderColor: rgb(0.2, 0.2, 0.2), 
                        borderWidth: 0.5,
                        color: undefined, 
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

                    page.drawText(label, {
                        x: xPos,
                        y: yPos,
                        size: textSize,
                        font: font,
                        color: rgb(0, 0, 0),
                    });
                }

                pageCount++;
                await new Promise(resolve => setTimeout(resolve, 10)); 
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
                printWindow.onload = function() {
                    printWindow.print();
                };
            } else {
                alert("Por favor, permita pop-ups neste site para imprimir diretamente.");
            }
        }
    }
};
