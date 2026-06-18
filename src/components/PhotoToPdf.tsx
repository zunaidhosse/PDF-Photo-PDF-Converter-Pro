import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Upload, FileDown, Eye, Share2, Trash2, 
  ChevronUp, ChevronDown, Check, Loader2, Sparkles, FileText, Plus,
  Move, Maximize2, RotateCw, Sliders
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { ActiveTab, SelectedPhoto, LogoConfig } from '../types';

interface PhotoToPdfProps {
  onBack: () => void;
  isBrandingEnabled: boolean;
}

export default function PhotoToPdf({ onBack, isBrandingEnabled }: PhotoToPdfProps) {
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfSizeLabel, setPdfSizeLabel] = useState('');

  // Branding states
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
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setLogoSrc(src);
        setLogoConfig(prev => ({
          ...prev,
          src,
          name: file.name,
          width: img.naturalWidth > 200 ? 100 : img.naturalWidth,
          height: img.naturalHeight > 200 ? (100 * img.naturalHeight / img.naturalWidth) : img.naturalHeight
        }));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
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

  
  // Settings
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'original'>('a4');
  const [margin, setMargin] = useState<'none' | 'small' | 'large'>('none');
  const [quality, setQuality] = useState<'high' | 'standard'>('high');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    processFiles(e.target.files);
  };

  const processFiles = (fileList: FileList) => {
    const newPhotos: Promise<SelectedPhoto>[] = Array.from(fileList).map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const src = event.target?.result as string;
          // Calculate human readable size
          const sizeKb = file.size / 1024;
          const sizeStr = sizeKb > 1024 
            ? `${(sizeKb / 1024).toFixed(1)} MB` 
            : `${sizeKb.toFixed(0)} KB`;
          
          resolve({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            src,
            size: sizeStr,
            file
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newPhotos).then(results => {
      setPhotos(prev => [...prev, ...results]);
      // Reset input value to allow uploading same files again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    });
  };

  // Reordering & deletion
  const movePhoto = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === photos.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...photos];
    const temp = reordered[index];
    reordered[index] = reordered[newIndex];
    reordered[newIndex] = temp;
    setPhotos(reordered);
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  // Generate PDF
  const generatePdf = async () => {
    if (photos.length === 0) return;
    setIsProcessing(true);
    setProcessingProgress(15);

    try {
      // Simulate gorgeous progressive processing steps for smooth flow
      await new Promise(r => setTimeout(r, 400));
      setProcessingProgress(45);
      
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: pageSize === 'original' ? 'a4' : pageSize,
      });

      for (let i = 0; i < photos.length; i++) {
        setProcessingProgress(Math.floor(45 + (35 * (i / photos.length))));
        const photo = photos[i];
        
        // Dynamic loading promise to extract aspects
        const imgInfo = await new Promise<{width: number, height: number}>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
          img.onerror = () => reject(new Error('Image failed to load'));
          img.src = photo.src;
        });

        // Determine real page dimension bounds
        let pWidth = doc.internal.pageSize.getWidth();
        let pHeight = doc.internal.pageSize.getHeight();

        if (pageSize === 'original') {
          // Resize document page to match the image dimensions exactly!
          doc.addPage([imgInfo.width, imgInfo.height], imgInfo.width > imgInfo.height ? 'l' : 'p');
          pWidth = imgInfo.width;
          pHeight = imgInfo.height;
        } else if (i > 0) {
          doc.addPage();
        }

        // Apply margins
        let marginSize = 0;
        if (margin === 'small') marginSize = pWidth * 0.04;
        if (margin === 'large') marginSize = pWidth * 0.08;

        const availableWidth = pWidth - (marginSize * 2);
        const availableHeight = pHeight - (marginSize * 2);

        // Aspect ratio locked rendering dimensions
        let printWidth = availableWidth;
        let printHeight = (imgInfo.height / imgInfo.width) * availableWidth;

        if (printHeight > availableHeight) {
          printHeight = availableHeight;
          printWidth = (imgInfo.width / imgInfo.height) * availableHeight;
        }

        const xOffset = marginSize + (availableWidth - printWidth) / 2;
        const yOffset = marginSize + (availableHeight - printHeight) / 2;

        const format = photo.file.type.includes('png') ? 'PNG' : 'JPEG';
        const imgQuality = quality === 'high' ? 0.95 : 0.75;

        let finalImageSrc = photo.src;
        if (isBrandingEnabled && logoSrc) {
          try {
            const mainImg = await new Promise<HTMLImageElement>((resolve) => {
              const item = new Image();
              item.onload = () => resolve(item);
              item.src = photo.src;
            });
            const logoImg = await new Promise<HTMLImageElement>((resolve) => {
              const item = new Image();
              item.onload = () => resolve(item);
              item.src = logoSrc;
            });

            const canvas = document.createElement('canvas');
            canvas.width = imgInfo.width;
            canvas.height = imgInfo.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(mainImg, 0, 0, imgInfo.width, imgInfo.height);

              ctx.save();
              ctx.globalAlpha = logoConfig.opacity;
              const targetX = (logoConfig.x / 100) * imgInfo.width;
              const targetY = (logoConfig.y / 100) * imgInfo.height;

              // Proportional spacing calculation matches UI space (width 260px)
              const workspaceWidth = 260;
              const scaleFactor = imgInfo.width / workspaceWidth;

              const printLogoW = logoConfig.width * logoConfig.scale * scaleFactor;
              const printLogoH = logoConfig.height * logoConfig.scale * scaleFactor;

              ctx.translate(targetX + printLogoW / 2, targetY + printLogoH / 2);
              ctx.rotate((logoConfig.rotation * Math.PI) / 180);
              ctx.drawImage(logoImg, -printLogoW / 2, -printLogoH / 2, printLogoW, printLogoH);
              ctx.restore();

              finalImageSrc = canvas.toDataURL('image/jpeg', imgQuality);
            }
          } catch (e) {
            console.error('Failed to embed watermark onto page:', e);
          }
        }

        doc.addImage(finalImageSrc, 'JPEG', xOffset, yOffset, printWidth, printHeight, undefined, 'FAST');
        await new Promise(r => setTimeout(r, 80)); // progressive yield
      }

      setProcessingProgress(90);

      // Clean up first A4 page if original scale is used because doc initialization adds 1 blank A4
      if (pageSize === 'original') {
        doc.deletePage(1);
      }

      const generatedBlob = doc.output('blob');
      const sizeMb = generatedBlob.size / (1024 * 1024);
      setPdfSizeLabel(sizeMb > 1 ? `${sizeMb.toFixed(2)} MB` : `${(generatedBlob.size / 1024).toFixed(0)} KB`);
      setPdfBlob(generatedBlob);
      setPdfUrl(URL.createObjectURL(generatedBlob));
      setProcessingProgress(100);
      await new Promise(r => setTimeout(r, 450));
    } catch (err) {
      console.error('PDF creation error:', err);
      alert('An error occurred during PDF conversion.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download Output PDF
  const downloadPdf = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `PhotoConverted_${Date.now().toString().substr(-6)}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Web Share API support
  const sharePdf = async () => {
    if (!pdfBlob) return;
    if (navigator.share) {
      try {
        const file = new File([pdfBlob], 'documents.pdf', { type: 'application/pdf' });
        await navigator.share({
          files: [file],
          title: 'Converted PDF Document',
          text: 'Shared PDF from PDF Photo Converter Pro',
        });
      } catch (err) {
        console.log('Share canceled or failing:', err);
      }
    } else {
      // Fallback
      downloadPdf();
    }
  };

  return (
    <div className="flex-1 flex flex-col p-5 text-white" id="p_to_pdf_view">
      {/* Top action header bar */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white"
          id="back_btn_photo_to_pdf"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-display font-bold text-lg leading-tight">Photo to PDF</h2>
          <p className="font-sans text-[11px] text-slate-400">Convert pictures to document papers</p>
        </div>
      </div>

      {isProcessing ? (
        // Progress Screen
        <div className="flex-1 flex flex-col items-center justify-center py-12">
          <div className="relative mb-6">
            <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
            <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-xl" />
          </div>
          <p className="font-display font-semibold text-lg text-slate-100">Generating PDF Document...</p>
          <p className="font-sans text-xs text-slate-400 mt-1">{processingProgress}% finished</p>
          
          {/* Progress bar */}
          <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-4 border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-300" 
              style={{ width: `${processingProgress}%` }}
            />
          </div>
        </div>
      ) : pdfUrl ? (
        // PDF Output / Completion Dashboard
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col justify-between"
        >
          <div className="flex-1 flex flex-col items-center justify-center py-6">
            {/* Styled Success Card */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-[0_8px_30px_rgba(245,158,11,0.3)] mb-6">
              <FileText className="w-12 h-12 text-white" />
            </div>

            <h3 className="font-display font-bold text-xl text-center text-white">Your PDF is Ready!</h3>
            <p className="font-sans text-xs text-slate-400 mt-1 text-center">
              Successfully converted {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
            </p>

            {/* Micro Details Box */}
            <div className="w-full max-w-xs mt-6 px-4 py-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Page count:</span>
                <span className="text-slate-100 font-bold">{photos.length} Pages</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Estimated size:</span>
                <span className="text-slate-100 font-bold">{pdfSizeLabel}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Scaling mode:</span>
                <span className="text-slate-100 font-bold uppercase">{pageSize}</span>
              </div>
            </div>

            {/* PDF Embedded Frame Preview Option */}
            <div className="mt-8 text-center">
              <a 
                href={pdfUrl} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs text-amber-400 hover:text-amber-300 font-bold bg-amber-400/10 px-4 py-2 rounded-full border border-amber-400/20 transition-all hover:scale-105"
              >
                <Eye className="w-4 h-4" />
                <span>View Final PDF Document</span>
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={downloadPdf}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 font-display font-bold text-sm text-[#0c1328] hover:shadow-[0_4px_20px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2"
              id="download_pdf_btn"
            >
              <FileDown className="w-4.5 h-4.5" />
              <span>Download PDF File</span>
            </button>

            {navigator.share && (
              <button
                onClick={sharePdf}
                className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-display font-medium text-sm text-slate-100 transition-all flex items-center justify-center gap-2"
                id="share_pdf_btn"
              >
                <Share2 className="w-4.5 h-4.5" />
                <span>Share PDF</span>
              </button>
            )}

            <button
              onClick={() => {
                setPdfUrl(null);
                setPdfBlob(null);
                setPhotos([]);
              }}
              className="w-full py-3 text-center text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Convert Another Batch
            </button>
          </div>
        </motion.div>
      ) : (
        // File Uploader & Editor Flow
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex-1 overflow-y-auto pr-0.5 space-y-5">
            
            {/* File drop area if empty */}
            {photos.length === 0 ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-amber-400/50 rounded-2xl p-8 text-center cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-all py-16 flex flex-col items-center justify-center group"
                id="upload_drop_area"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                />
                
                <div className="w-16 h-16 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>
                
                <h3 className="font-display font-bold text-base text-slate-100">Click to import photos</h3>
                <p className="font-sans text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
                  Support JPEG, PNG formats. You can select single or multiple files at once.
                </p>
              </div>
            ) : (
              // Selected files with settings
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 rounded-xl p-3">
                  <span className="text-xs text-slate-400 font-medium">Selected: {photos.length} image{photos.length > 1 ? 's' : ''}</span>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs text-amber-400 font-bold bg-amber-400/10 px-3 py-1.5 border border-amber-400/20 rounded-lg hover:bg-amber-400/20 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add More</span>
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>

                {/* Grid Lists / Render items */}
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  <AnimatePresence initial={false}>
                    {photos.map((photo, i) => (
                      <motion.div
                        key={photo.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-3 bg-white/5 border border-white/10 p-2.5 rounded-xl overflow-hidden"
                      >
                        <img 
                          src={photo.src} 
                          alt="thumbnail" 
                          className="w-12 h-12 object-cover rounded-lg bg-slate-800"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-xs font-bold text-slate-200 truncate pr-2">{photo.name}</p>
                          <p className="font-sans text-[10px] text-slate-400 mt-0.5">{photo.size}</p>
                        </div>

                        {/* Order Controls & Delete */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button 
                            disabled={i === 0}
                            onClick={() => movePhoto(i, 'up')}
                            className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-20"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            disabled={i === photos.length - 1}
                            onClick={() => movePhoto(i, 'down')}
                            className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-20"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => removePhoto(photo.id)}
                            className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all ml-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* ADVANCED BRANDING WATERMARK WORKSPACE */}
                {isBrandingEnabled && (
                  <div className="bg-gradient-to-br from-slate-900 via-slate-905 to-slate-900 border border-emerald-500/20 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span className="font-display font-bold text-xs text-slate-200">লোগো ওয়াটারমার্ক সংযুক্ত করুন (Branding)</span>
                      </div>
                      <span className="text-[9px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded uppercase font-mono">Logo system</span>
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
                          <p className="font-sans text-[10px] text-slate-500 mt-1">সবগুলো ছবিতে ওয়াটারমার্ক হিসেবে লোগো বসে যাবে</p>
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

                        {/* Drag and Drop preview on Page 1 image */}
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
                              {/* First Uploaded Photo preview */}
                              <img 
                                ref={previewImgRef}
                                src={photos[0].src} 
                                alt="first page preview" 
                                className="max-h-[160px] w-auto object-contain rounded-lg border border-white/5 pointer-events-none select-none"
                              />

                              {/* Moveable Stamp Logo */}
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

                {/* Advanced PDF Output Configuration */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="font-display font-semibold text-xs text-slate-300">Convert Settings (Pro)</span>
                  </div>

                  {/* Setting 1: Page Margins */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase">Margins</span>
                    <div className="grid grid-cols-3 gap-2">
                      {(['none', 'small', 'large'] as const).map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setMargin(opt)}
                          className={`py-2 text-xs rounded-lg border font-medium capitalize transition-all ${
                            margin === opt 
                              ? 'bg-amber-400/20 border-amber-400 text-amber-200 font-semibold' 
                              : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Setting 2: Format / Target Sizes */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase">Page Size Format</span>
                    <div className="grid grid-cols-3 gap-2">
                      {(['original', 'a4', 'letter'] as const).map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setPageSize(opt)}
                          className={`py-2 text-xs rounded-lg border font-medium uppercase transition-all ${
                            pageSize === opt 
                              ? 'bg-amber-400/20 border-amber-400 text-amber-200 font-semibold' 
                              : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                          }`}
                        >
                          {opt === 'original' ? 'Auto PDF' : opt}
                        </button>
                      ))}
                    </div>
                    {pageSize === 'original' && (
                      <p className="font-sans text-[10px] text-amber-400/80 mt-1.5 leading-normal">
                        ★ Auto scale adjusts each page's dimensions to match your source image size perfectly to eliminate dark margins.
                      </p>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Core Convert Handler */}
          <div className="mt-4 pt-1">
            <button
              disabled={photos.length === 0}
              onClick={generatePdf}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 font-display font-bold text-sm text-[#0c1328] hover:shadow-[0_4px_25px_rgba(245,158,11,0.3)] hover:scale-[1.01] active:scale-95 disabled:scale-100 disabled:opacity-30 disabled:shadow-none transition-all flex items-center justify-center gap-2"
              id="start_pdf_gen_btn"
            >
              <FileDown className="w-5 h-5" />
              <span>Convert to PDF Now</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
