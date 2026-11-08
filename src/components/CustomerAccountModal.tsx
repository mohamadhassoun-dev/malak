import React, { useState } from 'react';
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Package,
  Clock,
  RotateCcw,
  CheckCircle2,
  Flame,
  AlertCircle,
  X,
  LogOut,
  Edit2,
  Save,
  Search,
  ShoppingBag
} from 'lucide-react';
import { CustomerAccount, OrderRecord, OrderStatus, CartItem } from '../types';
import { formatLbp, formatUsd } from '../services/storageService';

interface CustomerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCustomer: CustomerAccount | null;
  transactions: OrderRecord[];
  usdRate: number;
  onUpdateCustomer: (updated: CustomerAccount) => void;
  onLogoutCustomer: () => void;
  onOpenAuthModal: () => void;
  onReorder: (items: CartItem[]) => void;
}

export const CustomerAccountModal: React.FC<CustomerAccountModalProps> = ({
  isOpen,
  onClose,
  currentCustomer,
  transactions,
  usdRate,
  onUpdateCustomer,
  onLogoutCustomer,
  onOpenAuthModal,
  onReorder,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(currentCustomer?.name || '');
  const [phoneInput, setPhoneInput] = useState(currentCustomer?.phone || '');
  const [addressInput, setAddressInput] = useState(currentCustomer?.address || '');
  const [guestPhoneSearch, setGuestPhoneSearch] = useState('');
  const [reorderSuccessMsg, setReorderSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter orders for logged in customer OR guest search
  const customerOrders = transactions.filter(t => {
    if (currentCustomer) {
      return (
        t.customerId === currentCustomer.id ||
        (currentCustomer.phone && t.customerPhone === currentCustomer.phone) ||
        (currentCustomer.name && t.customerName.toLowerCase() === currentCustomer.name.toLowerCase())
      );
    }
    if (guestPhoneSearch.trim()) {
      return t.customerPhone && t.customerPhone.includes(guestPhoneSearch.trim());
    }
    return false;
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer) return;
    if (!nameInput.trim() || !phoneInput.trim()) return;

    onUpdateCustomer({
      ...currentCustomer,
      name: nameInput.trim(),
      phone: phoneInput.trim(),
      address: addressInput.trim()
    });
    setIsEditing(false);
  };

  const handleReorderClick = (items: CartItem[]) => {
    onReorder(items);
    setReorderSuccessMsg('تمت إضافة أصناف الطلب إلى سلتك بنجاح!');
    setTimeout(() => {
      setReorderSuccessMsg(null);
      onClose();
    }, 1500);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return { label: 'قيد الاستلام والمراجعة', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800' };
      case 'preparing':
        return { label: 'قيد الخبز بالفرن', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 animate-pulse' };
      case 'ready':
        return { label: 'جاهز للاستلام / مع السائق', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' };
      case 'completed':
        return { label: 'تم التسليم بنجاح', color: 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300' };
      case 'cancelled':
        return { label: 'ملغي', color: 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400' };
      default:
        return { label: status, color: 'bg-stone-100 dark:bg-stone-800 text-stone-600' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-stone-200 dark:border-stone-800 text-right space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900 dark:text-stone-50">
                {currentCustomer ? `حسابي وسجل طلباتي` : 'تتبع الطلبات وسجل الزبائن'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {currentCustomer
                  ? `مرحباً بك، ${currentCustomer.name} · تتبع طلباتك السابقة وتفاصيل حسابك`
                  : 'يمكنك تتبع طلبك برقم الهاتف أو تسجيل حساب للاحتفاظ بطلباتك'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {reorderSuccessMsg && (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{reorderSuccessMsg}</span>
          </div>
        )}

        {/* Customer Account Details Card */}
        {currentCustomer ? (
          <div className="bg-stone-50 dark:bg-stone-800/60 rounded-2xl p-4 sm:p-5 border border-stone-200 dark:border-stone-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-500 dark:text-stone-400">بيانات الحساب الشخصي</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  حساب مسجل ({currentCustomer.id})
                </span>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <button
                    onClick={() => {
                      setNameInput(currentCustomer.name);
                      setPhoneInput(currentCustomer.phone);
                      setAddressInput(currentCustomer.address || '');
                      setIsEditing(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>تعديل البيانات</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                  >
                    إلغاء
                  </button>
                )}
                <button
                  onClick={onLogoutCustomer}
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 dark:hover:text-rose-400 mr-2 cursor-pointer"
                  title="تسجيل الخروج من الحساب"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>خروج</span>
                </button>
              </div>
            </div>

            {!isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
                <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
                  <div className="text-stone-400 text-[11px] font-normal mb-1">الاسم الكامل</div>
                  <div className="text-stone-900 dark:text-stone-100 font-black">{currentCustomer.name}</div>
                </div>

                <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
                  <div className="text-stone-400 text-[11px] font-normal mb-1">رقم الهاتف / الواتساب</div>
                  <div className="text-stone-900 dark:text-stone-100 font-mono">{currentCustomer.phone}</div>
                </div>

                <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
                  <div className="text-stone-400 text-[11px] font-normal mb-1">عنوان التوصيل الافتراضي</div>
                  <div className="text-stone-900 dark:text-stone-100 truncate">
                    {currentCustomer.address || 'لم يتم تحديد عنوان بعد'}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-3 pt-2 text-xs font-bold">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-500 mb-1">الاسم الكامل:</label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-500 mb-1">رقم الهاتف:</label>
                    <input
                      type="text"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-stone-500 mb-1">العنوان الافتراضي:</label>
                  <input
                    type="text"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    placeholder="المدينة، الشارع، البناية..."
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl dynamic-btn text-white font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>حفظ التعديلات</span>
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-4 sm:p-5 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-black text-sm text-stone-900 dark:text-stone-50 mb-1">
                لست مسجلاً الدخول بحساب زبون
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                تسجيل الحساب اختياري وليس إجبارياً للطلب، لكنه يتيح لك حفظ عنوانك وتتبع سجل وجباتك وإعادة طلبها بنقرة واحدة!
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenAuthModal();
              }}
              className="px-4 py-2.5 rounded-xl dynamic-btn text-white text-xs font-black shrink-0 cursor-pointer shadow-sm"
            >
              تسجيل الدخول / إنشاء حساب
            </button>
          </div>
        )}

        {/* Guest Phone Lookup Section */}
        {!currentCustomer && (
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-600 dark:text-stone-300">
              أو ابحث عن طلباتك السابقة برقم هاتفك المسجل أثناء الطلب كـ زائر:
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="أدخل رقم هاتفك (مثال: 03123456)..."
                value={guestPhoneSearch}
                onChange={(e) => setGuestPhoneSearch(e.target.value)}
                className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-bold text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>
        )}

        {/* Order History Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-stone-900 dark:text-stone-50 flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-500" />
              <span>سجل الطلبات السابقة ({customerOrders.length})</span>
            </h4>
            <span className="text-xs text-stone-400">تحديث فوري مباشر</span>
          </div>

          {customerOrders.length === 0 ? (
            <div className="text-center py-10 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-dashed border-stone-200 dark:border-stone-700 p-6">
              <ShoppingBag className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-stone-600 dark:text-stone-300">
                {currentCustomer
                  ? 'لا توجد طلبات مسجلة بحسابك حتى الآن'
                  : guestPhoneSearch
                  ? 'لا توجد طلبات مرتبطة برقم الهاتف المدخل'
                  : 'أدخل رقم هاتفك أعلاه أو سجل الدخول لاستعراض طلباتك السابقة'}
              </p>
              <p className="text-[11px] text-stone-400 mt-1">
                عند قيامك بأي طلب سيتم حفظه هنا تلقائياً لمتابعته وإعادة طلبه بسهولة
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {customerOrders.map(order => {
                const status = getStatusBadge(order.status);
                const orderTypeLabel = order.type === 'hall'
                  ? `طاولة ${order.tableNumber || 1}`
                  : order.type === 'takeaway'
                  ? 'سفري (تيك أواي)'
                  : 'دليفري (توصيل)';

                return (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3 hover:border-amber-400/60 transition"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-stone-900 dark:text-stone-100">
                          {order.id}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                          {orderTypeLabel}
                        </span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${status.color}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Items List */}
                    <div className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/60 p-2.5 rounded-xl border border-stone-100 dark:border-stone-800">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px]">
                          <span className="font-medium">
                            {item.quantity}× {item.name}
                            {item.notes && <span className="text-amber-600 mr-1 text-[10px]">({item.notes})</span>}
                          </span>
                          <span className="font-bold tabular-nums text-stone-900 dark:text-stone-100">
                            {formatLbp(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer & Action */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <div className="text-stone-400 text-[11px] flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{order.createdAt}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-left">
                          <span className="font-black text-xs dynamic-text tabular-nums">
                            {formatLbp(order.totalLbp)}
                          </span>
                          <span className="text-[10px] text-stone-400 block font-normal">
                            ({formatUsd(order.totalLbp, usdRate)})
                          </span>
                        </div>

                        <button
                          onClick={() => handleReorderClick(order.items)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                          title="إعادة طلب هذه الأصناف فوراً"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>إعادة الطلب</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
