
import React, { useState, useEffect, useRef } from 'react';
import { ViewMode, Magazine, Page, MagazineElement } from './types';
import Onboarding from './components/Onboarding';
import Editor from './components/Editor';
import MagazineReaderDemo from './components/MagazineReaderDemo';
import { ICONS } from './constants';

const BASE_WIDTH = 550;

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('onboarding');
  const [magazine, setMagazine] = useState<Magazine | null>(null);
  const [containerWidth, setContainerWidth] = useState(window.innerWidth);
  const [currentPreviewSpreadIndex, setCurrentPreviewSpreadIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const spreadRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const handleResize = () => setContainerWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleOnboardingComplete = (newMagazine: Magazine) => {
    setMagazine(newMagazine);
    setView('editor');
  };

  const getSpreads = (pages: Page[], aspectRatio: number) => {
    const spreads: Page[][] = [];
    if (pages.length === 0) return spreads;

    if (aspectRatio > 1.2) {
      for (const page of pages) {
        spreads.push([page]);
      }
      return spreads;
    }

    spreads.push([pages[0]]); // Cover
    for (let i = 1; i < pages.length; i += 2) {
      spreads.push(pages.slice(i, i + 2));
    }
    return spreads;
  };

  const spreads = magazine ? getSpreads(magazine.pages, magazine.aspectRatio) : [];

  const handleElementClick = (element: MagazineElement) => {
    if (!element.action) return;

    if (element.action.type === 'page' && element.action.value) {
      const spreadIndex = parseInt(element.action.value);
      if (view === 'preview') {
        if (spreadIndex !== currentPreviewSpreadIndex) {
          triggerFlip(spreadIndex);
        }
      } else {
        const targetRef = spreadRefs.current[`spread-${spreadIndex}`];
        if (targetRef) {
          targetRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    } else if (element.action.type === 'link' && element.action.value) {
      window.open(element.action.value, '_blank');
    }
  };

  const triggerFlip = (index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentPreviewSpreadIndex(index);
    setTimeout(() => setIsAnimating(false), 1000); // Matches transition duration
  };

  const nextSpread = () => {
    if (currentPreviewSpreadIndex < spreads.length - 1 && !isAnimating) {
      triggerFlip(currentPreviewSpreadIndex + 1);
    }
  };

  const prevSpread = () => {
    if (currentPreviewSpreadIndex > 0 && !isAnimating) {
      triggerFlip(currentPreviewSpreadIndex - 1);
    }
  };

  // Check URL hash for demo mode
  useEffect(() => {
    if (window.location.hash === '#demo') {
      setView('demo' as ViewMode);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-500 selection:text-white font-sans overflow-x-hidden">
      {view === 'demo' && <MagazineReaderDemo />}

      {view === 'onboarding' && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}
      
      {view === 'editor' && magazine && (
        <Editor 
          magazine={magazine} 
          setMagazine={setMagazine} 
          onPreview={() => {
            setCurrentPreviewSpreadIndex(0);
            setView('preview');
          }}
        />
      )}

      {view === 'preview' && magazine && (
        <div ref={previewRef} className="fixed inset-0 bg-slate-950 z-50 overflow-hidden flex flex-col items-center justify-center p-4">
            <style>{`
              .preview-stage {
                perspective: 3500px;
                transform-style: preserve-3d;
              }
              .flip-spread {
                transition: transform 1s cubic-bezier(0.645, 0.045, 0.355, 1), opacity 0.8s ease;
                transform-style: preserve-3d;
                backface-visibility: hidden;
                transform-origin: center;
              }
              /* Current spread: Visible and flat */
              .flip-spread.active {
                opacity: 1;
                transform: rotateY(0deg) scale(var(--scale));
                z-index: 50;
              }
              /* Past spread: Flipped over to the left side */
              .flip-spread.past {
                opacity: 0;
                transform: rotateY(-180deg) scale(calc(var(--scale) * 0.9));
                z-index: 0;
                pointer-events: none;
              }
              /* Future spread: Waiting to flip from the right side */
              .flip-spread.future {
                opacity: 0;
                transform: rotateY(180deg) scale(calc(var(--scale) * 0.9));
                z-index: 0;
                pointer-events: none;
              }

              /* Spine Shadow effect during flip */
              .spine-shadow {
                position: absolute;
                top: 0;
                bottom: 0;
                left: 50%;
                width: 2px;
                background: rgba(0,0,0,0.3);
                box-shadow: 0 0 40px 10px rgba(0,0,0,0.5);
                z-index: 100;
                pointer-events: none;
                transform: translateX(-50%);
              }
              
              .clip-triangle-left { clip-path: polygon(100% 0, 0 50%, 100% 100%); }
              .clip-triangle-right { clip-path: polygon(0 0, 100% 50%, 0 100%); }
            `}</style>

            {/* Header / HUD */}
            <div className="fixed top-0 left-0 right-0 h-20 md:h-28 bg-black/40 backdrop-blur-3xl z-[100] flex items-center justify-between px-6 md:px-16 border-b border-white/5 shadow-2xl">
                <div className="flex flex-col">
                  <span className="text-[10px] text-blue-400 font-bold tracking-[0.4em] uppercase mb-1">Reader View</span>
                  <h2 className="text-white font-instrument italic text-xl md:text-3xl leading-none tracking-tight truncate max-w-[200px] md:max-w-none">{magazine.title}</h2>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
                    Spread {currentPreviewSpreadIndex + 1} of {spreads.length}
                  </div>
                  <button 
                      onClick={() => setView('editor')}
                      className="bg-white text-black px-6 md:px-10 py-3 md:py-4 rounded-full text-[10px] md:text-xs font-bold transition-all border border-white hover:bg-transparent hover:text-white tracking-widest uppercase shadow-xl"
                  >
                      Close
                  </button>
                </div>
            </div>

            {/* Navigation Buttons - Triangular Page Turners */}
            <button 
              onClick={prevSpread}
              disabled={currentPreviewSpreadIndex === 0 || isAnimating}
              className={`fixed left-8 z-[110] w-20 h-20 md:w-24 md:h-24 flex items-center justify-center bg-white/5 border border-white/10 text-white transition-all hover:bg-blue-600 hover:border-blue-500 disabled:opacity-0 disabled:pointer-events-none transform active:scale-90 shadow-2xl backdrop-blur-xl group clip-triangle-left`}
            >
              <div className="mr-4 transform group-hover:-translate-x-1 transition-transform">{ICONS.Prev}</div>
            </button>

            <button 
              onClick={nextSpread}
              disabled={currentPreviewSpreadIndex === spreads.length - 1 || isAnimating}
              className={`fixed right-8 z-[110] w-20 h-20 md:w-24 md:h-24 flex items-center justify-center bg-white/5 border border-white/10 text-white transition-all hover:bg-blue-600 hover:border-blue-500 disabled:opacity-0 disabled:pointer-events-none transform active:scale-90 shadow-2xl backdrop-blur-xl group clip-triangle-right`}
            >
              <div className="ml-4 transform group-hover:translate-x-1 transition-transform">{ICONS.Next}</div>
            </button>

            {/* Content Container */}
            <div className="w-full h-full flex items-center justify-center relative preview-stage">
              {spreads.map((spread, sIdx) => {
                  const isLandscape = magazine.aspectRatio > 1.2;
                  const spreadWidth = isLandscape ? BASE_WIDTH * 2 : (spread.length === 1 ? BASE_WIDTH : BASE_WIDTH * 2);
                  const pageHeight = Math.round((isLandscape ? BASE_WIDTH * 2 : BASE_WIDTH) / magazine.aspectRatio);
                  
                  const padding = 280; 
                  const availableWidth = containerWidth - padding;
                  const scale = Math.min(1, availableWidth / spreadWidth);

                  const isActive = sIdx === currentPreviewSpreadIndex;
                  const isPast = sIdx < currentPreviewSpreadIndex;
                  const isFuture = sIdx > currentPreviewSpreadIndex;

                  return (
                      <div 
                        key={sIdx} 
                        className={`flip-spread absolute ${isActive ? 'active' : isPast ? 'past' : 'future'}`}
                        style={{ 
                          width: `${spreadWidth}px`,
                          height: `${pageHeight}px`,
                          '--scale': scale
                        } as React.CSSProperties}
                      >
                          <div 
                            className="flex shadow-[0_120px_240px_-60px_rgba(0,0,0,1)] bg-white relative group rounded-sm overflow-hidden border border-white/5 h-full w-full"
                          >
                            {/* The Spine Line Shadow */}
                            {spread.length > 1 && <div className="spine-shadow" />}
                            
                            {spread.map((page, pIdx) => {
                                const isPair = spread.length > 1;
                                return (
                                    <div 
                                        key={page.id}
                                        className={`relative overflow-hidden flex-1 ${isPair && pIdx === 0 ? 'border-r border-black/10' : ''}`}
                                        style={{ 
                                          backgroundImage: page.background ? `url(${page.background})` : 'none', 
                                          backgroundSize: '100% 100%', 
                                          backgroundPosition: 'center',
                                          backgroundRepeat: 'no-repeat',
                                          fontFamily: magazine.brandKit.bodyFont 
                                        }}
                                    >
                                        {/* Realistic Depth Shading */}
                                        {isPair && pIdx === 0 && (
                                          <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-black/20 via-black/5 to-transparent z-40 pointer-events-none" />
                                        )}
                                        {isPair && pIdx === 1 && (
                                          <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-black/20 via-black/5 to-transparent z-40 pointer-events-none" />
                                        )}
                                        {/* Edge softening */}
                                        {isPair && pIdx === 0 && (
                                          <div className="absolute top-0 left-0 bottom-0 w-10 bg-gradient-to-r from-black/5 to-transparent z-40 pointer-events-none" />
                                        )}
                                        {isPair && pIdx === 1 && (
                                          <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-l from-black/5 to-transparent z-40 pointer-events-none" />
                                        )}

                                        {page.elements.map(el => (
                                            <div 
                                              key={el.id} 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleElementClick(el);
                                              }}
                                              style={{ 
                                                position: 'absolute', 
                                                left: `${el.x}%`, 
                                                top: `${el.y}%`, 
                                                width: `${el.width}%`, 
                                                height: `${el.height}%`,
                                                fontFamily: el.type === 'headline' ? magazine.brandKit.headingFont : magazine.brandKit.bodyFont,
                                                zIndex: 10,
                                                cursor: el.action ? 'pointer' : 'default'
                                              }} 
                                              className={`${el.type === 'headline' ? 'text-4xl md:text-5xl font-bold uppercase tracking-tighter leading-[0.9]' : el.type === 'text' ? 'text-sm md:text-lg leading-relaxed font-medium' : ''} ${el.action ? 'hover:ring-2 hover:ring-blue-500/20 active:scale-95' : 'pointer-events-none'} transition-all text-slate-900`}
                                            >
                                                {el.type === 'image' ? (
                                                    <img src={el.content} className="w-full h-full object-cover shadow-2xl" />
                                                ) : el.type === 'hotspot' ? (
                                                    <div className="w-full h-full bg-blue-500/0 hover:bg-blue-500/10 transition-all flex items-center justify-center rounded-xl group/hot">
                                                        <div className="p-3 md:p-4 bg-blue-600 text-white rounded-full opacity-0 scale-50 group-hover/hot:opacity-100 group-hover/hot:scale-100 transition-all duration-500 shadow-2xl">
                                                            {ICONS.Zap}
                                                        </div>
                                                    </div>
                                                 ) : el.content}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                          </div>
                      </div>
                  );
              })}
            </div>

            {/* Bottom Progress Tracker */}
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex gap-3 p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full z-[100]">
                {spreads.map((_, i) => (
                    <button
                      key={i}
                      disabled={isAnimating}
                      onClick={() => triggerFlip(i)}
                      className={`h-1 rounded-full transition-all duration-300 ${i === currentPreviewSpreadIndex ? 'w-12 bg-blue-500' : 'w-4 bg-white/20 hover:bg-white/40'}`}
                    />
                ))}
            </div>
            
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-[0.5em] text-white/20 pointer-events-none">
              Folio Flip Engine 2.0
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
