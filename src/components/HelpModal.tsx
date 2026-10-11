import React from 'react';
import { X, Sparkles, Printer, FileText, Smartphone, ShieldCheck } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card help-modal-card">
        <div className="modal-header">
          <div className="modal-title-with-icon">
            <Sparkles size={20} className="icon-gold" />
            <h3>A4 Print Studio Guide & Best Practices</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body help-modal-content">
          <div className="help-tip-card">
            <div className="help-tip-icon">
              <FileText size={20} />
            </div>
            <div className="help-tip-body">
              <h4>Standard A4 Print Standard (210 × 297 mm)</h4>
              <p>
                A standard screen image has only 72 to 96 DPI. When printed on physical paper, it looks blurry.
                Our engine resamples and applies unsharp edge masks up to <strong>300 DPI (2480 × 3508 px)</strong> or <strong>600 DPI (4960 × 7016 px)</strong> so every character prints razor-sharp.
              </p>
            </div>
          </div>

          <div className="help-tip-card">
            <div className="help-tip-icon">
              <Sparkles size={20} />
            </div>
            <div className="help-tip-body">
              <h4>Magic Document Scan (Shadow Removal)</h4>
              <p>
                When taking phone photos of study notes or textbook pages, room lighting and your phone cast ugly shadows. 
                <strong>Magic Document</strong> automatically levels the paper background to crisp clean pure white, removing shadows and making pen ink pop.
              </p>
            </div>
          </div>

          <div className="help-tip-card">
            <div className="help-tip-icon">
              <Printer size={20} />
            </div>
            <div className="help-tip-body">
              <h4>Laser Print / Ink Saver (Pure B&W)</h4>
              <p>
                For office laser printers, Xerox copies, or saving toner ink, use <strong>Sharp B&W</strong>. It eliminates gray gradient noise and outputs pure black text on pure white paper.
              </p>
            </div>
          </div>

          <div className="help-tip-card">
            <div className="help-tip-icon">
              <Smartphone size={20} />
            </div>
            <div className="help-tip-body">
              <h4>Printing from Android Phone</h4>
              <p>
                Tap the <strong>Print</strong> button to trigger the Android system print service. You can print directly to Wi-Fi/Bluetooth printers or save as a native A4 PDF via Google Print Spooler.
              </p>
            </div>
          </div>

          <div className="help-tip-card">
            <div className="help-tip-icon">
              <ShieldCheck size={20} />
            </div>
            <div className="help-tip-body">
              <h4>100% Client-Side & Private</h4>
              <p>
                Your files, personal notes, and documents are processed entirely inside your device's browser memory via WebGL/Canvas. Zero data is ever uploaded to any external server.
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-primary-btn" onClick={onClose}>
            Got it, Let's Print!
          </button>
        </div>
      </div>
    </div>
  );
};
