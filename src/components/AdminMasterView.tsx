import React, { useState, useEffect } from 'react';
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
  FileText
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

  // Aggregates for master strip
  const totalSalesLbp = state.transactions.reduce((s, t) => s + t.totalLbp, 0);
  const totalExpensesLbp = state.expenses.reduce((s, e) => s + e.amount, 0);
  const netCashLbp = totalSalesLbp - totalExpensesLbp;
  const breadItem = state.inventory.find(i => i.name.includes('خبز') || i.name.includes('رغيف')) || state.inventory[0];
  const pendingKitchenCount = state.transactions.filter(t => t.status === 'pending' || t.status === 'preparing').length;

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
              className="px-3.5 py-2 bg-stone-950 hover:bg-stone-900 text-amber-300 rounded-xl text-xs font-black shadow transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة إيصال الطلب</span>
            </button>
            <button
              onClick={() => {
                playNewOrderAlertSound();
              }}
              className="p-2 bg-amber-400 hover:bg-amber-300 text-stone-900 rounded-xl"
              title="اختبار رنة التنبيه"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={onDismissNewOrderAlert}
              className="p-2 bg-stone-900/10 hover:bg-stone-900/20 text-stone-950 rounded-xl"
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
            className="px-4 py-2.5 rounded-xl bg-[#881337] hover:bg-[#700f2d] text-white text-xs font-black shadow-sm transition flex items-center gap-2"
            title="معاينة وطباعة كشف الحساب اليومي Z-Report"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>كشف الحساب اليومي (Z-Report)</span>
          </button>

          <button
            onClick={onOpenSqlModal}
            className="px-3.5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold transition flex items-center gap-1.5"
            title="تصدير قاعدة بيانات SQL لـ Hostinger"
          >
            <Database className="w-4 h-4" />
            <span>قاعدة SQL</span>
          </button>

          <button
            onClick={onOpenSettingsModal}
            className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 transition"
            title="إعدادات المطعم والشركة"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Section Selector Bar on the Same Page */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-stone-100 dark:bg-stone-900 p-1.5 rounded-2xl border border-stone-200 dark:border-stone-800 text-xs font-bold">
        <button
          onClick={() => setAdminSection('workstation')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            adminSection === 'workstation'
              ? 'bg-[#881337] text-white shadow'
              : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>الكاشير والمطبخ المشترك (Workstation)</span>
          {pendingKitchenCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-900 text-[10px] font-black flex items-center justify-center">
              {pendingKitchenCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminSection('tables')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            adminSection === 'tables'
              ? 'bg-[#881337] text-white shadow'
              : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
          }`}
        >
          <TableIcon className="w-4 h-4" />
          <span>مخطط الطاولات</span>
        </button>

        <button
          onClick={() => setAdminSection('inventory')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            adminSection === 'inventory'
              ? 'bg-[#881337] text-white shadow'
              : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>المستودع ومخزون الخبز</span>
        </button>

        <button
          onClick={() => setAdminSection('menu')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            adminSection === 'menu'
              ? 'bg-[#881337] text-white shadow'
              : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span>قائمة الأصناف والأسعار</span>
        </button>

        <button
          onClick={() => setAdminSection('transactions')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            adminSection === 'transactions'
              ? 'bg-[#881337] text-white shadow'
              : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>سجل الفواتير والمعاملات</span>
        </button>

        <button
          onClick={() => setAdminSection('reports')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            adminSection === 'reports'
              ? 'bg-[#881337] text-white shadow'
              : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>التقارير والأرباح</span>
        </button>
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
                          <span className="text-[#881337] dark:text-rose-400">{order.type === 'hall' ? `طاولة ${order.tableNumber}` : order.type === 'takeaway' ? 'سفري' : 'دليفري'}</span>
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
                            className="w-full py-1.5 rounded-lg bg-amber-500 text-stone-900 font-black text-xs hover:bg-amber-600"
                          >
                            بدء الخبز
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              playChime('success');
                              onUpdateOrderStatus(order.id, 'ready');
                            }}
                            className="w-full py-1.5 rounded-lg bg-emerald-600 text-white font-black text-xs hover:bg-emerald-700"
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
