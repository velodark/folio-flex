
import React, { useState, useRef, useEffect } from 'react';
import { Magazine, Page, MagazineElement, BrandKit, ElementType } from '../types';
import { ICONS } from '../constants';
import { editImageWithAI, generateProImage, generateVeoVideo, processPdfPageWithAI } from '../services/geminiService';

const EDITOR_STAGE_WIDTH = 1100; 

interface EditorProps {
  magazine: Magazine;
  setMagazine: (m: Magazine) => void;
  onPreview: () => void;
}

const Editor: React.FC<EditorProps> = ({ magazine, setMagazine, onPreview }) => {
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.8);
  const [isFlipping, setIsFlipping] = useState<'next' | 'prev' | null>(null);
  const [showInspector, setShowInspector] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSpreadPicker, setShowSpreadPicker] = useState(false);
  
  const [history, setHistory] = useState<Magazine[]>([]);
  
  const [activeSuggestion, setActiveSuggestion] = useState<MagazineElement | null>(null);
  const [pendingSuggestions, setPendingSuggestions] = useState<MagazineElement[]>([]);

  const isLandscapeMagazine = magazine.aspectRatio > 1.2;

  const spreads: Page[][] = [];
  if (isLandscapeMagazine) {
    magazine.pages.forEach(p => spreads.push([p]));
  } else {
    spreads.push([magazine.pages[0]]); 
    for (let i = 1; i < magazine.pages.length; i += 2) {
      spreads.push(magazine.pages.slice(i, i + 2));
    }
  }

  const activeSpread = spreads[currentSpreadIndex] || [];
  const [activePageIndex, setActivePageIndex] = useState(0);

  useEffect(() => {
    const firstPageInSpread = magazine.pages.findIndex(p => p.id === activeSpread[0]?.id);
    if (firstPageInSpread !== -1) setActivePageIndex(firstPageInSpread);
  }, [currentSpreadIndex, magazine.pages, activeSpread]);

  const selectedElement = magazine.pages[activePageIndex]?.elements.find(e => e.id === selectedElementId);

  const displayRatio = isLandscapeMagazine ? magazine.aspectRatio : magazine.aspectRatio * 2;
  const finalDisplayRatio = (activeSpread.length === 1 && !isLandscapeMagazine) ? magazine.aspectRatio : displayRatio;
  
  const containerWidth = EDITOR_STAGE_WIDTH * zoom;
  const containerHeight = containerWidth / finalDisplayRatio;

  const pushToHistory = (currentMagazine: Magazine) => {
    setHistory(prev => [JSON.parse(JSON.stringify(currentMagazine)), ...prev].slice(0, 20));
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const [previous, ...rest] = history;
      setHistory(rest);
      setMagazine(previous);
      setSelectedElementId(null);
    }
  };

  const updateMagazineState = (newMagazine: Magazine) => {
    pushToHistory(magazine);
    setMagazine(newMagazine);
  };

  const handlePageChange = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentSpreadIndex < spreads.length - 1) {
      setIsFlipping('next');
      setTimeout(() => {
        setCurrentSpreadIndex(prev => prev + 1);
        setIsFlipping(null);
      }, 500);
    } else if (direction === 'prev' && currentSpreadIndex > 0) {
      setIsFlipping('prev');
      setTimeout(() => {
        setCurrentSpreadIndex(prev => prev - 1);
        setIsFlipping(null);
      }, 500);
    }
  };

  const updateElement = (pageIndex: number, elementId: string, updates: Partial<MagazineElement>) => {
    const newPages = [...magazine.pages];
    newPages[pageIndex].elements = newPages[pageIndex].elements.map(e => 
      e.id === elementId ? { ...e, ...updates } : e
    );
    updateMagazineState({ ...magazine, pages: newPages });
  };

  const addElement = (type: ElementType, customProps: Partial<MagazineElement> = {}) => {
    const id = `el-${Date.now()}`;
    const newElement: MagazineElement = {
      id,
      type,
      x: 20,
      y: 20,
      width: type === 'text' || type === 'headline' ? 60 : 40,
      height: type === 'text' || type === 'headline' ? 10 : 30,
      content: type === 'text' ? 'New text content...' : type === 'headline' ? 'LOREM IPSUM' : 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80',
      ...customProps
    };
    const newPages = [...magazine.pages];
    newPages[activePageIndex].elements.push(newElement);
    updateMagazineState({ ...magazine, pages: newPages });
    setSelectedElementId(id);
  };

  const deleteElement = (pageIndex: number, elementId: string) => {
    const newPages = [...magazine.pages];
    newPages[pageIndex].elements = newPages[pageIndex].elements.filter(e => e.id !== elementId);
    updateMagazineState({ ...magazine, pages: newPages });
    setSelectedElementId(null);
  };

  const fetchMagicSuggestions = async () => {
    const currentPage = magazine.pages[activePageIndex];
    if (!currentPage.background) return;
    
    setIsAiLoading(true);
    try {
      const suggestedHotspots = await processPdfPageWithAI(currentPage.background);
      if (suggestedHotspots.length > 0) {
        setPendingSuggestions(suggestedHotspots.map(s => ({ ...s, isSuggestion: true })));
        setActiveSuggestion({ ...suggestedHotspots[0], isSuggestion: true });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (!activeSuggestion) return;
    addElement('hotspot', activeSuggestion);
    const nextBatch = pendingSuggestions.slice(1);
    setPendingSuggestions(nextBatch);
    setActiveSuggestion(nextBatch.length > 0 ? nextBatch[0] : null);
  };

  const handleRejectSuggestion = () => {
    const nextBatch = pendingSuggestions.slice(1);
    setPendingSuggestions(nextBatch);
    setActiveSuggestion(nextBatch.length > 0 ? nextBatch[0] : null);
  };

  const handleAiAction = async (actionType: 'edit-image' | 'generate-image' | 'animate') => {
    if (!aiPrompt) return;
    setIsAiLoading(true);
    try {
      if (actionType === 'edit-image' && selectedElement?.type === 'image') {
        const result = await editImageWithAI(selectedElement.content, aiPrompt);
        if (result) updateElement(activePageIndex, selectedElement.id, { content: result });
      } else if (actionType === 'generate-image') {
        const result = await generateProImage(aiPrompt, "1:1", "1K");
        if (result) {
            addElement('image', { content: result });
        }
      } else if (actionType === 'animate' && selectedElement?.type === 'image') {
         const video = await generateVeoVideo(aiPrompt, selectedElement.content);
         if (video) setVideoUrl(video);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
      setAiPrompt('');
    }
  };

  return (
    <div className="flex h-screen bg-[#f1f3f5] overflow-hidden text-slate-900 selection:bg-blue-600 selection:text-white">
      <style>{`
        .book-stage {
          perspective: 2500px;
          transform-style: preserve-3d;
        }
        .magazine-spread {
          transition: transform 0.6s cubic-bezier(0.6, -0.28, 0.735, 0.045), opacity 0.5s ease;
          box-shadow: 0 40px 100px -20px rgba(0,0,0,0.3);
          flex-shrink: 0;
        }
        .flip-next { transform: rotateY(-15deg) translateX(-100px) rotateX(2deg); opacity: 0; }
        .flip-prev { transform: rotateY(15deg) translateX(100px) rotateX(-2deg); opacity: 0; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}</style>

      {/* Pages Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} flex-shrink-0 border-r bg-white flex flex-col z-20 shadow-sm border-slate-200 transition-all duration-300`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between overflow-hidden">
          {!sidebarCollapsed && <h2 className="font-bold text-lg tracking-tight text-slate-800 whitespace-nowrap">Spreads</h2>}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all">
            {sidebarCollapsed ? ICONS.Next : ICONS.Prev}
          </button>
        </div>
        {!sidebarCollapsed && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {spreads.map((spread, idx) => (
              <div 
                key={idx} 
                onClick={() => setCurrentSpreadIndex(idx)}
                className={`group flex flex-col gap-2 p-3 rounded-2xl transition-all cursor-pointer ${currentSpreadIndex === idx ? 'bg-slate-900 shadow-xl' : 'hover:bg-slate-100'}`}
              >
                <div className="flex gap-1 h-12 w-full">
                  {spread.map(p => (
                    <div 
                      key={p.id}
                      className="flex-1 rounded-md border border-slate-200 bg-slate-50 overflow-hidden"
                      style={{ 
                        backgroundImage: p.background ? `url(${p.background})` : 'none',
                        backgroundSize: 'cover'
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between px-1">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${currentSpreadIndex === idx ? 'text-blue-400' : 'text-slate-400'}`}>
                    {idx === 0 ? 'COVER' : `SPREAD ${idx}`}
                  </span>
                </div>
              </div>
            ))}
            <button 
              onClick={() => {
                const newPages = [...magazine.pages, { id: `pg-${Date.now()}`, elements: [] }];
                updateMagazineState({ ...magazine, pages: newPages });
                setCurrentSpreadIndex(spreads.length);
              }}
              className="w-full py-5 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center gap-2 text-slate-300 hover:border-blue-200 hover:text-blue-500 hover:bg-blue-50/20 transition-all"
            >
              {ICONS.Plus} <span className="text-[10px] font-black uppercase tracking-[0.2em]">New Spread</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Workspace Stage */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#e9ecef]">
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 z-30 shadow-sm">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <button 
                    disabled={currentSpreadIndex === 0}
                    onClick={() => handlePageChange('prev')}
                    className="p-2 text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-10"
                >
                  {ICONS.Prev}
                </button>
                <button 
                    disabled={currentSpreadIndex === spreads.length - 1}
                    onClick={() => handlePageChange('next')}
                    className="p-2 text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-10"
                >
                  {ICONS.Next}
                </button>
             </div>
             <div className="h-4 w-[1px] bg-slate-200" />
             <h1 className="font-instrument text-2xl italic tracking-tight text-slate-800 truncate">{magazine.title}</h1>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleUndo}
              disabled={history.length === 0}
              className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all disabled:opacity-30"
              title="Undo"
            >
              {ICONS.Undo}
            </button>
            <div className="hidden md:flex items-center gap-4 px-4 py-1.5 bg-white border border-slate-200 rounded-full shadow-inner">
               <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Zoom</span>
               <input type="range" min="0.3" max="1.5" step="0.05" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-32 accent-slate-900" />
               <span className="text-[10px] font-bold text-slate-600 w-10">{Math.round(zoom * 100)}%</span>
            </div>
            <div className="hidden md:block w-[1px] h-6 bg-slate-200 mx-2" />
            <button 
              onClick={onPreview}
              className="px-6 py-2 border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2 shadow-sm"
            >
              {ICONS.Monitor} Preview
            </button>
            <button className="px-8 py-2 bg-blue-600 text-white rounded-full text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20">
              Publish
            </button>
          </div>
        </header>

        {/* Suggestion Notification Bar */}
        {activeSuggestion && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[70] animate-in slide-in-from-top-4 duration-500 w-full max-w-lg">
            <div className="bg-slate-900 text-white rounded-[2rem] p-4 flex items-center justify-between shadow-2xl border border-white/10 backdrop-blur-xl">
              <div className="flex items-center gap-4 pl-4">
                <div className="p-2 bg-blue-500 rounded-full animate-pulse">
                  {ICONS.Zap}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">AI Suggestion</span>
                  <span className="text-sm font-bold truncate max-w-[200px]">{activeSuggestion.content}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleRejectSuggestion}
                  className="p-3 bg-white/10 hover:bg-red-500/20 text-white rounded-full transition-all"
                  title="New Suggestion"
                >
                  {ICONS.ThumbsDown}
                </button>
                <button 
                  onClick={handleAcceptSuggestion}
                  className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all"
                  title="Keep this one"
                >
                  {ICONS.ThumbsUp}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Spread Editing Area */}
        <div className="flex-1 overflow-auto editor-canvas relative flex items-center justify-center p-8 md:p-20 book-stage">
          <div 
            className={`magazine-spread relative flex bg-white rounded-sm ${isFlipping === 'next' ? 'flip-next' : isFlipping === 'prev' ? 'flip-prev' : ''}`}
            style={{ 
              width: `${containerWidth}px`,
              height: `${containerHeight}px`
            }}
          >
            {activeSpread.map((page, pIdx) => {
              const globalIdx = magazine.pages.findIndex(p => p.id === page.id);
              return (
                <div 
                  key={page.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePageIndex(globalIdx);
                    setSelectedElementId(null);
                  }}
                  className={`relative h-full flex-1 transition-all ${activePageIndex === globalIdx ? 'ring-inset ring-2 ring-blue-500/10' : ''}`}
                  style={{ 
                    backgroundImage: page.background ? `url(${page.background})` : 'none',
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    fontFamily: magazine.brandKit.bodyFont
                  }}
                >
                  {activeSpread.length > 1 && pIdx === 0 && (
                    <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-black/5 to-transparent z-40 pointer-events-none" />
                  )}
                  {activeSpread.length > 1 && pIdx === 1 && (
                    <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-black/5 to-transparent z-40 pointer-events-none" />
                  )}
                  {activeSpread.length > 1 && pIdx === 0 && (
                    <div className="absolute top-0 right-0 bottom-0 w-[1px] bg-black/10 z-50 pointer-events-none" />
                  )}

                  {page.elements.map(el => (
                    <DraggableElement 
                      key={el.id} 
                      element={el} 
                      isSelected={selectedElementId === el.id && activePageIndex === globalIdx}
                      onSelect={() => {
                        setActivePageIndex(globalIdx);
                        setSelectedElementId(el.id);
                      }}
                      onUpdate={(upd) => updateElement(globalIdx, el.id, upd)}
                      brandKit={magazine.brandKit}
                      pageHeight={containerHeight}
                      pageWidth={containerWidth / activeSpread.length}
                    />
                  ))}

                  {/* Ghost Preview of AI Suggestion */}
                  {activeSuggestion && activePageIndex === globalIdx && (
                    <div 
                      style={{
                        position: 'absolute',
                        left: `${activeSuggestion.x}%`,
                        top: `${activeSuggestion.y}%`,
                        width: `${activeSuggestion.width}%`,
                        height: `${activeSuggestion.height}%`,
                        zIndex: 100
                      }}
                      className="border-4 border-dashed border-blue-500/50 bg-blue-500/10 rounded-2xl animate-pulse flex items-center justify-center pointer-events-none"
                    >
                      <div className="bg-blue-600 text-white p-2 rounded-full scale-75">
                        {ICONS.Zap}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Floating Property Inspector */}
          {selectedElement && (
            <div className={`absolute top-8 right-8 w-80 bg-white/95 backdrop-blur-3xl border border-slate-200 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] rounded-[2.5rem] flex flex-col z-[60] transition-all duration-500 transform animate-in fade-in slide-in-from-right-8 ${!showInspector ? 'translate-x-[calc(100%-48px)]' : ''}`}>
               <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-[2.5rem]">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Inspector</span>
                    <span className="text-xs font-bold text-slate-800">{selectedElement.type.toUpperCase()}</span>
                  </div>
                  <button onClick={() => setShowInspector(!showInspector)} className="p-2.5 hover:bg-white rounded-full transition-all text-slate-400 shadow-sm border border-transparent hover:border-slate-100">
                     {showInspector ? ICONS.Next : ICONS.Prev}
                  </button>
               </div>
               
               {showInspector && (
                 <div className="p-8 space-y-10 max-h-[75vh] overflow-y-auto custom-scrollbar relative">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Content & Interactivity</label>
                      {selectedElement.type === 'text' || selectedElement.type === 'headline' ? (
                        <textarea 
                          className="w-full border border-slate-200 p-6 rounded-[2rem] text-sm min-h-[160px] focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all bg-white font-medium leading-relaxed shadow-inner"
                          value={selectedElement.content}
                          onChange={(e) => updateElement(activePageIndex, selectedElement.id, { content: e.target.value })}
                        />
                      ) : selectedElement.type === 'image' ? (
                        <div className="aspect-[1.54/1] bg-slate-50 rounded-[2rem] overflow-hidden relative group border-2 border-white shadow-xl">
                          <img src={selectedElement.content} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="p-10 bg-blue-50 rounded-[2.5rem] border-2 border-blue-100 flex flex-col items-center gap-4 text-center">
                           <div className="p-4 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-500/40">{ICONS.Hotspot}</div>
                           <input 
                             className="bg-transparent border-b border-blue-200 text-center font-bold text-blue-900 outline-none w-full"
                             value={selectedElement.content}
                             onChange={(e) => updateElement(activePageIndex, selectedElement.id, { content: e.target.value })}
                             placeholder="Action Label..."
                           />
                        </div>
                      )}

                      {/* Action Configuration Panel */}
                      <div className="mt-6 p-5 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Click Action</label>
                        <select 
                          className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold outline-none"
                          value={selectedElement.action?.type || 'none'}
                          onChange={(e) => {
                            const type = e.target.value as any;
                            updateElement(activePageIndex, selectedElement.id, { action: type === 'none' ? undefined : { type, value: '' } });
                          }}
                        >
                          <option value="none">No Action</option>
                          <option value="page">Page Jump (TOC)</option>
                          <option value="link">External Link</option>
                        </select>
                        
                        {selectedElement.action?.type === 'page' && (
                          <div className="space-y-3 animate-in fade-in">
                            <button 
                              onClick={() => setShowSpreadPicker(true)}
                              className="w-full py-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
                            >
                              {selectedElement.action.value ? `Target: Spread ${selectedElement.action.value}` : 'Set Navigation Target'}
                            </button>
                            
                            {selectedElement.action.value && (
                              <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-inner flex items-center gap-3">
                                 <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-300 border">S{selectedElement.action.value}</div>
                                 <div className="flex flex-col">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-blue-500">Linked to</span>
                                    <span className="text-[10px] font-bold text-slate-700 leading-none">Spread #{selectedElement.action.value}</span>
                                 </div>
                              </div>
                            )}
                          </div>
                        )}

                        {selectedElement.action?.type === 'link' && (
                          <input 
                            placeholder="https://..."
                            className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium outline-none animate-in fade-in"
                            value={selectedElement.action.value}
                            onChange={(e) => updateElement(activePageIndex, selectedElement.id, { action: { type: 'link', value: e.target.value } })}
                          />
                        )}
                      </div>
                    </div>

                    <div className="space-y-5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                            {ICONS.Sparkles} Creative AI Engine
                        </label>
                        <div className="space-y-4 bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl">
                            <textarea 
                                className="w-full bg-white/10 border border-white/10 p-5 rounded-2xl text-xs h-32 text-white focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder:text-white/20"
                                placeholder="Describe your creative vision..."
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                            />
                            <div className="grid grid-cols-2 gap-3">
                                {selectedElement.type === 'image' && (
                                    <button 
                                        onClick={() => handleAiAction('edit-image')}
                                        disabled={isAiLoading}
                                        className="px-2 py-4 bg-white/10 text-white border border-white/10 rounded-2xl text-[10px] font-black hover:bg-white/20 disabled:opacity-50 transition-all uppercase tracking-widest"
                                    >
                                        {isAiLoading ? '...' : 'Edit'}
                                    </button>
                                )}
                                <button 
                                    onClick={() => handleAiAction('generate-image')}
                                    disabled={isAiLoading}
                                    className={`${selectedElement.type === 'image' ? 'col-span-1' : 'col-span-2'} px-2 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black hover:bg-blue-500 disabled:opacity-50 transition-all uppercase tracking-widest shadow-lg shadow-blue-600/20`}
                                >
                                    {isAiLoading ? '...' : 'Generate'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button 
                      onClick={() => deleteElement(activePageIndex, selectedElement.id)}
                      className="w-full py-5 border border-red-100 text-red-500 hover:bg-red-50 rounded-[2rem] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
                    >
                      {ICONS.Trash} Discard Object
                    </button>

                    {/* Visual Spread Picker Overlay */}
                    {showSpreadPicker && (
                      <div className="absolute inset-0 bg-white/98 z-[100] p-6 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                         <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Select Target Spread</h3>
                            <button onClick={() => setShowSpreadPicker(false)} className="p-2 hover:bg-slate-100 rounded-full">{ICONS.Prev}</button>
                         </div>
                         <div className="flex-1 overflow-y-auto grid grid-cols-1 gap-4 custom-scrollbar pb-10">
                            {spreads.map((spread, sIdx) => (
                              <button
                                key={sIdx}
                                onClick={() => {
                                  updateElement(activePageIndex, selectedElement.id, { action: { type: 'page', value: sIdx.toString() } });
                                  setShowSpreadPicker(false);
                                }}
                                className={`group p-4 rounded-3xl border-2 transition-all flex flex-col gap-3 ${selectedElement.action?.value === sIdx.toString() ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}
                              >
                                 <div className="flex gap-1 h-16 w-full opacity-60 group-hover:opacity-100 transition-all">
                                    {spread.map(p => (
                                      <div key={p.id} className="flex-1 bg-slate-200 rounded-md overflow-hidden border border-slate-100" style={{ backgroundImage: p.background ? `url(${p.background})` : 'none', backgroundSize: 'cover' }} />
                                    ))}
                                 </div>
                                 <div className="flex items-center justify-between px-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                                      {sIdx === 0 ? 'Cover Page' : `Spread ${sIdx}`}
                                    </span>
                                    {selectedElement.action?.value === sIdx.toString() && (
                                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                                    )}
                                 </div>
                              </button>
                            ))}
                         </div>
                      </div>
                    )}
                 </div>
               )}
            </div>
          )}

          {/* Floating Main Toolbar */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-[2.5rem] px-5 py-3 flex items-center gap-2 z-50">
            <ToolbarButton icon={ICONS.Text} label="Headline" onClick={() => addElement('headline')} />
            <ToolbarButton icon={ICONS.Layers} label="Copy" onClick={() => addElement('text')} />
            <ToolbarButton icon={ICONS.Image} label="Asset" onClick={() => addElement('image')} />
            <ToolbarButton icon={ICONS.Hotspot} label="Action" onClick={() => addElement('hotspot')} />
            <div className="w-[1px] h-10 bg-slate-100 mx-4" />
            <ToolbarButton 
              icon={isAiLoading ? <div className="animate-spin w-4 h-4 border-2 border-blue-600/20 border-t-blue-600 rounded-full" /> : ICONS.Sparkles} 
              label="Magic Logic" 
              onClick={fetchMagicSuggestions} 
            />
          </div>
        </div>

        {videoUrl && (
            <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-20 backdrop-blur-xl">
                <div className="relative w-full max-w-5xl bg-black rounded-[4rem] overflow-hidden shadow-2xl border border-white/10">
                    <button onClick={() => setVideoUrl(null)} className="absolute top-8 right-8 z-10 bg-white/20 hover:bg-white/40 p-5 rounded-full text-white transition-all backdrop-blur-md">
                        {ICONS.Trash}
                    </button>
                    <video src={videoUrl} controls autoPlay className="w-full aspect-video" />
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

const DraggableElement: React.FC<{
  element: MagazineElement;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (u: Partial<MagazineElement>) => void;
  brandKit: BrandKit;
  pageHeight: number;
  pageWidth: number;
}> = ({ element, isSelected, onSelect, onUpdate, brandKit, pageHeight, pageWidth }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = element.x;
    const initialY = element.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = ((moveEvent.clientX - startX) / pageWidth) * 100;
      const dy = ((moveEvent.clientY - startY) / pageHeight) * 100;
      onUpdate({ x: initialX + dx, y: initialY + dy });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const commonStyles: React.CSSProperties = {
    position: 'absolute',
    left: `${element.x}%`,
    top: `${element.y}%`,
    width: `${element.width}%`,
    height: `${element.height}%`,
    cursor: isDragging ? 'grabbing' : 'grab',
    transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    zIndex: isSelected ? 50 : 10,
    outline: isSelected ? '4px solid #3b82f6' : 'none',
    boxShadow: isSelected ? '0 30px 60px -10px rgba(59, 130, 246, 0.4)' : 'none'
  };

  if (element.type === 'headline') {
    return (
      <div 
        ref={elementRef}
        onMouseDown={handleMouseDown}
        style={{ ...commonStyles, fontFamily: brandKit.headingFont }}
        className="text-6xl font-bold leading-[0.95] select-none uppercase tracking-tighter"
      >
        {element.content}
      </div>
    );
  }

  if (element.type === 'text') {
    return (
      <div 
        ref={elementRef}
        onMouseDown={handleMouseDown}
        style={{ ...commonStyles, fontSize: '1.1rem', lineHeight: '1.6' }}
        className="text-slate-900 overflow-hidden select-none font-medium opacity-90"
      >
        {element.content}
      </div>
    );
  }

  if (element.type === 'image') {
    return (
      <div 
        ref={elementRef}
        onMouseDown={handleMouseDown}
        style={commonStyles}
        className="overflow-hidden group rounded-sm"
      >
        <img src={element.content} className="w-full h-full object-cover pointer-events-none transition-transform duration-[5s] group-hover:scale-110" />
      </div>
    );
  }

  if (element.type === 'hotspot') {
    return (
      <div 
        ref={elementRef}
        onMouseDown={handleMouseDown}
        style={commonStyles}
        className="bg-blue-600/5 border-2 border-dashed border-blue-600/30 flex items-center justify-center transition-all hover:bg-blue-600/10 backdrop-blur-[2px] rounded-2xl"
      >
        <div className="bg-blue-600 text-white p-3 rounded-full shadow-2xl flex items-center gap-3">
            {ICONS.Hotspot}
            <span className="text-[9px] font-black pr-2 uppercase tracking-[0.2em]">{element.content}</span>
        </div>
      </div>
    );
  }

  return null;
};

const ToolbarButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center w-24 h-20 rounded-[1.5rem] hover:bg-slate-50 transition-all gap-1 group relative overflow-hidden"
  >
    <div className="text-slate-400 group-hover:text-blue-600 transition-all duration-300 transform group-hover:-translate-y-1">
        {icon}
    </div>
    <span className="text-[9px] font-black text-slate-400 group-hover:text-slate-900 uppercase tracking-widest transition-colors">
        {label}
    </span>
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0" />
  </button>
);

export default Editor;
