import { useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'bn' | 'fa' | 'hi';

export interface TranslationDict {
  appName: string;
  appSubtitle: string;
  premiumMember: string;
  welcomeUser: string;
  welcomeSubtitle: string;
  advancedLogoMode: string;
  advancedLogoDesc: string;
  
  // Dashboard card titles & descriptions
  photoToPdfTitle: string;
  photoToPdfDesc: string;
  pdfToPhotoTitle: string;
  pdfToPhotoDesc: string;
  pdfLogoPdfTitle: string;
  pdfLogoPdfDesc: string;
  addLogoTitle: string;
  addLogoDesc: string;
  
  // Badges
  fastBadge: string;
  hqRenderBadge: string;
  newModeBadge: string;
  editorBadge: string;
  activeBadge: string;
  offBadge: string;

  // Buttons & Labels
  back: string;
  browseFiles: string;
  clearAll: string;
  convertToPdf: string;
  converting: string;
  selectBaseFile: string;
  selectLogo: string;
  logoControls: string;
  scale: string;
  rotation: string;
  opacity: string;
  downloadFinalPhoto: string;
  downloadFinalPdf: string;
  optionalCurrentPage: string;
  dragDropOrClick: string;
  dragDropLogoOrClick: string;
  selectedPhotos: string;
  fitPageSize: string;
  a4Size: string;
  usLetter: string;
  pdfToPhotoBtn: string;
  downloadZip: string;
  extracting: string;
  quality: string;
  highQuality: string;
  standardQuality: string;
  lowQuality: string;
  dropPdfHere: string;
  page: string;
  logoAddedSuccess: string;
  pdfLoadError: string;
}

export const translations: Record<LanguageCode, TranslationDict> = {
  en: {
    appName: 'PDF Photo',
    appSubtitle: 'CONVERTER PRO',
    premiumMember: 'Premium Member',
    welcomeUser: 'Welcome, User',
    welcomeSubtitle: 'What would you like to create today?',
    advancedLogoMode: 'Advanced Logo Mode • Custom Brand',
    advancedLogoDesc: 'Enable checkbox to apply personal logos/watermarks to PDFs and photos',
    
    photoToPdfTitle: 'Photo to PDF',
    photoToPdfDesc: 'Select one or multiple photos and instantly convert them into a high-quality PDF document for sharing.',
    pdfToPhotoTitle: 'PDF to Photo',
    pdfToPhotoDesc: 'Convert PDF pages into high-resolution images. Extract visual content with precision and save in top quality.',
    pdfLogoPdfTitle: 'PDF LOGO PDF',
    pdfLogoPdfDesc: 'Upload a PDF file, insert your logo/photo overlay on top, and download as a branded high-quality PDF.',
    addLogoTitle: 'Add Logo (Only Image)',
    addLogoDesc: 'Personalize your image files. Drag, resize, and rotate any logo onto your documents with transparency controls.',
    
    fastBadge: 'Fast',
    hqRenderBadge: 'HQ Render',
    newModeBadge: 'New Mode',
    editorBadge: 'Editor',
    activeBadge: 'ACTIVE',
    offBadge: 'OFF',

    back: 'Back',
    browseFiles: 'Browse Files',
    clearAll: 'Clear All',
    convertToPdf: 'Convert to PDF',
    converting: 'Converting...',
    selectBaseFile: 'Upload Base File (PDF or Image)',
    selectLogo: 'Upload Logo / Watermark (PNG)',
    logoControls: 'Logo Layer Settings',
    scale: 'Scale / Size',
    rotation: 'Rotation',
    opacity: 'Opacity',
    downloadFinalPhoto: 'Download Final Photo',
    downloadFinalPdf: 'Download Branded PDF (PDF LOGO PDF)',
    optionalCurrentPage: 'Download Current Page as Image (Optional)',
    dragDropOrClick: 'Drag & drop photos or click to select',
    dragDropLogoOrClick: 'Drag & drop your overlay image (PNG) or click to browse',
    selectedPhotos: 'Selected Photos',
    fitPageSize: 'Fit Page Size (Responsive)',
    a4Size: 'A4 Size (Strict)',
    usLetter: 'US Letter (Strict)',
    pdfToPhotoBtn: 'Convert PDF to Photos',
    downloadZip: 'Download All Pages as ZIP',
    extracting: 'Extracting pages, please wait...',
    quality: 'Render Quality',
    highQuality: 'High Quality (300 DPI - Crisp)',
    standardQuality: 'Standard (150 DPI - Balanced)',
    lowQuality: 'Low Quality (75 DPI - Compact)',
    dropPdfHere: 'Drag & drop your PDF file or click to browse',
    page: 'Page',
    logoAddedSuccess: 'Logo applied successfully!',
    pdfLoadError: 'Could not load PDF. Please make sure the file is valid.'
  },
  bn: {
    appName: 'পিডিএফ ফটো',
    appSubtitle: 'কনভার্টার প্রো',
    premiumMember: 'প্রিমিয়াম মেম্বার',
    welcomeUser: 'স্বাগতম, ব্যবহারকারী',
    welcomeSubtitle: 'আজ আপনি কি দিয়ে কাজ করতে চান?',
    advancedLogoMode: 'এডভান্সড লগো মোড • কাস্টম ব্র্যান্ড',
    advancedLogoDesc: 'পিডিএফ ও ইমেজে নিজস্ব লোগো সংযুক্ত করতে টিক দিন',
    
    photoToPdfTitle: 'ফটো টু পিডিএফ (Photo to PDF)',
    photoToPdfDesc: 'এক বা একাধিক ছবি নির্বাচন করে তৎক্ষণাৎ শেয়ারযোগ্য হাই-কোয়ালিটি পিডিএফ ডকুমেন্টে রূপান্তর করুন।',
    pdfToPhotoTitle: 'পিডিএফ টু ফটো (PDF to Photo)',
    pdfToPhotoDesc: 'পিডিএফ-এর পেজগুলোকে হাই-রেজোলিউশন ছবিতে রূপান্তর করুন। সুনির্দিষ্টভাবে ছবি বের করে সেরা কোয়ালিটিতে সেভ করুন।',
    pdfLogoPdfTitle: 'পিডিএফ লোগো পিডিএফ (PDF LOGO PDF)',
    pdfLogoPdfDesc: 'পিডিএফ ফাইল আপলোড করে তার ওপর লোগো/ফটো যোগ করে সরাসরি ব্র্যান্ডেড পিডিএফ হিসেবে ডাউনলোড করুন।',
    addLogoTitle: 'লোগো এড করুন (শুধুমাত্র ইমেজ)',
    addLogoDesc: 'আপনার ইমেজ ফাইলগুলোতে নিজস্ব লোগো যুক্ত করুন। ট্রান্সপারেন্সি কন্ট্রোল সহ লোগো ড্র্যাগ, রিসাইজ এবং রোটেট করুন।',
    
    fastBadge: 'দ্রুত',
    hqRenderBadge: 'এইচকিউ রেন্ডার',
    newModeBadge: 'নতুন মোড',
    editorBadge: 'এডিটর',
    activeBadge: 'সক্রিয়',
    offBadge: 'বন্ধ',

    back: 'ফিরুন',
    browseFiles: 'ফাইল ব্রাউজ করুন',
    clearAll: 'সব ফাইল মুছুন',
    convertToPdf: 'পিডিএফে রূপান্তর করুন',
    converting: 'রূপান্তর করা হচ্ছে...',
    selectBaseFile: 'প্রধান ফাইল আপলোড করুন (PDF বা ইমেজ)',
    selectLogo: 'লোগো/ওয়াটারমার্ক আপলোড করুন (PNG)',
    logoControls: 'লোগো লেয়ার সেটিংস',
    scale: 'স্কেল / সাইজ',
    rotation: 'ঘূর্ণন (Rotation)',
    opacity: 'স্বচ্ছতা (Opacity)',
    downloadFinalPhoto: 'ফাইনাল ফটো ডাউনলোড করুন',
    downloadFinalPdf: 'ফাইনাল পিডিএফ ডাউনলোড করুন (ডাউনলোড ফাইনাল PDF)',
    optionalCurrentPage: 'বর্তমান পেজটি ইমেজ হিসেবে ডাউনলোড করুন (ঐচ্ছিক)',
    dragDropOrClick: 'ফটো এখানে ড্রপ করুন অথবা সিলেক্ট করতে ক্লিক করুন',
    dragDropLogoOrClick: 'ওভারলে পিএনজি (PNG) ইমেজ ড্রপ করুন অথবা ব্রাউজ করতে ক্লিক করুন',
    selectedPhotos: 'নির্বাচিত ফটোগুলো',
    fitPageSize: 'পেজ সাইজ ফিট করুন (রেসপন্সিভ)',
    a4Size: 'A4 সাইজ (কঠোর নিয়ম)',
    usLetter: 'ইউএস লেটার (কঠোর নিয়ম)',
    pdfToPhotoBtn: 'পিডিএফ থেকে ফটো রূপান্তর করুন',
    downloadZip: 'সবগুলো পেজ জিপ (ZIP) আকারে ডাউনলোড করুন',
    extracting: 'পেজগুলো নিষ্কাশন করা হচ্ছে, দয়া করে অপেক্ষা করুন...',
    quality: 'রেন্ডার কোয়ালিটি',
    highQuality: 'উচ্চ মান (300 DPI - ক্রিস্প)',
    standardQuality: 'স্বাভাবিক (150 DPI - ব্যালেন্সড)',
    lowQuality: 'কম মান (75 DPI - কম্প্যাক্ট)',
    dropPdfHere: 'আপনার পিডিএফ ফাইলটি এখানে ড্রপ করুন অথবা ব্রাউজ করুন',
    page: 'পৃষ্ঠা',
    logoAddedSuccess: 'লোগো সফলভাবে যুক্ত করা হয়েছে!',
    pdfLoadError: 'পিডিএফ লোড করা সম্ভব হয়নি। দয়া করে সঠিক ফাইল দিন।'
  },
  fa: {
    appName: 'پی‌دی‌اف عکس',
    appSubtitle: 'مبدل حرفه‌ای',
    premiumMember: 'عضویت ویژه Premium',
    welcomeUser: 'خوش آمدید، کاربر عزیز',
    welcomeSubtitle: 'امروز می‌خواهید چه چیزی بسازید؟',
    advancedLogoMode: 'حالت پیشرفته لوگو • برند سفارشی',
    advancedLogoDesc: 'برای اعمال لوگو یا واترمارک اختصاصی روی پی‌دی‌اف و عکس‌ها تیک بزنید',
    
    photoToPdfTitle: 'عکس به پی‌دی‌اف',
    photoToPdfDesc: 'یک یا چند عکس را انتخاب کرده و فوراً آن‌ها را به یک سند پی‌دی‌اف با کیفیت بالا برای اشتراک‌گذاری تبدیل کنید.',
    pdfToPhotoTitle: 'پی‌دی‌اف به عکس',
    pdfToPhotoDesc: 'صفحات پی‌دی‌اف را به تصاویر با وضوح بالا تبدیل نمایید. محتوای بصری را با دقت استخراج و با کیفیت فوق‌العاده ذخیره کنید.',
    pdfLogoPdfTitle: 'پی‌دی‌اف لوگو پی‌دی‌اف',
    pdfLogoPdfDesc: 'فایل پی‌دی‌اف را آپلود کنید، لوگو یا تصویر همپوشان خود را روی آن قرار دهید و به عنوان پی‌دی‌اف اختصاصی برند دانلود کنید.',
    addLogoTitle: 'افزودن لوگو (فقط تصویر/عکس)',
    addLogoDesc: 'تصاویر خود را شخصی‌سازی کنید. هر لوگویی را با کنترل‌های شفافیت روی اسناد خود بکشید، تغییر اندازه دهید و بچرخانید.',
    
    fastBadge: 'سریع',
    hqRenderBadge: 'رندر بالا HQ',
    newModeBadge: 'حالت جدید',
    editorBadge: 'ویرایشگر',
    activeBadge: 'فعال',
    offBadge: 'غیرفعال',

    back: 'بازگشت',
    browseFiles: 'مرور فایل‌ها',
    clearAll: 'پاک کردن همه',
    convertToPdf: 'تبدیل به پی‌دی‌اف',
    converting: 'در حال تبدیل...',
    selectBaseFile: 'آپلود فایل اصلی (PDF یا تصویر)',
    selectLogo: 'آپلود لوگو / واترمارک (PNG)',
    logoControls: 'تنظیمات لایه لوگو',
    scale: 'مقیاس / اندازه',
    rotation: 'چرخش لوگو',
    opacity: 'شفافیت / وضوح',
    downloadFinalPhoto: 'دانلود عکس نهایی',
    downloadFinalPdf: 'دانلود پی‌دی‌اف نهایی (دانلود فاینال PDF)',
    optionalCurrentPage: 'دانلود صفحه فعلی به عنوان عکس (اختیاری)',
    dragDropOrClick: 'عکس‌ها را به اینجا بکشید یا برای انتخاب کلیک کنید',
    dragDropLogoOrClick: 'عکس رویی (PNG) را به اینجا بکشید یا برای مرور کلیک کنید',
    selectedPhotos: 'عکس‌های انتخاب شده',
    fitPageSize: 'هم‌اندازه کردن صفحه (واکنش‌گرا)',
    a4Size: 'اندازه A4 (دقیق)',
    usLetter: 'اندازه نامه آمریکا Letter',
    pdfToPhotoBtn: 'تبدیل پی‌دی‌اف به تصاویر',
    downloadZip: 'دانلود همه صفحات به صورت ZIP',
    extracting: 'در حال استخراج صفحات، لطفاً شکیبا باشید...',
    quality: 'کیفیت رندر صفحه',
    highQuality: 'کیفیت عالی (300 DPI - بسیار شفاف)',
    standardQuality: 'استاندارد (150 DPI - متوازن)',
    lowQuality: 'کیفیت پایین (75 DPI - فشرده)',
    dropPdfHere: 'فایل پی‌دی‌اف خود را به اینجا بکشید یا برای مرور کلیک کنید',
    page: 'صفحه',
    logoAddedSuccess: 'لوگو با موفقیت اعمال شد!',
    pdfLoadError: 'خطا در بارگذاری پی‌دی‌اف. لطفاً از صحت فایل اطمینان حاصل کنید.'
  },
  hi: {
    appName: 'पीडीएफ फोटो',
    appSubtitle: 'कनवर्टर प्रो',
    premiumMember: 'प्रीमियम सदस्य',
    welcomeUser: 'स्वागत है, उपयोगकर्ता',
    welcomeSubtitle: 'आज आप क्या बनाना चाहेंगे?',
    advancedLogoMode: 'उन्नत लोगो मोड • कस्टम ब्रांड',
    advancedLogoDesc: 'पीडीएफ और छवियों पर निजी लोगो/वॉटरमार्क जोड़ने के लिए टिक करें',
    
    photoToPdfTitle: 'फोटो से पीडीएफ (Photo to PDF)',
    photoToPdfDesc: 'एक या अधिक फ़ोटो चुनें और उन्हें साझा करने के लिए तुरंत उच्च-गुणवत्ता वाले पीडीएफ दस्तावेज़ में बदलें।',
    pdfToPhotoTitle: 'पीडीएफ से फोटो (PDF to Photo)',
    pdfToPhotoDesc: 'पीडीएफ पृष्ठों को उच्च-रिज़ॉल्यूशन छवियों में बदलें। सटीक रूप से विज़ुअल सामग्री निकालें और सर्वोत्तम गुणवत्ता में सहेजें।',
    pdfLogoPdfTitle: 'पीडीएफ लोगो पीडीएफ (PDF LOGO PDF)',
    pdfLogoPdfDesc: 'एक पीडीएफ फाइल अपलोड करें, उसके ऊपर अपना लोगो/फोटो जोड़ें, और सीधे ब्रांडेड पीडीएफ के रूप में डाउनलोड करें।',
    addLogoTitle: 'लोगो जोड़ें (केवल छवि)',
    addLogoDesc: 'अपनी छवि फ़ाइलों को व्यक्तिगत बनाएं। पारदर्शिता सेटिंग्स के साथ दस्तावेजों पर लोगो खींचें, आकार बदलें और घुमाएं।',
    
    fastBadge: 'तेज़',
    hqRenderBadge: 'HQ रेंडर',
    newModeBadge: 'नया मोड',
    editorBadge: 'संपादक',
    activeBadge: 'सक्रिय',
    offBadge: 'बंद',

    back: 'वापस जाएं',
    browseFiles: 'फ़ाइलें ढूंढें',
    clearAll: 'सभी हटाएं',
    convertToPdf: 'पीडीएफ में बदलें',
    converting: 'बदला जा रहा है...',
    selectBaseFile: 'मुख्य फ़ाइल अपलोड करें (PDF या छवि)',
    selectLogo: 'लोगो/वॉटरमार्क अपलोड करें (PNG)',
    logoControls: 'लोगो परत सेटिंग्स',
    scale: 'पैमाना / आकार',
    rotation: 'रोटेशन / घुमाव',
    opacity: 'पारदर्शिता',
    downloadFinalPhoto: 'अंतिम फोटो डाउनलोड करें',
    downloadFinalPdf: 'अंतिम पीडीएफ डाउनलोड करें (डालउनलोड फाइनल PDF)',
    optionalCurrentPage: 'वर्तमान पृष्ठ को छवि के रूप में डाउनलोड करें (वैकल्पिक)',
    dragDropOrClick: 'फ़ोटो को यहाँ खींचें या चुनने के लिए यहाँ क्लिक करें',
    dragDropLogoOrClick: 'ओवरले पीएनजी (PNG) छवि यहाँ खींचें या चुनने के लिए क्लिक करें',
    selectedPhotos: 'चयनित तस्वीरें',
    fitPageSize: 'पेज साइज फिट करें (उत्तरदायी)',
    a4Size: 'A4 आकार (कठोर नियम)',
    usLetter: 'यूएस लेटर (कठोर नियम)',
    pdfToPhotoBtn: 'पीडीएफ को फोटो में बदलें',
    downloadZip: 'सभी पृष्ठों को जिप (ZIP) के रूप में डाउनलोड करें',
    extracting: 'पन्नों को निकाला जा रहा है, कृपया प्रतीक्षा करें...',
    quality: 'रेंडर गुणवत्ता',
    highQuality: 'उच्च गुणवत्ता (300 DPI - स्पष्ट)',
    standardQuality: 'मानक (150 DPI - संतुलित)',
    lowQuality: 'कम गुणवत्ता (75 DPI - कॉम्पैक्ट)',
    dropPdfHere: 'अपनी पीडीएफ फाइल को यहां खींचें या ब्राउज़ करें',
    page: 'पृष्ठ',
    logoAddedSuccess: 'लोगो सफलतापूर्वक जोड़ा गया!',
    pdfLoadError: 'पीडीएफ लोड नहीं किया जा सका। कृपया जांचें कि फ़ाइल सही है।'
  }
};

// Global subscription list for reactive changes
const listeners = new Set<(lang: LanguageCode) => void>();
let currentLanguage: LanguageCode = (localStorage.getItem('app-lang') as LanguageCode) || 'en';

export function getLanguage(): LanguageCode {
  return currentLanguage;
}

export function setLanguage(lang: LanguageCode) {
  if (translations[lang]) {
    currentLanguage = lang;
    localStorage.setItem('app-lang', lang);
    listeners.forEach((listener) => listener(lang));
  }
}

export function useTranslation() {
  const [lang, setLangState] = useState<LanguageCode>(currentLanguage);

  useEffect(() => {
    const handleLanguageChange = (newLang: LanguageCode) => {
      setLangState(newLang);
    };
    listeners.add(handleLanguageChange);
    return () => {
      listeners.delete(handleLanguageChange);
    };
  }, []);

  return {
    t: translations[lang],
    lang,
    setLanguage
  };
}
