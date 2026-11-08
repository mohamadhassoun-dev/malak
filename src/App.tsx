import React, { useState, useEffect } from 'react';
import { AppState, CartItem, MenuItem, OrderRecord, OrderType, PaymentMethod, AppUser, CompanyProfile, InventoryItem, ExpenseRecord, OrderStatus } from './types';
import { loadInitialState, saveStateToStorage, subscribeToCrossTabSync, playChime, playNewOrderAlertSound } from './services/storageService';
import { printThermalOrder, printThermalZReport } from './services/printService';
import { Navbar } from './components/Navbar';
import { CustomerView } from './components/CustomerView';
import { AdminMasterView } from './components/AdminMasterView';
import { ZReportModal } from './components/ZReportModal';
import { SqlExportModal } from './components/SqlExportModal';
import { SettingsModal } from './components/SettingsModal';
import { LoginModal } from './components/LoginModal';
import { ThermalReceipt } from './components/ThermalReceipt';
import { DEFAULT_COMPANY, DEFAULT_USERS } from './data/defaultData';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadInitialState());
  const [currentTab, setCurrentTab] = useState<string>('customer');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('malak_dark_mode') === 'true';
    }
    return false;
  });

  // Modals & Alerts
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isZReportModalOpen, setIsZReportModalOpen] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState<OrderRecord | null>(null);

  // Printing state
  const [printOrder, setPrintOrder] = useState<OrderRecord | null>(null);
  const [reportPrintData, setReportPrintData] = useState<{
    date: string;
    totalSalesLbp: number;
    totalSalesUsd: number;
    totalExpensesLbp: number;
    netCashLbp: number;
    itemsSummary: { name: string; qty: number; total: number }[];
  } | null>(null);

  // Subscribe to cross-tab updates (real-time sync across multiple windows/tabs)
  useEffect(() => {
    const unsubscribe = subscribeToCrossTabSync(() => {
      setState(loadInitialState());
    });
    return () => unsubscribe();
  }, []);

  // Save changes to storage whenever state updates
  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  // Apply dark mode & dynamic theme color to root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('malak_dark_mode', String(isDarkMode));

    const color = state.company.primaryColor || '#881337';
    document.documentElement.style.setProperty('--primary-color', color);
    document.documentElement.style.setProperty('--btn-color', color);
  }, [isDarkMode, state.company.primaryColor]);

  // Active Cart helper
  const getActiveCart = (): CartItem[] => {
    if (state.currentOrderType === 'hall') {
      return state.tables[state.activeTable] || [];
    }
    if (state.currentOrderType === 'takeaway') {
      return state.takeawayCart || [];
    }
    return state.deliveryCart || [];
  };

  const updateActiveCart = (newCart: CartItem[]) => {
    setState(prev => {
      if (prev.currentOrderType === 'hall') {
        return {
          ...prev,
          tables: {
            ...prev.tables,
            [prev.activeTable]: newCart
          }
        };
      }
      if (prev.currentOrderType === 'takeaway') {
        return { ...prev, takeawayCart: newCart };
      }
      return { ...prev, deliveryCart: newCart };
    });
  };

  // Cart operations
  const handleAddToCart = (item: MenuItem, notes?: string) => {
    const current = getActiveCart();
    const existingIdx = current.findIndex(c => c.id === item.id && (c.notes || '') === (notes || ''));

    if (existingIdx !== -1) {
      const next = [...current];
      next[existingIdx].quantity += 1;
      updateActiveCart(next);
    } else {
      updateActiveCart([...current, { ...item, quantity: 1, notes }]);
    }
  };

  const handleUpdateCartQty = (itemId: number, delta: number) => {
    const current = getActiveCart();
    const idx = current.findIndex(c => c.id === itemId);
    if (idx !== -1) {
      const next = [...current];
      next[idx].quantity += delta;
      if (next[idx].quantity <= 0) {
        next.splice(idx, 1);
      }
      updateActiveCart(next);
    }
  };

  const handleRemoveCartItem = (itemId: number) => {
    const current = getActiveCart();
    updateActiveCart(current.filter(c => c.id !== itemId));
  };

  const handleClearCart = () => {
    updateActiveCart([]);
  };

  // Deduct bread from inventory upon order completion
  const deductBreadInventory = (cart: CartItem[], currentInv: InventoryItem[]): InventoryItem[] => {
    let breadToDeduct = 0;
    cart.forEach(item => {
      if (item.deductBread) {
        breadToDeduct += item.quantity;
      }
    });

    if (breadToDeduct === 0) return currentInv;

    return currentInv.map(invItem => {
      if (invItem.name.includes('خبز') || invItem.name.includes('رغيف')) {
        const sold = (invItem.soldQty || 0) + breadToDeduct;
        const initial = invItem.initialQty || (invItem.qty + sold);
        const remaining = Math.max(0, initial - sold);
        return {
          ...invItem,
          initialQty: initial,
          soldQty: sold,
          qty: remaining
        };
      }
      return invItem;
    });
  };

  // Submit order from POS or Customer view
  const handleCheckoutOrder = (details: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    paymentMethod: PaymentMethod;
    paidLbp: number;
    paidUsd: number;
    notes?: string;
  }) => {
    const cart = getActiveCart();
    if (!cart.length) return;

    const totalLbp = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const totalUsd = totalLbp / (state.company.usdRate || 89500);

    const newOrder: OrderRecord = {
      id: 'TRX-' + Math.floor(100000 + Math.random() * 900000),
      type: state.currentOrderType,
      tableNumber: state.currentOrderType === 'hall' ? state.activeTable : undefined,
      customerName: details.customerName || (state.currentOrderType === 'hall' ? `طاولة ${state.activeTable}` : 'زبون'),
      customerPhone: details.customerPhone,
      customerAddress: details.customerAddress,
      notes: details.notes,
      items: [...cart],
      totalLbp,
      totalUsd,
      usdRate: state.company.usdRate || 89500,
      status: 'pending',
      paymentMethod: details.paymentMethod,
      createdAt: new Date().toLocaleString('ar-LB'),
      cashierName: state.activeUser.name
    };

    // Update inventory bread deduction
    const updatedInv = deductBreadInventory(cart, state.inventory);

    setState(prev => {
      const nextTables = { ...prev.tables };
      if (prev.currentOrderType === 'hall') {
        nextTables[prev.activeTable] = [];
      }

      return {
        ...prev,
        transactions: [newOrder, ...prev.transactions],
        inventory: updatedInv,
        tables: nextTables,
        takeawayCart: prev.currentOrderType === 'takeaway' ? [] : prev.takeawayCart,
        deliveryCart: prev.currentOrderType === 'delivery' ? [] : prev.deliveryCart
      };
    });

    playChime('order');
    setNewOrderAlert(newOrder);
    playNewOrderAlertSound();

    // Trigger robust thermal printing (80mm isolated engine + native print backup)
    printThermalOrder(newOrder, state.company);
    setReportPrintData(null);
    setPrintOrder(newOrder);
  };

  // Direct order submission from Customer Storefront
  const handleCustomerSubmitOrder = (customerDetails: {
    name: string;
    phone: string;
    address: string;
    notes: string;
  }) => {
    handleCheckoutOrder({
      customerName: customerDetails.name,
      customerPhone: customerDetails.phone,
      customerAddress: customerDetails.address,
      notes: customerDetails.notes,
      paymentMethod: 'cash_lbp',
      paidLbp: 0,
      paidUsd: 0
    });
  };

  // Thermal reprint of a past invoice
  const handleReprintReceipt = (order: OrderRecord) => {
    printThermalOrder(order, state.company);
    setReportPrintData(null);
    setPrintOrder(order);
  };

  // Print Daily Z-Report
  const handlePrintDailyReport = () => {
    setIsZReportModalOpen(true);
  };

  const handlePrintZReportFromModal = () => {
    const totalSalesLbp = state.transactions.reduce((s, t) => s + t.totalLbp, 0);
    const totalSalesUsd = totalSalesLbp / (state.company.usdRate || 89500);
    const totalExpensesLbp = state.expenses.reduce((s, e) => s + e.amount, 0);
    const netCashLbp = totalSalesLbp - totalExpensesLbp;

    const itemMap: Record<string, { qty: number; total: number }> = {};
    state.transactions.forEach(t => {
      t.items.forEach(i => {
        if (!itemMap[i.name]) itemMap[i.name] = { qty: 0, total: 0 };
        itemMap[i.name].qty += i.quantity;
        itemMap[i.name].total += (i.price * i.quantity);
      });
    });

    const itemsSummary = Object.entries(itemMap).map(([name, val]) => ({
      name,
      qty: val.qty,
      total: val.total
    }));

    const breadItemRef = state.inventory.find(i => i.name.includes('خبز') || i.name.includes('رغيف'));
    const breadSoldRef = breadItemRef ? (breadItemRef.soldQty || 0) : 0;
    const breadRemainingRef = breadItemRef ? breadItemRef.qty : 0;

    // 1. Direct isolated thermal print
    printThermalZReport({
      date: new Date().toLocaleDateString('ar-LB'),
      time: new Date().toLocaleTimeString('ar-LB', { hour: '2-digit', minute: '2-digit' }),
      company: state.company,
      totalSalesLbp,
      totalSalesUsd,
      totalExpensesLbp,
      netCashLbp,
      ordersCount: state.transactions.length,
      breadSold: breadSoldRef,
      breadRemaining: breadRemainingRef,
      itemsSummary,
      closedBy: state.activeUser.name
    });

    // 2. Set backup in-page state
    setPrintOrder(null);
    setReportPrintData({
      date: new Date().toLocaleDateString('ar-LB'),
      totalSalesLbp,
      totalSalesUsd,
      totalExpensesLbp,
      netCashLbp,
      itemsSummary
    });
  };

  // End Business Day (Day Closure / Z-Report)
  const handleConfirmEndDay = () => {
    const totalSalesLbp = state.transactions.reduce((s, t) => s + t.totalLbp, 0);
    const totalSalesUsd = totalSalesLbp / (state.company.usdRate || 89500);
    const totalExpensesLbp = state.expenses.reduce((s, e) => s + e.amount, 0);
    const netCashLbp = totalSalesLbp - totalExpensesLbp;

    const breadItem = state.inventory.find(i => i.name.includes('خبز') || i.name.includes('رغيف'));
    const breadSold = breadItem ? (breadItem.soldQty || 0) : 0;

    const closingRecord = {
      id: 'CLOSE-' + Date.now(),
      date: new Date().toLocaleDateString('ar-LB'),
      totalSalesLbp,
      totalSalesUsd,
      totalExpensesLbp,
      netCashLbp,
      ordersCount: state.transactions.length,
      breadSold,
      closedBy: state.activeUser.name,
      closedAt: new Date().toISOString()
    };

    // Reset daily counters
    setState(prev => {
      const resetInv = prev.inventory.map(item => {
        if (item.name.includes('خبز') || item.name.includes('رغيف')) {
          return {
            ...item,
            initialQty: item.qty, // current remaining becomes new initial
            soldQty: 0
          };
        }
        return item;
      });

      return {
        ...prev,
        transactions: [],
        expenses: [],
        inventory: resetInv,
        closings: [closingRecord, ...prev.closings]
      };
    });

    setIsZReportModalOpen(false);
    alert('تم إنهاء يوم العمل وتصفير المبيعات مع أرشفة اليومية بنجاح!');
  };

  // Update order status in KDS
  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(o => (o.id === orderId ? { ...o, status } : o))
    }));
  };

  // Table operations
  const handleAddTable = (num: number) => {
    setState(prev => ({
      ...prev,
      tables: {
        ...prev.tables,
        [num]: []
      },
      activeTable: num
    }));
  };

  const handleRemoveTable = (num: number) => {
    setState(prev => {
      const next = { ...prev.tables };
      delete next[num];
      const remainingNums = Object.keys(next).map(Number);
      return {
        ...prev,
        tables: next,
        activeTable: remainingNums.length > 0 ? remainingNums[0] : 1
      };
    });
  };

  const handleClearTable = (num: number) => {
    setState(prev => ({
      ...prev,
      tables: {
        ...prev.tables,
        [num]: []
      }
    }));
  };

  // Inventory actions
  const handleUpdateItemStock = (name: string, newQty: number) => {
    setState(prev => ({
      ...prev,
      inventory: prev.inventory.map(i => {
        if (i.name === name) {
          const sold = i.soldQty || 0;
          return {
            ...i,
            qty: newQty,
            initialQty: newQty + sold
          };
        }
        return i;
      })
    }));
  };

  const handleAddInventoryItem = (item: Omit<InventoryItem, 'id' | 'soldQty'>) => {
    setState(prev => ({
      ...prev,
      inventory: [...prev.inventory, { ...item, id: Date.now(), soldQty: 0 }]
    }));
  };

  const handleAddExpense = (exp: Omit<ExpenseRecord, 'id' | 'date'>) => {
    setState(prev => ({
      ...prev,
      expenses: [
        {
          ...exp,
          id: Date.now(),
          date: new Date().toLocaleDateString('ar-LB') + ' ' + new Date().toLocaleTimeString('ar-LB', { hour: '2-digit', minute: '2-digit' })
        },
        ...prev.expenses
      ]
    }));
  };

  const handleDeleteExpense = (id: number) => {
    setState(prev => ({
      ...prev,
      expenses: prev.expenses.filter(e => e.id !== id)
    }));
  };

  // Menu actions
  const handleAddMenuItem = (item: Omit<MenuItem, 'id'>) => {
    setState(prev => ({
      ...prev,
      menu: [...prev.menu, { ...item, id: Date.now() }]
    }));
  };

  const handleUpdateMenuItem = (updated: MenuItem) => {
    setState(prev => ({
      ...prev,
      menu: prev.menu.map(m => (m.id === updated.id ? updated : m))
    }));
  };

  const handleDeleteMenuItem = (id: number) => {
    setState(prev => ({
      ...prev,
      menu: prev.menu.filter(m => m.id !== id)
    }));
  };

  // Transaction actions
  const handleUpdateTransaction = (orderId: string, updatedItems: CartItem[]) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => {
        if (t.id === orderId) {
          const totalLbp = updatedItems.reduce((s, i) => s + (i.price * i.quantity), 0);
          return {
            ...t,
            items: updatedItems,
            totalLbp,
            totalUsd: totalLbp / (t.usdRate || prev.company.usdRate || 89500)
          };
        }
        return t;
      })
    }));
  };

  const handleDeleteTransaction = (orderId: string) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== orderId)
    }));
  };

  const handleClearAllTransactions = () => {
    setState(prev => ({ ...prev, transactions: [] }));
  };

  // Company and User settings
  const handleSaveCompany = (updated: CompanyProfile) => {
    setState(prev => ({ ...prev, company: updated }));
  };

  const handleResetDefaults = () => {
    setState(prev => ({ ...prev, company: DEFAULT_COMPANY }));
  };

  // Authentication & Role Management (Admin and Customer only)
  const handleLoginAsAdmin = () => {
    const admin = state.users.find(u => u.role === 'admin') || DEFAULT_USERS[0];
    setState(prev => ({ ...prev, activeUser: admin }));
    setCurrentTab('admin');
  };

  const handleSwitchToCustomer = () => {
    const customer = state.users.find(u => u.role === 'customer') || DEFAULT_USERS[1];
    setState(prev => ({ ...prev, activeUser: customer }));
    setCurrentTab('customer');
  };

  const handleUpdateAdminPin = (newPin: string) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => (u.role === 'admin' ? { ...u, pin: newPin } : u)),
      activeUser: prev.activeUser.role === 'admin' ? { ...prev.activeUser, pin: newPin } : prev.activeUser
    }));
  };

  const handleSelectTab = (tab: string) => {
    if (state.activeUser.role !== 'admin' && tab !== 'customer') {
      setIsLoginModalOpen(true);
      return;
    }
    setCurrentTab(tab);
  };

  const handleUpdateUsdRate = (rate: number) => {
    setState(prev => ({
      ...prev,
      company: { ...prev.company, usdRate: rate }
    }));
  };

  const cart = getActiveCart();
  const tablesCount = Object.keys(state.tables).length;
  const adminUser = state.users.find(u => u.role === 'admin') || DEFAULT_USERS[0];
  const breadItem = state.inventory.find(i => i.name.includes('خبز') || i.name.includes('رغيف')) || state.inventory[0];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col justify-between">
      <div>
        {/* Navigation Bar */}
        <Navbar
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          company={state.company}
          activeUser={state.activeUser}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenSqlExport={() => setIsSqlModalOpen(true)}
          onUpdateUsdRate={handleUpdateUsdRate}
          cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
          onOpenCartDrawer={() => setIsCartDrawerOpen(true)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onSwitchToCustomer={handleSwitchToCustomer}
        />

        {/* Tab Views: Customer or Unified Admin Master Console */}
        {currentTab === 'customer' ? (
          <CustomerView
            menu={state.menu}
            company={state.company}
            cart={cart}
            orderType={state.currentOrderType}
            tableNumber={state.activeTable}
            tablesCount={tablesCount}
            onAddToCart={handleAddToCart}
            onUpdateCartQty={handleUpdateCartQty}
            onClearCart={handleClearCart}
            onSetOrderType={(type) => setState(prev => ({ ...prev, currentOrderType: type }))}
            onSetTableNumber={(tbl) => setState(prev => ({ ...prev, activeTable: tbl }))}
            onSubmitOrder={handleCustomerSubmitOrder}
            isCartDrawerOpen={isCartDrawerOpen}
            onCloseCartDrawer={() => setIsCartDrawerOpen(false)}
            onOpenCartDrawer={() => setIsCartDrawerOpen(true)}
          />
        ) : (
          <AdminMasterView
            state={state}
            cart={cart}
            tablesCount={tablesCount}
            newOrderAlert={newOrderAlert}
            onDismissNewOrderAlert={() => setNewOrderAlert(null)}
            onSetOrderType={(type) => setState(prev => ({ ...prev, currentOrderType: type }))}
            onSetTableNumber={(tbl) => setState(prev => ({ ...prev, activeTable: tbl }))}
            onAddToCart={handleAddToCart}
            onUpdateCartQty={handleUpdateCartQty}
            onRemoveCartItem={handleRemoveCartItem}
            onClearCart={handleClearCart}
            onCheckout={handleCheckoutOrder}
            onAddTable={handleAddTable}
            onRemoveTable={handleRemoveTable}
            onClearTable={handleClearTable}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateItemStock={handleUpdateItemStock}
            onAddInventoryItem={handleAddInventoryItem}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            onAddMenuItem={handleAddMenuItem}
            onUpdateMenuItem={handleUpdateMenuItem}
            onDeleteMenuItem={handleDeleteMenuItem}
            onReprintReceipt={handleReprintReceipt}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onClearAllTransactions={handleClearAllTransactions}
            onOpenZReportModal={handlePrintDailyReport}
            onOpenSqlModal={() => setIsSqlModalOpen(true)}
            onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 py-6 text-center text-xs text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-right sm:text-right">
            <strong className="font-black text-stone-900 dark:text-stone-100">
              {state.company.footerCopyrightText || `${state.company.name} · تأسيس ${state.company.establishmentYear} · ${state.company.city} - ${state.company.address}`}
            </strong>
            {state.company.footerNote && (
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
                {state.company.footerNote}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-stone-600 dark:text-stone-400">
            <span>هاتف: {state.company.phone}</span>
            <span>·</span>
            <span>واتساب: {state.company.whatsappPhone}</span>
            <span>·</span>
            <button
              onClick={() => setIsSqlModalOpen(true)}
              className="text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
            >
              دليل Hostinger & SQL
            </button>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <SqlExportModal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
        state={state}
        onRestoreState={(restored) => setState(restored)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        company={state.company}
        onSaveCompany={handleSaveCompany}
        onResetDefaults={handleResetDefaults}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        adminUser={adminUser}
        isAdminActive={state.activeUser.role === 'admin'}
        onLoginAsAdmin={handleLoginAsAdmin}
        onSwitchToCustomer={handleSwitchToCustomer}
        onUpdateAdminPin={handleUpdateAdminPin}
      />

      {/* Daily Z-Report Review & Thermal Print Modal */}
      <ZReportModal
        isOpen={isZReportModalOpen}
        onClose={() => setIsZReportModalOpen(false)}
        transactions={state.transactions}
        expenses={state.expenses}
        company={state.company}
        breadSold={breadItem ? (breadItem.soldQty || 0) : 0}
        breadRemaining={breadItem ? breadItem.qty : 0}
        onPrintThermal={handlePrintZReportFromModal}
        onConfirmEndDay={handleConfirmEndDay}
      />

      {/* Hidden Print Container for 72mm / 80mm Thermal Receipts & Z-Reports */}
      <ThermalReceipt
        order={printOrder}
        company={state.company}
        reportData={reportPrintData}
      />
    </div>
  );
}
