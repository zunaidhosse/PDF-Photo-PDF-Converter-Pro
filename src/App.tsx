import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import PhoneFrame from './components/PhoneFrame';
import Dashboard from './components/Dashboard';
import PhotoToPdf from './components/PhotoToPdf';
import PdfToPhoto from './components/PdfToPhoto';
import AddLogo from './components/AddLogo';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import InfoMenu from './components/InfoMenu';
import { useTranslation } from './lib/i18n';
import { ActiveTab } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isBrandingEnabled, setIsBrandingEnabled] = useState(false);
  const { t } = useTranslation();

  return (
    <PhoneFrame>
      {/* Premium Top Tick Mark Toggle Bar with integrated Info Menu option */}
      <div className="bg-[#0b0f19]/90 backdrop-blur-xl px-4 pt-4 pb-2.5 border-b border-white/[0.08] flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.3)] relative z-30">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <InfoMenu />
          <label className="flex items-center gap-2 cursor-pointer group select-none min-w-0 flex-1 mt-0.5">
            <input 
              type="checkbox" 
              checked={isBrandingEnabled} 
              onChange={(e) => setIsBrandingEnabled(e.target.checked)}
              className="sr-only"
            />
            {/* Custom Premium Mini Switch */}
            <div className={`w-7.5 h-4.25 rounded-full relative transition-colors duration-300 shrink-0 ${
              isBrandingEnabled 
                ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.35)]' 
                : 'bg-slate-800 border border-white/10'
            }`}>
              <div className={`absolute top-0.5 w-3.25 h-3.25 rounded-full bg-white transition-all duration-300 ${
                isBrandingEnabled ? 'left-3.75' : 'left-0.5'
              }`} />
            </div>
            <div className="flex flex-col min-w-0 pr-1 select-none">
              <span className={`font-display font-medium text-[9.5px] tracking-wide leading-tight uppercase transition-colors truncate ${
                isBrandingEnabled ? 'text-emerald-400 font-extrabold' : 'text-slate-300'
              }`}>
                {t.advancedLogoMode}
              </span>
              <span className="font-sans text-[8px] leading-tight text-slate-500 truncate mt-0.5">
                {t.advancedLogoDesc}
              </span>
            </div>
          </label>
        </div>
        <div className={`text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full uppercase border shrink-0 transition-all ${
          isBrandingEnabled 
            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 animate-pulse' 
            : 'bg-white/5 border-white/10 text-slate-500'
        }`}>
          {isBrandingEnabled ? t.activeBadge : t.offBadge}
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
