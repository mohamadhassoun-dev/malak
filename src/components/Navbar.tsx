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
  ExternalLink
} from 'lucide-react';
import { AppUser, CompanyProfile } from '../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  company: CompanyProfile;
  activeUser: AppUser;
  onOpenLogin: () => void;
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
  onOpenLogin,
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
        <div className="bg-[#881337] text-amber-200 text-xs py-1 px-4 text-center font-bold tracking-wide overflow-hidden whitespace-nowrap">
          <span>{company.announcementText}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('customer')}
            className="flex items-center gap-2.5 text-right group focus:outline-none"
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
              <span className="block text-[11px] text-stone-600 dark:text-stone-300 font-medium whitespace-nowrap">
                {company.headerTagline || `طرابلس - تأسيس ${company.establishmentYear}`}
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Only Admin sees all tabs; Customer sees store view) */}
        {isAdmin ? (
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 overflow-x-auto py-1">
            {adminTabs.map(tab => {
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#881337] text-white shadow-sm'
                      : 'text-stone-700 dark:text-stone-200 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800/80 px-3 py-1 rounded-full border border-stone-200 dark:border-stone-700">
            <span>{company.headerOnlineBadge || 'قائمة الطلب المباشر أونلاين عبر الواتساب'}</span>
          </div>
        )}

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Live Clock (tablet+) */}
          <div className="hidden sm:block text-center px-2 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-[11px] font-mono text-stone-700 dark:text-stone-300 tabular-nums">
            {liveTime}
          </div>

          {/* Dollar Exchange Rate Input (Admin can edit, Customer can view) */}
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
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg hover:bg-amber-100 transition whitespace-nowrap"
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
              className="relative p-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200 transition"
              title="سلة الطلبات"
              aria-label="سلة الطلبات"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#be123c] text-white text-[10px] font-black flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Theme switcher */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            title={isDarkMode ? "الوضع الفاتح" : "الوضع الليلي"}
            aria-label="تبديل المظهر"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings (Admin only) */}
          {isAdmin && (
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              title="إعدادات النظام والشركة"
              aria-label="إعدادات النظام والشركة"
            >
              <Sliders className="w-4 h-4" />
            </button>
          )}

          {/* Admin Login / Logout Switcher Button */}
          {isAdmin ? (
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-rose-50 text-rose-800 dark:bg-rose-950/70 dark:text-rose-200 border border-rose-300 transition whitespace-nowrap hover:bg-rose-100"
              title="لوحة تحكم المشرف أو الخروج للزبائن"
            >
              <Unlock className="w-3.5 h-3.5 text-rose-600" />
              <span>وضع الإدارة</span>
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-stone-950 shadow transition whitespace-nowrap"
              title="دخول الإدارة (PIN: 1234)"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>دخول الإدارة</span>
            </button>
          )}

          {/* Mobile Hamburger (Only in Admin mode when there are multiple tabs) */}
          {isAdmin && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
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
                className={`px-3 py-2 text-xs font-bold rounded-lg text-right transition ${
                  currentTab === tab.id
                    ? 'bg-[#881337] text-white'
                    : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
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
