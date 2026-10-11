import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Trash2,
  Copy,
  Plus,
  CheckCheck,
} from 'lucide-react';
import type { PrintPage } from '../types';

interface PageListStripProps {
  pages: PrintPage[];
  activeIndex: number;
  onSelectPage: (index: number) => void;
  onMovePage: (fromIndex: number, toIndex: number) => void;
  onRotatePage: (index: number) => void;
  onDuplicatePage: (index: number) => void;
  onDeletePage: (index: number) => void;
  onApplyToAll: () => void;
  onAddMoreClick: () => void;
}

export const PageListStrip: React.FC<PageListStripProps> = ({
  pages,
  activeIndex,
  onSelectPage,
  onMovePage,
  onRotatePage,
  onDuplicatePage,
  onDeletePage,
  onApplyToAll,
  onAddMoreClick,
}) => {
  if (pages.length === 0) return null;

  return (
    <div className="page-strip-container">
      <div className="page-strip-header">
        <div className="strip-title">
          <span>Pages & Document Sequence</span>
          <span className="strip-count">
            ({activeIndex + 1} of {pages.length})
          </span>
        </div>
        <div className="strip-header-actions">
          <button
            className="strip-action-btn btn-apply-all"
            onClick={onApplyToAll}
            title="Apply current page's filter and margin settings to every page"
          >
            <CheckCheck size={14} />
            <span>Apply Settings to All</span>
          </button>
          <button
            className="strip-action-btn btn-add-page"
            onClick={onAddMoreClick}
            title="Upload more images or PDF pages"
          >
            <Plus size={14} />
            <span>Add</span>
          </button>
        </div>
      </div>

      <div className="page-thumbnails-scroll">
        {pages.map((page, idx) => {
          const isActive = idx === activeIndex;

          return (
            <div
              key={page.id}
              className={`page-thumbnail-card ${isActive ? 'is-active' : ''}`}
              onClick={() => onSelectPage(idx)}
            >
              <div className="thumbnail-badge-number">{idx + 1}</div>

              <div className="thumbnail-preview-frame">
                <img
                  src={page.sourceUrl}
                  alt={page.name}
                  className="thumbnail-img"
                  style={{
                    transform: `rotate(${page.rotation}deg)`,
                  }}
                />
              </div>

              <div className="thumbnail-card-footer">
                <span className="thumbnail-page-name" title={page.name}>
                  {page.name}
                </span>

                <div
                  className="thumbnail-card-actions"
                  onClick={(e) => e.stopPropagation()} // Prevent card selection when clicking buttons
                >
                  <button
                    className="thumb-mini-btn"
                    disabled={idx === 0}
                    onClick={() => onMovePage(idx, idx - 1)}
                    title="Move page left"
                  >
                    <ChevronLeft size={14} />
                  </button>

                  <button
                    className="thumb-mini-btn"
                    onClick={() => onRotatePage(idx)}
                    title="Rotate 90 degrees clockwise"
                  >
                    <RotateCw size={14} />
                  </button>

                  <button
                    className="thumb-mini-btn"
                    onClick={() => onDuplicatePage(idx)}
                    title="Duplicate page"
                  >
                    <Copy size={13} />
                  </button>

                  <button
                    className="thumb-mini-btn btn-danger"
                    onClick={() => onDeletePage(idx)}
                    title="Delete page"
                  >
                    <Trash2 size={13} />
                  </button>

                  <button
                    className="thumb-mini-btn"
                    disabled={idx === pages.length - 1}
                    onClick={() => onMovePage(idx, idx + 1)}
                    title="Move page right"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
