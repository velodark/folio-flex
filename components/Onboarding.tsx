
import React, { useState, useRef } from 'react';
import { Magazine, Page, BrandKit, MagazineElement } from '../types';
import { ICONS, STYLE_PRESETS, INITIAL_BRAND_KIT } from '../constants';
import { analyzeContentForLayout, processPdfPageWithAI, detectPdfLayout } from '../services/geminiService';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.mjs`;

interface OnboardingProps {
  onComplete: (newMagazine: Magazine) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [sourceType, setSourceType] = useState<'fresh' | 'pdf' | null>(null);
  const [title, setTitle] = useState('New Publication');
  const [style, setStyle] = useState('editorial');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [aiStatus, setAiStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      if (title === 'New Publication') {
        setTitle(file.name.replace('.pdf', ''));
      }
    }
  };

  const cropCanvasToBase64 = (original: HTMLCanvasElement, sx: number, sy: number, sw: number, sh: number) => {
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = sw;
    cropCanvas.height = sh;
    const ctx = cropCanvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(original, sx, sy, sw, sh, 0, 0, sw, sh);
    }
    return cropCanvas.toDataURL('image/png', 0.95);
  };

  const processPdf = async (file: File): Promise<{ pages: Page[], aspectRatio: number }> => {
    setAiStatus('Opening document for processing...');
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages: Page[] = [];
    
    // Determine the base aspect ratio from the first page
    const firstPdfPage = await pdf.getPage(1);
    const firstViewport = firstPdfPage.getViewport({ scale: 1.0 });
    const isFirstPageSpread = firstViewport.width > firstViewport.height * 1.1;
    let masterAspectRatio = isFirstPageSpread ? (firstViewport.width / 2) / firstViewport.height : firstViewport.width / firstViewport.height;

    const pageCount = Math.min(pdf.numPages, 100); // Increased limit
    
    for (let i = 1; i <= pageCount; i++) {
      try {
        setAiStatus(`Converting Page ${i} of ${pageCount}...`);
        const pdfPage = await pdf.getPage(i);
        const viewport = pdfPage.getViewport({ scale: 2.0 }); // Sufficient resolution for splitting
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await pdfPage.render({ canvasContext: context, viewport }).promise;

        // Spread Detection per page
        const pageIsSpread = canvas.width > canvas.height * 1.1;

        if (pageIsSpread) {
          const halfWidth = canvas.width / 2;
          
          // Left Page
          const leftBase64 = cropCanvasToBase64(canvas, 0, 0, halfWidth, canvas.height);
          pages.push({ 
            id: `pdf-pg-${i}-L`, 
            background: leftBase64, 
            elements: [] // AI processing deferred to editor to keep ingestion fast
          });

          // Right Page
          const rightBase64 = cropCanvasToBase64(canvas, halfWidth, 0, halfWidth, canvas.height);
          pages.push({ 
            id: `pdf-pg-${i}-R`, 
            background: rightBase64, 
            elements: [] 
          });
        } else {
          const base64Image = canvas.toDataURL('image/png', 0.95);
          pages.push({ 
            id: `pdf-pg-${i}`, 
            background: base64Image, 
            elements: [] 
          });
        }
      } catch (err) {
        console.warn(`Error processing page ${i}:`, err);
        // Continue to next page rather than failing entire doc
      }
    }
    
    return { pages, aspectRatio: masterAspectRatio };
  };

  const handleStart = async () => {
    setIsGenerating(true);
    let initialPages: Page[] = [];
    let aspectRatio = 8.5 / 11;

    try {
      if (sourceType === 'pdf' && pdfFile) {
        const result = await processPdf(pdfFile);
        initialPages = result.pages;
        aspectRatio = result.aspectRatio;
      } else if (content) {
        setAiStatus('AI Designer is conceptualizing layouts...');
        const aiPages = await analyzeContentForLayout(content, [], style, INITIAL_BRAND_KIT);
        if (aiPages.length > 0) initialPages = aiPages;
      }

      if (initialPages.length === 0) {
        initialPages = [
          { id: 'page-1', elements: [
            { id: 'el-1', type: 'headline', content: title || 'FOLIO', x: 10, y: 15, width: 80, height: 10 },
            { id: 'el-2', type: 'text', content: 'Transforming ideas into interactive experiences.', x: 10, y: 25, width: 50, height: 10 },
            { id: 'el-3', type: 'image', content: 'https://images.unsplash.com/photo-1541462608141-ad60397d4573?auto=format&fit=crop&q=80', x: 0, y: 40, width: 100, height: 60 }
          ] }
        ];
      }

      onComplete({
        id: `mag-${Date.now()}`,
        title: title || 'New Publication',
        pages: initialPages,
        brandKit: INITIAL_BRAND_KIT,
        style: style as any,
        aspectRatio: aspectRatio
      });
    } catch (error) {
      console.error("Folio Critical Error:", error);
      setAiStatus('Generation encountered an issue. Reverting to safe mode...');
    } finally {
      setIsGenerating(false);
      setAiStatus('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 selection:bg-blue-600 selection:text-white font-sans">
      <div className="max-w-5xl w-full bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row min-h-[680px] border border-white">
        
        {/* Visual Brand Panel */}
        <div className="md:w-5/12 bg-slate-950 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -mr-48 -mt-48 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -ml-48 -mb-48"></div>
          
          <div className="z-10">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center mb-10 shadow-2xl shadow-blue-500/20">
              <span className="text-3xl font-black tracking-tighter">F</span>
            </div>
            <h1 className="text-5xl font-instrument italic leading-[1.05] mb-8 text-white/95">Publish without boundaries.</h1>
            <p className="text-slate-400 font-light leading-relaxed text-lg max-w-xs">Elevate your stories with AI-driven interactive design.</p>
          </div>

          <div className="z-10 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-inner">
             <div className="flex items-center gap-3 mb-4">
                <div className={`w-2.5 h-2.5 rounded-full ${isGenerating ? 'bg-blue-400 animate-ping' : 'bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.6)]'}`}></div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
                  {isGenerating ? 'AI Engine Running' : 'Folio Designer Active'}
                </span>
             </div>
             {aiStatus ? (
               <p className="text-xs text-blue-300 font-medium leading-relaxed animate-pulse font-mono">{aiStatus}</p>
             ) : (
               <div className="flex flex-col gap-3">
                  <div className="h-1 w-full bg-white/10 rounded-full"></div>
                  <div className="h-1 w-2/3 bg-white/10 rounded-full"></div>
               </div>
             )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="md:w-7/12 p-16 flex flex-col bg-white">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-12 duration-700 flex flex-col h-full">
              <h2 className="text-4xl font-bold mb-4 tracking-tight text-slate-900">Get Started.</h2>
              <p className="text-slate-500 mb-12 text-lg">Select your preferred creative workflow.</p>
              
              <div className="grid gap-6 flex-1">
                <button 
                  onClick={() => { setSourceType('fresh'); setStep(2); }}
                  className="group flex items-center gap-8 p-8 border-2 border-slate-50 rounded-[2.5rem] hover:border-blue-500 hover:bg-blue-50/20 transition-all text-left shadow-sm hover:shadow-2xl"
                >
                  <div className="w-16 h-16 bg-slate-100 rounded-[1.5rem] flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner transform group-hover:-rotate-6">
                    {ICONS.Zap}
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl mb-1 text-slate-800">Fresh Canvas</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">Design beautiful layouts from raw content using AI.</p>
                  </div>
                </button>

                <button 
                  onClick={() => { setSourceType('pdf'); setStep(2); }}
                  className="group flex items-center gap-8 p-8 border-2 border-slate-50 rounded-[2.5rem] hover:border-blue-500 hover:bg-blue-50/20 transition-all text-left shadow-sm hover:shadow-2xl"
                >
                  <div className="w-16 h-16 bg-slate-100 rounded-[1.5rem] flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner transform group-hover:rotate-6">
                    {ICONS.Monitor}
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl mb-1 text-slate-800">Interactive PDF</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">Enhance your existing PDF spreads with interactivity.</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-12 duration-700 h-full flex flex-col">
               <button onClick={() => setStep(1)} className="text-[11px] font-black text-slate-400 hover:text-blue-600 flex items-center gap-2 mb-12 tracking-[0.25em] transition-colors uppercase">
                {ICONS.Prev} Back
              </button>
              
              <h2 className="text-4xl font-bold mb-4 tracking-tight text-slate-900">Configuration.</h2>
              <p className="text-slate-500 mb-12 text-lg">Define the look and feel of your project.</p>

              <div className="space-y-12 flex-1">
                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block group-focus-within:text-blue-600 transition-colors">Publication Title</label>
                  <input 
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g. Summer Issue 2025"
                    className="w-full text-4xl font-light border-b-2 border-slate-100 py-4 outline-none focus:border-blue-600 transition-all placeholder:text-slate-200"
                  />
                </div>

                {sourceType === 'pdf' ? (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Source File</label>
                    <div 
                      onClick={() => !isGenerating && fileInputRef.current?.click()}
                      className={`group border-2 border-dashed border-slate-100 rounded-[3rem] p-12 flex flex-col items-center justify-center gap-6 hover:border-blue-500 hover:bg-blue-50/30 transition-all ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-sm hover:shadow-xl'}`}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handlePdfUpload} 
                        accept="application/pdf" 
                        className="hidden" 
                      />
                      <div className="w-20 h-20 bg-slate-50 text-slate-300 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-12 rounded-[2rem] flex items-center justify-center transition-all shadow-inner">
                        {ICONS.Download}
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-slate-900 text-xl">{pdfFile ? pdfFile.name : 'Select PDF Spread'}</p>
                        <p className="text-xs text-slate-400 mt-2">{pdfFile ? `${(pdfFile.size / (1024 * 1024)).toFixed(1)} MB` : '17"x11" or 8.5"x11" pages recommended'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 block">Visual Style</label>
                    <div className="grid grid-cols-2 gap-4">
                      {STYLE_PRESETS.map(s => (
                        <button 
                         key={s.id}
                         onClick={() => setStyle(s.id)}
                         className={`p-6 rounded-[2rem] border-2 text-left transition-all ${style === s.id ? 'border-blue-600 bg-blue-50/50 shadow-lg scale-105 z-10' : 'border-slate-50 hover:border-slate-200'}`}
                        >
                          <h4 className="font-bold text-base mb-1 text-slate-800">{s.name}</h4>
                          <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-wider font-medium">{s.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={handleStart}
                disabled={isGenerating || (sourceType === 'pdf' && !pdfFile)}
                className="w-full py-6 bg-slate-950 text-white rounded-[2.5rem] font-bold text-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] disabled:opacity-30 mt-12 group overflow-hidden relative"
              >
                {isGenerating ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                    Assembling Assets...
                  </>
                ) : (
                  <>Start Designing <span className="group-hover:translate-x-2 transition-transform duration-300">{ICONS.ArrowRight}</span></>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
