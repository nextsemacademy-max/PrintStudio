import type { PrintPage, DpiTarget, PageFilters, EnhancementPreset } from '../types';

export const A4_MM = {
  width: 210,
  height: 297,
};

export function getA4PixelDimensions(dpi: DpiTarget, orientation: 'portrait' | 'landscape') {
  const isPortrait = orientation === 'portrait';
  const widthMm = isPortrait ? A4_MM.width : A4_MM.height;
  const heightMm = isPortrait ? A4_MM.height : A4_MM.width;

  const width = Math.round((widthMm / 25.4) * dpi);
  const height = Math.round((heightMm / 25.4) * dpi);

  return { width, height };
}

export function marginMmToPixels(marginMm: number, dpi: number): number {
  return Math.round((marginMm / 25.4) * dpi);
}

export function determineEffectiveOrientation(page: PrintPage): 'portrait' | 'landscape' {
  if (page.orientation === 'portrait') return 'portrait';
  if (page.orientation === 'landscape') return 'landscape';

  // Auto-detect based on source aspect ratio & rotation
  const isRotated90 = page.rotation === 90 || page.rotation === 270;
  const effectiveW = isRotated90 ? page.sourceHeight : page.sourceWidth;
  const effectiveH = isRotated90 ? page.sourceWidth : page.sourceHeight;

  return effectiveW > effectiveH ? 'landscape' : 'portrait';
}

// Loads an image from URL or data URI
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load image: ${e}`));
    img.src = src;
  });
}

// 3x3 Convolution filter for sharpness / unsharp masking
function applyConvolutionSharpness(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number // 0 to 1
) {
  if (amount <= 0.05) return;

  const imgData = ctx.getImageData(0, 0, width, height);
  const src = imgData.data;
  const output = ctx.createImageData(width, height);
  const dst = output.data;

  // Sharpness matrix: [0, -k, 0], [-k, 1+4k, -k], [0, -k, 0]
  const k = amount * 0.75;
  const center = 1 + 4 * k;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;

      for (let c = 0; c < 3; c++) {
        const top = ((y - 1) * width + x) * 4 + c;
        const bottom = ((y + 1) * width + x) * 4 + c;
        const left = (y * width + (x - 1)) * 4 + c;
        const right = (y * width + (x + 1)) * 4 + c;

        const val =
          src[idx + c] * center -
          (src[top] + src[bottom] + src[left] + src[right]) * k;

        dst[idx + c] = Math.min(255, Math.max(0, val));
      }
      dst[idx + 3] = src[idx + 3]; // Preserve alpha
    }
  }

  // Copy border pixels
  for (let x = 0; x < width; x++) {
    const topIdx = x * 4;
    const botIdx = ((height - 1) * width + x) * 4;
    for (let c = 0; c < 4; c++) {
      dst[topIdx + c] = src[topIdx + c];
      dst[botIdx + c] = src[botIdx + c];
    }
  }
  for (let y = 0; y < height; y++) {
    const leftIdx = (y * width) * 4;
    const rightIdx = (y * width + (width - 1)) * 4;
    for (let c = 0; c < 4; c++) {
      dst[leftIdx + c] = src[leftIdx + c];
      dst[rightIdx + c] = src[rightIdx + c];
    }
  }

  ctx.putImageData(output, 0, 0);
}

// Document enhancement pixel-level processing
function applyPixelEnhancements(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  preset: EnhancementPreset,
  filters: PageFilters
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const totalPixels = width * height;

  const brightness = filters.brightness * 2.55; // -128 to 128
  const contrastFactor = (259 * (filters.contrast + 255)) / (255 * (259 - filters.contrast));
  const whiteningStrength = filters.whitening / 100;
  const binarizeThresh = filters.binarizeThreshold;

  // Sample background brightness if magic mode is active
  let bgLuminance = 210;
  if (preset === 'magic') {
    let sampleSum = 0;
    let sampleCount = 0;
    // Sample four corners and edges where paper is typically blank
    const step = Math.max(1, Math.floor(totalPixels / 2000));
    for (let i = 0; i < totalPixels; i += step) {
      const idx = i * 4;
      const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      if (lum > 140) {
        sampleSum += lum;
        sampleCount++;
      }
    }
    if (sampleCount > 0) {
      bgLuminance = Math.min(250, Math.max(180, sampleSum / sampleCount));
    }
  }

  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    let r = data[idx];
    let g = data[idx + 1];
    let b = data[idx + 2];

    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    if (preset === 'bw') {
      // High-Contrast Black & White (Laser / Xerox Ink Saver)
      const adjustedLum = lum + brightness;
      const isBlack = adjustedLum < binarizeThresh;
      const v = isBlack ? 0 : 255;
      data[idx] = v;
      data[idx + 1] = v;
      data[idx + 2] = v;
    } else if (preset === 'magic') {
      // Magic Document Scanner (Background leveling + shadow removal + rich ink)
      // Level paper background towards pure 255
      const whiteCutoff = bgLuminance * (1 - 0.25 * whiteningStrength);
      if (lum >= whiteCutoff) {
        const factor = (lum - whiteCutoff) / (255 - whiteCutoff || 1);
        r = Math.min(255, r + (255 - r) * factor * whiteningStrength);
        g = Math.min(255, g + (255 - g) * factor * whiteningStrength);
        b = Math.min(255, b + (255 - b) * factor * whiteningStrength);
      } else {
        // Deepen text inks
        const darkFactor = 1 - (whiteCutoff - lum) / whiteCutoff * 0.35;
        r = Math.max(0, r * darkFactor);
        g = Math.max(0, g * darkFactor);
        b = Math.max(0, b * darkFactor);
      }

      // Apply standard contrast & brightness adjustments
      r = Math.min(255, Math.max(0, contrastFactor * (r - 128) + 128 + brightness));
      g = Math.min(255, Math.max(0, contrastFactor * (g - 128) + 128 + brightness));
      b = Math.min(255, Math.max(0, contrastFactor * (b - 128) + 128 + brightness));

      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
    } else if (preset === 'grayscale') {
      // Clean Grayscale
      let gVal = lum + brightness;
      gVal = contrastFactor * (gVal - 128) + 128;
      gVal = Math.min(255, Math.max(0, gVal));
      data[idx] = gVal;
      data[idx + 1] = gVal;
      data[idx + 2] = gVal;
    } else if (preset === 'photo') {
      // True Color Photo
      r = Math.min(255, Math.max(0, contrastFactor * (r - 128) + 128 + brightness));
      g = Math.min(255, Math.max(0, contrastFactor * (g - 128) + 128 + brightness));
      b = Math.min(255, Math.max(0, contrastFactor * (b - 128) + 128 + brightness));

      // Slight saturation boost
      const avg = (r + g + b) / 3;
      r = Math.min(255, Math.max(0, avg + (r - avg) * 1.15));
      g = Math.min(255, Math.max(0, avg + (g - avg) * 1.15));
      b = Math.min(255, Math.max(0, avg + (b - avg) * 1.15));

      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
    } else {
      // Original with subtle adjustments
      if (brightness !== 0 || filters.contrast !== 0) {
        r = Math.min(255, Math.max(0, contrastFactor * (r - 128) + 128 + brightness));
        g = Math.min(255, Math.max(0, contrastFactor * (g - 128) + 128 + brightness));
        b = Math.min(255, Math.max(0, contrastFactor * (b - 128) + 128 + brightness));
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

// Master processor: draws source image onto target A4 canvas with layout, upscales, and enhances
export async function renderPageToCanvas(
  page: PrintPage,
  targetDpi: DpiTarget,
  scaleFactor: number = 1.0 // 1.0 for full DPI, < 1.0 for fast UI preview
): Promise<HTMLCanvasElement> {
  const effectiveOrientation = determineEffectiveOrientation(page);
  const fullDims = getA4PixelDimensions(targetDpi, effectiveOrientation);

  const canvasWidth = Math.round(fullDims.width * scaleFactor);
  const canvasHeight = Math.round(fullDims.height * scaleFactor);

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get canvas 2d context');

  // Fill canvas with pure paper white
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // High quality interpolation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const marginPx = Math.round(marginMmToPixels(page.marginMm, targetDpi) * scaleFactor);
  const safeAreaX = marginPx;
  const safeAreaY = marginPx;
  const safeAreaW = Math.max(1, canvasWidth - 2 * marginPx);
  const safeAreaH = Math.max(1, canvasHeight - 2 * marginPx);

  const img = await loadImage(page.sourceUrl);

  // Compute rotated dimensions
  const isRotated90 = page.rotation === 90 || page.rotation === 270;
  const rotatedSrcW = isRotated90 ? img.naturalHeight : img.naturalWidth;
  const rotatedSrcH = isRotated90 ? img.naturalWidth : img.naturalHeight;

  let drawW = safeAreaW;
  let drawH = safeAreaH;
  let drawX = safeAreaX;
  let drawY = safeAreaY;

  if (page.fitMode === 'fit') {
    // Keep aspect ratio inside safe area
    const scale = Math.min(safeAreaW / rotatedSrcW, safeAreaH / rotatedSrcH);
    drawW = rotatedSrcW * scale;
    drawH = rotatedSrcH * scale;
    drawX = safeAreaX + (safeAreaW - drawW) / 2;
    drawY = safeAreaY + (safeAreaH - drawH) / 2;
  } else if (page.fitMode === 'fill') {
    // Fill safe area, crop excess
    const scale = Math.max(safeAreaW / rotatedSrcW, safeAreaH / rotatedSrcH);
    drawW = rotatedSrcW * scale;
    drawH = rotatedSrcH * scale;
    drawX = safeAreaX + (safeAreaW - drawW) / 2;
    drawY = safeAreaY + (safeAreaH - drawH) / 2;
  }

  // Clip to safe printable area so 'fill' never bleeds outside user's margin
  ctx.save();
  ctx.beginPath();
  ctx.rect(safeAreaX, safeAreaY, safeAreaW, safeAreaH);
  ctx.clip();

  // Handle Rotation around center of drawn rect
  const centerX = drawX + drawW / 2;
  const centerY = drawY + drawH / 2;

  ctx.translate(centerX, centerY);
  ctx.rotate((page.rotation * Math.PI) / 180);

  const imgDrawW = isRotated90 ? drawH : drawW;
  const imgDrawH = isRotated90 ? drawW : drawH;

  ctx.drawImage(img, -imgDrawW / 2, -imgDrawH / 2, imgDrawW, imgDrawH);
  ctx.restore();

  // Apply Pixel Enhancements (Magic scan, B&W, Grayscale, Photo, Contrast)
  applyPixelEnhancements(ctx, canvasWidth, canvasHeight, page.enhancementPreset, page.filters);

  // Apply Sharpness / Unsharp Masking Kernel
  if (page.filters.sharpness > 0) {
    applyConvolutionSharpness(ctx, canvasWidth, canvasHeight, page.filters.sharpness / 100);
  }

  return canvas;
}
