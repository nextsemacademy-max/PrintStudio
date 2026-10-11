export type PageOrientation = 'portrait' | 'landscape' | 'auto';
export type MarginPreset = 'none' | 'minimum' | 'normal' | 'binder' | 'custom';
export type FitMode = 'fit' | 'fill' | 'stretch';
export type EnhancementPreset = 'magic' | 'bw' | 'grayscale' | 'photo' | 'original';
export type DpiTarget = 300 | 600;

export interface PageFilters {
  brightness: number; // -50 to 50
  contrast: number; // -50 to 50
  sharpness: number; // 0 to 100
  whitening: number; // 0 to 100 (paper background cleaner)
  binarizeThreshold: number; // 0 to 255
}

export interface PrintPage {
  id: string;
  name: string;
  sourceUrl: string; // Original object URL or base64
  sourceWidth: number;
  sourceHeight: number;
  orientation: PageOrientation;
  effectiveOrientation: 'portrait' | 'landscape';
  rotation: number; // 0, 90, 180, 270
  marginPreset: MarginPreset;
  marginMm: number; // Millimeters (e.g. 0, 5, 10, 15)
  fitMode: FitMode;
  enhancementPreset: EnhancementPreset;
  filters: PageFilters;
  targetDpi: DpiTarget;
  processedPreviewUrl?: string;
  isProcessing?: boolean;
}

export interface A4DimensionsMm {
  width: number; // 210
  height: number; // 297
}

export interface A4PixelDimensions {
  width: number;
  height: number;
}
