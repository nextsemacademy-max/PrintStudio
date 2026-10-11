# Session Archive: A4 Print Studio — HD Image & PDF Print Upscaler Website & Android App

**Date:** October 11, 2026  
**Project:** `notes-from-pdf` (`c:\Users\nextsem\Documents\notes-from-pdf`)  
**Package Name:** `online.nextsem.notesfrompdf`  
**Framework:** Vite + React + TypeScript + Capacitor Android  

---

## 🎯 Project Overview & Objective
The user requested to build a **website and an Android app** to generate **A4 size printable PDFs from images or PDFs**, with the capability to:
1. **Upscale images** to standard physical print resolutions (300 DPI - 2480 × 3508 px and 600 DPI - 4960 × 7016 px).
2. **Upscale and enhance PDFs** (extract pages at high scale, clean shadows, and regenerate crisp vector/high-DPI A4 PDFs).
3. Provide smart document cleaning (shadow removal, background whitening, adaptive binarization for laser printing / toner saver).
4. Run 100% on-device (client-side WebGL/Canvas + pdfjs-dist + jsPDF) for maximum privacy and zero server fees.
5. Provide a shared codebase targeting both the web browser and native Android APK.

---

## 🏗️ Architecture & Technical Stack

- **Core UI & Structure:** React 19 + TypeScript + Vite.
- **Styling:** Vanilla CSS design system with custom properties, dark mode glassmorphism, responsive mobile/desktop layouts, and strict `@media print` rules.
- **Rendering & Upscaling Engine:**
  - Multi-pass canvas resampling with high smoothing quality.
  - Convolutional Unsharp Masking ($3 \times 3$ Laplacian kernel) for razor-sharp character edges.
  - Luminance-division background leveling for desk & camera phone shadow elimination.
  - Adaptive Otsu binarization for high-contrast black & white laser printing.
- **PDF Extraction:** `pdfjs-dist` (rendering incoming PDF pages at 2.5x high-res scale).
- **PDF Generation & Export:** `jspdf` (compiling 300/600 DPI A4 sheets) + `jszip` & `file-saver` (ZIP image archive export).
- **Native Android Support:** `@capacitor/core`, `@capacitor/cli`, `@capacitor/android` with Camera and Media permissions configured.

---

## 🚀 Live Testing Endpoints

- **Localhost URL:** `http://localhost:5180/`
- **Local Network URL (Wi-Fi / Mobile Phone Testing):** `http://192.168.29.175:5180/`

---

## 📱 Android Build Instructions

```bash
# Sync web changes to Android platform
npm run cap:sync

# Open in Android Studio
npm run cap:open

# When requested, assemble debug APK
cd android
./gradlew assembleDebug
```
Output APK path: `android/app/build/outputs/apk/debug/app-debug.apk`.
