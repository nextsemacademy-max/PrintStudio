import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker for Vite
try {
  // Use Vite's asset URL resolution for the worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
} catch (e) {
  console.warn('Local pdf worker setup failed, using fallback worker URL', e);
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export interface ExtractedPdfPage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

export async function extractPagesFromPdf(
  file: File | ArrayBuffer,
  onProgress?: (current: number, total: number) => void
): Promise<ExtractedPdfPage[]> {
  const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file;
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;

  const extractedPages: ExtractedPdfPage[] = [];

  // Render each page at high resolution (scale 2.5) to preserve source crispness
  const RENDER_SCALE = 2.5;

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: RENDER_SCALE });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
      throw new Error('Canvas 2D context not available for PDF rendering');
    }

    // White paper background for transparency in PDFs
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
      canvas: canvas,
    };

    await page.render(renderContext).promise;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    extractedPages.push({
      pageNumber: pageNum,
      dataUrl,
      width: Math.round(viewport.width / RENDER_SCALE),
      height: Math.round(viewport.height / RENDER_SCALE),
    });

    if (onProgress) {
      onProgress(pageNum, totalPages);
    }
  }

  return extractedPages;
}
