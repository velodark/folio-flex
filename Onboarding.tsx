
import React, { useState, useRef } from 'react';
import { Magazine, Page, BrandKit, MagazineElement } from '../types';
import { ICONS, STYLE_PRESETS, INITIAL_BRAND_KIT } from '../constants';
import { analyzeContentForLayout, processPdfPageWithAI } from '../services/geminiService';
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

  const processPdf = async (file: File): Promise<{ pages: Page[], aspectRatio: number }> => {
    setAiStatus('Opening document for processing...');
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages: Page[] = [];
    
    // Determine the aspect ratio from the first page
    const firstPdfPage = await pdf.getPage(1);
    const firstViewport = firstPdfPage.getViewport({ scale: 1.0 });
    const masterAspectRatio = firstViewport.width / firstViewport.height;

    const pageCount = Math.min(pdf.numPages, 100);
    
    for (let i = 1; i <= pageCount; i++) {
      try {
        setAiStatus(`Importing Spread ${i} of ${pageCount}...`);
        const pdfPage = await pdf.getPage(i);
        const viewport = pdfPage.getViewport({ scale: 2.0 }); 
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await pdfPage.render({ canvasContext: context, viewport }).promise;

        // High resolution capture
        const base64Image = canvas.toDataURL('image/png', 0.98);
        pages.push({ 
          id: `pdf-pg-${i}`, 
          background: base64Image, 
          elements: [] 
        });
      } catch (err) {
        console.warn(`Error processing page ${i}:`, err);
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
      setAiStatus('Generation encountered an issue. Reverting...');
    } finally {
      setIsGenerating(false);
      setAiStatus('');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6 selection:bg-blue-600 selection:text-white font-sans">
      <div className="max-w-5xl w-full bg-white rounded-[4rem] shadow-[0_50px_150px_-30px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col md:flex-row min-h-[720px] border border-white">
        
        {/* Creative Panel */}
        <div className="md:w-5/12 bg-slate-950 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -ml-64 -mb-64"></div>
          
          <div className="z-10">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-[2.5rem] flex items-center justify-center mb-12 shadow-2xl shadow-blue-500/20 transform rotate-6 hover:rotate-0 transition-transform duration-700">
              <span className="text-4xl font-black tracking-tighter">F</span>
            </div>
            <h1 className="text-6xl font-instrument italic leading-[1] mb-10 text-white/95 text-balance">The 17x11 Interactive Platform.</h1>
            <p className="text-slate-400 font-light leading-relaxed text-xl max-w-xs">Upload your spreads directly or let AI craft high-fidelity editorial layouts from scratch.</p>
          </div>

          <div className="z-10 bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[3rem] shadow-inner">
             <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${isGenerating ? 'bg-blue-400 animate-ping' : 'bg-green-400 shadow-[0_0_20px_rgba(74,222,128,0.7)]'}`}></div>
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">
                  {isGenerating ? 'AI Engine Processing' : 'Folio Creative Ready'}
                </span>
             </div>
             {aiStatus ? (
               <p className="text-sm text-blue-300 font-medium leading-relaxed animate-pulse font-mono tracking-tight">{aiStatus}</p>
             ) : (
               <div className="flex flex-col gap-3 opacity-10">
                  <div className="h-1.5 w-full bg-white/20 rounded-full"></div>
                  <div className="h-1.5 w-2/3 bg-white/20 rounded-full"></div>
               </div>
             )}
          </div>
        </div>

        {/* Setup Panel */}
        <div className="md:w-7/12 p-20 flex flex-col bg-white">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-20 duration-1000 flex flex-col h-full">
              <h2 className="text-5xl font-bold mb-6 tracking-tight text-slate-900">Get Started.</h2>
              <p className="text-slate-500 mb-16 text-xl">Select your production workflow to begin.</p>
              
              <div className="grid gap-8 flex-1">
                <button 
                  onClick={() => { setSourceType('fresh'); setStep(2); }}
                  className="group flex items-center gap-10 p-10 border-2 border-slate-50 rounded-[3rem] hover:border-blue-500 hover:bg-blue-50/20 transition-all text-left shadow-sm hover:shadow-2xl"
                >
                  <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner transform group-hover:-rotate-12 duration-500">
                    {ICONS.Zap}
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl mb-2 text-slate-800">Fresh Design</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">Let AI build 8.5x11 layouts from your raw text and assets.</p>
                  </div>
                </button>

                <button 
                  onClick={() => { setSourceType('pdf'); setStep(2); }}
                  className="group flex items-center gap-10 p-10 border-2 border-slate-50 rounded-[3rem] hover:border-blue-500 hover:bg-blue-50/20 transition-all text-left shadow-sm hover:shadow-2xl"
                >
                  <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner transform group-hover:rotate-12 duration-500">
                    {ICONS.Monitor}
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl mb-2 text-slate-800">Direct Spread</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">Import your 17x11 PDF spreads with pixel-perfect scaling.</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-20 duration-1000 h-full flex flex-col">
               <button onClick={() => setStep(1)} className="text-[12px] font-black text-slate-400 hover:text-blue-600 flex items-center gap-3 mb-16 tracking-[0.3em] transition-colors uppercase">
                {ICONS.Prev} Back
              </button>
              
              <h2 className="text-5xl font-bold mb-6 tracking-tight text-slate-900">Project Config.</h2>
              <p className="text-slate-500 mb-16 text-xl">Define the foundation of your interactive publication.</p>

              <div className="space-y-16 flex-1">
                <div className="group">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 block group-focus-within:text-blue-600 transition-colors">Publication Title</label>
                  <input 
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g. Fall Winter 2025"
                    className="w-full text-5xl font-light border-b-2 border-slate-100 py-6 outline-none focus:border-blue-600 transition-all placeholder:text-slate-200"
                  />
                </div>

                {sourceType === 'pdf' ? (
                  <div className="space-y-6">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 block">Spread Document</label>
                    <div 
                      onClick={() => !isGenerating && fileInputRef.current?.click()}
                      className={`group border-2 border-dashed border-slate-100 rounded-[3.5rem] p-16 flex flex-col items-center justify-center gap-8 hover:border-blue-500 hover:bg-blue-50/40 transition-all ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-sm hover:shadow-2xl'}`}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handlePdfUpload} 
                        accept="application/pdf" 
                        className="hidden" 
                      />
                      <div className="w-24 h-24 bg-slate-50 text-slate-300 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 rounded-[2.5rem] flex items-center justify-center transition-all shadow-inner transform group-hover:rotate-12 duration-500">
                        {ICONS.Download}
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-slate-900 text-2xl">{pdfFile ? pdfFile.name : 'Choose Spread File'}</p>
                        <p className="text-xs text-slate-400 mt-3 uppercase tracking-widest font-bold">PDF • Up to 100 Pages • Auto-Scaled</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10 block">Editorial Style</label>
                    <div className="grid grid-cols-2 gap-6">
                      {STYLE_PRESETS.map(s => (
                        <button 
                         key={s.id}
                         onClick={() => setStyle(s.id)}
                         className={`p-8 rounded-[2.5rem] border-2 text-left transition-all ${style === s.id ? 'border-blue-600 bg-blue-50/50 shadow-xl scale-105 z-10' : 'border-slate-50 hover:border-slate-200'}`}
                        >
                          <h4 className="font-bold text-xl mb-2 text-slate-800">{s.name}</h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed uppercase tracking-widest font-bold">{s.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={handleStart}
                disabled={isGenerating || (sourceType === 'pdf' && !pdfFile)}
                className="w-full py-7 bg-slate-950 text-white rounded-[3rem] font-bold text-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-6 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] disabled:opacity-30 mt-16 group relative"
              >
                {isGenerating ? (
                  <>
                    <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    Assembling Spreads...
                  </>
                ) : (
                  <>Initialize Designer <span className="group-hover:translate-x-3 transition-transform duration-500">{ICONS.ArrowRight}</span></>
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
