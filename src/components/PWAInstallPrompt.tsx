import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Smartphone, ArrowUpFromLine, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Detect if the user is on iOS/Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIphoneOrIpad = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/crios|fxios/.test(userAgent);
    setIsIOS(isIphoneOrIpad);

    // 2. Listen for the native beforeinstallprompt event (Android / Desktop Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Auto-trigger on first-time visit (if not already installed or dismissed)
      const isDismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!isDismissed) {
        setShowPopup(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 3. Alternatively, check if it's the first visit of mobile users (fallback for other browsers)
    // and show the popup explaining how mock PWA handles installation
    const isDismissed = localStorage.getItem('pwa-prompt-dismissed');
    const isAlreadyInstalled = window.matchMedia('(display-mode: standalone)').matches;

    if (!isDismissed && !isAlreadyInstalled) {
      // Trigger prompt display after a small delay for premium feels
      const timer = setTimeout(() => {
        // If it's iOS or we didn't get native prompt yet, we can still show our beautiful install prompt
        setShowPopup(true);
      }, 1800);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show native install banner
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      // Clear deferred prompt so it can't be reused
      setDeferredPrompt(null);
      setShowPopup(false);
    } else {
      // Browser didn't support native prompt or is iOS Safari, let's keep showing the info/dismiss
      // In iOS, users must press Share -> Add to Home Screen (which we describe clearly in the popup)
      if (!isIOS) {
        // For Chrome (where prompt didn't fire yet or already installed)
        alert('আপনার ফোনে অ্যাপসটি ইতিমধ্যে ইন্সটল থাকতে পারে অথবা ব্রাউজার PWA সাপোর্ট করছেনা। ক্রোম ব্রাউজারের থ্রি-ডট (Three-Dot) মেনু থেকে "Install App" বা "Add to Home Screen" অপশন ব্যবহার করতে পারেন।');
        setShowPopup(false);
      }
    }
  };

  const handleDismiss = () => {
    // Prevent annoying the user on every reload
    localStorage.setItem('pwa-prompt-dismissed', 'true');
    setShowPopup(false);
  };

  return (
    <AnimatePresence>
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-20 sm:pb-6 pointer-events-none" id="pwa_popup_root">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm pointer-events-auto"
            onClick={handleDismiss}
          />

          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-full max-w-sm bg-gradient-to-b from-[#161e38] to-[#0e1424] border border-white/10 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10 pointer-events-auto overflow-hidden text-white"
            id="pwa_install_card"
          >
            {/* Glossy gradient effect background */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-all cursor-pointer"
              aria-label="Close"
              id="pwa_close_btn"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            {/* Icon Block */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-[#0f172a] p-1 border border-white/15 shadow-inner shrink-0 flex items-center justify-center">
                <img 
                  src="/icon.svg" 
                  alt="App Icon" 
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest block mb-0.5">
                  পোর্টেবল ওয়েব অ্যাপ • PWA
                </span>
                <h3 className="font-display font-black text-base text-white leading-tight">
                  Converter Pro ইনস্টল করুন
                </h3>
              </div>
            </div>

            {/* Features Description */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 mb-5 space-y-2.5">
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>ফোনে সরাসরি সাধারণ অ্যাপের মতো ইন্সটল করে লাইভ ব্যবহার করুন।</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center text-[9px] font-black text-emerald-400 shrink-0 mt-0.5">
                  ✓
                </div>
                <span>কোন ব্রাউজার ট্যাব বা এড্রেস বার ছাড়াই ফুল-স্ক্রিন মোড।</span>
              </div>
            </div>

            {/* Platform-specific triggers / instructions */}
            {isIOS ? (
              <div className="text-center bg-slate-900/40 border border-amber-500/10 rounded-2xl p-4 space-y-2 mb-4">
                <p className="text-xs text-slate-300">
                  আইফোনে ইন্সটল করার জন্য ব্রাউজারের নির্দেশাবলী অনুসরণ করুন:
                </p>
                <div className="flex flex-col gap-2.5 font-sans text-xs text-slate-400 items-start px-2 py-1">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-white/5 flex items-center justify-center text-[10px] font-bold">১</div>
                    <span>নীচের <ArrowUpFromLine className="w-4.5 h-4.5 inline text-sky-400" /> <b>"Share"</b> বাটনে চাপুন।</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-white/5 flex items-center justify-center text-[10px] font-bold">২</div>
                    <span>তালিকা স্ক্রোল করে <PlusSquare className="w-4.5 h-4.5 inline text-sky-400" /> <b>"Add to Home Screen"</b> ক্লিক করুন।</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-pink-500 font-display font-black text-sm text-white hover:shadow-[0_4px_25px_rgba(236,72,153,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  id="pwa_direct_install_btn"
                >
                  <Download className="w-4.5 h-4.5" />
                  <span>ডাউনলোড ও ইন্সটল করুন</span>
                </button>
                <button
                  onClick={handleDismiss}
                  className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-400 hover:text-white transition-all cursor-pointer text-center"
                  id="pwa_later_btn"
                >
                  না, পরে করব
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
