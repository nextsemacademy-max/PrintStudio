import React, { useState } from 'react';
import type {
  PrintPage,
  EnhancementPreset,
  DpiTarget,
  PageFilters,
  PageOrientation,
  MarginPreset,
  FitMode,
} from './types';
import { Header } from './components/Header';
import { UploadDropzone } from './components/UploadDropzone';
import { PageListStrip } from './components/PageListStrip';
import { EnhanceControls } from './components/EnhanceControls';
import { LayoutControls } from './components/LayoutControls';
import { A4PreviewCanvas } from './components/A4PreviewCanvas';
import { ExportModal } from './components/ExportModal';
import { HelpModal } from './components/HelpModal';
import { generateAndDownloadA4Pdf, exportPagesAsZip, type ExportProgress } from './utils/pdfExporter';
import { triggerDirectPrint } from './utils/printManager';
import { Wand2, Layout, PlusCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [pages, setPages] = useState<PrintPage[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'enhance' | 'layout' | 'add'>('enhance');

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const [exportModal, setExportModal] = useState<{
    isOpen: boolean;
    isCompleted: boolean;
    progress: ExportProgress;
  }>({
    isOpen: false,
    isCompleted: false,
    progress: { currentPage: 0, totalPages: 0, statusText: '' },
  });

  const currentPage = pages[activeIndex] || null;

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Add pages handler
  const handlePagesAdded = (newPages: PrintPage[]) => {
    setPages((prev) => {
      const updated = [...prev, ...newPages];
      if (prev.length === 0) {
        setActiveIndex(0);
      }
      return updated;
    });
    showNotification(`Added ${newPages.length} ${newPages.length === 1 ? 'page' : 'pages'}`);
  };

  // Page reordering & management
  const handleMovePage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= pages.length) return;
    setPages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, item);
      return copy;
    });
    setActiveIndex(toIndex);
  };

  const handleRotatePage = (index: number) => {
    setPages((prev) =>
      prev.map((p, idx) => {
        if (idx !== index) return p;
        const newRotation = ((p.rotation + 90) % 360);
        return { ...p, rotation: newRotation };
      })
    );
  };

  const handleDuplicatePage = (index: number) => {
    const target = pages[index];
    if (!target) return;
    const duplicated: PrintPage = {
      ...target,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${target.name} (Copy)`,
    };
    setPages((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, duplicated);
      return next;
    });
    setActiveIndex(index + 1);
    showNotification('Page duplicated');
  };

  const handleDeletePage = (index: number) => {
    setPages((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      return next;
    });
    if (activeIndex >= index && activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
    showNotification('Page deleted');
  };

  // Apply current page's settings to all pages in document
  const handleApplyToAll = () => {
    if (!currentPage) return;
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        marginPreset: currentPage.marginPreset,
        marginMm: currentPage.marginMm,
        fitMode: currentPage.fitMode,
        enhancementPreset: currentPage.enhancementPreset,
        filters: { ...currentPage.filters },
        targetDpi: currentPage.targetDpi,
      }))
    );
    showNotification('Applied settings to all pages in document!');
  };

  // Current page property modifiers
  const handlePresetChange = (preset: EnhancementPreset) => {
    if (!currentPage) return;
    let defaultFilters: PageFilters = {
      brightness: 0,
      contrast: 0,
      sharpness: 35,
      whitening: 40,
      binarizeThreshold: 140,
    };

    if (preset === 'bw') {
      defaultFilters = {
        brightness: 0,
        contrast: 20,
        sharpness: 50,
        whitening: 0,
        binarizeThreshold: 140,
      };
    } else if (preset === 'magic') {
      defaultFilters = {
        brightness: 0,
        contrast: 15,
        sharpness: 45,
        whitening: 50,
        binarizeThreshold: 140,
      };
    } else if (preset === 'photo') {
      defaultFilters = {
        brightness: 0,
        contrast: 10,
        sharpness: 25,
        whitening: 0,
        binarizeThreshold: 128,
      };
    } else if (preset === 'original') {
      defaultFilters = {
        brightness: 0,
        contrast: 0,
        sharpness: 0,
        whitening: 0,
        binarizeThreshold: 128,
      };
    }

    setPages((prev) =>
      prev.map((p, idx) =>
        idx === activeIndex
          ? { ...p, enhancementPreset: preset, filters: defaultFilters }
          : p
      )
    );
  };

  const handleDpiChange = (dpi: DpiTarget) => {
    setPages((prev) =>
      prev.map((p, idx) => (idx === activeIndex ? { ...p, targetDpi: dpi } : p))
    );
  };

  const handleFilterChange = (filters: PageFilters) => {
    setPages((prev) =>
      prev.map((p, idx) => (idx === activeIndex ? { ...p, filters } : p))
    );
  };

  const handleResetFilters = () => {
    if (currentPage) {
      handlePresetChange(currentPage.enhancementPreset);
      showNotification('Filters reset to preset defaults');
    }
  };

  const handleOrientationChange = (orientation: PageOrientation) => {
    setPages((prev) =>
      prev.map((p, idx) => (idx === activeIndex ? { ...p, orientation } : p))
    );
  };

  const handleMarginChange = (preset: MarginPreset, mm: number) => {
    setPages((prev) =>
      prev.map((p, idx) =>
        idx === activeIndex ? { ...p, marginPreset: preset, marginMm: mm } : p
      )
    );
  };

  const handleFitModeChange = (mode: FitMode) => {
    setPages((prev) =>
      prev.map((p, idx) => (idx === activeIndex ? { ...p, fitMode: mode } : p))
    );
  };

  const handleIncludePageNumbersChange = (val: boolean) => {
    setPages((prev) =>
      prev.map((p, idx) => (idx === activeIndex ? { ...p, includePageNumbers: val } : p))
    );
  };

  const handleHeaderTitleChange = (val: string) => {
    setPages((prev) =>
      prev.map((p, idx) => (idx === activeIndex ? { ...p, headerTitle: val } : p))
    );
  };

  // Export & Print actions
  const handleExportPdf = async () => {
    if (pages.length === 0) return;
    setExportModal({
      isOpen: true,
      isCompleted: false,
      progress: { currentPage: 1, totalPages: pages.length, statusText: 'Initializing PDF...' },
    });

    try {
      await generateAndDownloadA4Pdf(pages, 'A4_Printable_Notes.pdf', (progress) => {
        setExportModal((prev) => ({
          ...prev,
          progress,
        }));
      });
      setExportModal((prev) => ({ ...prev, isCompleted: true }));
    } catch (err) {
      console.error('PDF export failed', err);
      alert('Failed to export PDF. Please check console.');
      setExportModal((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const handleExportZip = async () => {
    if (pages.length === 0) return;
    setExportModal({
      isOpen: true,
      isCompleted: false,
      progress: { currentPage: 1, totalPages: pages.length, statusText: 'Exporting HD Images...' },
    });

    try {
      await exportPagesAsZip(pages, 'A4_High_DPI_Images.zip', (progress) => {
        setExportModal((prev) => ({
          ...prev,
          progress,
        }));
      });
      setExportModal((prev) => ({ ...prev, isCompleted: true }));
    } catch (err) {
      console.error('ZIP export failed', err);
      alert('Failed to export ZIP. Please check console.');
      setExportModal((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const handleDirectPrint = async () => {
    if (pages.length === 0) return;
    try {
      await triggerDirectPrint(pages, (status) => {
        if (status) showNotification(status);
      });
    } catch (err) {
      console.error('Direct print failed', err);
      alert('Print initialization failed.');
    }
  };

  return (
    <div className="app-root-layout">
      {/* Top Application Header */}
      <Header
        pageCount={pages.length}
        currentDpi={currentPage?.targetDpi || 300}
        isProcessing={exportModal.isOpen && !exportModal.isCompleted}
        onPrint={handleDirectPrint}
        onDownloadPdf={handleExportPdf}
        onExportZip={handleExportZip}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Floating Status Notification Toast */}
      {notification && (
        <div className="floating-notification-toast">
          <span>{notification}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="app-main-content">
        {pages.length === 0 ? (
          <div className="welcome-screen-wrapper">
            <UploadDropzone onPagesAdded={handlePagesAdded} isInitialEmptyState={true} />
          </div>
        ) : (
          <div className="studio-workspace-grid">
            {/* Left / Center: Preview Canvas & Bottom Page Sequence Strip */}
            <section className="studio-preview-section">
              <A4PreviewCanvas
                page={currentPage}
                pageIndex={activeIndex}
                totalPages={pages.length}
              />

              <PageListStrip
                pages={pages}
                activeIndex={activeIndex}
                onSelectPage={setActiveIndex}
                onMovePage={handleMovePage}
                onRotatePage={handleRotatePage}
                onDuplicatePage={handleDuplicatePage}
                onDeletePage={handleDeletePage}
                onApplyToAll={handleApplyToAll}
                onAddMoreClick={() => setActiveTab('add')}
              />
            </section>

            {/* Right: Studio Controls Panel */}
            <aside className="studio-controls-sidebar">
              {/* Sidebar Tabs */}
              <div className="sidebar-tabs-nav">
                <button
                  type="button"
                  className={`sidebar-tab-btn ${activeTab === 'enhance' ? 'is-active' : ''}`}
                  onClick={() => setActiveTab('enhance')}
                >
                  <Wand2 size={16} />
                  <span>Enhance & Upscale</span>
                </button>
                <button
                  type="button"
                  className={`sidebar-tab-btn ${activeTab === 'layout' ? 'is-active' : ''}`}
                  onClick={() => setActiveTab('layout')}
                >
                  <Layout size={16} />
                  <span>A4 Layout</span>
                </button>
                <button
                  type="button"
                  className={`sidebar-tab-btn ${activeTab === 'add' ? 'is-active' : ''}`}
                  onClick={() => setActiveTab('add')}
                >
                  <PlusCircle size={16} />
                  <span>Add Pages</span>
                </button>
              </div>

              {/* Sidebar Tab Content */}
              <div className="sidebar-tab-content-area">
                {activeTab === 'enhance' && currentPage && (
                  <EnhanceControls
                    currentPreset={currentPage.enhancementPreset}
                    currentDpi={currentPage.targetDpi}
                    filters={currentPage.filters}
                    onPresetChange={handlePresetChange}
                    onDpiChange={handleDpiChange}
                    onFilterChange={handleFilterChange}
                    onResetFilters={handleResetFilters}
                  />
                )}

                {activeTab === 'layout' && currentPage && (
                  <LayoutControls
                    orientation={currentPage.orientation}
                    marginPreset={currentPage.marginPreset}
                    marginMm={currentPage.marginMm}
                    fitMode={currentPage.fitMode}
                    rotation={currentPage.rotation}
                    includePageNumbers={currentPage.includePageNumbers}
                    headerTitle={currentPage.headerTitle}
                    onOrientationChange={handleOrientationChange}
                    onMarginChange={handleMarginChange}
                    onFitModeChange={handleFitModeChange}
                    onRotateClockwise={() => handleRotatePage(activeIndex)}
                    onIncludePageNumbersChange={handleIncludePageNumbersChange}
                    onHeaderTitleChange={handleHeaderTitleChange}
                  />
                )}

                {activeTab === 'add' && (
                  <div className="sidebar-add-container">
                    <UploadDropzone
                      onPagesAdded={(newPages) => {
                        handlePagesAdded(newPages);
                        setActiveTab('enhance');
                      }}
                      isInitialEmptyState={false}
                    />
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* Progress & Export Modal */}
      <ExportModal
        isOpen={exportModal.isOpen}
        isCompleted={exportModal.isCompleted}
        progress={exportModal.progress}
        onClose={() => setExportModal({ isOpen: false, isCompleted: false, progress: { currentPage: 0, totalPages: 0, statusText: '' } })}
      />

      {/* Practical Guide Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};

export default App;
