import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface MagazineReaderProps {
  pages: string[]; // Array of page image URLs
  onClose?: () => void;
  title?: string;
  initialPage?: number;
}

const MagazineReader: React.FC<MagazineReaderProps> = ({
  pages,
  onClose,
  title = 'Magazine',
  initialPage = 0
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([initialPage]));
  const containerRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);

  // Detect mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Preload adjacent pages
  useEffect(() => {
    const pagesToPreload = new Set(loadedImages);

    // Preload current page and adjacent pages
    if (isMobile) {
      // Single page mode: preload prev and next
      [currentPage - 1, currentPage, currentPage + 1].forEach(idx => {
        if (idx >= 0 && idx < pages.length) {
          pagesToPreload.add(idx);
        }
      });
    } else {
      // Spread mode: preload current spread and adjacent spreads
      const currentSpreadStart = currentPage % 2 === 0 ? currentPage : currentPage - 1;
      for (let i = currentSpreadStart - 2; i <= currentSpreadStart + 3; i++) {
        if (i >= 0 && i < pages.length) {
          pagesToPreload.add(i);
        }
      }
    }

    // Preload images
    pagesToPreload.forEach(idx => {
      if (!loadedImages.has(idx)) {
        const img = new Image();
        img.src = pages[idx];
      }
    });

    setLoadedImages(pagesToPreload);
  }, [currentPage, isMobile, pages]);

  // Navigation functions
  const goToNextPage = useCallback(() => {
    if (isFlipping) return;

    const nextPage = isMobile ? currentPage + 1 : currentPage + 2;
    if (nextPage < pages.length) {
      setIsFlipping(true);
      setCurrentPage(nextPage);
      setTimeout(() => setIsFlipping(false), 800);
    }
  }, [currentPage, isFlipping, isMobile, pages.length]);

  const goToPrevPage = useCallback(() => {
    if (isFlipping) return;

    const prevPage = isMobile ? currentPage - 1 : currentPage - 2;
    if (prevPage >= 0) {
      setIsFlipping(true);
      setCurrentPage(prevPage);
      setTimeout(() => setIsFlipping(false), 800);
    }
  }, [currentPage, isFlipping, isMobile]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevPage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextPage();
      } else if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextPage, goToPrevPage, onClose]);

  // Swipe/drag handler
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;

    if (info.offset.x > threshold) {
      goToPrevPage();
    } else if (info.offset.x < -threshold) {
      goToNextPage();
    }
  };

  // Click on page edges
  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFlipping) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const threshold = rect.width * 0.3;

    if (clickX < threshold) {
      goToPrevPage();
    } else if (clickX > rect.width - threshold) {
      goToNextPage();
    }
  };

  // Calculate pages to show
  const getVisiblePages = () => {
    if (isMobile) {
      return [currentPage];
    } else {
      // Spread view: show pairs
      if (currentPage === 0) {
        return [0]; // Cover page alone
      }
      // Ensure we show pairs starting from odd pages
      const leftPage = currentPage % 2 === 0 ? currentPage - 1 : currentPage;
      const rightPage = leftPage + 1;
      return rightPage < pages.length ? [leftPage, rightPage] : [leftPage];
    }
  };

  const visiblePages = getVisiblePages();
  const canGoPrev = isMobile ? currentPage > 0 : currentPage > 0;
  const canGoNext = isMobile ? currentPage < pages.length - 1 : currentPage < pages.length - 1;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-50 overflow-hidden"
    >
      {/* Ambient lighting effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 h-16 md:h-20 bg-black/40 backdrop-blur-xl z-50 flex items-center justify-between px-4 md:px-8 border-b border-white/10">
        <div>
          <div className="text-xs text-blue-400 font-bold tracking-widest uppercase mb-1">Magazine Reader</div>
          <h1 className="text-white font-bold text-lg md:text-2xl truncate max-w-[200px] md:max-w-none">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-white/60 text-xs font-mono">
            {isMobile ? currentPage + 1 : Math.floor(currentPage / 2) + 1} / {isMobile ? pages.length : Math.ceil(pages.length / 2)}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 text-white p-2 md:p-3 rounded-lg transition-all"
              aria-label="Close reader"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </header>

      {/* Main reading area */}
      <div className="absolute inset-0 flex items-center justify-center pt-16 md:pt-20 pb-20">
        <div
          className="relative w-full h-full flex items-center justify-center px-4 md:px-20"
          style={{ perspective: '2000px' }}
        >
          {/* Navigation buttons */}
          {canGoPrev && (
            <button
              onClick={goToPrevPage}
              disabled={isFlipping}
              className="absolute left-4 md:left-8 z-40 bg-white/10 hover:bg-blue-600 text-white p-3 md:p-4 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl backdrop-blur-sm border border-white/20 group"
              aria-label="Previous page"
            >
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          )}

          {canGoNext && (
            <button
              onClick={goToNextPage}
              disabled={isFlipping}
              className="absolute right-4 md:right-8 z-40 bg-white/10 hover:bg-blue-600 text-white p-3 md:p-4 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl backdrop-blur-sm border border-white/20 group"
              aria-label="Next page"
            >
              <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}

          {/* Pages */}
          <motion.div
            drag={!isFlipping ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ x: dragX }}
            className="relative flex items-center justify-center gap-0"
            onClick={handlePageClick}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{
                  duration: 0.8,
                  ease: [0.43, 0.13, 0.23, 0.96]
                }}
                className="flex shadow-2xl relative"
                style={{
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'center center'
                }}
              >
                {visiblePages.map((pageIdx, idx) => (
                  <motion.div
                    key={pageIdx}
                    className="relative bg-white"
                    style={{
                      width: isMobile ? '85vw' : 'min(45vh * 0.7, 400px)',
                      height: isMobile ? 'calc(85vw * 1.4)' : 'min(45vh, 560px)',
                      maxWidth: '600px'
                    }}
                  >
                    {/* Page content */}
                    <div className="absolute inset-0 overflow-hidden rounded-sm">
                      <img
                        src={pages[pageIdx]}
                        alt={`Page ${pageIdx + 1}`}
                        className="w-full h-full object-cover"
                        loading={loadedImages.has(pageIdx) ? 'eager' : 'lazy'}
                      />
                    </div>

                    {/* Page curl shadow effect */}
                    {!isMobile && idx === 0 && visiblePages.length > 1 && (
                      <>
                        {/* Right edge shadow (spine) */}
                        <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-black/30 via-black/10 to-transparent pointer-events-none z-10" />
                        {/* Subtle left edge highlight */}
                        <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-white/20 to-transparent pointer-events-none z-10" />
                      </>
                    )}
                    {!isMobile && idx === 1 && (
                      <>
                        {/* Left edge shadow (spine) */}
                        <div className="absolute top-0 left-0 bottom-0 w-16 bg-gradient-to-r from-black/30 via-black/10 to-transparent pointer-events-none z-10" />
                        {/* Subtle right edge highlight */}
                        <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white/20 to-transparent pointer-events-none z-10" />
                      </>
                    )}

                    {/* Page number */}
                    <div className={`absolute bottom-4 ${idx === 0 || isMobile ? 'right-4' : 'left-4'} text-xs text-gray-400 font-mono z-20`}>
                      {pageIdx + 1}
                    </div>

                    {/* Subtle page texture */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 pointer-events-none opacity-30" />
                  </motion.div>
                ))}

                {/* Spine shadow between spread pages */}
                {!isMobile && visiblePages.length > 1 && (
                  <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-gradient-to-b from-black/40 via-black/60 to-black/40 z-20 pointer-events-none shadow-lg" />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 bg-black/40 backdrop-blur-xl rounded-full border border-white/10">
        {Array.from({ length: isMobile ? pages.length : Math.ceil(pages.length / 2) }).map((_, idx) => {
          const isActive = isMobile ? idx === currentPage : idx === Math.floor(currentPage / 2);
          return (
            <button
              key={idx}
              onClick={() => {
                if (!isFlipping) {
                  setIsFlipping(true);
                  setCurrentPage(isMobile ? idx : idx * 2);
                  setTimeout(() => setIsFlipping(false), 800);
                }
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                isActive ? 'w-8 bg-blue-500' : 'w-1.5 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to ${isMobile ? 'page' : 'spread'} ${idx + 1}`}
            />
          );
        })}
      </div>

      {/* Instructions overlay (shows briefly on load) */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/40 text-xs text-center animate-pulse pointer-events-none">
        <div className="hidden md:block">Click edges • Swipe • Arrow keys</div>
        <div className="md:hidden">Swipe or tap edges to flip</div>
      </div>

      {/* Custom styles for better page flip effect */}
      <style>{`
        @keyframes pageCurl {
          0% {
            transform: rotateY(0deg);
            filter: brightness(1);
          }
          50% {
            transform: rotateY(15deg);
            filter: brightness(0.9);
          }
          100% {
            transform: rotateY(0deg);
            filter: brightness(1);
          }
        }

        .page-hover:hover {
          animation: pageCurl 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default MagazineReader;
