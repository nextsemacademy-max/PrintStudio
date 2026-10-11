import React from 'react';
import {
  FileText,
  Maximize2,
  Minimize2,
  RotateCw,
  Box,
} from 'lucide-react';
import type { PageOrientation, MarginPreset, FitMode } from '../types';

interface LayoutControlsProps {
  orientation: PageOrientation;
  marginPreset: MarginPreset;
  marginMm: number;
  fitMode: FitMode;
  rotation: number;
  onOrientationChange: (orientation: PageOrientation) => void;
  onMarginChange: (preset: MarginPreset, mm: number) => void;
  onFitModeChange: (mode: FitMode) => void;
  onRotateClockwise: () => void;
}

export const LayoutControls: React.FC<LayoutControlsProps> = ({
  orientation,
  marginPreset,
  fitMode,
  rotation,
  onOrientationChange,
  onMarginChange,
  onFitModeChange,
  onRotateClockwise,
}) => {
  const marginPresets: { id: MarginPreset; label: string; mm: number; desc: string }[] = [
    { id: 'none', label: '0 mm', mm: 0, desc: 'Borderless' },
    { id: 'minimum', label: '5 mm', mm: 5, desc: 'Print Safe' },
    { id: 'normal', label: '10 mm', mm: 10, desc: 'Standard' },
    { id: 'binder', label: '15 mm', mm: 15, desc: 'Hole-Punch / Binder' },
  ];

  return (
    <div className="control-panel-section">
      <div className="section-title-row">
        <div className="section-title">
          <FileText size={16} />
          <span>A4 Page Geometry & Margins</span>
        </div>
      </div>

      {/* A4 Orientation Toggle */}
      <div className="control-group">
        <label className="field-label">Page Orientation (210 × 297 mm):</label>
        <div className="segmented-pill-row">
          <button
            type="button"
            className={`seg-pill-btn ${orientation === 'auto' ? 'is-selected' : ''}`}
            onClick={() => onOrientationChange('auto')}
          >
            <span>Auto Detect</span>
          </button>
          <button
            type="button"
            className={`seg-pill-btn ${orientation === 'portrait' ? 'is-selected' : ''}`}
            onClick={() => onOrientationChange('portrait')}
          >
            <span>📄 Portrait</span>
          </button>
          <button
            type="button"
            className={`seg-pill-btn ${orientation === 'landscape' ? 'is-selected' : ''}`}
            onClick={() => onOrientationChange('landscape')}
          >
            <span>📜 Landscape</span>
          </button>
        </div>
      </div>

      {/* Margins Preset Selector */}
      <div className="control-group">
        <label className="field-label">Printable Margins (Safe Area):</label>
        <div className="margins-grid">
          {marginPresets.map((m) => {
            const isSelected = marginPreset === m.id;
            return (
              <button
                key={m.id}
                type="button"
                className={`margin-chip ${isSelected ? 'is-selected' : ''}`}
                onClick={() => onMarginChange(m.id, m.mm)}
              >
                <div className="margin-chip-top">
                  <Box size={14} />
                  <span className="margin-mm-val">{m.label}</span>
                </div>
                <span className="margin-chip-desc">{m.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fit Mode Toggle & Rotation */}
      <div className="control-group">
        <label className="field-label">Image Placement on Sheet:</label>
        <div className="fit-rotation-row">
          <div className="segmented-pill-row" style={{ flex: 1 }}>
            <button
              type="button"
              className={`seg-pill-btn ${fitMode === 'fit' ? 'is-selected' : ''}`}
              onClick={() => onFitModeChange('fit')}
              title="Show 100% of the image inside margins without cutting off anything"
            >
              <Minimize2 size={14} />
              <span>Fit Entire Document</span>
            </button>
            <button
              type="button"
              className={`seg-pill-btn ${fitMode === 'fill' ? 'is-selected' : ''}`}
              onClick={() => onFitModeChange('fill')}
              title="Fill A4 sheet completely (crops edges if aspect ratio differs)"
            >
              <Maximize2 size={14} />
              <span>Fill Sheet</span>
            </button>
          </div>

          <button
            type="button"
            className="rotate-btn"
            onClick={onRotateClockwise}
            title={`Rotate 90 degrees clockwise (Current: ${rotation}°)`}
          >
            <RotateCw size={15} />
            <span>Rotate {rotation}°</span>
          </button>
        </div>
      </div>
    </div>
  );
};
