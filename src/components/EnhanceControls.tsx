import React from 'react';
import {
  Wand2,
  Binary,
  Palette,
  Eye,
  Sparkles,
  Sliders,
  RotateCcw,
  Zap,
} from 'lucide-react';
import type { EnhancementPreset, DpiTarget, PageFilters } from '../types';

interface EnhanceControlsProps {
  currentPreset: EnhancementPreset;
  currentDpi: DpiTarget;
  filters: PageFilters;
  onPresetChange: (preset: EnhancementPreset) => void;
  onDpiChange: (dpi: DpiTarget) => void;
  onFilterChange: (filters: PageFilters) => void;
  onResetFilters: () => void;
}

export const EnhanceControls: React.FC<EnhanceControlsProps> = ({
  currentPreset,
  currentDpi,
  filters,
  onPresetChange,
  onDpiChange,
  onFilterChange,
  onResetFilters,
}) => {
  const handleSliderChange = (key: keyof PageFilters, value: number) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const presetsList: {
    id: EnhancementPreset;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'magic',
      title: 'Magic Document',
      subtitle: 'Shadow removal & white paper',
      icon: <Wand2 size={18} className="icon-magic" />,
    },
    {
      id: 'bw',
      title: 'Sharp B&W',
      subtitle: 'Laser print / Ink saver',
      icon: <Binary size={18} className="icon-bw" />,
    },
    {
      id: 'grayscale',
      title: 'Crisp Grayscale',
      subtitle: 'Clean monochrome tones',
      icon: <Eye size={18} className="icon-gray" />,
    },
    {
      id: 'photo',
      title: 'True Color HD',
      subtitle: 'Photos, diagrams & art',
      icon: <Palette size={18} className="icon-photo" />,
    },
    {
      id: 'original',
      title: 'Pure Upscale',
      subtitle: 'Keep colors + 300 DPI',
      icon: <Sparkles size={18} className="icon-pure" />,
    },
  ];

  return (
    <div className="control-panel-section">
      <div className="section-title-row">
        <div className="section-title">
          <Wand2 size={16} />
          <span>Image Upscaling & Cleaning</span>
        </div>
        <button
          className="section-reset-btn"
          onClick={onResetFilters}
          title="Reset sliders to preset defaults"
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>
      </div>

      {/* Target Print Resolution Selector */}
      <div className="dpi-selector-group">
        <label className="field-label">Target Print Resolution (DPI):</label>
        <div className="dpi-segmented-toggle">
          <button
            type="button"
            className={`dpi-btn ${currentDpi === 300 ? 'is-selected' : ''}`}
            onClick={() => onDpiChange(300)}
          >
            <Zap size={14} />
            <span>300 DPI (Standard A4 Print)</span>
            <span className="dpi-badge-dim">2480 × 3508 px</span>
          </button>
          <button
            type="button"
            className={`dpi-btn ${currentDpi === 600 ? 'is-selected' : ''}`}
            onClick={() => onDpiChange(600)}
          >
            <Sparkles size={14} />
            <span>600 DPI (Ultra Razor Print)</span>
            <span className="dpi-badge-dim">4960 × 7016 px</span>
          </button>
        </div>
      </div>

      {/* Enhancement Presets Grid */}
      <div className="presets-grid">
        {presetsList.map((p) => {
          const isSelected = currentPreset === p.id;
          return (
            <button
              key={p.id}
              type="button"
              className={`preset-card ${isSelected ? 'is-selected' : ''}`}
              onClick={() => onPresetChange(p.id)}
            >
              <div className="preset-card-top">
                <div className="preset-icon-box">{p.icon}</div>
                {isSelected && <span className="preset-active-dot" />}
              </div>
              <div className="preset-card-info">
                <div className="preset-title">{p.title}</div>
                <div className="preset-sub">{p.subtitle}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Fine-Tuning Sliders */}
      <div className="sliders-container">
        <div className="sliders-sub-header">
          <Sliders size={14} />
          <span>Fine-Tuning Controls</span>
        </div>

        {/* Sharpness Slider */}
        <div className="slider-row">
          <div className="slider-label-row">
            <span className="slider-label">Text & Edge Sharpness</span>
            <span className="slider-value-pill">{filters.sharpness}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={filters.sharpness}
            onChange={(e) => handleSliderChange('sharpness', Number(e.target.value))}
            className="custom-range-slider"
          />
        </div>

        {/* Background Whitening (for Magic Scan) */}
        {currentPreset === 'magic' && (
          <div className="slider-row">
            <div className="slider-label-row">
              <span className="slider-label">Paper Whitening & Shadow Removal</span>
              <span className="slider-value-pill">{filters.whitening}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={filters.whitening}
              onChange={(e) => handleSliderChange('whitening', Number(e.target.value))}
              className="custom-range-slider"
            />
          </div>
        )}

        {/* Binarization Threshold (for B&W mode) */}
        {currentPreset === 'bw' && (
          <div className="slider-row">
            <div className="slider-label-row">
              <span className="slider-label">B&W Black Ink Threshold</span>
              <span className="slider-value-pill">{filters.binarizeThreshold}</span>
            </div>
            <input
              type="range"
              min="40"
              max="220"
              value={filters.binarizeThreshold}
              onChange={(e) => handleSliderChange('binarizeThreshold', Number(e.target.value))}
              className="custom-range-slider"
            />
          </div>
        )}

        {/* Brightness Slider */}
        <div className="slider-row">
          <div className="slider-label-row">
            <span className="slider-label">Brightness</span>
            <span className="slider-value-pill">
              {filters.brightness > 0 ? `+${filters.brightness}` : filters.brightness}
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={filters.brightness}
            onChange={(e) => handleSliderChange('brightness', Number(e.target.value))}
            className="custom-range-slider"
          />
        </div>

        {/* Contrast Slider */}
        <div className="slider-row">
          <div className="slider-label-row">
            <span className="slider-label">Contrast</span>
            <span className="slider-value-pill">
              {filters.contrast > 0 ? `+${filters.contrast}` : filters.contrast}
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={filters.contrast}
            onChange={(e) => handleSliderChange('contrast', Number(e.target.value))}
            className="custom-range-slider"
          />
        </div>
      </div>
    </div>
  );
};
