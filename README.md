# 🖨️ Poster Studio Pro

**Poster Studio Pro** is a professional-grade web application designed to transform any image into a giant poster of any size. It automatically calculates the grid, splits the image, and generates a print-ready PDF. 

The ultimate feature? All the intelligence and processing run **100% offline (Client-Side)** directly in your browser, ensuring total privacy and speed, with no servers, Node.js, or heavy software installation required.

---

## ✨ Key Features & Recent Updates

- 🔒 **100% Offline & Private:** No images are sent to the cloud. All processing happens in your browser's local memory.
- 📐 **Automatic Grid & Aspect Ratio Lock:** Enter the desired physical size of the poster and your printer's paper size. The new **Keep Image Ratio** toggle ensures your photos are perfectly scaled without ever stretching or distorting.
- 🎛️ **Print Quality & Advanced Upscaling:** Choose between 3 rendering modes before exporting:
  - **Draft (Ink Saver):** Lowers DPI and increases compression for quick assembly tests.
  - **Normal:** Standard 300 DPI for great cost-benefit.
  - **High Quality (Upscaling):** Uses *Pica.js* (Lanczos interpolation & Unsharp Masking) to prevent pixelation when blowing up small images to giant poster sizes.
- 🧰 **Interactive Toolbar:** Easily navigate your workspace with the Pan (Hand) tool, rotate your image 90° for perfect orientation, and seamlessly zoom in/out (or use the mouse wheel).
- ✂️ **Crop Marks & Overlap:** Add an overlap area between sheets and generate a solid guide line for craft knife cutting, ensuring millimeter-perfect alignment.
- 🔢 **Smart Numbering:** Sheets are automatically numbered (e.g., A1, A2, B1) in the white safety margin to make assembly easy without cluttering the artwork.
- 🖨️ **Direct Printing:** Send the finished project directly to the operating system's print dialog with a single click, or export a standard `.pdf` file.

---

## 🛠️ Technologies & Libraries Used

The application was built with a focus on performance and modularity, using only native web technologies and client-side executable libraries:

- **HTML5, CSS3 & JavaScript (Vanilla ES6)**
- **[Fabric.js](http://fabricjs.com/)** - Rendering engine and interactive Canvas manipulation.
- **[PDF-lib](https://pdf-lib.js.org/)** - Multi-page PDF document creation, modification, and assembly.
- **[Pica.js](https://github.com/nodeca/pica)** - High-quality image resizing in browser (Lanczos filter algorithm).
- **[QRCode.js](https://davidshimjs.github.io/qrcodejs/)** - Dynamic QR Code generation for the credits section.
- **[JSZip](https://stuk.github.io/jszip/)** - Compressed file manipulation.

---

## 🚀 How to Use (Local Setup)

Because it's an entirely browser-based application, using it is extremely simple:

1. **Download** or clone this repository (`git clone https://github.com/gbmnagpng/poster-studio-pro.git`).
2. Extract the files on your computer.
3. Double-click the `index.html` file to open it in your default browser (Chrome, Edge, Safari, Firefox).
4. Drag an image to the center of the screen (or click "Import Image").
5. Adjust your dimensions and ensure "Keep Image Ratio" is checked.
6. Select your preferred Print Quality and click **🖨️ Print** or **Export PDF**.

---

## 📂 Project Structure

The architecture was designed to separate responsibilities without relying on complex bundlers:

```text
PosterStudioPro/
├── index.html          # Main interface
├── css/
│   └── style.css       # Styles (Professional Dark Theme, Flexbox)
└── js/
    ├── app.js          # Initialization, Global Events, Toolbar, and Drag & Drop
    ├── poster.js       # Math engine (grid calculation, DPI, measurements)
    ├── pdf.js          # Incremental PDF Engine with Quality settings & Pica.js
    ├── utils.js        # Physical unit conversion utilities
    ├── image.js        # Isolated image handling logic
    ├── ui.js           # Interface (DOM) updates
    └── state.js        # Application state management
