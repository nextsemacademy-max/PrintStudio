import React from 'react';
import {
  Printer,
  Download,
  FileArchive,
  Layers,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import type { DpiTarget } from '../types';

interface HeaderProps {
  pageCount: number;
  currentDpi: DpiTarget;
  isProcessing: boolean;
  onPrint: () => void;
  onDownloadPdf: () => void;
  onExportZip: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  pageCount,
  currentDpi,
  isProcessing,
  onPrint,
  onDownloadPdf,
  onExportZip,
  onOpenHelp,
}) => {
  return (
    <header className="app-header">
      <div className="header-brand-container">
        <div className="brand-badge-icon">
          <Sparkles className="icon-gold" size={22} />
        </div>
        <div className="brand-text">
          <div className="brand-title">
            <span>A4</span> Print Studio
          </div>
          <div className="brand-tagline">HD Image & PDF Print Upscaler</div>
        </div>
      </div>

      <div className="header-status-strip">
        <div className="status-pill">
          <Layers size={14} />
          <span>
            <strong>{pageCount}</strong> {pageCount === 1 ? 'Page' : 'Pages'}
          </span>
        </div>
        <div className="status-pill dpi-pill">
          <span>{currentDpi} DPI Print Target</span>
        </div>
      </div>

      <div className="header-actions">
        <button
          className="header-btn btn-subtle"
          onClick={onOpenHelp}
          title="Print & Upscale Guide"
          aria-label="Help and instructions"
        >
          <HelpCircle size={18} />
          <span className="btn-label-desktop">Guide</span>
        </button>

        <button
          className="header-btn btn-secondary"
          onClick={onExportZip}
          disabled={pageCount === 0 || isProcessing}
          title="Download all pages as high-resolution images in a ZIP file"
        >
          <FileArchive size={18} />
          <span className="btn-label-desktop">Save Images</span>
        </button>

        <button
          className="header-btn btn-secondary"
          onClick={onPrint}
          disabled={pageCount === 0 || isProcessing}
          title="Direct print with physical printer settings"
        >
          <Printer size={18} />
          <span>Print</span>
        </button>

        <button
          className="header-btn btn-primary"
          onClick={onDownloadPdf}
          disabled={pageCount === 0 || isProcessing}
          title="Export standard 300/600 DPI A4 PDF"
        >
          <Download size={18} />
          <span>Export A4 PDF</span>
        </button>
      </div>
    </header>
  );
};
