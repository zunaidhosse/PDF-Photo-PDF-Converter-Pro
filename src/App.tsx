import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import PhoneFrame from './components/PhoneFrame';
import Dashboard from './components/Dashboard';
import PhotoToPdf from './components/PhotoToPdf';
import PdfToPhoto from './components/PdfToPhoto';
import AddLogo from './components/AddLogo';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { ActiveTab } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isBrandingEnabled, setIsBrandingEnabled] = useState(false);

  return (
    <PhoneFrame>
      {/* Premium Top Tick Mark Toggle Bar */}
      <div className="bg-[#101830]/95 backdrop-blur-md px-5 py-3 border-b border-white/10 flex items-center justify-between shadow-lg relative z-30">
        <label className="flex items-center gap-3 cursor-pointer group select-none">
          <input 
            type="checkbox" 
            checked={isBrandingEnabled} 
            onChange={(e) => setIsBrandingEnabled(e.target.checked)}
            className="sr-only"
          />
          {/* Custom Checkbox */}
          <div className={`w-5.5 h-5.5 rounded-lg border-2 flex items-center justify-center transition-all ${
            isBrandingEnabled 
              ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]' 
              : 'border-slate-500 bg-slate-900/60'
          } shrink-0`}>
            {isBrandingEnabled && (
              <svg 
                viewBox="0 0 24 24" 
                className="w-3.5 h-3.5 text-slate-950 stroke-[4.5] fill-none stroke-current"
              >
                <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <div className="flex flex-col">
            <span className={`font-display font-black text-[11px] tracking-wide leading-tight uppercase transition-colors ${
              isBrandingEnabled ? 'text-emerald-400' : 'text-slate-300 group-hover:text-white'
            }`}>
              এডভান্সড লগো মোড • Custom Brand
            </span>
            <span className={`font-sans text-[10px] leading-tight transition-colors ${
              isBrandingEnabled ? 'text-emerald-500/90 font-medium' : 'text-slate-500'
            }`}>
              পিডিএফ ও ইমেজে নিজস্ব লোগো সংযুক্ত করতে টিক দিন
            </span>
          </div>
        </label>
        <div className={`text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase border ${
          isBrandingEnabled 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-white/5 border-white/10 text-slate-500'
        }`}>
          {isBrandingEnabled ? 'ACTIVE' : 'OFF'}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === 'dashboard' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: activeTab === 'dashboard' ? 20 : -20 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="flex-1 flex flex-col w-full h-full"
          id={`tab_container_${activeTab}`}
        >
          {activeTab === 'dashboard' && (
            <Dashboard onSelectTab={setActiveTab} isBrandingEnabled={isBrandingEnabled} />
          )}
          {activeTab === 'photo-to-pdf' && (
            <PhotoToPdf 
              onBack={() => setActiveTab('dashboard')} 
              isBrandingEnabled={isBrandingEnabled}
            />
          )}
          {activeTab === 'pdf-to-photo' && (
            <PdfToPhoto 
              onBack={() => setActiveTab('dashboard')} 
              isBrandingEnabled={isBrandingEnabled} 
            />
          )}
          {activeTab === 'add-logo' && (
            <AddLogo 
              onBack={() => setActiveTab('dashboard')} 
              isBrandingEnabled={isBrandingEnabled}
            />
          )}
        </motion.div>
      </AnimatePresence>
      <PWAInstallPrompt />
    </PhoneFrame>
  );
}
