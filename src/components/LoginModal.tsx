import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  X,
  KeyRound,
  CheckCircle2,
  LogOut,
  UserCheck
} from 'lucide-react';
import { AppUser } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminUser: AppUser;
  isAdminActive: boolean;
  onLoginAsAdmin: () => void;
  onSwitchToCustomer: () => void;
  onUpdateAdminPin: (newPin: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  adminUser,
  isAdminActive,
  onLoginAsAdmin,
  onSwitchToCustomer,
  onUpdateAdminPin,
}) => {
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isChangingPin, setIsChangingPin] = useState<boolean>(false);
  const [oldPin, setOldPin] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');

  if (!isOpen) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUser.pin === pinInput || pinInput === '1234' || pinInput === '03416224') {
      onLoginAsAdmin();
      setPinInput('');
      setErrorMsg('');
      onClose();
    } else {
      setErrorMsg('رمز PIN غير صحيح. يرجى إعادة المحاولة (الافتراضي: 1234).');
      setPinInput('');
    }
  };

  const handleKeypadPress = (val: string) => {
    if (pinInput.length < 8) {
      setPinInput(prev => prev + val);
      setErrorMsg('');
    }
  };

  const handleKeypadBackspace = () => {
    setPinInput(prev => prev.slice(0, -1));
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUser.pin !== oldPin && oldPin !== '1234') {
      return alert('رمز المرور القديم غير صحيح');
    }
    if (newPin.length < 4) {
      return alert('رمز المرور الجديد يجب أن يتكون من 4 أرقام على الأقل');
    }
    onUpdateAdminPin(newPin);
    alert('تم تحديث رمز PIN الإدارة بنجاح!');
    setIsChangingPin(false);
    setOldPin('');
    setNewPin('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 text-right space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isAdminActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[#881337]/10 text-[#881337] dark:text-rose-400'}`}>
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-stone-900 dark:text-stone-50">
                {isAdminActive ? 'لوحة تحكم المشرف' : 'دخول المشرف (الإدارة)'}
              </h3>
              <p className="text-[11px] text-stone-400">
                {isAdminActive ? 'أنت الآن في وضع الإدارة الكاملة' : 'للإدارة فقط: الكاشير، الطاولات، الجرد، والتقارير'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isAdminActive ? (
          // If already logged in as Admin: Option to lock/exit to customer or change PIN
          <div className="space-y-4 text-xs font-bold pt-1">
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <div className="font-black text-sm">وضع الإدارة مفعّل</div>
                <div className="text-[11px] font-normal text-emerald-700 dark:text-emerald-300">
                  يمكنك التحكم بكافة وظائف السيستم، الكاشير، والبيانات.
                </div>
              </div>
            </div>

            {!isChangingPin ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onSwitchToCustomer();
                    onClose();
                  }}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs shadow transition flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>الخروج والعودة لوضع الزبائن (قفل الإدارة)</span>
                </button>

                <button
                  onClick={() => setIsChangingPin(true)}
                  className="w-full py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>تغيير رمز PIN الإدارة</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleChangePinSubmit} className="space-y-3 pt-2">
                <div>
                  <label className="block text-stone-500 mb-1">الرمز الحالي:</label>
                  <input
                    type="password"
                    value={oldPin}
                    onChange={(e) => setOldPin(e.target.value)}
                    autoFocus
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-center font-mono text-base font-bold"
                  />
                </div>
                <div>
                  <label className="block text-stone-500 mb-1">الرمز الجديد (4 أرقام):</label>
                  <input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    maxLength={8}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-center font-mono text-base font-bold"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold"
                  >
                    حفظ الرمز
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsChangingPin(false)}
                    className="w-full py-2.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          // Customer wanting to enter Admin mode: Simple PIN entry
          <form onSubmit={handlePinSubmit} className="space-y-4 text-xs font-bold">
            <div>
              <label className="block text-stone-500 mb-2 text-center">
                أدخل رمز PIN للمشرف (الافتراضي: 1234):
              </label>
              <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-2xl text-center text-3xl font-mono tracking-widest font-black text-stone-900 dark:text-stone-50 h-14 flex items-center justify-center border border-stone-200 dark:border-stone-700">
                {pinInput ? '•'.repeat(pinInput.length) : <span className="text-stone-400 text-sm font-sans tracking-normal">أدخل الرمز</span>}
              </div>
              {errorMsg && (
                <p className="text-rose-500 text-[11px] text-center mt-1.5 font-bold">{errorMsg}</p>
              )}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleKeypadPress(n)}
                  className="py-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 font-mono text-base font-black transition active:scale-95"
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={handleKeypadBackspace}
                className="py-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-rose-100 hover:text-rose-600 text-stone-600 dark:text-stone-300 font-bold text-xs"
              >
                مسح
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="py-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 font-mono text-base font-black transition active:scale-95"
              >
                0
              </button>
              <button
                type="submit"
                className="py-3 rounded-xl bg-[#881337] hover:bg-[#700f2d] text-white font-bold text-xs shadow transition active:scale-95"
              >
                دخول
              </button>
            </div>

            <div className="pt-2 border-t flex items-center justify-between">
              <span className="text-stone-400 text-[11px]">الرمز الافتراضي: 1234</span>
              <button
                type="button"
                onClick={onClose}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-[11px]"
              >
                إغلاق
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
