import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldCheck,
  X,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { AppUser, CustomerAccount } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminUser: AppUser;
  isAdminActive: boolean;
  customers: CustomerAccount[];
  currentCustomer: CustomerAccount | null;
  onLoginAsAdmin: () => void;
  onSwitchToCustomer: () => void;
  onCustomerLoginSuccess: (customer: CustomerAccount) => void;
  onCustomerRegisterSuccess: (customer: CustomerAccount) => void;
  defaultTab?: 'customer_login' | 'customer_register' | 'admin_login';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  adminUser,
  isAdminActive,
  customers,
  currentCustomer,
  onLoginAsAdmin,
  onSwitchToCustomer,
  onCustomerLoginSuccess,
  onCustomerRegisterSuccess,
  defaultTab = 'customer_login'
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Input States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab === 'customer_register' ? 'register' : 'login');
      setLoginError('');
      setRegError('');
    }
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  // Unified Login Handler: Handles both Customer & Stealth Admin Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const identifier = loginIdentifier.trim();
    const cleanLower = identifier.toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, '');
    const pass = loginPassword.trim();

    if (!identifier) {
      setLoginError('يرجى إدخال رقم الهاتف أو اسم المستخدم');
      return;
    }

    if (!pass) {
      setLoginError('يرجى إدخال كلمة المرور');
      return;
    }

    // 1. Check if the entered credentials match the Admin Account (Hidden Inside)
    const isAdminUser =
      cleanLower === 'malak' ||
      cleanLower === 'admin' ||
      cleanLower === (adminUser.username || 'malak').toLowerCase() ||
      (adminUser.name && cleanLower === adminUser.name.toLowerCase()) ||
      cleanDigits === '03416224' ||
      cleanDigits === '96103416224';

    const isAdminPass =
      pass === 'M@lAk1998' ||
      pass === (adminUser.password || 'M@lAk1998') ||
      pass === (adminUser.pin || '1234');

    if (isAdminUser && isAdminPass) {
      onLoginAsAdmin();
      setLoginIdentifier('');
      setLoginPassword('');
      onClose();
      return;
    }

    // 2. Check for regular Customer Account
    const foundCustomer = customers.find(c => {
      const custDigits = c.phone.replace(/\D/g, '');
      return (
        (cleanDigits.length >= 6 && custDigits === cleanDigits) ||
        c.phone.replace(/[^0-9]/g, '') === cleanDigits ||
        c.name.trim().toLowerCase() === cleanLower
      );
    });

    if (foundCustomer) {
      if (foundCustomer.password && pass && foundCustomer.password !== pass) {
        setLoginError('كلمة المرور غير صحيحة. يرجى إعادة المحاولة.');
        return;
      }

      onCustomerLoginSuccess(foundCustomer);
      setLoginIdentifier('');
      setLoginPassword('');
      onClose();
      return;
    }

    // Neither matched
    setLoginError('رقم الهاتف أو كلمة المرور غير صحيحة. يرجى التأكد والمحاولة مرة أخرى.');
  };

  // Handle Customer Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim()) {
      setRegError('يرجى كتابة الاسم الكامل');
      return;
    }

    if (!regPhone.trim()) {
      setRegError('يرجى كتابة رقم الهاتف أو الواتساب');
      return;
    }

    const cleanPhone = regPhone.replace(/\D/g, '');
    const exists = customers.some(c => c.phone.replace(/\D/g, '') === cleanPhone);
    if (exists) {
      setRegError('رقم الهاتف هذا مسجل لدينا مسبقاً. يمكنك تسجيل الدخول مباشرة.');
      return;
    }

    const newCustomer: CustomerAccount = {
      id: 'CUST-' + Math.floor(1000 + Math.random() * 9000),
      name: regName.trim(),
      phone: regPhone.trim(),
      address: regAddress.trim(),
      password: regPassword.trim() || '1234',
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    onCustomerRegisterSuccess(newCustomer);
    setRegName('');
    setRegPhone('');
    setRegAddress('');
    setRegPassword('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-stone-200 dark:border-stone-800 text-right space-y-5">
        {/* Modal Top Bar - Clean and Unified */}
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-2xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-stone-900 dark:text-stone-50">
                تسجيل الدخول إلى الحساب
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                تسجيل الدخول لمتابعة الطلبات وتفاصيل الحساب
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Admin is already active, show quick status & switch */}
        {isAdminActive ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
              <div>
                <div className="font-black text-sm">أنت مسجل الدخول كـ مدير عام ({adminUser.name || 'malak'})</div>
                <div className="text-xs text-emerald-700 dark:text-emerald-300">
                  لوحة الإدارة الشاملة، الكاشير، المطبخ، والتقارير مفعلة بالكامل.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onSwitchToCustomer();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs shadow transition cursor-pointer"
            >
              الخروج إلى وضع الزبائن
            </button>
          </div>
        ) : (
          <>
            {/* Unified 2-Tab Switcher: Look completely like normal account tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 dark:bg-stone-800/80 rounded-2xl text-xs font-bold">
              <button
                onClick={() => {
                  setActiveTab('login');
                  setLoginError('');
                }}
                className={`py-2 px-2 rounded-xl transition cursor-pointer text-center ${
                  activeTab === 'login'
                    ? 'bg-white dark:bg-stone-700 text-stone-950 dark:text-stone-50 shadow-xs'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                تسجيل الدخول
              </button>

              <button
                onClick={() => {
                  setActiveTab('register');
                  setRegError('');
                }}
                className={`py-2 px-2 rounded-xl transition cursor-pointer text-center ${
                  activeTab === 'register'
                    ? 'bg-white dark:bg-stone-700 text-stone-950 dark:text-stone-50 shadow-xs'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                حساب جديد
              </button>
            </div>

            {/* TAB 1: Unified Login (Customer + Stealth Admin) */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-bold">
                <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
                  💡 تسجيل الدخول يتيح لك متابعة طلباتك السابقة، حفظ عنوانك، وتعبئة بياناتك تلقائياً عند الطلب. (الطلب متاح دائماً كـ زائر بدون حساب).
                </div>

                {loginError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-stone-600 dark:text-stone-300 mb-1">
                    رقم الهاتف أو اسم المستخدم:
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: 03123456 أو اسم الحساب"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    autoFocus
                    required
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 dark:text-stone-300 mb-1">
                    كلمة المرور:
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="أدخل كلمة المرور..."
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="w-full p-2.5 pl-9 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl dynamic-btn text-white font-black text-xs shadow-sm transition cursor-pointer"
                >
                  تسجيل الدخول
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-stone-500 hover:text-amber-600 dark:hover:text-amber-400 text-[11px] underline cursor-pointer"
                  >
                    ليس لديك حساب بعد؟ اضغط هنا لإنشاء حساب جديد مجاناً
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: Customer Registration */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs font-bold">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-[11px] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>أنشئ حسابك خلال ثوانٍ للاحتفاظ بسجل وجباتك وعناوين التوصيل!</span>
                </div>

                {regError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-stone-600 dark:text-stone-300 mb-1">
                    الاسم الكامل: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: محمد حسون"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 dark:text-stone-300 mb-1">
                    رقم الهاتف / الواتساب: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: 03416224"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 dark:text-stone-300 mb-1">
                    عنوان التوصيل الافتراضي (اختياري):
                  </label>
                  <input
                    type="text"
                    placeholder="طرابلس، شارع الأرز، قرب المسجد..."
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 dark:text-stone-300 mb-1">
                    كلمة المرور: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="اختر كلمة مرور لحسابك..."
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl dynamic-btn text-white font-black text-xs shadow-sm transition cursor-pointer"
                >
                  إنشاء الحساب والدخول فوراً
                </button>

                <p className="text-[10px] text-stone-400 text-center">
                  ملاحظة: يمكنك دائماً إتمام الطلبات كـ زائر بدون الحاجة لإنشاء حساب.
                </p>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
