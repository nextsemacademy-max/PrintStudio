import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Camera,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { extractPagesFromPdf } from '../utils/pdfExtractor';
import { generateSampleDocumentDataUrl } from '../utils/sampleData';
import type { PrintPage } from '../types';

interface UploadDropzoneProps {
  onPagesAdded: (newPages: PrintPage[]) => void;
  isInitialEmptyState?: boolean;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onPagesAdded,
  isInitialEmptyState = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: FileList | File[]) => {
    const pagesToAdd: PrintPage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        setIsLoadingPdf(true);
        try {
          const extracted = await extractPagesFromPdf(file, (curr, total) => {
            setLoadingProgress({ current: curr, total });
          });

          extracted.forEach((p) => {
            const isLandscape = p.width > p.height;
            pagesToAdd.push({
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: `${file.name} - Page ${p.pageNumber}`,
              sourceUrl: p.dataUrl,
              sourceWidth: p.width,
              sourceHeight: p.height,
              orientation: isLandscape ? 'landscape' : 'portrait',
              effectiveOrientation: isLandscape ? 'landscape' : 'portrait',
              rotation: 0,
              marginPreset: 'minimum',
              marginMm: 5,
              fitMode: 'fit',
              enhancementPreset: 'magic',
              filters: {
                brightness: 0,
                contrast: 10,
                sharpness: 35,
                whitening: 40,
                binarizeThreshold: 140,
              },
              targetDpi: 300,
            });
          });
        } catch (err) {
          console.error('Failed to parse PDF', err);
          alert('Could not parse the PDF file. Please ensure it is a valid PDF document.');
        } finally {
          setIsLoadingPdf(false);
        }
      } else if (file.type.startsWith('image/')) {
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        // Determine natural dimensions
        const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
          img.src = dataUrl;
        });

        const isLandscape = dimensions.width > dimensions.height;
        pagesToAdd.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          sourceUrl: dataUrl,
          sourceWidth: dimensions.width,
          sourceHeight: dimensions.height,
          orientation: isLandscape ? 'landscape' : 'portrait',
          effectiveOrientation: isLandscape ? 'landscape' : 'portrait',
          rotation: 0,
          marginPreset: 'minimum',
          marginMm: 5,
          fitMode: 'fit',
          enhancementPreset: 'magic',
          filters: {
            brightness: 0,
            contrast: 10,
            sharpness: 40,
            whitening: 45,
            binarizeThreshold: 140,
          },
          targetDpi: 300,
        });
      }
    }

    if (pagesToAdd.length > 0) {
      onPagesAdded(pagesToAdd);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = ''; // reset so same file can be re-selected if needed
    }
  };

  const handleLoadSample = () => {
    const sampleDataUrl = generateSampleDocumentDataUrl();
    const samplePage: PrintPage = {
      id: `sample-${Date.now()}`,
      name: 'Sample Lecture Note (with camera shadow)',
      sourceUrl: sampleDataUrl,
      sourceWidth: 900,
      sourceHeight: 1250,
      orientation: 'portrait',
      effectiveOrientation: 'portrait',
      rotation: 0,
      marginPreset: 'minimum',
      marginMm: 5,
      fitMode: 'fit',
      enhancementPreset: 'magic',
      filters: {
        brightness: 0,
        contrast: 15,
        sharpness: 45,
        whitening: 50,
        binarizeThreshold: 140,
      },
      targetDpi: 300,
    };
    onPagesAdded([samplePage]);
  };

  return (
    <div
      className={`upload-dropzone ${isDragging ? 'is-dragging' : ''} ${
        isInitialEmptyState ? 'empty-state-view' : 'compact-view'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,application/pdf"
        className="hidden-file-input"
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden-file-input"
        onChange={handleFileChange}
      />

      {isLoadingPdf ? (
        <div className="upload-loading-state">
          <Loader2 className="spinner-icon" size={42} />
          <h3>Extracting High-DPI PDF Pages...</h3>
          <p>
            Processing page {loadingProgress.current} of {loadingProgress.total}
          </p>
          <div className="upload-progress-bar">
            <div
              className="upload-progress-fill"
              style={{
                width: `${
                  loadingProgress.total > 0
                    ? (loadingProgress.current / loadingProgress.total) * 100
                    : 15
                }%`,
              }}
            />
          </div>
        </div>
      ) : (
        <div className="upload-content-inner">
          <div className="upload-icon-cluster">
            <div className="icon-bubble bubble-primary">
              <UploadCloud size={28} />
            </div>
            <div className="icon-bubble bubble-secondary">
              <FileText size={18} />
            </div>
            <div className="icon-bubble bubble-tertiary">
              <ImageIcon size={18} />
            </div>
          </div>

          <div className="upload-text-headings">
            <h3>{isInitialEmptyState ? 'Drop Images or PDFs Here' : 'Add More Images or PDF'}</h3>
            <p>
              Accepts phone snapshots, scanned notes, receipts, or multi-page PDFs. We'll upscale to
              crisp 300 DPI A4.
            </p>
          </div>

          <div className="upload-buttons-row">
            <button
              className="dropzone-btn btn-browse"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud size={18} />
              <span>Browse Files</span>
            </button>

            <button
              className="dropzone-btn btn-camera"
              onClick={() => cameraInputRef.current?.click()}
              title="Take a photo with your device camera"
            >
              <Camera size={18} />
              <span>Camera Scan</span>
            </button>

            {isInitialEmptyState && (
              <button className="dropzone-btn btn-sample" onClick={handleLoadSample}>
                <Sparkles size={18} />
                <span>Try Sample Note</span>
              </button>
            )}
          </div>

          {isInitialEmptyState && (
            <div className="upload-badges-row">
              <span className="feature-pill">✦ 300 & 600 DPI Upscaling</span>
              <span className="feature-pill">✦ Shadow & Stain Removal</span>
              <span className="feature-pill">✦ Pure A4 Margin Control</span>
              <span className="feature-pill">✦ 100% Offline & Private</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
