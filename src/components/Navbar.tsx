import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Sun,
  Moon,
  Database,
  Sliders,
  DollarSign,
  Lock,
  Unlock,
  ShoppingBag,
  User,
  Package,
  ShieldCheck
} from 'lucide-react';
import { AppUser, CompanyProfile, CustomerAccount } from '../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  company: CompanyProfile;
  activeUser: AppUser;
  currentCustomer: CustomerAccount | null;
  onOpenLogin: (defaultTab?: 'customer_login' | 'customer_register' | 'admin_login') => void;
  onOpenCustomerAccount: () => void;
  onOpenSettings: () => void;
  onOpenSqlExport: () => void;
  onUpdateUsdRate: (rate: number) => void;
  cartCount: number;
  onOpenCartDrawer: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onSwitchToCustomer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  company,
  activeUser,
  currentCustomer,
  onOpenLogin,
  onOpenCustomerAccount,
  onOpenSettings,
  onOpenSqlExport,
  onUpdateUsdRate,
  cartCount,
  onOpenCartDrawer,
  isDarkMode,
  onToggleDarkMode,
  onSwitchToCustomer,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [liveTime, setLiveTime] = useState('');
  const [editingUsd, setEditingUsd] = useState(false);
  const [tempRate, setTempRate] = useState(company.usdRate.toString());

  const isAdmin = activeUser.role === 'admin';

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString('ar-LB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Admin tabs (Unified All-in-One Master Console)
  const adminTabs = [
    { id: 'admin', label: 'لوحة الإدارة والمطبخ الشاملة (All-In-One)' },
    { id: 'customer', label: 'متجر الزبائن (Storefront)' },
  ];

  const handleRateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(tempRate);
    if (!isNaN(val) && val > 0) {
      onUpdateUsdRate(val);
      setEditingUsd(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      {/* Optional top announcement banner */}
      {company.announcementText && (
        <div
          style={{ backgroundColor: 'var(--announcement-bg, #881337)' }}
          className="text-amber-200 text-xs py-1.5 px-4 text-center font-bold tracking-wide overflow-hidden whitespace-nowrap shadow-xs"
        >
          <span>{company.announcementText}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 md:gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('customer')}
            className="flex items-center gap-2.5 text-right group focus:outline-none cursor-pointer"
          >
            <img
              src={company.logo}
              alt={company.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400 group-hover:scale-105 transition-transform"
            />
            <div className="leading-tight">
              <span className="block text-base sm:text-lg font-black tracking-tight text-stone-900 dark:text-stone-50 whitespace-nowrap">
                {company.name}
              </span>
              <span className="block text-[11px] text-stone-600 dark:text-stone-400 font-medium whitespace-nowrap">
                {company.headerTagline || `طرابلس - تأسيس ${company.establishmentYear}`}
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        {isAdmin ? (
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
            {adminTabs.map(tab => {
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'dynamic-bg text-white shadow-sm'
                      : 'text-stone-700 dark:text-stone-200 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-stone-700 dark:text-stone-300">
            <button
              onClick={onOpenCustomerAccount}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition cursor-pointer"
              title="تتبع طلباتك السابقة وتفاصيل حسابك"
            >
              <Package className="w-3.5 h-3.5 text-amber-500" />
              <span>{currentCustomer ? `طلباتي (${currentCustomer.name})` : 'سجل طلباتي السابقة'}</span>
            </button>
            <span className="text-[11px] text-stone-400">· الطلب متاح كـ زائر بدون حساب</span>
          </div>
        )}

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Live Clock (tablet+) */}
          <div className="hidden sm:block text-center px-2 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-[11px] font-mono text-stone-700 dark:text-stone-300 tabular-nums">
            {liveTime}
          </div>

          {/* Dollar Exchange Rate Input */}
          <div className="hidden md:flex items-center gap-1 text-xs bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700">
            <DollarSign className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-stone-500 text-[11px]">دولار:</span>
            {isAdmin && editingUsd ? (
              <form onSubmit={handleRateSubmit} className="inline-flex items-center">
                <input
                  type="number"
                  value={tempRate}
                  onChange={(e) => setTempRate(e.target.value)}
                  onBlur={handleRateSubmit}
                  autoFocus
                  className="w-16 text-center font-bold text-xs bg-white dark:bg-stone-900 border rounded px-1 py-0.5"
                />
              </form>
            ) : (
              <button
                onClick={() => isAdmin && setEditingUsd(true)}
                disabled={!isAdmin}
                className={`font-black text-stone-800 dark:text-stone-200 tabular-nums text-xs ${
                  isAdmin ? 'hover:text-[#881337] cursor-pointer' : 'cursor-default'
                }`}
                title={isAdmin ? "اضغط لتعديل سعر صرف الدولار" : "سعر الصرف المعتمد"}
              >
                {company.usdRate.toLocaleString('ar-LB')}
              </button>
            )}
          </div>

          {/* Hostinger SQL Export Tool (Admin only) */}
          {isAdmin && (
            <button
              onClick={onOpenSqlExport}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/60 transition whitespace-nowrap cursor-pointer"
              title="تصدير قاعدة بيانات SQL لـ Hostinger"
            >
              <Database className="w-3.5 h-3.5" />
              <span>قاعدة SQL</span>
            </button>
          )}

          {/* Customer Cart Drawer trigger */}
          {currentTab === 'customer' && (
            <button
              onClick={onOpenCartDrawer}
              className="relative p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-white transition cursor-pointer"
              title="سلة الطلبات"
              aria-label="سلة الطلبات"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full dynamic-btn text-[10px] font-black flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Theme switcher */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white transition cursor-pointer"
            title={isDarkMode ? "الوضع الفاتح" : "الوضع الليلي"}
            aria-label="تبديل المظهر"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings (Admin only) */}
          {isAdmin && (
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white transition cursor-pointer"
              title="إعدادات النظام والشركة"
              aria-label="إعدادات النظام والشركة"
            >
              <Sliders className="w-4 h-4" />
            </button>
          )}

          {/* AUTH & ACCOUNT BUTTON (Target of user focus CSS selector) */}
          {isAdmin ? (
            <button
              onClick={() => onOpenLogin('admin_login')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-rose-50 text-rose-800 dark:bg-rose-950/70 dark:text-rose-200 border border-rose-300 hover:bg-rose-100 transition whitespace-nowrap cursor-pointer shadow-xs"
              title="لوحة تحكم المشرف (مسجل الدخول: malak)"
            >
              <Unlock className="w-3.5 h-3.5 text-rose-600" />
              <span>وضع المشرف</span>
            </button>
          ) : currentCustomer ? (
            <button
              onClick={onOpenCustomerAccount}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition whitespace-nowrap cursor-pointer shadow-xs"
              title={`حساب الزبون: ${currentCustomer.name} · استعراض الطلبات`}
            >
              <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{currentCustomer.name.split(' ')[0]} (حسابي)</span>
            </button>
          ) : (
            <button
              onClick={() => onOpenLogin('customer_login')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-xs transition whitespace-nowrap cursor-pointer"
              title="تسجيل الدخول للزبائن أو المشرف"
            >
              <User className="w-3.5 h-3.5" />
              <span>تسجيل الدخول</span>
            </button>
          )}

          {/* Dedicated Admin Portal Direct Button if in customer view */}
          {!isAdmin && (
            <button
              onClick={() => onOpenLogin('admin_login')}
              className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
              title="دخول المشرف (malak / M@lAk1998)"
              aria-label="دخول المشرف"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Mobile Hamburger (Only in Admin mode) */}
          {isAdmin && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white cursor-pointer"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu for Admin */}
      {isAdmin && mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 py-3 space-y-2">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-stone-100 dark:border-stone-800">
            {adminTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  onSelectTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2 text-xs font-bold rounded-xl text-right transition cursor-pointer ${
                  currentTab === tab.id
                    ? 'dynamic-bg text-white shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              onClick={() => {
                onOpenSqlExport();
                setMobileMenuOpen(false);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 rounded-lg font-bold"
            >
              <Database className="w-3.5 h-3.5" />
              <span>تصدير Hostinger SQL</span>
            </button>

            <button
              onClick={() => {
                onOpenSettings();
                setMobileMenuOpen(false);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-lg font-bold"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>إعدادات النظام</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
