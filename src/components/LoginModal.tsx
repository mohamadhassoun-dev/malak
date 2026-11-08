import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  X,
  KeyRound,
  User,
  UserPlus,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MapPin
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
  const [activeTab, setActiveTab] = useState<'customer_login' | 'customer_register' | 'admin_login'>(
    isAdminActive ? 'admin_login' : defaultTab
  );

  // Admin Login State
  const [adminUsername, setAdminUsername] = useState('malak');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminError, setAdminError] = useState('');

  // Customer Login State
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [customerLoginError, setCustomerLoginError] = useState('');

  // Customer Register State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');

  if (!isOpen) return null;

  // Handle Admin Login with username `malak` and password `M@lAk1998`
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    const cleanUser = adminUsername.trim();
    const cleanPass = adminPassword.trim();

    // Verify against user's specific credentials: malak / M@lAk1998
    const isValidUsername = cleanUser.toLowerCase() === 'malak' || cleanUser.toLowerCase() === (adminUser.username || 'malak').toLowerCase();
    const isValidPassword = cleanPass === 'M@lAk1998' || cleanPass === (adminUser.password || 'M@lAk1998') || cleanPass === (adminUser.pin || '1234');

    if (isValidUsername && isValidPassword) {
      onLoginAsAdmin();
      setAdminPassword('');
      onClose();
    } else {
      setAdminError('اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التأكد وإعادة المحاولة.');
    }
  };

  // Handle Customer Login
  const handleCustomerLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerLoginError('');

    const phoneOrName = customerPhone.trim().toLowerCase();
    const pass = customerPassword.trim();

    if (!phoneOrName) {
      setCustomerLoginError('يرجى إدخال رقم الهاتف أو الاسم المسجل');
      return;
    }

    const found = customers.find(c =>
      c.phone.replace(/[^0-9]/g, '') === phoneOrName.replace(/[^0-9]/g, '') ||
      c.name.toLowerCase() === phoneOrName
    );

    if (!found) {
      setCustomerLoginError('لم يتم العثور على حساب بهذا الهاتف. يمكنك إنشاء حساب جديد مجاناً.');
      return;
    }

    if (found.password && pass && found.password !== pass) {
      setCustomerLoginError('كلمة المرور غير صحيحة. يرجى إعادة المحاولة.');
      return;
    }

    onCustomerLoginSuccess(found);
    setCustomerPassword('');
    onClose();
  };

  // Handle Customer Registration
  const handleCustomerRegisterSubmit = (e: React.FormEvent) => {
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

    // Check if phone already registered
    const cleanPhone = regPhone.replace(/[^0-9]/g, '');
    const exists = customers.some(c => c.phone.replace(/[^0-9]/g, '') === cleanPhone);
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
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-stone-900 dark:text-stone-50">
                تسجيل الدخول وإدارة الحسابات
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                تسجيل زبائن المطعم أو الدخول للوحة المشرف
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-stone-100 dark:bg-stone-800/80 rounded-2xl text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('customer_login');
              setCustomerLoginError('');
            }}
            className={`py-2 px-2 rounded-xl transition cursor-pointer text-center ${
              activeTab === 'customer_login'
                ? 'bg-white dark:bg-stone-700 text-stone-950 dark:text-stone-50 shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            دخول الزبون
          </button>

          <button
            onClick={() => {
              setActiveTab('customer_register');
              setRegError('');
            }}
            className={`py-2 px-2 rounded-xl transition cursor-pointer text-center ${
              activeTab === 'customer_register'
                ? 'bg-white dark:bg-stone-700 text-stone-950 dark:text-stone-50 shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            حساب جديد
          </button>

          <button
            onClick={() => {
              setActiveTab('admin_login');
              setAdminError('');
            }}
            className={`py-2 px-2 rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-1 ${
              activeTab === 'admin_login'
                ? 'dynamic-bg text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>لوحة المشرف</span>
          </button>
        </div>

        {/* TAB 1: Customer Login */}
        {activeTab === 'customer_login' && (
          <form onSubmit={handleCustomerLoginSubmit} className="space-y-4 text-xs font-bold">
            <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
              💡 تسجيل الدخول يتيح لك متابعة طلباتك السابقة، حفظ عنوانك، وتعبئة بياناتك تلقائياً عند الطلب. (الطلب متاح دائماً كـ زائر بدون حساب).
            </div>

            {customerLoginError && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{customerLoginError}</span>
              </div>
            )}

            <div>
              <label className="block text-stone-600 dark:text-stone-300 mb-1">
                رقم الهاتف / الواتساب:
              </label>
              <input
                type="text"
                placeholder="مثال: 03123456"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                autoFocus
                className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              />
            </div>

            <div>
              <label className="block text-stone-600 dark:text-stone-300 mb-1">
                كلمة المرور:
              </label>
              <input
                type="password"
                placeholder="أدخل كلمة المرور..."
                value={customerPassword}
                onChange={(e) => setCustomerPassword(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl dynamic-btn text-white font-black text-xs shadow-sm transition cursor-pointer"
            >
              تسجيل الدخول بحسابي
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setActiveTab('customer_register')}
                className="text-stone-500 hover:text-amber-600 dark:hover:text-amber-400 text-[11px] underline cursor-pointer"
              >
                ليس لديك حساب بعد؟ اضغط هنا لإنشاء حساب جديد مجاناً
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: Customer Registration */}
        {activeTab === 'customer_register' && (
          <form onSubmit={handleCustomerRegisterSubmit} className="space-y-3 text-xs font-bold">
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

        {/* TAB 3: Admin Login with username `malak` and password `M@lAk1998` */}
        {activeTab === 'admin_login' && (
          <form onSubmit={handleAdminSubmit} className="space-y-4 text-xs font-bold">
            {isAdminActive ? (
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <div className="font-black text-sm">أنت مسجل الدخول كـ مدير عام</div>
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-300">
                      لوحة الكاشير والمطبخ والتقارير متاحة بالكامل.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSwitchToCustomer();
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black shadow transition cursor-pointer"
                >
                  الخروج إلى وضع الزبائن
                </button>
              </div>
            ) : (
              <>
                <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-[11px]">
                  🔒 تسجيل دخول خاص بإدارة مطعم ملك الصفيحة (الكاشير، المطبخ، الجرد، والتقارير).
                </div>

                {adminError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{adminError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-stone-600 dark:text-stone-300 mb-1">
                    اسم مستخدم الإدارة (Username):
                  </label>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    required
                    placeholder="malak"
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">الاسم المعتمد: malak</span>
                </div>

                <div>
                  <label className="block text-stone-600 dark:text-stone-300 mb-1">
                    كلمة مرور الإدارة (Password):
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full p-2.5 pl-9 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl dynamic-btn text-white font-black text-xs shadow-sm transition cursor-pointer"
                >
                  تسجيل الدخول إلى لوحة الإدارة
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
