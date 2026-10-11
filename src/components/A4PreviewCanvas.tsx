import React, { useEffect, useRef, useState } from 'react';
import {
  Ruler,
  SplitSquareVertical,
  ZoomIn,
  Loader2,
  FileCheck,
} from 'lucide-react';
import type { PrintPage } from '../types';
import { renderPageToCanvas, determineEffectiveOrientation, getA4PixelDimensions } from '../utils/imageProcessor';

interface A4PreviewCanvasProps {
  page: PrintPage | null;
  pageIndex: number;
  totalPages: number;
}

export const A4PreviewCanvas: React.FC<A4PreviewCanvasProps> = ({
  page,
  pageIndex,
  totalPages,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isRendering, setIsRendering] = useState(false);
  const [showRulers, setShowRulers] = useState(false);
  const [showSplitView, setShowSplitView] = useState(false);
  const [splitPosition, setSplitPosition] = useState(50); // percentage (0 to 100)
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0, visible: false });

  // Render preview canvas whenever page properties change
  useEffect(() => {
    if (!page) return;

    let isMounted = true;
    setIsRendering(true);

    const render = async () => {
      try {
        // Render processed preview at ~1200px height for ultra fast 60fps feedback
        const processed = await renderPageToCanvas(page, 300, 0.45);

        // Also render original un-enhanced version if split-screen is enabled
        const originalPageConfig: PrintPage = {
          ...page,
          enhancementPreset: 'original',
          filters: {
            brightness: 0,
            contrast: 0,
            sharpness: 0,
            whitening: 0,
            binarizeThreshold: 128,
          },
        };
        const original = await renderPageToCanvas(originalPageConfig, 300, 0.45);

        if (!isMounted) return;

        // Draw onto the displayed canvas
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = processed.width;
          canvas.height = processed.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(processed, 0, 0);
          }
        }

        const origCanvas = originalCanvasRef.current;
        if (origCanvas) {
          origCanvas.width = original.width;
          origCanvas.height = original.height;
          const ctx = origCanvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(original, 0, 0);
          }
        }
      } catch (err) {
        console.error('Preview render error', err);
      } finally {
        if (isMounted) setIsRendering(false);
      }
    };

    render();

    return () => {
      isMounted = false;
    };
  }, [
    page?.id,
    page?.sourceUrl,
    page?.rotation,
    page?.orientation,
    page?.marginMm,
    page?.fitMode,
    page?.enhancementPreset,
    page?.filters.brightness,
    page?.filters.contrast,
    page?.filters.sharpness,
    page?.filters.whitening,
    page?.filters.binarizeThreshold,
    page?.targetDpi,
  ]);

  // Handle Magnifier Movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!showMagnifier || !containerRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      setMagnifierPos({ x, y, visible: true });
    } else {
      setMagnifierPos((prev) => ({ ...prev, visible: false }));
    }
  };

  const handleMouseLeave = () => {
    setMagnifierPos((prev) => ({ ...prev, visible: false }));
  };

  if (!page) {
    return (
      <div className="preview-empty-placeholder">
        <FileCheck size={48} className="empty-icon" />
        <p>No document loaded. Upload an image or PDF to start.</p>
      </div>
    );
  }

  const effectiveOrientation = determineEffectiveOrientation(page);
  const dims = getA4PixelDimensions(page.targetDpi, effectiveOrientation);
  const isPortrait = effectiveOrientation === 'portrait';
  const widthMm = isPortrait ? 210 : 297;
  const heightMm = isPortrait ? 297 : 210;

  return (
    <div className="a4-preview-viewport" ref={containerRef}>
      {/* Top Toolbar for Canvas Overlays */}
      <div className="preview-top-toolbar">
        <div className="preview-info-badge">
          <span className="badge-dim">
            {widthMm} × {heightMm} mm
          </span>
          <span className="badge-separator">•</span>
          <span className="badge-res">
            {dims.width} × {dims.height} px
          </span>
          <span className="badge-separator">•</span>
          <span className="badge-dpi">{page.targetDpi} DPI</span>
        </div>

        <div className="preview-tools-cluster">
          <button
            type="button"
            className={`tool-icon-btn ${showSplitView ? 'is-active' : ''}`}
            onClick={() => setShowSplitView(!showSplitView)}
            title="Toggle Before/After Split Comparison"
          >
            <SplitSquareVertical size={16} />
            <span>Split View</span>
          </button>

          <button
            type="button"
            className={`tool-icon-btn ${showMagnifier ? 'is-active' : ''}`}
            onClick={() => setShowMagnifier(!showMagnifier)}
            title="Toggle 3.5x Text Detail Magnifier Loupe"
          >
            <ZoomIn size={16} />
            <span>Magnifier</span>
          </button>

          <button
            type="button"
            className={`tool-icon-btn ${showRulers ? 'is-active' : ''}`}
            onClick={() => setShowRulers(!showRulers)}
            title="Toggle Millimeter Rulers"
          >
            <Ruler size={16} />
            <span>Rulers</span>
          </button>
        </div>
      </div>

      {/* Main A4 Sheet Stage */}
      <div
        className={`a4-sheet-wrapper ${effectiveOrientation}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {isRendering && (
          <div className="preview-rendering-overlay">
            <Loader2 className="spinner-icon" size={28} />
            <span>Updating A4 Print Canvas...</span>
          </div>
        )}

        {/* Physical Millimeter Rulers Overlay */}
        {showRulers && (
          <div className="a4-rulers-overlay">
            <div className="ruler-top">
              <span>0mm</span>
              <span>{Math.round(widthMm / 2)}mm</span>
              <span>{widthMm}mm</span>
            </div>
            <div className="ruler-left">
              <span>0mm</span>
              <span>{Math.round(heightMm / 2)}mm</span>
              <span>{heightMm}mm</span>
            </div>
          </div>
        )}

        {/* Printable Margins Guide Box */}
        {page.marginMm > 0 && (
          <div
            className="a4-margin-guide-box"
            style={{
              top: `${(page.marginMm / heightMm) * 100}%`,
              bottom: `${(page.marginMm / heightMm) * 100}%`,
              left: `${(page.marginMm / widthMm) * 100}%`,
              right: `${(page.marginMm / widthMm) * 100}%`,
            }}
            title={`Printable Area (${page.marginMm}mm margin)`}
          />
        )}

        {/* Canvases */}
        <div className="canvases-stack">
          {/* Enhanced / Processed Master Canvas */}
          <canvas ref={canvasRef} className="a4-master-canvas" />

          {/* Original Canvas (Revealed during Split View) */}
          {showSplitView && (
            <div
              className="split-reveal-container"
              style={{ width: `${splitPosition}%` }}
            >
              <canvas ref={originalCanvasRef} className="a4-original-canvas" />
              <div className="split-label-original">Original Photo</div>
            </div>
          )}

          {showSplitView && (
            <div
              className="split-divider-line"
              style={{ left: `${splitPosition}%` }}
            >
              <div className="split-handle-thumb">
                <span>◀ ▶</span>
              </div>
            </div>
          )}

          {showSplitView && (
            <div className="split-label-enhanced">Cleaned & Upscaled (300 DPI)</div>
          )}
        </div>

        {/* Magnifier Loupe Tool */}
        {showMagnifier && magnifierPos.visible && canvasRef.current && (
          <div
            className="magnifier-loupe"
            style={{
              left: `${magnifierPos.x}px`,
              top: `${magnifierPos.y}px`,
              backgroundImage: `url(${canvasRef.current.toDataURL()})`,
              backgroundPosition: `-${magnifierPos.x * 2.5 - 75}px -${
                magnifierPos.y * 2.5 - 75
              }px`,
              backgroundSize: `${canvasRef.current.width * 2.5}px ${
                canvasRef.current.height * 2.5
              }px`,
            }}
          >
            <div className="magnifier-crosshair" />
          </div>
        )}
      </div>

      {/* Split-Screen Slider Control */}
      {showSplitView && (
        <div className="split-slider-control-bar">
          <span className="split-label-text">Original</span>
          <input
            type="range"
            min="0"
            max="100"
            value={splitPosition}
            onChange={(e) => setSplitPosition(Number(e.target.value))}
            className="split-range-slider"
          />
          <span className="split-label-text">Cleaned & Upscaled</span>
        </div>
      )}

      {/* Bottom Page Navigation Indicator */}
      <div className="preview-bottom-nav">
        <span>
          Page {pageIndex + 1} of {totalPages}
        </span>
      </div>
    </div>
  );
};
