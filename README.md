# A4 Print Studio — HD Image & PDF Print Upscaler

A modern, high-performance web and native Android application designed to convert, upscale, and clean images and low-resolution PDFs into razor-sharp, print-ready **A4 standard documents (210 × 297 mm)** at **300 DPI (2480 × 3508 px)** and **600 DPI (4960 × 7016 px)**.

---

## 🌟 Key Features

### 1. Hybrid Upscaling & Document Cleaning Engine
- **300 & 600 DPI High-DPI Upscaler**: Resamples input images and low-resolution PDFs using multi-pass interpolation and unsharp masking (convolutional edge sharpening) so fine letters and diagrams print with crystal clarity.
- **Magic Document Scan (Shadow Removal)**: Automatically levels paper backgrounds to pure `#ffffff`, eliminating camera phone shadows, room lighting gradients, and yellow paper tints while preserving vibrant colored inks (blue/red annotations, highlighters).
- **Sharp B&W (Laser Print / Ink Saver)**: Dynamic adaptive binarization for laser printers and Xerox copiers, eliminating gray toner grain and saving ink.
- **True Color HD**: Enhanced tonal curves for photos, certificates, and colored diagrams.
- **Crisp Grayscale**: Balanced monochrome output.
- **Custom Sliders**: Text Sharpness, Paper Whitening, Brightness, Contrast, and Ink Threshold.

### 2. A4 Page Geometry & Layout Precision
- **Standard A4 Dimensions**: Exact $210 \times 297\text{ mm}$ page framing.
- **Orientation Control**: Auto-detect, Portrait, or Landscape.
- **Printable Margins**:
  - `0 mm` (Borderless printing)
  - `5 mm` (Standard home printer safe margin)
  - `10 mm` (Clean document margin)
  - `15 mm` (Filing, ring binder, and hole-punch margin)
- **Fit & Placement Modes**:
  - *Fit Entire Document*: Guarantees 100% visibility within safe margins.
  - *Fill Sheet*: Edge-to-edge coverage.
- **Rotation**: 0°, 90°, 180°, and 270°.

### 3. Multi-Page Workflow & Sequencing
- Drag-and-drop or batch ingestion of multiple images and multi-page PDFs.
- Reorder pages with sequence controls.
- Rotate, duplicate, or delete individual pages.
- **"Apply Settings to All"**: Propagate filters and margins across the entire document in 1 click.

### 4. Interactive A4 Print Inspector
- **Split-Screen Before / After Comparison**: Interactive slider to inspect original vs. upscaled results.
- **3.5x Magnifier Loupe Tool**: Hover or touch anywhere to inspect individual letterforms before printing.
- **Millimeter Grid Rulers**: Accurate 0–210mm and 0–297mm ruler overlays.

### 5. Multi-Channel Export & Print
- **Export A4 PDF**: Creates a standards-compliant multi-page 300/600 DPI PDF via `jsPDF`.
- **Direct System Print**: Triggers native browser / Android system print spooler with exact `@page { size: A4; margin: 0; }` CSS.
- **Export High-DPI Images (ZIP)**: Download high-resolution PNG/JPG archives.

### 6. 100% Private & Client-Side
- All image and PDF processing runs strictly in-memory on the device via WebGL and Canvas. Zero documents are ever sent to an external server.

---

## 🚀 Running Locally

```bash
# Start development server
npm run dev

# Build production bundle
npm run build
```

- **Local Web**: `http://localhost:5180/`
- **Mobile Wi-Fi Testing**: `http://192.168.29.175:5180/`

---

## 📱 Android App (Capacitor)

The Android app is fully configured in the `android/` directory:

```bash
# Sync web changes to Android project
npm run cap:sync

# Open Android project in Android Studio
npm run cap:open

# Or build debug APK directly (when requested)
cd android
./gradlew assembleDebug
```
The output APK will be generated at `android/app/build/outputs/apk/debug/app-debug.apk`.
