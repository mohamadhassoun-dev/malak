import React, { useState } from 'react';
import {
  Sliders,
  Save,
  X,
  Camera,
  RefreshCw,
  Palette,
  DollarSign,
  Building2,
  Check,
  Layout,
  Image as ImageIcon,
  Flame,
  FileText,
  Printer,
  Sparkles,
  AlertTriangle,
  Receipt
} from 'lucide-react';
import { CompanyProfile } from '../types';
import { DEFAULT_COMPANY, DEFAULT_LOGO, HERO_IMAGE } from '../data/defaultData';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyProfile;
  onSaveCompany: (updated: CompanyProfile) => void;
  onResetDefaults: () => void;
}

// Color Presets for one-click styling
const COLOR_PRESETS = [
  {
    name: 'العنابي الملكي (الأصلي)',
    primary: '#881337',
    primaryHover: '#700f2d',
    btn: '#be123c',
    btnHover: '#9f1239',
    btnText: '#ffffff',
    accent: '#f59e0b',
    announcement: '#881337'
  },
  {
    name: 'الزمردي الدمشقي الفاخر',
    primary: '#065f46',
    primaryHover: '#044e39',
    btn: '#059669',
    btnHover: '#047857',
    btnText: '#ffffff',
    accent: '#fbbf24',
    announcement: '#064e3b'
  },
  {
    name: 'لهيب الفرن الحجري (البرتقالي)',
    primary: '#9a3412',
    primaryHover: '#7c2d12',
    btn: '#ea580c',
    btnHover: '#c2410c',
    btnText: '#ffffff',
    accent: '#facc15',
    announcement: '#7c2d12'
  },
  {
    name: 'الكحلي الإمبراطوري',
    primary: '#1e3a8a',
    primaryHover: '#172554',
    btn: '#2563eb',
    btnHover: '#1d4ed8',
    btnText: '#ffffff',
    accent: '#f59e0b',
    announcement: '#1e3a8a'
  },
  {
    name: 'الأسود الملكي والذهب',
    primary: '#1c1917',
    primaryHover: '#0c0a09',
    btn: '#d97706',
    btnHover: '#b45309',
    btnText: '#ffffff',
    accent: '#f59e0b',
    announcement: '#1c1917'
  },
  {
    name: 'القهوة العربي والموكا',
    primary: '#451a03',
    primaryHover: '#2d1102',
    btn: '#78350f',
    btnHover: '#5b260b',
    btnText: '#ffffff',
    accent: '#fcd34d',
    announcement: '#3f1503'
  }
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  company,
  onSaveCompany,
  onResetDefaults,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'colors' | 'receipt' | 'header' | 'hero' | 'footer'>('general');

  // General settings
  const [name, setName] = useState(company.name);
  const [subName, setSubName] = useState(company.subName);
  const [phone, setPhone] = useState(company.phone);
  const [whatsappPhone, setWhatsappPhone] = useState(company.whatsappPhone);
  const [address, setAddress] = useState(company.address);
  const [city, setCity] = useState(company.city);
  const [country, setCountry] = useState(company.country);
  const [taxNumber, setTaxNumber] = useState(company.taxNumber);
  const [establishmentYear, setEstablishmentYear] = useState(company.establishmentYear || '1998');
  const [usdRate, setUsdRate] = useState(company.usdRate.toString());
  const [logo, setLogo] = useState(company.logo);

  // Colors & Theme System
  const [primaryColor, setPrimaryColor] = useState(company.primaryColor || '#881337');
  const [primaryHoverColor, setPrimaryHoverColor] = useState(company.primaryHoverColor || '#700f2d');
  const [btnColor, setBtnColor] = useState(company.btnColor || '#be123c');
  const [btnHoverColor, setBtnHoverColor] = useState(company.btnHoverColor || '#9f1239');
  const [btnTextColor, setBtnTextColor] = useState(company.btnTextColor || '#ffffff');
  const [accentColor, setAccentColor] = useState(company.accentColor || '#f59e0b');
  const [announcementBgColor, setAnnouncementBgColor] = useState(company.announcementBgColor || '#881337');

  // Dedicated Receipt & Z-Report settings
  const [receiptLogo, setReceiptLogo] = useState(company.receiptLogo || company.logo || DEFAULT_LOGO);
  const [showReceiptLogo, setShowReceiptLogo] = useState(company.showReceiptLogo !== false);
  const [receiptHeaderNote, setReceiptHeaderNote] = useState(company.receiptHeaderNote || 'أشهى صفيحة طرابلسية على الحطب');
  const [receiptFooterNote, setReceiptFooterNote] = useState(company.receiptFooterNote || 'شكراً لزيارتكم ونتمنى لكم وجبة شهية!');

  // Header settings
  const [announcementText, setAnnouncementText] = useState(company.announcementText || '');
  const [headerTagline, setHeaderTagline] = useState(company.headerTagline || `طرابلس - تأسيس ${company.establishmentYear || '1998'}`);
  const [headerOnlineBadge, setHeaderOnlineBadge] = useState(company.headerOnlineBadge || 'قائمة الطلب المباشر أونلاين عبر الواتساب');

  // Hero settings
  const [heroBadge, setHeroBadge] = useState(company.heroBadge || `أصالة المذاق الطرابلسي منذ عام ${company.establishmentYear || '1998'}`);
  const [heroTitle, setHeroTitle] = useState(company.heroTitle || 'أشهى صفيحة طرابلسية طازجة تُخبز على الحطب');
  const [heroSubtitle, setHeroSubtitle] = useState(company.heroSubtitle || 'عجينة مقرمشة، لحمة طازجة متبلة بأسرار التوابل العائلية، ودبس الرمان الطبيعي. استمتع بتجربة طعام أصيلة في مطعمنا أو اطلب مباشرة عبر الواتساب.');
  const [heroImage, setHeroImage] = useState(company.heroImage || HERO_IMAGE);
  const [heroCtaText, setHeroCtaText] = useState(company.heroCtaText || 'استعرض القائمة واطلب الآن');

  // Footer settings
  const [footerCopyrightText, setFooterCopyrightText] = useState(company.footerCopyrightText || `${company.name} · تأسيس ${company.establishmentYear || '1998'} · جميع الحقوق محفوظة`);
  const [footerNote, setFooterNote] = useState(company.footerNote || 'أشهى صفيحة طرابلسية على الحطب ومعجنات طازجة ومقبلات يومية');

  // Feedback states
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 250;
        if (width > height) {
          if (width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setLogo(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleReceiptLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 250;
        if (width > height) {
          if (width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setReceiptLogo(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;
        if (width > height) {
          if (width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setHeroImage(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const applyPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setPrimaryColor(preset.primary);
    setPrimaryHoverColor(preset.primaryHover);
    setBtnColor(preset.btn);
    setBtnHoverColor(preset.btnHover);
    setBtnTextColor(preset.btnText);
    setAccentColor(preset.accent);
    setAnnouncementBgColor(preset.announcement);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const rate = parseFloat(usdRate) || 89500;
    const updated: CompanyProfile = {
      ...company,
      name: name.trim() || DEFAULT_COMPANY.name,
      subName: subName.trim(),
      phone: phone.trim() || DEFAULT_COMPANY.phone,
      whatsappPhone: whatsappPhone.trim() || DEFAULT_COMPANY.whatsappPhone,
      address: address.trim(),
      city: city.trim(),
      country: country.trim(),
      taxNumber: taxNumber.trim(),
      establishmentYear: establishmentYear.trim(),
      usdRate: rate,
      logo,
      // Colors
      primaryColor,
      primaryHoverColor,
      btnColor,
      btnHoverColor,
      btnTextColor,
      accentColor,
      announcementBgColor,
      // Receipt & Report custom settings
      receiptLogo,
      showReceiptLogo,
      receiptHeaderNote: receiptHeaderNote.trim(),
      receiptFooterNote: receiptFooterNote.trim(),
      // Header, Hero, Footer
      announcementText: announcementText.trim(),
      headerTagline: headerTagline.trim(),
      headerOnlineBadge: headerOnlineBadge.trim(),
      heroBadge: heroBadge.trim(),
      heroTitle: heroTitle.trim(),
      heroSubtitle: heroSubtitle.trim(),
      heroImage: heroImage.trim() || HERO_IMAGE,
      heroCtaText: heroCtaText.trim(),
      footerCopyrightText: footerCopyrightText.trim(),
      footerNote: footerNote.trim()
    };

    onSaveCompany(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleExecuteReset = () => {
    onResetDefaults();
    setShowResetConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 text-right space-y-4 max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950 text-[#881337] dark:text-rose-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-stone-900 dark:text-stone-50">
                لوحة تخصيص النظام، الألوان، الشعار والطباعة
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 font-medium">
                تعديل الألوان، شعار الفاتورة، تفاصيل المنشأة والواجهة بواقعية وسهولة تامة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-900 dark:hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'general'
                ? 'bg-[#881337] text-white shadow-sm'
                : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>بيانات المنشأة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('colors')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'colors'
                ? 'bg-[#881337] text-white shadow-sm'
                : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>نظام الألوان والمظهر</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('receipt')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'receipt'
                ? 'bg-[#881337] text-white shadow-sm'
                : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>شعار الفاتورة والتقرير</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('header')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'header'
                ? 'bg-[#881337] text-white shadow-sm'
                : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>الهيدر والشعار</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hero')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'hero'
                ? 'bg-[#881337] text-white shadow-sm'
                : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>الهيرو والغلاف</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('footer')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'footer'
                ? 'bg-[#881337] text-white shadow-sm'
                : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>الفوتر</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs font-bold flex-grow overflow-y-auto pr-1">
          {/* TAB 1: General Company Profile & Finance */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 mb-1">اسم المطعم / المنشأة:</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-black text-sm"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 mb-1">الوصف المختصر:</label>
                  <input
                    type="text"
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 mb-1">رقم هاتف الاتصال (يفتح اتصال مباشر للزبون):</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 mb-1">رقم الواتساب (يفتح محادثة واتساب فورية):</label>
                  <input
                    type="tel"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    placeholder="مثال: 9613416224"
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 mb-1">المدينة:</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 mb-1">العنوان بالتفصيل:</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 mb-1">سنة التأسيس:</label>
                  <input
                    type="text"
                    value={establishmentYear}
                    onChange={(e) => setEstablishmentYear(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                <label className="block text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                  <span>سعر صرف الدولار المعتمد في الحسابات والفواتير (ل.ل):</span>
                </label>
                <input
                  type="number"
                  value={usdRate}
                  onChange={(e) => setUsdRate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-50 font-black text-base"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Coloring & Theme Customization System */}
          {activeTab === 'colors' && (
            <div className="space-y-4">
              {/* Presets */}
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2">
                <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>نماذج ألوان جاهزة بنقرة واحدة (Color Presets):</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COLOR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-amber-500 transition text-right text-[11px] font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-stone-300 shrink-0"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <span className="truncate text-stone-800 dark:text-stone-200">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed Color Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Primary Brand Color */}
                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                  <label className="block text-stone-700 dark:text-stone-300 mb-1.5 font-bold">
                    اللون الأساسي للعلامة والهيدر:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                {/* 2. Primary Hover Color */}
                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                  <label className="block text-stone-700 dark:text-stone-300 mb-1.5 font-bold">
                    لون الهيدر عند التمرير (Primary Hover):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryHoverColor}
                      onChange={(e) => setPrimaryHoverColor(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={primaryHoverColor}
                      onChange={(e) => setPrimaryHoverColor(e.target.value)}
                      className="flex-1 p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                {/* 3. Action Buttons Color */}
                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                  <label className="block text-stone-700 dark:text-stone-300 mb-1.5 font-bold">
                    لون الأزرار وإجراءات الطلب (Action Buttons):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={btnColor}
                      onChange={(e) => setBtnColor(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={btnColor}
                      onChange={(e) => setBtnColor(e.target.value)}
                      className="flex-1 p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                {/* 4. Action Buttons Hover */}
                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                  <label className="block text-stone-700 dark:text-stone-300 mb-1.5 font-bold">
                    لون الأزرار عند تمرير الماوس (Button Hover):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={btnHoverColor}
                      onChange={(e) => setBtnHoverColor(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={btnHoverColor}
                      onChange={(e) => setBtnHoverColor(e.target.value)}
                      className="flex-1 p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                {/* 5. Button Text Color */}
                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                  <label className="block text-stone-700 dark:text-stone-300 mb-1.5 font-bold">
                    لون نصوص الأزرار (Button Text Color):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={btnTextColor}
                      onChange={(e) => setBtnTextColor(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={btnTextColor}
                      onChange={(e) => setBtnTextColor(e.target.value)}
                      className="flex-1 p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                {/* 6. Accent Gold / Highlights */}
                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                  <label className="block text-stone-700 dark:text-stone-300 mb-1.5 font-bold">
                    لون التمييز والشارات والعروض (Accent Color):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="flex-1 p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono text-xs uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview of Selected Theme */}
              <div className="p-4 rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 space-y-3">
                <span className="text-[11px] font-bold text-stone-500 block">معاينة حية للمظهر الجديد:</span>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    style={{ backgroundColor: btnColor, color: btnTextColor }}
                    className="px-4 py-2 rounded-xl font-black text-xs shadow-md transition"
                  >
                    زر تجريبي رئيسي
                  </button>

                  <span
                    style={{ backgroundColor: accentColor + '25', color: accentColor, borderColor: accentColor + '50' }}
                    className="px-3 py-1 rounded-full text-xs font-black border"
                  >
                    شارة تمييز وعروض
                  </span>

                  <span
                    style={{ color: primaryColor }}
                    className="font-black text-sm"
                  >
                    نص ملون بالعلامة التجارية
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Custom Receipt & Report Settings */}
          {activeTab === 'receipt' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-stone-900 dark:text-stone-100 font-bold flex items-center gap-1.5">
                    <Printer className="w-4 h-4 text-emerald-600" />
                    <span>شعار الفواتير والتقارير الحرارية (Receipt & Z-Report Logo):</span>
                  </label>
                  <label className="px-3 py-1.5 rounded-xl bg-[#881337] text-white hover:bg-[#700f2d] cursor-pointer flex items-center gap-1.5 text-xs font-bold">
                    <Camera className="w-3.5 h-3.5" />
                    <span>رفع شعار خاص للفاتورة</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-4">
                  {/* Receipt Logo Thumbnail Preview */}
                  <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-600 flex items-center justify-center p-2 bg-white shrink-0 shadow-xs">
                    {receiptLogo ? (
                      <img
                        src={receiptLogo}
                        alt="شعار الفاتورة"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-stone-400 text-center">لا يوجد شعار</span>
                    )}
                  </div>

                  <div className="space-y-2 flex-grow">
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800 dark:text-stone-200">
                        <input
                          type="checkbox"
                          checked={showReceiptLogo}
                          onChange={(e) => setShowReceiptLogo(e.target.checked)}
                          className="w-4 h-4 rounded text-rose-600 cursor-pointer"
                        />
                        <span>طباعة الشعار على الفواتير وتقارير الإغلاق اليومي</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setReceiptLogo(logo)}
                        className="px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-300 font-bold text-[11px] cursor-pointer"
                      >
                        استخدام نفس الشعار الرئيسي
                      </button>
                      <button
                        type="button"
                        onClick={() => setReceiptLogo(DEFAULT_LOGO)}
                        className="px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-300 font-bold text-[11px] cursor-pointer"
                      >
                        الشعار الافتراضي
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 dark:text-stone-300 mb-1">
                  جملة رأس الفاتورة الحرارية (Receipt Header Note):
                </label>
                <input
                  type="text"
                  value={receiptHeaderNote}
                  onChange={(e) => setReceiptHeaderNote(e.target.value)}
                  placeholder="مثال: أشهى صفيحة طرابلسية على الحطب"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-stone-700 dark:text-stone-300 mb-1">
                  جملة نهاية الفاتورة والتقرير (Receipt Footer Note):
                </label>
                <input
                  type="text"
                  value={receiptFooterNote}
                  onChange={(e) => setReceiptFooterNote(e.target.value)}
                  placeholder="مثال: شكراً لزيارتكم ونتمنى لكم وجبة شهية!"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              {/* Thermal preview badge */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-xs">
                ✅ متوافق 100% مع الطابعات الحرارية قياس <strong>80mm و 72mm</strong> (Xprinter, Bixolon, Epson, Rongta) وبلوتوث / USB.
              </div>
            </div>
          )}

          {/* TAB 4: Header Customization */}
          {activeTab === 'header' && (
            <div className="space-y-4">
              {/* Logo preview and upload */}
              <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                <div className="relative group w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400 shadow bg-white shrink-0">
                  <img src={logo} alt="شعار" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1.5 flex-grow">
                  <div className="text-stone-900 dark:text-stone-100 font-bold">
                    شعار المطعم الرسمي (Header Logo):
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="px-3 py-1.5 rounded-xl bg-[#881337] text-white hover:bg-[#700f2d] cursor-pointer flex items-center gap-1.5 font-bold">
                      <Camera className="w-3.5 h-3.5" />
                      <span>رفع شعار جديد</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setLogo(DEFAULT_LOGO)}
                      className="px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-300 font-bold cursor-pointer"
                    >
                      استعادة الافتراضي
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 dark:text-stone-300 mb-1">
                  شريط الإعلانات الترحيبي العريض أعلى الموقع:
                </label>
                <input
                  type="text"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="مثال: 🔥 صفيحة طازجة تُخبز يومياً على الحطب - خدمة التوصيل متوفرة!"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 mb-1">
                    الشعار النصي أسفل الاسم في الهيدر (Tagline):
                  </label>
                  <input
                    type="text"
                    value={headerTagline}
                    onChange={(e) => setHeaderTagline(e.target.value)}
                    placeholder="مثال: طرابلس - تأسيس 1998"
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 mb-1">
                    شارة الطلب الأونلاين للزبائن (Online Badge):
                  </label>
                  <input
                    type="text"
                    value={headerOnlineBadge}
                    onChange={(e) => setHeaderOnlineBadge(e.target.value)}
                    placeholder="مثال: قائمة الطلب المباشر أونلاين عبر الواتساب"
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Hero Customization */}
          {activeTab === 'hero' && (
            <div className="space-y-4">
              <div>
                <label className="block text-stone-700 dark:text-stone-300 mb-1">
                  شارة الهيرو العلوية (Hero Badge):
                </label>
                <input
                  type="text"
                  value={heroBadge}
                  onChange={(e) => setHeroBadge(e.target.value)}
                  placeholder="مثال: أصالة المذاق الطرابلسي منذ عام 1998"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-stone-700 dark:text-stone-300 mb-1">
                  عنوان الهيرو الرئيسي الكبير (Hero Title):
                </label>
                <input
                  type="text"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="مثال: أشهى صفيحة طرابلسية طازجة تُخبز على الحطب"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm font-black"
                />
              </div>

              <div>
                <label className="block text-stone-700 dark:text-stone-300 mb-1">
                  الوصف التفصيلي الجذاب (Hero Subtitle):
                </label>
                <textarea
                  rows={3}
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="اكتب وصفاً شهياً لجذب الزبائن..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-stone-700 dark:text-stone-300 mb-1">
                  نص زر الطلب السريع (Hero CTA Button):
                </label>
                <input
                  type="text"
                  value={heroCtaText}
                  onChange={(e) => setHeroCtaText(e.target.value)}
                  placeholder="مثال: استعرض القائمة واطلب الآن"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              {/* Hero Image Selector & Upload */}
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-stone-900 dark:text-stone-100 font-bold flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                    <span>صورة غلاف الهيرو (Hero Background Image):</span>
                  </label>
                  <label className="px-3 py-1.5 rounded-xl bg-[#881337] text-white hover:bg-[#700f2d] cursor-pointer flex items-center gap-1.5 text-xs font-bold">
                    <Camera className="w-3.5 h-3.5" />
                    <span>رفع صورة من الجهاز</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHeroImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <input
                  type="text"
                  value={heroImage}
                  onChange={(e) => setHeroImage(e.target.value)}
                  placeholder="أدخل رابط صورة مباشر أو ارفع ملف من جهازك"
                  className="w-full p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono text-[11px]"
                />

                {/* Hero Preview Thumbnail */}
                <div className="relative h-28 rounded-xl overflow-hidden border border-stone-300 dark:border-stone-700">
                  <img
                    src={heroImage}
                    alt="معاينة الهيرو"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-stone-950/40 flex items-center justify-center">
                    <span className="text-white text-xs font-black bg-stone-900/70 px-3 py-1 rounded-md">
                      معاينة حية لصورة الغلاف
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Footer Customization */}
          {activeTab === 'footer' && (
            <div className="space-y-4">
              <div>
                <label className="block text-stone-700 dark:text-stone-300 mb-1">
                  نص حقوق النشر الرئيسي في الفوتر (Copyright Text):
                </label>
                <input
                  type="text"
                  value={footerCopyrightText}
                  onChange={(e) => setFooterCopyrightText(e.target.value)}
                  placeholder="مثال: ملك الصفيحة زكرياعروب · تأسيس 1998 · جميع الحقوق محفوظة"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-stone-700 dark:text-stone-300 mb-1">
                  شعار أو جملة إضافية ترويجية في الفوتر (Footer Slogan / Note):
                </label>
                <input
                  type="text"
                  value={footerNote}
                  onChange={(e) => setFooterNote(e.target.value)}
                  placeholder="مثال: أشهى صفيحة طرابلسية على الحطب ومعجنات طازجة يومياً"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200">
                💡 <strong>ملاحظة:</strong> أرقام الهاتف والواتساب والعنوان المدخلة في تبويب «بيانات المنشأة» تظهر تلقائياً كروابط مباشرة للاتصال والمحادثة في الفوتر.
              </div>
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="px-3 py-2 rounded-xl text-stone-500 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400 transition font-bold cursor-pointer"
            >
              استعادة الافتراضيات
            </button>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#881337] hover:bg-[#700f2d] text-white font-black shadow flex items-center gap-2 cursor-pointer transition active:scale-95"
              >
                {savedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
                <span>{savedSuccess ? 'تم الحفظ وتطبيق التغييرات!' : 'حفظ التعديلات'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold hover:bg-stone-300 dark:hover:bg-stone-700 cursor-pointer transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </form>

        {/* Reset Confirmation In-App Dialog */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs">
            <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 dark:border-stone-800 text-right space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-stone-900 dark:text-stone-50">
                    استعادة الإعدادات الأصلية
                  </h4>
                  <p className="text-xs text-stone-500">
                    هل تريد استعادة جميع إعدادات النظام والألوان والشعار الافتراضية؟
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleExecuteReset}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs cursor-pointer"
                >
                  نعم، استعادة
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="py-2 px-3 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs cursor-pointer hover:bg-stone-300"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
