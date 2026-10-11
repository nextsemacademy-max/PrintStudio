import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { PrintPage } from '../types';
import { renderPageToCanvas, determineEffectiveOrientation, A4_MM } from './imageProcessor';

export interface ExportProgress {
  currentPage: number;
  totalPages: number;
  statusText: string;
}

export async function generateAndDownloadA4Pdf(
  pages: PrintPage[],
  filename: string = 'A4_Printable_Notes.pdf',
  onProgress?: (progress: ExportProgress) => void
): Promise<void> {
  if (pages.length === 0) return;

  let doc: jsPDF | null = null;

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const orientation = determineEffectiveOrientation(page);
    const widthMm = orientation === 'portrait' ? A4_MM.width : A4_MM.height;
    const heightMm = orientation === 'portrait' ? A4_MM.height : A4_MM.width;

    if (onProgress) {
      onProgress({
        currentPage: i + 1,
        totalPages: pages.length,
        statusText: `Upscaling Page ${i + 1} of ${pages.length} (${page.targetDpi} DPI)...`,
      });
    }

    // Render master high-DPI canvas (300 or 600 DPI)
    const masterCanvas = await renderPageToCanvas(page, page.targetDpi, 1.0, i, pages.length);

    const isBw = page.enhancementPreset === 'bw';
    const imageFormat = isBw ? 'PNG' : 'JPEG';
    const imageDataUrl = masterCanvas.toDataURL(isBw ? 'image/png' : 'image/jpeg', 0.94);

    if (i === 0) {
      doc = new jsPDF({
        orientation,
        unit: 'mm',
        format: 'a4',
        compress: true,
      });
    } else if (doc) {
      doc.addPage('a4', orientation);
    }

    if (doc) {
      doc.addImage(
        imageDataUrl,
        imageFormat,
        0,
        0,
        widthMm,
        heightMm,
        undefined,
        'FAST'
      );
    }
  }

  if (doc) {
    if (onProgress) {
      onProgress({
        currentPage: pages.length,
        totalPages: pages.length,
        statusText: 'Compiling final A4 PDF...',
      });
    }
    doc.save(filename);
  }
}

export async function exportPagesAsZip(
  pages: PrintPage[],
  zipFilename: string = 'A4_Print_Images.zip',
  onProgress?: (progress: ExportProgress) => void
): Promise<void> {
  const zip = new JSZip();

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if (onProgress) {
      onProgress({
        currentPage: i + 1,
        totalPages: pages.length,
        statusText: `Processing HD Image ${i + 1} of ${pages.length}...`,
      });
    }

    const masterCanvas = await renderPageToCanvas(page, page.targetDpi, 1.0, i, pages.length);
    const isBw = page.enhancementPreset === 'bw';
    const extension = isBw ? 'png' : 'jpg';
    const mimeType = isBw ? 'image/png' : 'image/jpeg';

    const blob = await new Promise<Blob | null>((resolve) =>
      masterCanvas.toBlob((b) => resolve(b), mimeType, 0.94)
    );

    if (blob) {
      const pageNumStr = String(i + 1).padStart(2, '0');
      zip.file(`Page_${pageNumStr}_${page.name.replace(/\.[^/.]+$/, '')}.${extension}`, blob);
    }
  }

  if (onProgress) {
    onProgress({
      currentPage: pages.length,
      totalPages: pages.length,
      statusText: 'Packaging ZIP file...',
    });
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, zipFilename);
}
