import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Upload, Download, Eye, Loader2, Sparkles, 
  FileText, ArrowDownToLine, RefreshCw, Layers,
  Move, Maximize2, RotateCw, Sliders
} from 'lucide-react';
import { ActiveTab, ConvertedImage, LogoConfig } from '../types';

import * as pdfjsLib from 'pdfjs-dist';

// Assign custom worker from CDN matches exact installed package version for bulletproof bundling
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PdfToPhotoProps {
  onBack: () => void;
  isBrandingEnabled: boolean;
}

export default function PdfToPhoto({ onBack, isBrandingEnabled }: PdfToPhotoProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [pages, setPages] = useState<ConvertedImage[]>([]);
  const [pdfMeta, setPdfMeta] = useState<{ name: string; size: string; totalPages: number } | null>(null);

  // Branding States
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [logoConfig, setLogoConfig] = useState<LogoConfig>({
    src: null,
    name: null,
    x: 40,
    y: 75,
    scale: 0.6,
    rotation: 0,
    opacity: 0.85,
    width: 100,
    height: 100
  });

  const [isDragLogo, setIsDragLogo] = useState(false);
  const [dragOffsetLogo, setDragOffsetLogo] = useState({ x: 0, y: 0 });
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const previewImgRef = useRef<HTMLImageElement>(null);
  const customLogoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selectedLogo = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setLogoSrc(src);
        setLogoConfig(prev => ({
          ...prev,
          src,
          name: selectedLogo.name,
          width: img.naturalWidth > 200 ? 100 : img.naturalWidth,
          height: img.naturalHeight > 200 ? (100 * img.naturalHeight / img.naturalWidth) : img.naturalHeight
        }));
      };
      img.src = src;
    };
    reader.readAsDataURL(selectedLogo);
  };

  const handlePointerDownLogo = (e: React.PointerEvent) => {
    e.preventDefault();
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    setDragOffsetLogo({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragLogo(true);
  };

  const handlePointerMoveLogo = (e: React.PointerEvent) => {
    if (!isDragLogo || !previewContainerRef.current || !previewImgRef.current) return;
    const containerRect = previewContainerRef.current.getBoundingClientRect();
    const imageRect = previewImgRef.current.getBoundingClientRect();
    const rawX = e.clientX - containerRect.left - dragOffsetLogo.x;
    const rawY = e.clientY - containerRect.top - dragOffsetLogo.y;
    const pctX = Math.max(0, Math.min(100, (rawX / imageRect.width) * 100));
    const pctY = Math.max(0, Math.min(100, (rawY / imageRect.height) * 100));
    setLogoConfig(prev => ({ ...prev, x: pctX, y: pctY }));
  };

  const handlePointerUpLogo = () => {
    setIsDragLogo(false);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Selector
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    processPdfFile(e.target.files[0]);
  };


  const processPdfFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);
    setPages([]);
    setProgress(5);
    setProcessingStatus('Reading PDF headers...');

    try {
      // Calculate human-readable size
      const sizeKb = selectedFile.size / 1024;
      const sizeStr = sizeKb > 1024 
        ? `${(sizeKb / 1024).toFixed(1)} MB` 
        : `${sizeKb.toFixed(0)} KB`;

      // Read PDF file as an ArrayBuffer
      const fileReader = new FileReader();
      const arrayBufferPromise = new Promise<ArrayBuffer>((resolve, reject) => {
        fileReader.onload = () => resolve(fileReader.result as ArrayBuffer);
        fileReader.onerror = reject;
      });
      fileReader.readAsArrayBuffer(selectedFile);
      const arrayBuffer = await arrayBufferPromise;

      setProcessingStatus('Initializing extraction engine...');
      setProgress(15);
      await new Promise(r => setTimeout(r, 200));

      // Loaded document
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      setPdfMeta({
        name: selectedFile.name,
        size: sizeStr,
        totalPages: numPages
      });

      const parsedPages: ConvertedImage[] = [];

      // Render loop
      for (let pNum = 1; pNum <= numPages; pNum++) {
        setProcessingStatus(`Rendering page ${pNum} of ${numPages}...`);
        
        const individualProgress = Math.floor(15 + (80 * (pNum / numPages)));
        setProgress(individualProgress);

        const page = await pdf.getPage(pNum);

        // Render at high-quality scale (2.5x) for ultimate sharpness
        const scale = 2.5; 
        const viewport = page.getViewport({ scale });

        // Offscreen Canvas
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const context = canvas.getContext('2d');
        if (!context) throw new Error('Failed to create 2D rendering framework context.');

        // White background safety for typical transparent pages to render text correctly
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Rendering framework promise
        const renderTask = page.render({
          canvasContext: context,
          viewport: viewport
        } as any);
        await renderTask.promise;

        const dataUrl = canvas.toDataURL('image/png'); // PNG high fidelity
        
        parsedPages.push({
          pageNumber: pNum,
          src: dataUrl,
          width: canvas.width,
          height: canvas.height
        });

        // Progressive view updates: Let pages pop up in real-time!
        setPages([...parsedPages]);
        await new Promise(r => setTimeout(r, 50));
      }

      setProgress(100);
      setProcessingStatus('Completed rendering successfully!');
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      console.error('PDF parsing error:', err);
      alert('An error occurred during PDF conversion. Please choose a valid non-encrypted PDF file.');
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download logic & compositing
  const getComposedPageSrc = async (photo: ConvertedImage): Promise<string> => {
    if (!isBrandingEnabled || !logoSrc) return photo.src;

    return new Promise((resolve) => {
      const baseImg = new Image();
      baseImg.onload = () => {
        const logoImg = new Image();
        logoImg.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = photo.width;
          canvas.height = photo.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(baseImg, 0, 0, photo.width, photo.height);

            ctx.save();
            ctx.globalAlpha = logoConfig.opacity;
            const targetX = (logoConfig.x / 100) * photo.width;
            const targetY = (logoConfig.y / 100) * photo.height;

            // Proportional layout matching UI workspace preview container width
            const workspaceWidth = 260; 
            const scaleFactor = photo.width / workspaceWidth;

            const printLogoW = logoConfig.width * logoConfig.scale * scaleFactor;
            const printLogoH = logoConfig.height * logoConfig.scale * scaleFactor;

            ctx.translate(targetX + printLogoW/2, targetY + printLogoH/2);
            ctx.rotate((logoConfig.rotation * Math.PI) / 180);
            ctx.drawImage(logoImg, -printLogoW/2, -printLogoH/2, printLogoW, printLogoH);
            ctx.restore();

            resolve(canvas.toDataURL('image/png'));
          } else {
            resolve(photo.src);
          }
        };
        logoImg.src = logoSrc;
      };
      baseImg.src = photo.src;
    });
  };

  const downloadPage = async (photo: ConvertedImage) => {
    const finalSrc = await getComposedPageSrc(photo);
    const link = document.createElement('a');
    link.href = finalSrc;
    // Strip pdf from filename if exists
    const prefix = pdfMeta?.name.replace(/\.[^/.]+$/, "") || 'extracted_page';
    link.download = `${prefix}_Page_${photo.pageNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    // Triggers all pages to download sequentially with soft delays
    pages.forEach((page, i) => {
      setTimeout(() => {
        downloadPage(page);
      }, i * 400);
    });
  };

  return (
    <div className="flex-1 flex flex-col p-5 text-white" id="pdf_to_photo_view">
      {/* Dynamic Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white"
          id="back_btn_pdf_to_photo"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-display font-bold text-lg leading-tight">PDF to Photo</h2>
          <p className="font-sans text-[11px] text-slate-400">Extract high-fidelity pages into images</p>
        </div>
      </div>

      {isProcessing ? (
        // Progress Engine Loop
        <div className="flex-1 flex flex-col items-center justify-center py-12">
          <div className="relative mb-6">
            <Loader2 className="w-12 h-12 text-sky-400 animate-spin" />
            <div className="absolute inset-0 bg-sky-400/20 rounded-full blur-xl" />
          </div>
          <p className="font-display font-semibold text-lg text-slate-100">Extracting PDF Assets...</p>
          <p className="font-sans text-xs text-indigo-300 mt-1">{processingStatus}</p>

          <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-4 border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 font-medium mt-2">Running client-side rendering with PDF.js ({progress}%)</span>
        </div>
      ) : pages.length > 0 ? (
        // Pages Render Grid & Action Board
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex-1 overflow-y-auto pr-0.5 space-y-4">
            
            {/* Meta header ribbon */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex justify-between items-center text-xs">
              <div className="truncate pr-4">
                <p className="font-sans font-bold text-slate-200 truncate">{pdfMeta?.name}</p>
                <p className="font-sans text-[10px] text-slate-400 mt-0.5">{pdfMeta?.size} • {pdfMeta?.totalPages} pages</p>
              </div>
              <button
                onClick={() => {
                  setPages([]);
                  setFile(null);
                  setPdfMeta(null);
                }}
                className="flex items-center gap-1.5 text-xs text-sky-400 font-bold bg-sky-400/10 px-3 py-1.5 border border-sky-400/20 rounded-lg hover:bg-sky-400/20 transition-all shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* WATERMARK SYSTEM WORKSPACE */}
            {isBrandingEnabled && (
              <div className="bg-gradient-to-br from-slate-900 via-slate-905 to-slate-900 border border-emerald-500/20 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="font-display font-bold text-xs text-slate-200">লোগো ওয়াটারমার্ক সংযুক্ত করুন (Branding)</span>
                  </div>
                  <span className="text-[9px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded uppercase font-mono">Active</span>
                </div>

                {!logoSrc ? (
                  <div>
                    <div 
                      onClick={() => customLogoInputRef.current?.click()}
                      className="border border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl p-6 text-center cursor-pointer bg-white/[0.01] hover:bg-white/[0.03] transition-all flex flex-col items-center justify-center group"
                    >
                      <input 
                        type="file" 
                        ref={customLogoInputRef} 
                        onChange={handleLogoChange}
                        accept="image/*" 
                        className="hidden" 
                      />
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-105 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="font-display font-medium text-xs text-slate-300">একটি PNG ব্রান্ড লোগো সিলেক্ট করুন</span>
                      <p className="font-sans text-[10px] text-slate-500 mt-1">সবগুলো পৃষ্ঠায় ওয়াটারমার্ক হিসেবে লোগো বসে যাবে</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Selected Logo Header bar */}
                    <div className="flex justify-between items-center text-xs bg-white/5 p-2 rounded-lg border border-white/5">
                      <span className="text-slate-300 font-medium truncate max-w-[150px]">
                        📁 {logoConfig.name}
                      </span>
                      <button 
                        onClick={() => { setLogoSrc(null); setLogoConfig(prev => ({ ...prev, src: null, name: null })); }}
                        className="text-[10px] text-red-400 hover:text-red-300 font-bold px-2 py-1 rounded hover:bg-red-500/10"
                      >
                        লোগো সরান
                      </button>
                    </div>

                    {/* Drag and Drop preview on extracted Page 1 image */}
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block mb-2 uppercase">Preview & Drag placement:</span>
                      
                      <div className="flex items-center justify-center min-h-[180px] bg-slate-950/40 rounded-xl border border-white/5 p-2 relative overflow-hidden">
                        <div 
                          ref={previewContainerRef}
                          onPointerMove={handlePointerMoveLogo}
                          onPointerUp={handlePointerUpLogo}
                          onPointerLeave={handlePointerUpLogo}
                          className="relative select-none touch-none max-h-full max-w-full"
                        >
                          {/* Page 1 extracted preview */}
                          <img 
                            ref={previewImgRef}
                            src={pages[0].src} 
                            alt="first page extracted preview" 
                            className="max-h-[160px] w-auto object-contain rounded-lg border border-white/5 pointer-events-none select-none"
                          />

                          {/* Moveable Logo Stamp */}
                          <div
                            onPointerDown={handlePointerDownLogo}
                            className={`absolute cursor-pointer select-none active:scale-[1.01] transition-shadow ${
                              isDragLogo ? 'ring-2 ring-emerald-400 shadow-2xl' : 'hover:ring-1 hover:ring-white/40'
                            }`}
                            style={{
                              left: `${logoConfig.x}%`,
                              top: `${logoConfig.y}%`,
                              transform: `rotate(${logoConfig.rotation}deg)`,
                              opacity: logoConfig.opacity,
                              width: `${logoConfig.width * logoConfig.scale}px`,
                              height: `${logoConfig.height * logoConfig.scale}px`,
                              touchAction: 'none'
                            }}
                          >
                            <img 
                              src={logoSrc} 
                              alt="logo stamp" 
                              className="w-full h-full object-contain pointer-events-none"
                            />
                            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-emerald-500 shadow flex items-center justify-center pointer-events-none">
                              <Move className="w-1.5 h-1.5 text-slate-950" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Slider controls spacing */}
                    <div className="bg-white/5 border border-white/5 rounded-xl p-3 space-y-3">
                      
                      {/* Size Scaling */}
                      <div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-1">
                          <span className="flex items-center gap-1 uppercase">
                            <Maximize2 className="w-3 h-3 text-emerald-400" /> Size Scale
                          </span>
                          <span>{Math.round(logoConfig.scale * 100)}%</span>
                        </div>
                        <input 
                          type="range"
                          min="0.1"
                          max="2.0"
                          step="0.05"
                          value={logoConfig.scale}
                          onChange={(e) => setLogoConfig(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                        />
                      </div>

                      {/* Rotation Angle */}
                      <div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-1">
                          <span className="flex items-center gap-1 uppercase">
                            <RotateCw className="w-3 h-3 text-emerald-400" /> Rotation Angle
                          </span>
                          <span>{logoConfig.rotation}°</span>
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max="360"
                          step="2"
                          value={logoConfig.rotation}
                          onChange={(e) => setLogoConfig(prev => ({ ...prev, rotation: parseInt(e.target.value) }))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                        />
                      </div>

                      {/* Transparency */}
                      <div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-1">
                          <span className="flex items-center gap-1 uppercase">
                            <Sliders className="w-3 h-3 text-emerald-400" /> Transparency
                          </span>
                          <span>{Math.round(logoConfig.opacity * 100)}%</span>
                        </div>
                        <input 
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.05"
                          value={logoConfig.opacity}
                          onChange={(e) => setLogoConfig(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                        />
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Grid display scrollbox */}
            <div className="grid grid-cols-2 gap-3" id="pages_preview_grid">
              {pages.map((img) => (
                <div 
                  key={img.pageNumber} 
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-2 flex flex-col justify-between group overflow-hidden"
                >
                  <div className="relative aspect-[3/4] bg-slate-900 rounded-lg overflow-hidden border border-white/5">
                    <img 
                      src={img.src} 
                      alt={`page-${img.pageNumber}`} 
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-1.5 left-1.5 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-sky-400">
                      Page {img.pageNumber}
                    </div>
                  </div>

                  <div className="mt-2.5">
                    <button
                      onClick={() => downloadPage(img)}
                      className="w-full py-2 bg-white/5 hover:bg-sky-500 hover:text-white border border-white/10 hover:border-sky-500 rounded-lg flex items-center justify-center gap-1.5 text-xs text-slate-300 font-bold transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Save page</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Action Footer Bar */}
          <div className="mt-4 pt-2">
            <button
              onClick={handleDownloadAll}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 font-display font-bold text-sm text-white hover:shadow-[0_4px_25px_rgba(56,189,248,0.3)] hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
              id="download_all_pages_btn"
            >
              <ArrowDownToLine className="w-5 h-5" />
              <span>Save All Pages (HQ PNG)</span>
            </button>
          </div>
        </div>
      ) : (
        // Initial Uploader view
        <div className="flex-1 flex flex-col justify-center py-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-sky-400/50 rounded-2xl p-8 py-16 text-center cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col items-center justify-center group"
            id="pdf_file_uploader_zone"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept="application/pdf" 
              className="hidden" 
            />
            
            <div className="w-16 h-16 rounded-xl bg-sky-400/10 border border-sky-400/20 flex items-center justify-center text-sky-400 mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8" />
            </div>
            
            <h3 className="font-display font-bold text-base text-slate-100">Click to import PDF</h3>
            <p className="font-sans text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
              Accepts any PDF files. Converts each page element cleanly to a crystal-clear image file.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
