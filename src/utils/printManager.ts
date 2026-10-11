import type { PrintPage } from '../types';
import { renderPageToCanvas, determineEffectiveOrientation } from './imageProcessor';

export async function triggerDirectPrint(
  pages: PrintPage[],
  onStatusUpdate?: (status: string) => void
): Promise<void> {
  if (pages.length === 0) return;

  if (onStatusUpdate) onStatusUpdate('Preparing high-resolution print pages...');

  // Remove existing print container if any
  let printContainer = document.getElementById('print-container');
  if (printContainer) {
    printContainer.remove();
  }

  printContainer = document.createElement('div');
  printContainer.id = 'print-container';
  printContainer.className = 'print-only-container';
  document.body.appendChild(printContainer);

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if (onStatusUpdate) {
      onStatusUpdate(`Rendering page ${i + 1} of ${pages.length} for printer...`);
    }

    // Render at 300 DPI for physical printing
    const canvas = await renderPageToCanvas(page, 300, 1.0, i, pages.length);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

    const pageWrapper = document.createElement('div');
    const orientation = determineEffectiveOrientation(page);
    pageWrapper.className = `printable-a4-page ${orientation}`;

    const img = document.createElement('img');
    img.src = dataUrl;
    img.className = 'printable-a4-image';
    pageWrapper.appendChild(img);

    printContainer.appendChild(pageWrapper);
  }

  if (onStatusUpdate) onStatusUpdate('Opening print dialog...');

  // Short delay to ensure browser loads images in the print container DOM
  setTimeout(() => {
    window.print();
    if (onStatusUpdate) onStatusUpdate('');
  }, 400);
}
