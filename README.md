# 🖨️ Poster Studio Pro

**Poster Studio Pro** is a professional-grade web application designed to transform any image into a giant poster of any size. It automatically calculates the grid, splits the image, and generates a print-ready PDF. 

The ultimate feature? All the intelligence and processing run **100% offline (Client-Side)** directly in your browser, ensuring total privacy and speed, with no servers, Node.js, or heavy software installation required.

---

## ✨ Key Features

- 🔒 **100% Offline & Private:** No images are sent to the cloud. All processing happens in your browser's local memory.
- 📐 **Automatic Grid Calculation:** Just enter the desired physical size of the poster and your printer's paper size (A4, A3, Letter, etc.). The system instantly calculates how many sheets are needed.
- ✂️ **Crop Marks & Overlap:** Add an overlap area between sheets and generate a perfect solid guide line for craft knife cutting, ensuring millimeter-perfect alignment.
- 🔢 **Smart Numbering:** Sheets are automatically numbered (e.g., A1, A2, B1, B2) at the footer (in the white safety margin) to make assembly easy without cluttering the artwork.
- 🚀 **Incremental PDF Engine:** Smart architecture that renders and saves the PDF sheet by sheet, continuously freeing up memory. This allows generating massive posters without crashing standard computers.
- 🖨️ **Direct Printing:** Send the finished project directly to the operating system's print dialog or export standard `.pdf` files.
- 📊 **Real-Time Quality Analysis:** The system calculates the estimated final DPI based on the chosen size and warns if the print quality will be Excellent, Good, or Low.

---

## 🛠️ Technologies & Libraries Used

The application was built with a focus on performance and modularity, using only native web technologies and client-side executable libraries:

- **HTML5, CSS3 & JavaScript (Vanilla ES6)**
- **[Fabric.js](http://fabricjs.com/)** - Rendering engine and Canvas manipulation (Zoom, Pan, Crop).
- **[PDF-lib](https://pdf-lib.js.org/)** - Multi-page PDF document creation, modification, and assembly.
- **[QRCode.js](https://davidshimjs.github.io/qrcodejs/)** - Dynamic QR Code generation for the credits section.
- **[JSZip](https://stuk.github.io/jszip/)** - Compressed file manipulation.

---

## 🚀 How to Use (Local Setup)

Because it's an entirely browser-based application, using it is extremely simple:

1. **Download** or clone this repository (`git clone https://github.com/gbmnagpng/poster-studio-pro.git`).
2. Extract the files on your computer.
3. Double-click the `index.html` file.
4. The system will open in your default browser (Chrome, Edge, Firefox, Safari).
5. Drag an image to the center of the screen (or use `Ctrl+V`).
6. Configure the dimensions on the right sidebar and click **Export PDF**.

---

## 📂 Project Structure

The architecture was designed to separate responsibilities without relying on complex bundlers:

```text
PosterStudioPro/
├── index.html          # Main interface
├── css/
│   └── style.css       # Styles (Professional Dark Theme, Flexbox)
└── js/
    ├── app.js          # Initialization, Global Events, and Drag & Drop
    ├── poster.js       # Math engine (grid calculation, DPI, measurements)
    ├── pdf.js          # Incremental PDF Engine (Fabric Canvas -> PDF-lib)
    ├── utils.js        # Physical unit conversion utilities
    ├── image.js        # Isolated image handling logic
    ├── ui.js           # Interface (DOM) updates
    └── state.js        # Application state management
