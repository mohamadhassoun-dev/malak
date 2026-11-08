import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  MessageCircle,
  Calculator,
  User,
  Phone,
  MapPin,
  UtensilsCrossed,
  DollarSign,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CartItem, CompanyProfile, MenuItem, OrderType, PaymentMethod } from '../types';
import { formatLbp, formatUsd, playChime } from '../services/storageService';

interface POSViewProps {
  menu: MenuItem[];
  company: CompanyProfile;
  cart: CartItem[];
  orderType: OrderType;
  tableNumber: number;
  tablesCount: number;
  onSetOrderType: (type: OrderType) => void;
  onSetTableNumber: (tbl: number) => void;
  onAddToCart: (item: MenuItem) => void;
  onUpdateCartQty: (itemId: number, delta: number) => void;
  onRemoveCartItem: (itemId: number) => void;
  onClearCart: () => void;
  onCheckout: (details: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    paymentMethod: PaymentMethod;
    paidLbp: number;
    paidUsd: number;
  }) => void;
}

export const POSView: React.FC<POSViewProps> = ({
  menu,
  company,
  cart,
  orderType,
  tableNumber,
  tablesCount,
  onSetOrderType,
  onSetTableNumber,
  onAddToCart,
  onUpdateCartQty,
  onRemoveCartItem,
  onClearCart,
  onCheckout,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_lbp');

  // Change calculator
  const [receivedLbp, setReceivedLbp] = useState<string>('');
  const [receivedUsd, setReceivedUsd] = useState<string>('');

  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(menu.map(m => m.category)))];
  }, [menu]);

  const filteredItems = useMemo(() => {
    return menu.filter(item => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch && item.isAvailable;
    });
  }, [menu, selectedCategory, searchQuery]);

  const totalLbp = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalUsd = totalLbp / (company.usdRate || 89500);

  // Change computation
  const paidLbpNum = parseFloat(receivedLbp) || 0;
  const paidUsdNum = parseFloat(receivedUsd) || 0;
  const totalPaidInLbp = paidLbpNum + (paidUsdNum * company.usdRate);
  const changeLbp = totalPaidInLbp > totalLbp ? totalPaidInLbp - totalLbp : 0;
  const changeUsd = changeLbp / company.usdRate;

  const handleCheckoutClick = () => {
    if (!cart.length) return;
    onCheckout({
      customerName: customerName || (orderType === 'hall' ? `طاولة ${tableNumber}` : 'زبون كاشير'),
      customerPhone,
      customerAddress,
      paymentMethod,
      paidLbp: paidLbpNum,
      paidUsd: paidUsdNum
    });
    setReceivedLbp('');
    setReceivedUsd('');
  };

  const handleWhatsAppSend = () => {
    if (!cart.length) return;
    const cleanPhone = company.whatsappPhone.replace(/[^0-9]/g, '');
    let typeText = orderType === 'hall' ? `طاولة رقم ${tableNumber}` : orderType === 'takeaway' ? 'سفري' : 'دليفري';

    let msg = `*فاتورة كاشير - ${company.name}*%0A`;
    msg += `━━━━━━━━━━━━━━━━━━━━━%0A`;
    msg += `🍴 *الطلب:* ${typeText}%0A`;
    if (customerName) msg += `👤 *الزبون:* ${customerName}%0A`;
    if (customerPhone) msg += `📞 *الهاتف:* ${customerPhone}%0A`;
    if (customerAddress && orderType === 'delivery') msg += `📍 *العنوان:* ${customerAddress}%0A`;
    msg += `━━━━━━━━━━━━━━━━━━━━━%0A`;
    cart.forEach((i, idx) => {
      msg += `${idx + 1}. ${i.name} (${i.quantity}×) - ${formatLbp(i.price * i.quantity)}%0A`;
    });
    msg += `━━━━━━━━━━━━━━━━━━━━━%0A`;
    msg += `💰 *الإجمالي:* *${formatLbp(totalLbp)}* (${formatUsd(totalLbp, company.usdRate)})%0A`;

    handleCheckoutClick();
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top Header / Mode Switcher */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-[#881337] dark:text-rose-400">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-stone-900 dark:text-stone-50">
              نقطة البيع السريعة (الكاشير)
            </h2>
            <p className="text-xs text-stone-500">
              تسجيل الطلبات، خصم مخزون الخبز آلياً، والطباعة الحرارية الفورية
            </p>
          </div>
        </div>

        {/* Order Type Tabs */}
        <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 p-1.5 rounded-xl text-xs font-bold">
          <button
            onClick={() => onSetOrderType('hall')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              orderType === 'hall'
                ? 'dynamic-bg text-white shadow'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-700/60'
            }`}
          >
            صالة (طاولة)
          </button>
          <button
            onClick={() => onSetOrderType('takeaway')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              orderType === 'takeaway'
                ? 'dynamic-bg text-white shadow'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-700/60'
            }`}
          >
            تيك أواي (سفري)
          </button>
          <button
            onClick={() => onSetOrderType('delivery')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              orderType === 'delivery'
                ? 'dynamic-bg text-white shadow'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-700/60'
            }`}
          >
            دليفري (توصيل)
          </button>
        </div>
      </div>

      {/* Hall Tables selector bar (if Hall selected) */}
      {orderType === 'hall' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-3 mb-6 shadow-sm flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-stone-500 whitespace-nowrap mr-2">
            الطاولة الحالية:
          </span>
          {Array.from({ length: tablesCount || 8 }, (_, i) => i + 1).map(tNum => (
            <button
              key={tNum}
              onClick={() => onSetTableNumber(tNum)}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition ${
                tableNumber === tNum
                  ? 'bg-amber-500 text-stone-950 shadow-md ring-2 ring-amber-400'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              طاولة {tNum}
            </button>
          ))}
        </div>
      )}

      {/* Customer Info Form (if takeaway or delivery) */}
      {(orderType === 'takeaway' || orderType === 'delivery') && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 mb-6 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
          <div>
            <label className="block text-stone-500 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> اسم الزبون:
            </label>
            <input
              type="text"
              placeholder="اسم الزبون"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
            />
          </div>
          <div>
            <label className="block text-stone-500 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> رقم الهاتف:
            </label>
            <input
              type="tel"
              placeholder="03xxxxxx"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
            />
          </div>
          {orderType === 'delivery' && (
            <div>
              <label className="block text-stone-500 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> عنوان التوصيل:
              </label>
              <input
                type="text"
                placeholder="طرابلس - القبة، شارع..."
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
              />
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Catalog Left / Ticket Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Menu items catalog */}
        <div className="lg:col-span-2 space-y-4">
          {/* Categories & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'dynamic-bg text-white shadow-sm'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  {cat === 'all' ? 'الكل' : cat}
                </button>
              ))}
            </div>

            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="بحث سريع عن صنف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-3 py-1.5 text-xs font-bold rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
              />
            </div>
          </div>

          {/* Items Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  playChime('add');
                  onAddToCart(item);
                }}
                className="p-3 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-[var(--primary-color)] dark:hover:border-amber-400 shadow-sm text-right flex flex-col justify-between transition-all group active:scale-95 cursor-pointer"
              >
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 mb-2 relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {item.deductBread && (
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-stone-900/80 text-amber-300">
                      خبز
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 line-clamp-1 mb-1">
                    {item.name}
                  </h4>
                  <div className="text-xs font-black dynamic-text tabular-nums">
                    {formatLbp(item.price)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Active Ticket & Checkout */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 shadow-sm sticky top-20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-stone-900 dark:text-stone-100">
                    {orderType === 'hall' ? `فاتورة طاولة ${tableNumber}` : orderType === 'takeaway' ? 'فاتورة سفري' : 'فاتورة دليفري'}
                  </span>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={onClearCart}
                    className="text-stone-400 hover:text-rose-600 p-1 text-xs transition flex items-center gap-1 font-bold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>مسح</span>
                  </button>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                {cart.length === 0 ? (
                  <p className="text-center py-10 text-stone-400 text-xs font-bold">
                    السلة فارغة. اضغط على أي صنف لإضافته
                  </p>
                ) : (
                  cart.map(item => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="font-bold text-stone-900 dark:text-stone-100 truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-[#881337] dark:text-rose-400 font-black tabular-nums">
                          {formatLbp(item.price * item.quantity)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            playChime('remove');
                            onUpdateCartQty(item.id, -1);
                          }}
                          className="w-6 h-6 rounded bg-stone-200 dark:bg-stone-700 font-black text-stone-700 dark:text-stone-300 flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-black text-xs">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            playChime('add');
                            onUpdateCartQty(item.id, 1);
                          }}
                          className="w-6 h-6 rounded dynamic-btn font-black flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                        <button
                          onClick={() => onRemoveCartItem(item.id)}
                          className="p-1 text-stone-400 hover:text-rose-500 mr-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Calculations & Payment Box */}
            <div className="pt-3 border-t border-stone-200 dark:border-stone-800 space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-bold text-xs text-stone-500">
                  <span>المجموع الفرعي:</span>
                  <span className="tabular-nums font-black text-stone-800 dark:text-stone-200">
                    {formatLbp(totalLbp)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-base font-black dynamic-text">
                  <span>المجموع النهائي:</span>
                  <span className="tabular-nums text-lg">{formatLbp(totalLbp)}</span>
                </div>
                <div className="flex items-center justify-between text-xs bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-200 dark:border-amber-800/50">
                  <span className="text-amber-800 dark:text-amber-300 font-bold">المجموع بالدولار ($):</span>
                  <span className="font-black text-amber-900 dark:text-amber-200 tabular-nums text-sm">
                    {formatUsd(totalLbp, company.usdRate)}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-stone-500">طريقة الدفع:</label>
                <div className="grid grid-cols-3 gap-1 text-[11px] font-bold">
                  {(['cash_lbp', 'cash_usd', 'whish_money'] as PaymentMethod[]).map(pm => (
                    <button
                      key={pm}
                      onClick={() => setPaymentMethod(pm)}
                      className={`py-1.5 rounded-lg border text-center transition cursor-pointer ${
                        paymentMethod === pm
                          ? 'dynamic-bg text-white dynamic-border'
                          : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:text-stone-900 dark:hover:text-white'
                      }`}
                    >
                      {pm === 'cash_lbp' ? 'كاش ليرة' : pm === 'cash_usd' ? 'كاش دولار' : 'تحويل Whish'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Change Calculator Input */}
              <div className="grid grid-cols-2 gap-2 text-xs font-bold bg-stone-50 dark:bg-stone-800/50 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700">
                <div>
                  <label className="block text-[10px] text-stone-500 mb-0.5">المستلم بالليرة:</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={receivedLbp}
                    onChange={(e) => setReceivedLbp(e.target.value)}
                    className="w-full p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-black tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500 mb-0.5">المستلم بالدولار ($):</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={receivedUsd}
                    onChange={(e) => setReceivedUsd(e.target.value)}
                    className="w-full p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-black tabular-nums"
                  />
                </div>
                {changeLbp > 0 && (
                  <div className="col-span-2 pt-1 border-t flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-black text-xs">
                    <span>الباقي للزبون:</span>
                    <span>{formatLbp(changeLbp)} (${changeUsd.toFixed(2)})</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  disabled={!cart.length}
                  onClick={handleCheckoutClick}
                  className="w-full py-3 px-4 rounded-xl dynamic-btn font-black text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>محاسبة وطباعة الإيصال الحراري</span>
                </button>

                <button
                  disabled={!cart.length}
                  onClick={handleWhatsAppSend}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs shadow transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>محاسبة وإرسال عبر الواتساب</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
