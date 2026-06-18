import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Upload, RefreshCw, Eye, Download, Sparkles, 
  Sliders, Move, RotateCw, Maximize2, Layers, Check, ChevronLeft, ChevronRight, FileText,
  Loader2
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';
import { ActiveTab, LogoConfig } from '../types';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface AddLogoProps {
  onBack: () => void;
  isBrandingEnabled: boolean;
}

export default function AddLogo({ onBack, isBrandingEnabled }: AddLogoProps) {
  // Step indicators: 1: Select Base. 2: Select Logo. 3: Workspace
  const [editorStep, setEditorStep] = useState<1 | 2 | 3>(1);

  // PDF Exporting States
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfRenderingProgress, setPdfRenderingProgress] = useState(0);

  // Raw file details
  const [baseFileType, setBaseFileType] = useState<'image' | 'pdf' | null>(null);
  const [baseImageSrc, setBaseImageSrc] = useState<string | null>(null);
  const [baseImageDimensions, setBaseImageDimensions] = useState({ width: 0, height: 0 });
  const [logoImageSrc, setLogoImageSrc] = useState<string | null>(null);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);

  // PDF Page attributes if PDF is loaded as canvas
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pdfPageCount, setPdfPageCount] = useState(1);
  const [pdfActivePage, setPdfActivePage] = useState(1);

  // Logo Overlay Configurations
  const [logoConfig, setLogoConfig] = useState<LogoConfig>({
    src: null,
    name: null,
    x: 35, // percent coordinates 0-100
    y: 35,
    scale: 0.8,
    rotation: 0,
    opacity: 0.95,
    width: 120, // default dimensions
    height: 120
  });

  // UI state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [exportPreviewUrl, setExportPreviewUrl] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const baseImgRef = useRef<HTMLImageElement>(null);
  
  const baseFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Set steps manually or reset
  const handleFullReset = () => {
    setEditorStep(1);
    setBaseFileType(null);
    setBaseImageSrc(null);
    setLogoImageSrc(null);
    setExportPreviewUrl(null);
    setPdfDoc(null);
    setLogoConfig({
      src: null,
      name: null,
      x: 35,
      y: 35,
      scale: 0.8,
      rotation: 0,
      opacity: 0.95,
      width: 120,
      height: 120
    });
  };

  // 1. Process Base Document Selection
  const handleBaseFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    if (file.type.includes('pdf')) {
      processBasePdf(file);
    } else {
      processBaseImage(file);
    }
  };

  const processBaseImage = (file: File) => {
    setBaseFileType('image');
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setBaseImageSrc(src);
      
      // Get logical dimensions
      const img = new Image();
      img.onload = () => {
        setBaseImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        setEditorStep(3); // Go straight to interactive preview workspace
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const processBasePdf = async (file: File) => {
    setBaseFileType('pdf');
    setIsProcessingPdf(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      setPdfPageCount(pdf.numPages);
      setPdfActivePage(1);

      await renderPdfPageAsBase(pdf, 1);
      setEditorStep(3); // Go straight to interactive preview workspace
    } catch (err) {
      console.error('Base PDF error:', err);
      alert('Could not open PDF file.');
      setBaseFileType(null);
    } finally {
      setIsProcessingPdf(false);
    }
  };

  const renderPdfPageAsBase = async (pdfObj: pdfjsLib.PDFDocumentProxy, pageNumber: number) => {
    try {
      const page = await pdfObj.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 2.0 }); //HQ render base

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport } as any).promise;
        const src = canvas.toDataURL('image/png');
        setBaseImageSrc(src);
        setBaseImageDimensions({ width: canvas.width, height: canvas.height });
      }
    } catch (err) {
      console.error('Page render error:', err);
    }
  };

  // Helper trigger to switch base PDF page index
  const changePdfPage = async (direction: 'prev' | 'next') => {
    if (!pdfDoc) return;
    let newPageNum = pdfActivePage;
    if (direction === 'prev' && pdfActivePage > 1) newPageNum -= 1;
    if (direction === 'next' && pdfActivePage < pdfPageCount) newPageNum += 1;

    if (newPageNum !== pdfActivePage) {
      setPdfActivePage(newPageNum);
      setIsProcessingPdf(true);
      await renderPdfPageAsBase(pdfDoc, newPageNum);
      setIsProcessingPdf(false);
    }
  };

  // 2. Process Logo File Selection
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setLogoImageSrc(src);

      // Extract details
      const img = new Image();
      img.onload = () => {
        setLogoConfig(prev => ({
          ...prev,
          src,
          name: file.name,
          width: img.naturalWidth > 300 ? 120 : img.naturalWidth,
          height: img.naturalHeight > 300 ? (120 * img.naturalHeight / img.naturalWidth) : img.naturalHeight
        }));
        setEditorStep(3); // open Workspace
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // 3. Coordinate dragging handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    
    // Track localized click offset on the stamp
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current || !baseImgRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const imageRect = baseImgRef.current.getBoundingClientRect();
    
    // Calculate exactly relative to the image bounds for precise physical placement
    const rawX = e.clientX - imageRect.left - dragOffset.x;
    const rawY = e.clientY - imageRect.top - dragOffset.y;

    // Convert pixels to responsive percentage dimensions relative to base image viewport dimensions
    const pctX = Math.max(0, Math.min(100, (rawX / imageRect.width) * 100));
    const pctY = Math.max(0, Math.min(100, (rawY / imageRect.height) * 100));

    setLogoConfig(prev => ({
      ...prev,
      x: pctX,
      y: pctY
    }));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // 4. Multi-Layer High Quality Renderer
  const generateOverlaidImage = async () => {
    if (!baseImageSrc) return;
    if (!logoImageSrc) {
      alert('অনুগ্রহ করে প্রথমে একটি লোগো বা ফটো আপনার ফাইলে যুক্ত করুন!');
      return;
    }
    setIsExporting(true);

    try {
      // Create high-res elements
      const baseImg = await new Promise<HTMLImageElement>((resolve) => {
        const item = new Image();
        item.onload = () => resolve(item);
        item.src = baseImageSrc;
      });

      const logoImg = await new Promise<HTMLImageElement>((resolve) => {
        const item = new Image();
        item.onload = () => resolve(item);
        item.src = logoImageSrc;
      });

      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = baseImageDimensions.width;
      exportCanvas.height = baseImageDimensions.height;
      const ctx = exportCanvas.getContext('2d');

      if (!ctx) throw new Error('Could not request exportation ctx context.');

      // Stage 1: Base Element
      ctx.drawImage(baseImg, 0, 0, baseImageDimensions.width, baseImageDimensions.height);

      // Stage 2: Rotated scaled logo alignment
      ctx.save();
      ctx.globalAlpha = logoConfig.opacity;

      // Extract interactive layout sizes inside workspace viewport
      let workspaceImageWidth = baseImgRef.current?.clientWidth || 0;
      if (workspaceImageWidth <= 1) {
        workspaceImageWidth = baseImgRef.current?.naturalWidth || 600;
      }
      const workspaceImageHeight = baseImgRef.current?.clientHeight || 400;

      // Map percentage locations back onto original high resolution
      const targetX = (logoConfig.x / 100) * baseImageDimensions.width;
      const targetY = (logoConfig.y / 100) * baseImageDimensions.height;

      // Calculate upscale print factor ratios between real file and container
      const upscaleFactor = baseImageDimensions.width / workspaceImageWidth;

      const printWidth = logoConfig.width * logoConfig.scale * upscaleFactor;
      const printHeight = logoConfig.height * logoConfig.scale * upscaleFactor;

      // Translate context back to center point of stamp to handle rotation precisely
      ctx.translate(targetX + printWidth / 2, targetY + printHeight / 2);
      ctx.rotate((logoConfig.rotation * Math.PI) / 180);

      ctx.drawImage(
        logoImg,
        -printWidth / 2,
        -printHeight / 2,
        printWidth,
        printHeight
      );

      ctx.restore();

      const finalUrl = exportCanvas.toDataURL('image/png', 0.98);
      setExportPreviewUrl(finalUrl);
    } catch (err) {
      console.error('Export error:', err);
      alert('An error occurred during composite rendering.');
    } finally {
      setIsExporting(false);
    }
  };

  const downloadOverlaid = () => {
    if (!exportPreviewUrl) return;
    const a = document.createElement('a');
    a.href = exportPreviewUrl;
    a.download = `Watermarked_${Date.now().toString().substr(-6)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadOverlaidPdf = async () => {
    if (!pdfDoc) return;
    if (!logoImageSrc) {
      alert('অনুগ্রহ করে প্রথমে একটি লোগো বা ফটো আপনার ফাইলে যুক্ত করুন!');
      return;
    }
    setIsExportingPdf(true);
    setPdfRenderingProgress(5);

    try {
      let doc: any = null;

      const logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const item = new Image();
        item.onload = () => resolve(item);
        item.onerror = (e) => reject(e);
        item.src = logoImageSrc;
      });

      for (let pNum = 1; pNum <= pdfPageCount; pNum++) {
        setPdfRenderingProgress(Math.floor(5 + (90 * (pNum / pdfPageCount))));
        const page = await pdfDoc.getPage(pNum);
        
        // 1. Get original viewport at scale 1.0 (internal PDF points)
        const originalViewport = page.getViewport({ scale: 1.0 });
        const pdfPageWidth = originalViewport.width;
        const pdfPageHeight = originalViewport.height;

        // 2. Render with high resolution (scale 3.0 for crisp 300 DPI high-quality print)
        const renderScale = 3.0;
        const viewport = page.getViewport({ scale: renderScale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport } as any).promise;

          // 3. Align logo over current high-res PDF page canvas
          ctx.save();
          ctx.globalAlpha = logoConfig.opacity;

          // Find the workspace display scaling factor to align percentage position correctly
          let workspaceImageWidth = baseImgRef.current?.clientWidth || 0;
          if (workspaceImageWidth <= 1) {
            workspaceImageWidth = baseImgRef.current?.naturalWidth || 600;
          }
          const upscaleFactor = canvas.width / workspaceImageWidth;

          // Coordinates are in percentages (0-100)
          const targetX = (logoConfig.x / 100) * canvas.width;
          const targetY = (logoConfig.y / 100) * canvas.height;

          // Final logo print dimensions
          const printXW = logoConfig.width * logoConfig.scale * upscaleFactor;
          const printXH = logoConfig.height * logoConfig.scale * upscaleFactor;

          ctx.translate(targetX + printXW / 2, targetY + printXH / 2);
          ctx.rotate((logoConfig.rotation * Math.PI) / 180);
          ctx.drawImage(logoImg, -printXW / 2, -printXH / 2, printXW, printXH);
          ctx.restore();

          // 4. Compress to image data (use format image/png for lossless maximum quality)
          const dataUrl = canvas.toDataURL('image/png');

          // 5. Build/add page with exact original point dimensions (A4 standard is 595.28 x 841.89 points)
          const orientation = pdfPageWidth > pdfPageHeight ? 'l' : 'p';
          if (!doc) {
            doc = new jsPDF({
              orientation: orientation,
              unit: 'pt',
              format: [pdfPageWidth, pdfPageHeight]
            });
          } else {
            doc.addPage([pdfPageWidth, pdfPageHeight], orientation);
          }

          // Draw image to fill the exact original PDF page coordinates
          doc.addImage(dataUrl, 'PNG', 0, 0, pdfPageWidth, pdfPageHeight, undefined, 'FAST');
        }
      }

      setPdfRenderingProgress(100);
      await new Promise(r => setTimeout(r, 200));
      doc.save(`Branded_${Date.now().toString().slice(-6)}.pdf`);
    } catch (e) {
      console.error('PDF compiling with watermark failed:', e);
      alert('PDF তৈরি করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setIsExportingPdf(false);
      setPdfRenderingProgress(0);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-5 text-white" id="add_logo_section">
      {/* Upper header controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white"
            id="back_btn_add_logo"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-display font-bold text-lg leading-tight">Add Logo</h2>
            <p className="font-sans text-[11px] text-slate-400">Place overlays on your PDFs or Photos</p>
          </div>
        </div>

        {editorStep > 1 && (
          <button 
            onClick={handleFullReset}
            className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all"
            title="Start Over"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {exportPreviewUrl ? (
        // Preview Final Composition Result View
        <div className="flex-1 flex flex-col justify-between" id="preview_composite_view">
          <div className="flex-1 overflow-y-auto space-y-4 text-center">
            
            <div className="py-2 inline-flex items-center gap-1.5 px-3 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-xs text-emerald-300 font-bold mb-2">
              <Check className="w-4 h-4" />
              <span>HQ Composed Image Ready</span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-2.5 aspect-[3/4] flex items-center justify-center overflow-hidden">
              <img 
                src={exportPreviewUrl} 
                alt="composite" 
                className="max-h-full max-w-full object-contain rounded-lg shadow-xl"
              />
            </div>
            
            <p className="font-sans text-xs text-slate-400">
              The composite output preserves high original resolution ({baseImageDimensions.width}x{baseImageDimensions.height}) and opacity.
            </p>
          </div>

          <div className="space-y-3 mt-4">
            {baseFileType === 'pdf' ? (
              <button
                onClick={downloadOverlaidPdf}
                disabled={isExportingPdf}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 font-display font-extrabold text-sm text-white hover:shadow-[0_4px_25px_rgba(16,185,129,0.3)] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                id="download_branded_pdf_btn"
              >
                {isExportingPdf ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    <span>Saving Branded PDF ({pdfRenderingProgress}%)</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4.5 h-4.5" />
                    <span>Download Final PDF (ডাউনলোড ফাইনাল PDF)</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={downloadOverlaid}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-pink-500 font-display font-bold text-sm text-white hover:shadow-[0_4px_25px_rgba(236,72,153,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                id="download_composite_btn"
              >
                <Download className="w-4.5 h-4.5" />
                <span>Download Final Photo</span>
              </button>
            )}

            {baseFileType === 'pdf' && (
              <button
                onClick={downloadOverlaid}
                className="w-full py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-sans text-xs text-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
                id="download_composite_page_btn"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Current Page as Image (ঐচ্ছিক)</span>
              </button>
            )}

            <button
              onClick={() => setExportPreviewUrl(null)}
              className="w-full py-3 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Back to edits
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between">
          
          {/* Main flow steps */}
          {editorStep === 1 && (
            // STEP 1: LOAD TARGET BASE (IMAGE/PDF)
            <div className="flex-1 flex flex-col justify-center py-6">
              <span className="text-slate-400 font-display text-xs font-bold mb-3 uppercase tracking-wider block">Step 1: Import Base File</span>
              
              <div 
                onClick={() => baseFileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-fuchsia-400/50 rounded-2xl p-8 py-16 text-center cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col items-center justify-center group"
                id="base_file_uploader"
              >
                <input 
                  type="file" 
                  ref={baseFileInputRef} 
                  onChange={handleBaseFileChange}
                  accept="image/*,application/pdf" 
                  className="hidden" 
                />
                
                <div className="w-16 h-16 rounded-xl bg-fuchsia-400/10 border border-fuchsia-400/20 flex items-center justify-center text-fuchsia-400 mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>
                
                <h3 className="font-display font-bold text-base text-slate-100">Click to import paper base</h3>
                <p className="font-sans text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
                  Choose a Photo or PDF Document. We will lay your transparent logo on top cleanly.
                </p>
              </div>

              {isProcessingPdf && (
                <div className="flex items-center gap-2 mt-4 justify-center text-xs text-slate-400">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-fuchsia-400" />
                  <span>Scanning PDF structures...</span>
                </div>
              )}
            </div>
          )}

          {editorStep === 2 && (
            // STEP 2: LOAD LOGO / WATERMARK
            <div className="flex-1 flex flex-col justify-center py-6">
              <span className="text-slate-400 font-display text-xs font-bold mb-3 uppercase tracking-wider block">Step 2: Import Overlay Logo</span>
              
              <div 
                onClick={() => logoFileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-fuchsia-400/50 rounded-2xl p-8 py-16 text-center cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col items-center justify-center group"
                id="logo_file_uploader"
              >
                <input 
                  type="file" 
                  ref={logoFileInputRef} 
                  onChange={handleLogoFileChange}
                  accept="image/*" 
                  className="hidden" 
                />
                
                <div className="w-16 h-16 rounded-xl bg-fuchsia-400/10 border border-fuchsia-400/20 flex items-center justify-center text-fuchsia-400 mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>
                
                <h3 className="font-display font-bold text-base text-slate-100">Import Logo / PNG</h3>
                <p className="font-sans text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
                  Choose your seal or corporate brand image. For best transparency, please use transparent PNG background files.
                </p>
              </div>
            </div>
          )}

          {editorStep === 3 && baseImageSrc && (
            // STEP 3: INTERACTIVE WORKSPACE
            <div className="flex-1 flex flex-col justify-between" id="stamping_workspace">
              
              {/* PDF Page Pager if file is PDF */}
              {baseFileType === 'pdf' && pdfPageCount > 1 && (
                <div className="flex justify-between items-center bg-white/5 border border-white/10 p-2 rounded-xl text-xs mb-3">
                  <span className="text-slate-400 font-medium">PDF Source Paper:</span>
                  <div className="flex items-center gap-2 font-bold text-slate-200">
                    <button 
                      disabled={pdfActivePage === 1}
                      onClick={() => changePdfPage('prev')}
                      className="w-6 h-6 rounded bg-white/5 flex items-center justify-center hover:bg-white/10 disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span>Page {pdfActivePage} of {pdfPageCount}</span>
                    <button 
                      disabled={pdfActivePage === pdfPageCount}
                      onClick={() => changePdfPage('next')}
                      className="w-6 h-6 rounded bg-white/5 flex items-center justify-center hover:bg-white/10 disabled:opacity-30"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Composition Interactive Canvas Viewport */}
              <div className="flex-1 flex items-center justify-center overflow-hidden max-h-[300px] bg-slate-950/40 rounded-2xl border border-white/5 p-2 relative mb-4">
                <div 
                  ref={containerRef}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  className="relative select-none touch-none max-h-full max-w-full"
                >
                  {/* Base Asset Plate */}
                  <img 
                    ref={baseImgRef}
                    src={baseImageSrc} 
                    alt="base" 
                    className="max-h-[280px] w-auto object-contain rounded-lg pointer-events-none select-none"
                    onLoad={() => {
                      // Adjust coordinate bounds
                    }}
                  />

                  {/* Moveable Logo Stamp */}
                  {logoImageSrc ? (
                    <div
                      onPointerDown={handlePointerDown}
                      className={`absolute cursor-pointer select-none active:scale-[1.01] transition-shadow ${
                        isDragging ? 'ring-2 ring-fuchsia-400 shadow-2xl' : 'hover:ring-1 hover:ring-white/40'
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
                        src={logoImageSrc} 
                        alt="logo" 
                        className="w-full h-full object-contain pointer-events-none"
                      />
                      
                      {/* Tiny drag indicator indicator */}
                      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-fuchsia-500 shadow flex items-center justify-center pointer-events-none">
                        <Move className="w-1.5 h-1.5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-transparent flex items-center justify-center uppercase font-bold text-[10px] tracking-wider text-slate-400 pointer-events-none select-none">
                      (No Logo/Photo Added Yet)
                    </div>
                  )}
                </div>
              </div>

              {/* Slider controls bottom bar / Logo Upload trigger */}
              {!logoImageSrc ? (
                <div 
                  onClick={() => logoFileInputRef.current?.click()}
                  className="bg-white/[0.02] border-2 border-dashed border-slate-700 hover:border-fuchsia-400/50 rounded-2xl p-6 text-center cursor-pointer hover:bg-white/[0.04] transition-all flex flex-col items-center justify-center group mb-4"
                  id="logo_direct_uploader_workspace"
                >
                  <input 
                    type="file" 
                    ref={logoFileInputRef} 
                    onChange={handleLogoFileChange}
                    accept="image/*" 
                    className="hidden" 
                  />
                  <div className="w-12 h-12 rounded-xl bg-fuchsia-400/10 border border-fuchsia-400/20 flex items-center justify-center text-fuchsia-400 mb-3 group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="font-display font-bold text-xs text-white">১. লোগো বা ফটো সিলেক্ট করুন</h4>
                  <p className="font-sans text-[10px] text-slate-400 mt-1">পিডিএফ অথবা ছবির ওপরে লোগো বসানোর জন্য আপলোড করুন।</p>
                </div>
              ) : (
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3.5 mb-4">
                  
                  {/* Active Logo Details & Actions */}
                  <div className="flex justify-between items-center text-xs bg-white/5 p-2 rounded-xl border border-white/10 mb-1">
                    <span className="text-slate-300 font-medium truncate max-w-[150px] flex items-center gap-1">
                      📁 {logoConfig.name || 'Logo Image'}
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => logoFileInputRef.current?.click()}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold px-2 py-1 rounded bg-slate-900/40 border border-emerald-500/10 cursor-pointer"
                      >
                        লোগো পরিবর্তন
                      </button>
                      <button 
                        onClick={() => { setLogoImageSrc(null); setLogoConfig(prev => ({ ...prev, src: null, name: null })); }}
                        className="text-[10px] text-red-400 hover:text-red-300 font-bold px-2 py-1 rounded bg-slate-900/40 border border-red-500/10 cursor-pointer"
                      >
                        লোগো সরান
                      </button>
                    </div>
                  </div>

                  {/* 1. Size Slider */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-1">
                      <span className="flex items-center gap-1 uppercase">
                        <Maximize2 className="w-3 h-3 text-fuchsia-400" /> Key Size Scaling
                      </span>
                      <span>{Math.round(logoConfig.scale * 100)}%</span>
                    </div>
                    <input 
                      type="range"
                      min="0.1"
                      max="2.5"
                      step="0.05"
                      value={logoConfig.scale}
                      onChange={(e) => setLogoConfig(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-400"
                    />
                  </div>

                  {/* 2. Rotation Slider */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-1">
                      <span className="flex items-center gap-1 uppercase">
                        <RotateCw className="w-3 h-3 text-fuchsia-400" /> Logo Rotation Angle
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
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-400"
                    />
                  </div>

                  {/* 3. Opacity Slider */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-1">
                      <span className="flex items-center gap-1 uppercase">
                        <Sliders className="w-3 h-3 text-fuchsia-400" /> Transparency Value
                      </span>
                      <span>{Math.round(logoConfig.opacity * 100)}%</span>
                    </div>
                    <input 
                      type="range"
                      min="0.05"
                      max="1"
                      step="0.05"
                      value={logoConfig.opacity}
                      onChange={(e) => setLogoConfig(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-400"
                    />
                  </div>

                  <div className="text-[10px] text-slate-500 font-medium text-center">
                    💡 Tip: Drag & drop the logo directly on the live viewport image above to reposition freely.
                  </div>
                </div>
              )}

              {/* Action trigger button */}
              <div className="space-y-3">
                {baseFileType === 'pdf' && (
                  <button
                    onClick={downloadOverlaidPdf}
                    disabled={isExportingPdf}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 font-display font-extrabold text-sm text-white hover:shadow-[0_4px_25px_rgba(16,185,129,0.3)] hover:scale-[1.01] transition-all flex items-center justify-center gap-2 border border-emerald-400/20 shadow-lg cursor-pointer"
                    id="direct_download_branded_pdf_btn"
                  >
                    {isExportingPdf ? (
                      <>
                        <Loader2 className="w-4.5 h-4.5 animate-spin" />
                        <span>Saving Branded PDF ({pdfRenderingProgress}%)</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-4.5 h-4.5" />
                        <span>Download Final PDF (PDF LOGO PDF)</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={generateOverlaidImage}
                  disabled={isExporting || isExportingPdf}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-pink-500 font-display font-bold text-sm text-white hover:shadow-[0_4px_25px_rgba(236,72,153,0.3)] hover:scale-[1.01] transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  id="preview_logo_overlaid_btn"
                >
                  {isExporting ? (
                    <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                  ) : (
                    <Eye className="w-4.5 h-4.5" />
                  )}
                  <span>Combine & Render High Quality Image</span>
                </button>
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
}
