import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Globe, HelpCircle, Share2, X, ExternalLink, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { useTranslation, LanguageCode } from '../lib/i18n';

export default function InfoMenu() {
  const { t, lang, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Pre-generate QR Code in high quality
  useEffect(() => {
    QRCode.toDataURL('https://pdf-photo-pdf-converter-pro.vercel.app/', {
      width: 300,
      margin: 1.5,
      color: {
        dark: '#0f172a', // deep slate 900
        light: '#ffffff'
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR Code:', err));
  }, []);

  const languages: { code: LanguageCode; name: string; nativeName: string }[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'bn', name: 'Bangla', nativeName: 'বাংলা' },
    { code: 'fa', name: 'Persian', nativeName: 'فارسی' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  ];

  return (
    <div className="relative" ref={menuRef} id="info_menu_component">
      {/* Sleek, eye-catching Prominent 3-line Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border-2 cursor-pointer ${
          isOpen
            ? 'bg-gradient-to-r from-indigo-500/20 to-pink-500/20 border-indigo-400 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.35)]'
            : 'bg-white/[0.07] border-white/15 text-slate-100 hover:bg-white/15 hover:border-slate-300 hover:scale-105 active:scale-95 shadow-sm'
        }`}
        id="info_menu_trigger_btn"
        title="Settings Menu"
      >
        <Menu className="w-5.5 h-5.5 stroke-[2.5]" />
      </button>

      {/* Floating Dropdown Dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute left-0 mt-3.5 w-[280px] bg-[#11182c]/98 border border-white/10 rounded-2.5xl shadow-[0_15px_45px_rgba(0,0,0,0.6)] backdrop-blur-xl p-4.5 z-50 text-white select-none"
            id="info_menu_dropdown"
          >
            {/* Soft decorative spot lamp background */}
            <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-indigo-500/5 to-transparent rounded-t-2.5xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <span className="font-display font-black text-xs text-indigo-400 tracking-wider uppercase">
                {lang === 'bn' ? 'অপশন মেনু' : lang === 'fa' ? 'منوی گزینه‌ها' : lang === 'hi' ? 'विकल्प मेनू' : 'Premium Options'}
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Option 1: Language Switcher */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold font-display">
                    {lang === 'bn' ? 'ভাষা পরিবর্তন (Language)' : lang === 'fa' ? 'تغییر زبان (Language)' : lang === 'hi' ? 'भाषा बदलें (Language)' : 'Change Language'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-white/[0.02] border border-white/5 rounded-xl">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLanguage(l.code)}
                      className={`py-1.5 px-2.5 rounded-lg text-left transition-all duration-200 cursor-pointer ${
                        lang === l.code
                          ? 'bg-gradient-to-r from-indigo-500/20 to-pink-500/25 border border-indigo-400/40 text-indigo-200 font-extrabold shadow-[0_2px_10px_rgba(99,102,241,0.15)]'
                          : 'border border-transparent text-slate-400 hover:text-white hover:bg-white/5 font-medium'
                      }`}
                      id={`lang_btn_${l.code}`}
                    >
                      <div className="text-[11px] leading-tight font-display">{l.nativeName}</div>
                      <div className="text-[9px] opacity-40 leading-none">{l.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 2: Help Line Connection */}
              <a
                href="https://zunaidhosse.github.io/My-contact/"
                target="_blank"
                rel="noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-200 cursor-pointer group text-left"
                id="helpline_link"
              >
                <div className="flex items-center gap-2.5 text-slate-200">
                  <HelpCircle className="w-4.5 h-4.5 text-fuchsia-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold block leading-none">
                      {lang === 'bn' ? 'হেল্প লাইন' : lang === 'fa' ? 'خط پشتیبانی' : lang === 'hi' ? 'हेल्प लाइन' : 'Help Line'}
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5 leading-none">
                      zunaidhosse.github.io
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
              </a>

              {/* Option 3: Apps Share with QR Display */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowQr(true);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-200 cursor-pointer group text-left"
                id="share_app_trigger_btn"
              >
                <div className="flex items-center gap-2.5 text-slate-200">
                  <Share2 className="w-4.5 h-4.5 text-sky-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold block leading-none">
                      {lang === 'bn' ? 'অ্যাপস শেয়ার' : lang === 'fa' ? 'اشتراک‌گذاری برنامه' : lang === 'hi' ? 'ऐप साझा करें' : 'Share App'}
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5 leading-none">
                      {lang === 'bn' ? 'কিউআর কোড স্ক্যান করুন' : lang === 'fa' ? 'اسکن کد QR' : lang === 'hi' ? 'QR कोड स्कैन करें' : 'Scan QR code to install'}
                    </span>
                  </div>
                </div>
                <QrCode className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Presentation Overlay Modal */}
      <AnimatePresence>
        {showQr && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none" id="qr_share_modal_root">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md pointer-events-auto"
              onClick={() => setShowQr(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-full max-w-sm bg-gradient-to-b from-[#131a32] to-[#0c1020] border border-white/10 rounded-3xl p-6.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] relative z-10 pointer-events-auto text-center"
              id="qr_share_card"
            >
              {/* Soft visual accent glows */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <button
                onClick={() => setShowQr(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-all cursor-pointer"
                id="qr_close_btn"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mb-4 text-center mt-2 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-3 text-sky-400">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="font-display font-black text-lg text-white">
                  {lang === 'bn' ? 'শেয়ার কিউআর কোড' : lang === 'fa' ? 'کد شارژ و اشتراک' : lang === 'hi' ? 'कस्टम क्यूआर कोड' : 'Scan to Install & Share'}
                </h3>
                <p className="font-sans text-xs text-slate-400 max-w-[240px] mt-1.5 leading-relaxed">
                  {lang === 'bn' 
                    ? 'যেকোন ফোন থেকে এই কিউআর কোডটি স্ক্যান করে নিমেষেই ইন্সটল করতে ভিজিট করুন।'
                    : lang === 'fa'
                    ? 'برای باز کردن و نصب سریع برنامه بر روی تلفن همراه دیگر، این کد را اسکن نمایید.'
                    : lang === 'hi'
                    ? 'दूसरे फोन पर कनवर्टर एप तुरंत इंस्टाल करने के लिए इस क्यूआर कोड को स्कैन करें।'
                    : 'Scan this code with any phone camera to instantly load and install PDF Photo Converter Pro.'}
                </p>
              </div>

              {/* QR Render Target Container */}
              <div className="bg-white rounded-2.5xl p-4.5 inline-block shadow-inner border-4 border-[#222c4d]/50 mb-5 relative group">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="PWA App QR Code Link"
                    className="w-48 h-48 max-w-full select-none rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-slate-500 text-xs">
                    Generating QR...
                  </div>
                )}
              </div>

              {/* Link Clipboard Button / display */}
              <div className="bg-white/5 border border-white/5 rounded-2xl px-4 py-3 select-all cursor-pointer hover:bg-white/10 transition-all flex items-center justify-between gap-3 text-slate-300">
                <span className="font-mono text-[10px] break-all text-slate-400 font-bold overflow-hidden text-ellipsis whitespace-nowrap pr-2">
                  https://pdf-photo-pdf-converter-pro.vercel.app/
                </span>
                <span className="text-[10px] font-bold text-sky-400 uppercase shrink-0">URL</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
