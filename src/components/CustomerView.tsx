import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  Minus,
  ShoppingBag,
  Flame,
  Clock,
  Sparkles,
  MapPin,
  Phone,
  MessageCircle,
  Check,
  Send,
  X,
  ChevronDown,
  User,
  AlertCircle,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem, CompanyProfile, MenuItem, OrderType, CustomerAccount } from '../types';
import { formatLbp, formatUsd, playChime } from '../services/storageService';
import { HERO_IMAGE } from '../data/defaultData';

interface CustomerViewProps {
  menu: MenuItem[];
  company: CompanyProfile;
  cart: CartItem[];
  orderType: OrderType;
  tableNumber: number;
  tablesCount: number;
  currentCustomer: CustomerAccount | null;
  onOpenCustomerAccount: () => void;
  onOpenAuthModal: () => void;
  onLogoutCustomer?: () => void;
  onAddToCart: (item: MenuItem, notes?: string) => void;
  onUpdateCartQty: (itemId: number, delta: number) => void;
  onClearCart: () => void;
  onSetOrderType: (type: OrderType) => void;
  onSetTableNumber: (table: number) => void;
  onSubmitOrder: (customerDetails: { name: string; phone: string; address: string; notes: string }) => void;
  isCartDrawerOpen: boolean;
  onCloseCartDrawer: () => void;
  onOpenCartDrawer: () => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({
  menu,
  company,
  cart,
  orderType,
  tableNumber,
  tablesCount,
  currentCustomer,
  onOpenCustomerAccount,
  onOpenAuthModal,
  onAddToCart,
  onUpdateCartQty,
  onClearCart,
  onSetOrderType,
  onSetTableNumber,
  onSubmitOrder,
  isCartDrawerOpen,
  onCloseCartDrawer,
  onOpenCartDrawer,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [noteModalItem, setNoteModalItem] = useState<MenuItem | null>(null);
  const [customNote, setCustomNote] = useState<string>('');

  const [customerName, setCustomerName] = useState<string>(() => currentCustomer?.name || '');
  const [customerPhone, setCustomerPhone] = useState<string>(() => currentCustomer?.phone || '');
  const [customerAddress, setCustomerAddress] = useState<string>(() => currentCustomer?.address || '');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [orderSubmittedSuccess, setOrderSubmittedSuccess] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string; address?: string }>({});
  const [touched, setTouched] = useState<{ name?: boolean; phone?: boolean; address?: boolean }>({});

  // Sync inputs if customer logs in or profile changes
  useEffect(() => {
    if (currentCustomer) {
      if (currentCustomer.name) setCustomerName(currentCustomer.name);
      if (currentCustomer.phone) setCustomerPhone(currentCustomer.phone);
      if (currentCustomer.address) setCustomerAddress(currentCustomer.address);
    }
  }, [currentCustomer]);

  // Extract categories
  const categories = useMemo(() => {
    const set = new Set(menu.map(m => m.category));
    return ['all', ...Array.from(set)];
  }, [menu]);

  // Filter menu items
  const filteredItems = useMemo(() => {
    return menu.filter(item => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch && item.isAvailable;
    });
  }, [menu, selectedCategory, searchQuery]);

  const totalLbp = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleQuickAdd = (item: MenuItem) => {
    playChime('add');
    onAddToCart(item);
  };

  const openCustomizeModal = (item: MenuItem) => {
    setNoteModalItem(item);
    setCustomNote('');
  };

  const confirmCustomizeAdd = () => {
    if (noteModalItem) {
      playChime('add');
      onAddToCart(noteModalItem, customNote);
      setNoteModalItem(null);
    }
  };

  const validateForm = (): boolean => {
    const errors: { name?: string; phone?: string; address?: string } = {};

    if (!customerName.trim() || customerName.trim().length < 2) {
      errors.name = 'الاسم مطلوب لإتمام الطلب (يرجى كتابة اسمك الكريم)';
    }

    const cleanPhoneDigits = customerPhone.replace(/\D/g, '');
    if (!customerPhone.trim() || cleanPhoneDigits.length < 6) {
      errors.phone = 'رقم الهاتف مطلوب لتأكيد وتنسيق الطلب (مثال: 03123456)';
    }

    if (orderType === 'delivery' && (!customerAddress || customerAddress.trim().length < 3)) {
      errors.address = 'عنوان التوصيل بالتفصيل مطلوب لطلبات الدليفري';
    }

    setFormErrors(errors);
    setTouched({ name: true, phone: true, address: true });
    return Object.keys(errors).length === 0;
  };

  const handleWhatsAppOrder = () => {
    if (!cart.length) return;
    if (!validateForm()) return;

    const cleanPhone = company.whatsappPhone.replace(/[^0-9]/g, '');
    let typeText = 'داخل الصالة (طاولة ' + tableNumber + ')';
    if (orderType === 'takeaway') typeText = 'طلب سفري (تيك أواي)';
    if (orderType === 'delivery') typeText = 'توصيل دليفري للعنوان';

    let text = `*طلب جديد من موقع ${company.name}*%0A`;
    text += `━━━━━━━━━━━━━━━━━━━━━%0A`;
    text += `🍴 *نوع الطلب:* ${typeText}%0A`;
    text += `👤 *الاسم:* ${customerName.trim()}%0A`;
    text += `📞 *الهاتف:* ${customerPhone.trim()}%0A`;
    if (customerAddress && orderType === 'delivery') text += `📍 *العنوان:* ${customerAddress.trim()}%0A`;
    if (orderNotes) text += `📝 *ملاحظات:* ${orderNotes.trim()}%0A`;
    text += `━━━━━━━━━━━━━━━━━━━━━%0A`;
    text += `*تفاصيل الطلب:*%0A`;
    cart.forEach((item, idx) => {
      text += `${idx + 1}. ${item.name} (${item.quantity}×) - ${formatLbp(item.price * item.quantity)}`;
      if (item.notes) text += ` _[${item.notes}]_`;
      text += `%0A`;
    });
    text += `━━━━━━━━━━━━━━━━━━━━━%0A`;
    text += `💰 *المجموع الكلي:* *${formatLbp(totalLbp)}* (${formatUsd(totalLbp, company.usdRate)})%0A`;
    text += `سعر الصرف المعتمد: 1$ = ${company.usdRate.toLocaleString('ar-LB')} ل.ل`;

    onSubmitOrder({
      name: customerName.trim(),
      phone: customerPhone.trim(),
      address: customerAddress.trim(),
      notes: orderNotes.trim()
    });

    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
    setOrderSubmittedSuccess(true);
    setTimeout(() => {
      setOrderSubmittedSuccess(false);
      onCloseCartDrawer();
    }, 2500);
  };

  const handleDirectSubmit = () => {
    if (!cart.length) return;
    if (!validateForm()) return;

    onSubmitOrder({
      name: customerName.trim(),
      phone: customerPhone.trim(),
      address: customerAddress.trim(),
      notes: orderNotes.trim()
    });
    setOrderSubmittedSuccess(true);
    setTimeout(() => {
      setOrderSubmittedSuccess(false);
      onCloseCartDrawer();
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-24">
      {/* Hero Section with Warm Artisan Stone Oven Imagery */}
      <section className="relative overflow-hidden bg-stone-900 text-white min-h-[380px] sm:min-h-[440px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={company.heroImage || HERO_IMAGE}
            alt={company.name}
            className="w-full h-full object-cover opacity-35 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full text-right">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mb-4">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{company.heroBadge || `أصالة المذاق الطرابلسي منذ عام ${company.establishmentYear}`}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white mb-3">
              {company.heroTitle || 'أشهى صفيحة طرابلسية طازجة تُخبز على الحطب'}
            </h1>

            <p className="text-sm sm:text-base text-stone-200 leading-relaxed mb-6 font-medium">
              {company.heroSubtitle || 'عجينة مقرمشة، لحمة طازجة متبلة بأسرار التوابل العائلية، ودبس الرمان الطبيعي. استمتع بتجربة طعام أصيلة في مطعمنا أو اطلب مباشرة عبر الواتساب.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <a
                href="#menu-section"
                className="px-5 py-3 rounded-xl dynamic-btn font-black shadow-lg shadow-rose-900/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{company.heroCtaText || 'استعرض القائمة واطلب الآن'}</span>
              </a>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-stone-200 font-bold bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15">
                <span className="flex items-center gap-1.5 text-stone-300">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{company.city} - {company.address}</span>
                </span>
                <span className="hidden sm:inline text-stone-500">·</span>
                <a
                  href={`tel:${company.phone.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center gap-1.5 hover:text-emerald-400 text-stone-200 transition cursor-pointer"
                  title="اتصال هاتفي مباشر بالمطعم"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{company.phone}</span>
                </a>
                <span className="hidden sm:inline text-stone-500">·</span>
                <a
                  href={`https://wa.me/${company.whatsappPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-emerald-400 text-emerald-300 transition cursor-pointer"
                  title="محادثة واتساب فورية"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>واتساب مباشر</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Catalog & Order Types */}
      <main id="menu-section" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Customer Account Access - Displayed inside the customer page */}
        {currentCustomer ? (
          <div className="mb-8 bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-stone-100 dark:to-stone-900 rounded-3xl p-4 sm:p-5 border border-emerald-500/25 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 w-full md:w-auto">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-400/30 shadow-2xs">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">أهلاً بك مجدداً</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                    حساب نشط
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-50">
                  {currentCustomer.name}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                  {currentCustomer.phone} {currentCustomer.address && `· ${currentCustomer.address}`}
                </p>
              </div>
            </div>

            {/* These 2 buttons shown inside when logged in to their account */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
              <button
                onClick={onOpenCustomerAccount}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-xs font-black text-stone-800 dark:text-stone-100 shadow-xs transition cursor-pointer"
                title="استعراض ومتابعة الطلبات السابقة"
              >
                <Package className="w-4 h-4 text-amber-500" />
                <span>سجل طلباتي السابقة</span>
              </button>

              <button
                onClick={onOpenCustomerAccount}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs transition cursor-pointer"
                title="تعديل بيانات الحساب والعنوان"
              >
                <User className="w-4 h-4" />
                <span>تفاصيل حسابي</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-3 sm:p-4 bg-stone-100/90 dark:bg-stone-900/90 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300 font-medium">
              <Package className="w-4 h-4 text-amber-500 shrink-0" />
              <span>الطلب متاح دائماً كـ زائر بدون حساب · أو سجّل دخولك لحفظ بياناتك وعناوينك.</span>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
              <button
                onClick={onOpenCustomerAccount}
                className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold transition cursor-pointer shadow-2xs"
              >
                تتبع طلب برقم الهاتف
              </button>
            </div>
          </div>
        )}

        {/* Order Mode Segmented Selector */}
        <div className="mb-8 p-3 sm:p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm sm:text-base font-black text-stone-900 dark:text-stone-50">
                طريقة استلام الطلب
              </h2>
              <p className="text-xs text-stone-500">اختر طلبك داخل الصالة، سفري للاستلام، أو توصيل دليفري</p>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-stone-100 dark:bg-stone-800 p-1.5 rounded-xl text-xs font-bold">
              <button
                onClick={() => onSetOrderType('hall')}
                className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  orderType === 'hall'
                    ? 'dynamic-bg text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-700/60'
                }`}
              >
                <span>داخل الصالة</span>
              </button>
              <button
                onClick={() => onSetOrderType('takeaway')}
                className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  orderType === 'takeaway'
                    ? 'dynamic-bg text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-700/60'
                }`}
              >
                <span>سفري (تيك أواي)</span>
              </button>
              <button
                onClick={() => onSetOrderType('delivery')}
                className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  orderType === 'delivery'
                    ? 'dynamic-bg text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-700/60'
                }`}
              >
                <span>دليفري (توصيل)</span>
              </button>
            </div>
          </div>

          {/* If Hall: Table Selector */}
          {orderType === 'hall' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center gap-3 overflow-x-auto pb-1"
            >
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300 whitespace-nowrap">
                اختر رقم طاولتك:
              </span>
              <div className="flex items-center gap-2">
                {Array.from({ length: tablesCount || 8 }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    onClick={() => onSetTableNumber(num)}
                    className={`w-9 h-9 rounded-lg font-black text-xs transition flex items-center justify-center cursor-pointer ${
                      tableNumber === num
                        ? 'bg-amber-500 text-stone-900 shadow'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Categories Bar & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'dynamic-bg text-white shadow-sm'
                      : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  {cat === 'all' ? 'جميع الأصناف' : cat}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث عن صنف أو مكون..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-3 py-2 text-xs font-bold bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#881337]"
            />
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
            <ShoppingBag className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-700 dark:text-stone-300 mb-1">لا توجد نتائج مطابقة</h3>
            <p className="text-xs text-stone-400">جرب البحث بكلمات أخرى أو اختر قسماً آخر</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredItems.map(item => {
              const inCart = cart.find(c => c.id === item.id);
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="group bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Image Slot */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.badge && (
                      <span className="absolute top-2.5 right-2.5 px-2.5 py-1 text-[10px] font-black rounded-lg bg-amber-500 text-stone-900 shadow">
                        {item.badge}
                      </span>
                    )}
                    {item.deductBread && (
                      <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 text-[9px] font-bold rounded-md bg-stone-900/80 text-amber-200 backdrop-blur-xs">
                        خبز أسمر طازج
                      </span>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 mb-1">
                        {item.category}
                      </div>
                      <h3 className="text-base font-black text-stone-900 dark:text-stone-50 mb-1.5 group-hover:text-[var(--primary-color)] transition-colors">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mb-3 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
                      <div>
                        <div className="text-base font-black dynamic-text tabular-nums">
                          {formatLbp(item.price)}
                        </div>
                        <div className="text-[10px] text-stone-400 tabular-nums">
                          {formatUsd(item.price, company.usdRate)}
                        </div>
                      </div>

                      {inCart ? (
                        <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
                          <button
                            onClick={() => {
                              playChime('remove');
                              onUpdateCartQty(item.id, -1);
                            }}
                            className="w-7 h-7 rounded-lg bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                            aria-label="إنقاص الكمية"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center font-black text-xs text-stone-900 dark:text-stone-100">
                            {inCart.quantity}
                          </span>
                          <button
                            onClick={() => {
                              playChime('add');
                              onUpdateCartQty(item.id, 1);
                            }}
                            className="w-7 h-7 rounded-lg dynamic-btn font-bold flex items-center justify-center transition cursor-pointer"
                            aria-label="زيادة الكمية"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openCustomizeModal(item)}
                            className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-white transition text-[11px] font-bold cursor-pointer"
                            title="تخصيص الطلب وملاحظات"
                          >
                            تخصيص
                          </button>
                          <button
                            onClick={() => handleQuickAdd(item)}
                            className="px-3.5 py-2 rounded-xl dynamic-btn text-xs font-bold shadow-sm transition flex items-center gap-1 cursor-pointer active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>إضافة</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bottom Sticky Cart Bar (Active when items in cart) */}
      {cart.length > 0 && !isCartDrawerOpen && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-40 bg-stone-900/95 text-white backdrop-blur-md p-3 sm:p-3.5 rounded-2xl shadow-2xl border border-stone-700/60 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="relative p-2 rounded-xl dynamic-btn">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-stone-900 text-[10px] font-black flex items-center justify-center">
                {totalItemsCount}
              </span>
            </div>
            <div>
              <div className="text-xs font-black text-amber-300">
                {formatLbp(totalLbp)}
              </div>
              <div className="text-[10px] text-stone-400">
                {formatUsd(totalLbp, company.usdRate)} · {orderType === 'hall' ? `طاولة ${tableNumber}` : orderType === 'takeaway' ? 'سفري' : 'دليفري'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCartDrawer}
              className="px-4 py-2 bg-white text-stone-900 hover:bg-stone-100 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700 rounded-xl text-xs font-black shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>معاينة السلة</span>
              <ChevronDown className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Slide-over Cart Drawer */}
      <AnimatePresence>
        {isCartDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseCartDrawer}
              className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-white dark:bg-stone-900 h-full shadow-2xl flex flex-col z-10"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-[#881337] dark:text-rose-400">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-stone-900 dark:text-stone-50">سلة الطلبات</h3>
                    <p className="text-xs text-stone-400">
                      {orderType === 'hall' ? `طاولة ${tableNumber}` : orderType === 'takeaway' ? 'سفري (تيك أواي)' : 'توصيل منزلي'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onCloseCartDrawer}
                  className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition"
                  aria-label="إغلاق السلة"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-grow overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingBag className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-2" />
                    <p className="text-sm font-bold text-stone-600 dark:text-stone-400">سلتك فارغة حالياً</p>
                    <p className="text-xs text-stone-400 mt-1">أضف بعض الصفيحة الطازجة لتجربتها!</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <div className="font-bold text-stone-900 dark:text-stone-100">{item.name}</div>
                          <div className="text-[#881337] dark:text-rose-400 font-black tabular-nums">
                            {formatLbp(item.price * item.quantity)}
                          </div>
                          {item.notes && (
                            <div className="text-[10px] text-amber-600 dark:text-amber-400">
                              *{item.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 bg-white dark:bg-stone-900 p-1 rounded-lg border border-stone-200 dark:border-stone-700">
                        <button
                          onClick={() => {
                            playChime('remove');
                            onUpdateCartQty(item.id, -1);
                          }}
                          className="w-6 h-6 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-black flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-5 text-center font-black">{item.quantity}</span>
                        <button
                          onClick={() => {
                            playChime('add');
                            onUpdateCartQty(item.id, 1);
                          }}
                          className="w-6 h-6 rounded bg-[#be123c] text-white font-black flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))
                )}

                {/* Customer Checkout Details Form */}
                {cart.length > 0 && (
                  <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-3.5 text-xs font-bold">
                    <div className="flex items-center justify-between">
                      <h4 className="text-stone-900 dark:text-stone-100 font-black text-sm flex items-center gap-1.5">
                        <User className="w-4 h-4 dynamic-text" />
                        <span>معلومات مقدم الطلب</span>
                      </h4>
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800">
                        الاسم والرقم مطلوبان لإتمام الطلب *
                      </span>
                    </div>

                    {currentCustomer ? (
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-emerald-600" />
                          <span>مسجل الدخول: {currentCustomer.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={onOpenCustomerAccount}
                          className="text-amber-600 dark:text-amber-400 hover:underline text-[10px] cursor-pointer"
                        >
                          تعديل / سجل طلباتي
                        </button>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[11px] font-bold text-stone-600 dark:text-stone-300 flex items-center justify-between">
                        <span>الطلب متاح كـ زائر بدون حساب</span>
                        <button
                          type="button"
                          onClick={onOpenAuthModal}
                          className="text-amber-600 dark:text-amber-400 hover:underline text-[10px] cursor-pointer"
                        >
                          تسجيل حساب / دخول
                        </button>
                      </div>
                    )}

                    {/* Customer Name Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-stone-800 dark:text-stone-200 flex items-center gap-1 font-bold">
                          <span>الاسم الكامل:</span>
                          <span className="text-rose-600 font-black text-sm">*</span>
                          <span className="text-[10px] text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded">
                            مطلوب
                          </span>
                        </label>
                        {touched.name && formErrors.name && (
                          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">
                            حقل إجباري
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="أدخل اسمك الكريم هنا (مطلوب)..."
                        value={customerName}
                        onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          if (formErrors.name) {
                            setFormErrors(prev => ({ ...prev, name: undefined }));
                          }
                        }}
                        className={`w-full border rounded-xl p-2.5 transition text-xs font-bold text-stone-900 dark:text-stone-50 bg-stone-50 dark:bg-stone-800 ${
                          touched.name && formErrors.name
                            ? 'border-rose-500 ring-2 ring-rose-500/30 bg-rose-50/60 dark:bg-rose-950/30'
                            : 'border-stone-200 dark:border-stone-700 focus:border-[#881337] focus:ring-2 focus:ring-[#881337]/20'
                        }`}
                      />
                      {touched.name && formErrors.name && (
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{formErrors.name}</span>
                        </p>
                      )}
                    </div>

                    {/* Customer Phone Input (Target of CSS selector 2) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-stone-800 dark:text-stone-200 flex items-center gap-1 font-bold">
                          <span>رقم الهاتف (للتواصل والواتساب):</span>
                          <span className="text-rose-600 font-black text-sm">*</span>
                          <span className="text-[10px] text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded">
                            مطلوب
                          </span>
                        </label>
                        {touched.phone && formErrors.phone && (
                          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">
                            حقل إجباري
                          </span>
                        )}
                      </div>
                      <input
                        type="tel"
                        required
                        placeholder="مثال: 03123456 أو 70123456 (مطلوب)..."
                        value={customerPhone}
                        onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
                        onChange={(e) => {
                          setCustomerPhone(e.target.value);
                          if (formErrors.phone) {
                            setFormErrors(prev => ({ ...prev, phone: undefined }));
                          }
                        }}
                        className={`w-full border rounded-xl p-2.5 transition text-xs font-bold font-mono text-stone-900 dark:text-stone-50 bg-stone-50 dark:bg-stone-800 ${
                          touched.phone && formErrors.phone
                            ? 'border-rose-500 ring-2 ring-rose-500/30 bg-rose-50/60 dark:bg-rose-950/30'
                            : 'border-stone-200 dark:border-stone-700 focus:border-[#881337] focus:ring-2 focus:ring-[#881337]/20'
                        }`}
                      />
                      {touched.phone && formErrors.phone && (
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{formErrors.phone}</span>
                        </p>
                      )}
                    </div>

                    {orderType === 'delivery' && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-stone-800 dark:text-stone-200 flex items-center gap-1 font-bold">
                            <span>العنوان بالتفصيل (الشارع، المبنى، الطابق):</span>
                            <span className="text-rose-600 font-black text-sm">*</span>
                            <span className="text-[10px] text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded">
                              مطلوب للدليفري
                            </span>
                          </label>
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="مثال: طرابلس - القبة، شارع الأرز، بناية النور ط2..."
                          value={customerAddress}
                          onBlur={() => setTouched(prev => ({ ...prev, address: true }))}
                          onChange={(e) => {
                            setCustomerAddress(e.target.value);
                            if (formErrors.address) {
                              setFormErrors(prev => ({ ...prev, address: undefined }));
                            }
                          }}
                          className={`w-full border rounded-xl p-2.5 transition text-xs font-bold text-stone-900 dark:text-stone-50 bg-stone-50 dark:bg-stone-800 ${
                            touched.address && formErrors.address
                              ? 'border-rose-500 ring-2 ring-rose-500/30 bg-rose-50/60 dark:bg-rose-950/30'
                              : 'border-stone-200 dark:border-stone-700 focus:border-[#881337] focus:ring-2 focus:ring-[#881337]/20'
                          }`}
                        />
                        {touched.address && formErrors.address && (
                          <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{formErrors.address}</span>
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-stone-700 dark:text-stone-300 mb-1">ملاحظات خاصة للشيف (اختياري):</label>
                      <input
                        type="text"
                        placeholder="مثال: حار زيادة، بدون بصل، صفيحة مقمرة..."
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        className="w-full border rounded-xl p-2.5 bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-50 text-xs font-bold focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20"
                      />
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] font-bold text-amber-900 dark:text-amber-200">
                      💵 طريقة الدفع: نقداً عند الاستلام (كاش بالليرة اللبنانية أو بالدولار أو تحويل Whish Money)
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer & Actions */}
              {cart.length > 0 && (
                <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/80 space-y-3">
                  {/* Validation Error Alert Banner */}
                  {Object.keys(formErrors).some(k => formErrors[k as keyof typeof formErrors]) && (
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>يرجى كتابة الاسم ورقم الهاتف بالكامل للمتابعة وتأكيد الطلب!</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm font-bold">
                    <span>المجموع بالليرة:</span>
                    <span className="text-base font-black text-[#881337] dark:text-rose-400 tabular-nums">
                      {formatLbp(totalLbp)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-200 dark:border-amber-800/50">
                    <span className="text-amber-800 dark:text-amber-300 font-bold">المجموع بالدولار ($):</span>
                    <span className="font-black text-amber-900 dark:text-amber-200 tabular-nums">
                      {formatUsd(totalLbp, company.usdRate)}
                    </span>
                  </div>

                  {orderSubmittedSuccess ? (
                    <div className="p-3 rounded-xl bg-emerald-500 text-white font-bold text-center text-xs flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>تم تسجيل وإرسال طلبك بنجاح! شكراً لك.</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* WhatsApp 1-tap Send */}
                      <button
                        onClick={handleWhatsAppOrder}
                        className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>إرسال وتأكيد الطلب عبر الواتساب</span>
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={handleDirectSubmit}
                          className="py-2.5 px-3 rounded-xl dynamic-bg text-white font-black text-xs shadow transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>تثبيت في السيستم</span>
                        </button>
                        <button
                          onClick={onClearCart}
                          className="py-2.5 px-3 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs hover:bg-stone-300 dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-white transition cursor-pointer"
                        >
                          إفراغ السلة
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Item Customize / Notes Modal */}
      <AnimatePresence>
        {noteModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNoteModalItem(null)}
              className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-white dark:bg-stone-900 rounded-2xl shadow-2xl p-5 z-10 border border-stone-200 dark:border-stone-800 text-right space-y-4"
            >
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                <h3 className="font-black text-base text-stone-900 dark:text-stone-50">
                  تخصيص: {noteModalItem.name}
                </h3>
                <button onClick={() => setNoteModalItem(null)} className="text-stone-400 hover:text-stone-900 dark:hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-2">
                  ملاحظات أو إضافات خاصة للصنف:
                </label>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {['حار زيادة', 'بدون بصل', 'دبس رمان إكسترا', 'خبز مقمر', 'جبنة إكسترا'].map(suggestion => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setCustomNote(prev => prev ? `${prev}، ${suggestion}` : suggestion)}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-white cursor-pointer"
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="اكتب أي ملاحظة تريد إيصالها للفرن..."
                  className="w-full text-xs font-bold p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={confirmCustomizeAdd}
                  className="w-full py-2.5 rounded-xl dynamic-btn font-black text-xs shadow transition cursor-pointer active:scale-95"
                >
                  إضافة مع الملاحظة
                </button>
                <button
                  onClick={() => setNoteModalItem(null)}
                  className="w-full py-2.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs hover:bg-stone-300 dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-white cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
