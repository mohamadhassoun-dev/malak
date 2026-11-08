import React, { useState } from 'react';
import {
  Bell,
  ChefHat,
  Flame,
  CheckCircle,
  UtensilsCrossed,
  Printer,
  CalendarCheck,
  Boxes,
  DollarSign,
  TrendingUp,
  CreditCard,
  Wheat,
  Sliders,
  Database,
  FileSpreadsheet,
  AlertCircle,
  X,
  Volume2,
  Table as TableIcon,
  Receipt,
  FileText,
  ChevronDown,
  ChevronUp,
  Menu as MenuIcon,
  LayoutGrid
} from 'lucide-react';
import {
  AppState,
  CartItem,
  CompanyProfile,
  ExpenseRecord,
  InventoryItem,
  MenuItem,
  OrderRecord,
  OrderStatus,
  OrderType,
  PaymentMethod
} from '../types';
import { formatLbp, formatUsd, playChime, playNewOrderAlertSound } from '../services/storageService';
import { POSView } from './POSView';
import { TablesView } from './TablesView';
import { KitchenView } from './KitchenView';
import { InventoryView } from './InventoryView';
import { MenuManagementView } from './MenuManagementView';
import { TransactionsView } from './TransactionsView';
import { ReportsView } from './ReportsView';

interface AdminMasterViewProps {
  state: AppState;
  cart: CartItem[];
  tablesCount: number;
  newOrderAlert: OrderRecord | null;
  onDismissNewOrderAlert: () => void;
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
  onAddTable: (num: number) => void;
  onRemoveTable: (num: number) => void;
  onClearTable: (num: number) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onUpdateItemStock: (name: string, newQty: number) => void;
  onAddInventoryItem: (item: Omit<InventoryItem, 'id' | 'soldQty'>) => void;
  onAddExpense: (exp: Omit<ExpenseRecord, 'id' | 'date'>) => void;
  onDeleteExpense: (id: number) => void;
  onAddMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  onUpdateMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (id: number) => void;
  onReprintReceipt: (order: OrderRecord) => void;
  onUpdateTransaction: (orderId: string, updatedItems: CartItem[]) => void;
  onDeleteTransaction: (orderId: string) => void;
  onClearAllTransactions: () => void;
  onOpenZReportModal: () => void;
  onOpenSqlModal: () => void;
  onOpenSettingsModal: () => void;
}

export const AdminMasterView: React.FC<AdminMasterViewProps> = ({
  state,
  cart,
  tablesCount,
  newOrderAlert,
  onDismissNewOrderAlert,
  onSetOrderType,
  onSetTableNumber,
  onAddToCart,
  onUpdateCartQty,
  onRemoveCartItem,
  onClearCart,
  onCheckout,
  onAddTable,
  onRemoveTable,
  onClearTable,
  onUpdateOrderStatus,
  onUpdateItemStock,
  onAddInventoryItem,
  onAddExpense,
  onDeleteExpense,
  onAddMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
  onReprintReceipt,
  onUpdateTransaction,
  onDeleteTransaction,
  onClearAllTransactions,
  onOpenZReportModal,
  onOpenSqlModal,
  onOpenSettingsModal,
}) => {
  // Master Active Sub-Section on the same page
  const [adminSection, setAdminSection] = useState<'workstation' | 'tables' | 'inventory' | 'menu' | 'transactions' | 'reports'>('workstation');
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);

  // Aggregates for master strip
  const totalSalesLbp = state.transactions.reduce((s, t) => s + t.totalLbp, 0);
  const totalExpensesLbp = state.expenses.reduce((s, e) => s + e.amount, 0);
  const netCashLbp = totalSalesLbp - totalExpensesLbp;
  const breadItem = state.inventory.find(i => i.name.includes('خبز') || i.name.includes('رغيف')) || state.inventory[0];
  const pendingKitchenCount = state.transactions.filter(t => t.status === 'pending' || t.status === 'preparing').length;

  const sectionsList = [
    {
      id: 'workstation' as const,
      label: 'الكاشير والمطبخ المشترك (Workstation)',
      shortLabel: 'الكاشير والمطبخ',
      icon: UtensilsCrossed,
      desc: 'تسجيل الفواتير السريعة وشاشة الفرن الحجري المباشرة',
      badge: pendingKitchenCount > 0 ? pendingKitchenCount : undefined,
      badgeColor: 'bg-amber-400 text-stone-900'
    },
    {
      id: 'tables' as const,
      label: 'مخطط وإدارة الطاولات (Floor Plan)',
      shortLabel: 'مخطط الطاولات',
      icon: TableIcon,
      desc: 'إشغال الطاولات وإغلاق الحسابات',
      badge: undefined
    },
    {
      id: 'inventory' as const,
      label: 'المستودع ومخزون الخبز والمصاريف',
      shortLabel: 'المستودع والخبز',
      icon: Boxes,
      desc: 'جرد أكياس الخبز، المواد الأولية، وسندات الصرف',
      badge: breadItem && breadItem.qty <= breadItem.minThreshold ? 'تنبيه' : undefined,
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      id: 'menu' as const,
      label: 'قائمة الأصناف والأسعار (Menu)',
      shortLabel: 'قائمة الأصناف',
      icon: ChefHat,
      desc: 'إضافة وتعديل أطباق الصفيحة والمعجنات والأسعار',
      badge: undefined
    },
    {
      id: 'transactions' as const,
      label: 'سجل الفواتير والمعاملات (Transactions)',
      shortLabel: 'سجل الفواتير',
      icon: Receipt,
      desc: 'أرشيف المبيعات وإعادة طباعة الإيصالات الحرارية',
      badge: state.transactions.length > 0 ? state.transactions.length : undefined,
      badgeColor: 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
    },
    {
      id: 'reports' as const,
      label: 'التقارير والأرباح واليومية (Reports)',
      shortLabel: 'التقارير والأرباح',
      icon: TrendingUp,
      desc: 'إحصائيات المبيعات، كشف Z-Report، والأرباح الصافية',
      badge: undefined
    }
  ];

  const currentSectionMeta = sectionsList.find(s => s.id === adminSection) || sectionsList[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-5">
      {/* 1. Real-time New Order Notification Banner (Audio + Visual Alert) */}
      {newOrderAlert && (
        <div className="p-4 rounded-2xl bg-amber-500 text-stone-950 shadow-xl border-2 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-stone-950 text-amber-400">
              <Bell className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <div className="font-black text-base flex items-center gap-2">
                <span>🔔 وصل طلب جديد الآن من الزبون!</span>
                <span className="text-xs bg-stone-900 text-white px-2 py-0.5 rounded-md font-mono">
                  {newOrderAlert.id}
                </span>
              </div>
              <div className="text-xs font-bold text-stone-900 mt-0.5">
                {newOrderAlert.type === 'hall' ? `طاولة رقم ${newOrderAlert.tableNumber}` : newOrderAlert.type === 'takeaway' ? 'سفري (تيك أواي)' : 'دليفري (توصيل)'} · {newOrderAlert.customerName} ·{' '}
                <strong className="underline">{formatLbp(newOrderAlert.totalLbp)}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onReprintReceipt(newOrderAlert);
              }}
              className="px-3.5 py-2 bg-stone-950 hover:bg-stone-900 text-amber-300 rounded-xl text-xs font-black shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة إيصال الطلب</span>
            </button>
            <button
              onClick={() => {
                playNewOrderAlertSound();
              }}
              className="p-2 bg-amber-400 hover:bg-amber-300 text-stone-900 rounded-xl cursor-pointer"
              title="اختبار رنة التنبيه"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={onDismissNewOrderAlert}
              className="p-2 bg-stone-900/10 hover:bg-stone-900/20 text-stone-950 rounded-xl cursor-pointer"
              title="إغلاق التنبيه"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Top Executive Operational Bar & Z-Report Access */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* KPI Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-grow">
          <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
            <div className="text-[10px] text-stone-500 font-bold">مبيعات اليوم</div>
            <div className="text-sm font-black text-stone-900 dark:text-stone-50 tabular-nums">
              {formatLbp(totalSalesLbp)}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
            <div className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold">صافي الصندوق</div>
            <div className={`text-sm font-black tabular-nums ${netCashLbp >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600'}`}>
              {formatLbp(netCashLbp)}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
            <div className="text-[10px] text-amber-800 dark:text-amber-300 font-bold">متبقي الخبز الأسمر</div>
            <div className="text-sm font-black text-amber-900 dark:text-amber-200 tabular-nums">
              {breadItem ? breadItem.qty : 0} رغيف
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">
            <div className="text-[10px] text-rose-800 dark:text-rose-300 font-bold">طلبات المطبخ النشطة</div>
            <div className="text-sm font-black text-rose-700 dark:text-rose-300 tabular-nums">
              {pendingKitchenCount} تذاكر
            </div>
          </div>
        </div>

        {/* Master Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={onOpenZReportModal}
            className="px-4 py-2.5 rounded-xl dynamic-bg text-white text-xs font-black shadow-sm transition flex items-center gap-2 cursor-pointer active:scale-95"
            title="معاينة وطباعة كشف الحساب اليومي Z-Report"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>كشف الحساب اليومي (Z-Report)</span>
          </button>

          <button
            onClick={onOpenSqlModal}
            className="px-3.5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer hover:bg-amber-100"
            title="تصدير قاعدة بيانات SQL لـ Hostinger"
          >
            <Database className="w-4 h-4" />
            <span>قاعدة SQL</span>
          </button>

          <button
            onClick={onOpenSettingsModal}
            className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-white transition cursor-pointer"
            title="إعدادات المطعم، الألوان، والشعار"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Non-Scrolling Vertical Dropdown Menu (Requirement 9) */}
      <div className="relative bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm p-2 sm:p-3">
        {/* Main Dropdown Button / Selector Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsMenuDropdownOpen(!isMenuDropdownOpen)}
            className="flex-1 flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200/70 dark:hover:bg-stone-700/60 border border-stone-200 dark:border-stone-700 transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg dynamic-bg text-white shadow-xs">
                {React.createElement(currentSectionMeta.icon, { className: 'w-4 h-4' })}
              </div>
              <div className="text-right">
                <div className="text-[11px] text-stone-500 dark:text-stone-400 font-bold">
                  القسم النشط حالياً: (اضغط لفتح القائمة المنسدلة ▾)
                </div>
                <div className="text-sm font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span>{currentSectionMeta.label}</span>
                  {currentSectionMeta.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${currentSectionMeta.badgeColor || 'bg-amber-400 text-stone-950'}`}>
                      {currentSectionMeta.badge}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 text-xs font-bold shadow-xs">
              <span>{isMenuDropdownOpen ? 'إغلاق القائمة' : 'تغيير القسم'}</span>
              {isMenuDropdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {/* Quick Shortcuts for Desktop View */}
          <div className="hidden lg:flex items-center gap-1.5 flex-wrap">
            {sectionsList.map(sec => {
              const isSelected = adminSection === sec.id;
              const IconComp = sec.icon;
              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    setAdminSection(sec.id);
                    setIsMenuDropdownOpen(false);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'dynamic-bg text-white shadow-sm'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-stone-950 dark:hover:text-white'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{sec.shortLabel}</span>
                  {sec.badge && (
                    <span className="w-4 h-4 rounded-full bg-amber-400 text-stone-900 text-[9px] font-black flex items-center justify-center">
                      {sec.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Vertical Dropdown Panel (Expands Downwards without Horizontal Scrolling) */}
        {isMenuDropdownOpen && (
          <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 animate-fadeIn">
            {sectionsList.map(sec => {
              const isSelected = adminSection === sec.id;
              const IconComp = sec.icon;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    setAdminSection(sec.id);
                    setIsMenuDropdownOpen(false);
                  }}
                  className={`p-3 rounded-2xl text-right transition border flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? 'border-transparent dynamic-bg text-white shadow-md'
                      : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/90 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/80 hover:text-stone-950 dark:hover:text-white'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'}`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-black text-xs">{sec.label}</span>
                      {sec.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${sec.badgeColor || 'bg-amber-400 text-stone-900'}`}>
                          {sec.badge}
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] mt-0.5 line-clamp-1 ${isSelected ? 'text-white/80' : 'text-stone-500 dark:text-stone-400'}`}>
                      {sec.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Section Renderings */}
      {/* A. Unified Workstation: POS + Live Kitchen side-by-side on same screen */}
      {adminSection === 'workstation' && (
        <div className="space-y-6">
          {/* Live Kitchen Strip on top of POS */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-amber-300 dark:border-amber-900/60 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-stone-100 dark:border-stone-800 pb-2">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-sm text-stone-900 dark:text-stone-50">
                  شاشة المطبخ والفرن الحجري المباشرة (KDS)
                </h3>
              </div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                {pendingKitchenCount} طلبات قيد التحضير والتسليم
              </span>
            </div>

            {state.transactions.filter(t => t.status === 'pending' || t.status === 'preparing').length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-4 font-bold">
                لا توجد طلبات معلقة أمام الفرن حالياً
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {state.transactions
                  .filter(t => t.status === 'pending' || t.status === 'preparing')
                  .slice(0, 6)
                  .map(order => (
                    <div
                      key={order.id}
                      className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border-2 border-amber-400 text-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5 font-black">
                          <span className="dynamic-text font-black">{order.type === 'hall' ? `طاولة ${order.tableNumber}` : order.type === 'takeaway' ? 'سفري' : 'دليفري'}</span>
                          <span className="font-mono text-stone-400 text-[10px]">{order.id}</span>
                        </div>
                        <div className="space-y-1 mb-2">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between font-bold text-stone-800 dark:text-stone-200">
                              <span>{it.quantity}× {it.name}</span>
                              {it.notes && <span className="text-[10px] text-amber-600">*{it.notes}</span>}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-200 dark:border-stone-700 flex gap-2">
                        {order.status === 'pending' ? (
                          <button
                            onClick={() => {
                              playChime('add');
                              onUpdateOrderStatus(order.id, 'preparing');
                            }}
                            className="w-full py-1.5 rounded-lg bg-amber-500 text-stone-900 font-black text-xs hover:bg-amber-600 cursor-pointer"
                          >
                            بدء الخبز
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              playChime('success');
                              onUpdateOrderStatus(order.id, 'ready');
                            }}
                            className="w-full py-1.5 rounded-lg bg-emerald-600 text-white font-black text-xs hover:bg-emerald-700 cursor-pointer"
                          >
                            جاهز للتسليم
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* POS Terminal */}
          <POSView
            menu={state.menu}
            company={state.company}
            cart={cart}
            orderType={state.currentOrderType}
            tableNumber={state.activeTable}
            tablesCount={tablesCount}
            onSetOrderType={onSetOrderType}
            onSetTableNumber={onSetTableNumber}
            onAddToCart={onAddToCart}
            onUpdateCartQty={onUpdateCartQty}
            onRemoveCartItem={onRemoveCartItem}
            onClearCart={onClearCart}
            onCheckout={onCheckout}
          />
        </div>
      )}

      {/* B. Tables Floor Plan */}
      {adminSection === 'tables' && (
        <TablesView
          tables={state.tables}
          activeTable={state.activeTable}
          company={state.company}
          onSelectTable={(tbl) => {
            onSetTableNumber(tbl);
            onSetOrderType('hall');
            setAdminSection('workstation');
          }}
          onAddTable={onAddTable}
          onRemoveTable={onRemoveTable}
          onClearTable={onClearTable}
        />
      )}

      {/* C. Inventory & Bread & Expenses */}
      {adminSection === 'inventory' && (
        <InventoryView
          inventory={state.inventory}
          expenses={state.expenses}
          onUpdateItemStock={onUpdateItemStock}
          onAddInventoryItem={onAddInventoryItem}
          onAddExpense={onAddExpense}
          onDeleteExpense={onDeleteExpense}
          onEndBusinessDay={onOpenZReportModal}
        />
      )}

      {/* D. Menu & Prices Management */}
      {adminSection === 'menu' && (
        <MenuManagementView
          menu={state.menu}
          onAddMenuItem={onAddMenuItem}
          onUpdateMenuItem={onUpdateMenuItem}
          onDeleteMenuItem={onDeleteMenuItem}
        />
      )}

      {/* E. Transactions Log & Receipts */}
      {adminSection === 'transactions' && (
        <TransactionsView
          transactions={state.transactions}
          company={state.company}
          onReprintReceipt={onReprintReceipt}
          onUpdateTransaction={onUpdateTransaction}
          onDeleteTransaction={onDeleteTransaction}
          onClearAllTransactions={onClearAllTransactions}
        />
      )}

      {/* F. Reports & Z-Reports */}
      {adminSection === 'reports' && (
        <ReportsView
          transactions={state.transactions}
          expenses={state.expenses}
          closings={state.closings}
          company={state.company}
          onPrintDailyReport={onOpenZReportModal}
        />
      )}
    </div>
  );
};
