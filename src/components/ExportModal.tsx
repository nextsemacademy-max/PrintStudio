import React from 'react';
import { Loader2, CheckCircle, FileText, X } from 'lucide-react';
import type { ExportProgress } from '../utils/pdfExporter';

interface ExportModalProps {
  isOpen: boolean;
  isCompleted: boolean;
  progress: ExportProgress;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  isCompleted,
  progress,
  onClose,
}) => {
  if (!isOpen) return null;

  const percentage =
    progress.totalPages > 0
      ? Math.round((progress.currentPage / progress.totalPages) * 100)
      : 0;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title-with-icon">
            <FileText size={20} className="icon-blue" />
            <h3>{isCompleted ? 'Export Completed' : 'Generating High-DPI Document'}</h3>
          </div>
          {isCompleted && (
            <button className="modal-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          )}
        </div>

        <div className="modal-body">
          {isCompleted ? (
            <div className="modal-success-state">
              <CheckCircle size={56} className="icon-success" />
              <h4>Ready for Printing!</h4>
              <p>
                Your document has been upscaled to pristine print resolution and saved to your device.
              </p>
              <button className="modal-primary-btn" onClick={onClose}>
                Done
              </button>
            </div>
          ) : (
            <div className="modal-progress-state">
              <Loader2 size={44} className="spinner-icon icon-blue" />
              <h4>{progress.statusText || 'Processing pages...'}</h4>
              <p>
                Rendering Page {progress.currentPage} of {progress.totalPages}
              </p>

              <div className="modal-progress-track">
                <div
                  className="modal-progress-indicator"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="modal-progress-percentage">{percentage}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
