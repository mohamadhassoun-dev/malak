import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  PenSquare,
  Trash2,
  CalendarCheck,
  AlertCircle,
  Receipt,
  Wallet,
  Check,
  Wheat,
  X,
  AlertTriangle
} from 'lucide-react';
import { ExpenseRecord, InventoryItem } from '../types';
import { formatLbp } from '../services/storageService';

interface InventoryViewProps {
  inventory: InventoryItem[];
  expenses: ExpenseRecord[];
  onUpdateItemStock: (name: string, newQty: number) => void;
  onAddInventoryItem: (item: Omit<InventoryItem, 'id' | 'soldQty'>) => void;
  onAddExpense: (exp: Omit<ExpenseRecord, 'id' | 'date'>) => void;
  onDeleteExpense: (id: number) => void;
  onEndBusinessDay: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  expenses,
  onUpdateItemStock,
  onAddInventoryItem,
  onAddExpense,
  onDeleteExpense,
  onEndBusinessDay,
}) => {
  // Modals state
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editQtyValue, setEditQtyValue] = useState<string>('');
  const [stockError, setStockError] = useState<string | null>(null);

  const [showAddInvModal, setShowAddInvModal] = useState<boolean>(false);
  const [newInvName, setNewInvName] = useState<string>('');
  const [newInvQty, setNewInvQty] = useState<string>('100');
  const [newInvUnit, setNewInvUnit] = useState<string>('رغيف');
  const [newInvMin, setNewInvMin] = useState<string>('20');
  const [invError, setInvError] = useState<string | null>(null);

  const [showAddExpModal, setShowAddExpModal] = useState<boolean>(false);
  const [newExpTitle, setNewExpTitle] = useState<string>('');
  const [newExpAmount, setNewExpAmount] = useState<string>('');
  const [newExpCat, setNewExpCat] = useState<ExpenseRecord['category']>('supplies');
  const [expError, setExpError] = useState<string | null>(null);

  // In-app deletion confirm for expense
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseRecord | null>(null);

  // Bread item (special emphasis)
  const breadItem = inventory.find(i => i.name.includes('خبز') || i.name.includes('رغيف')) || inventory[0];

  const openStockModal = (item: InventoryItem) => {
    setEditingItem(item);
    setEditQtyValue(item.qty.toString());
    setStockError(null);
  };

  const handleSaveStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const val = parseFloat(editQtyValue);
    if (isNaN(val) || val < 0) {
      setStockError('يرجى إدخال كمية صحيحة (صفر أو أكثر)');
      return;
    }
    onUpdateItemStock(editingItem.name, val);
    setEditingItem(null);
  };

  const handleAddInvSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvName.trim()) {
      setInvError('يرجى كتابة اسم المادة');
      return;
    }
    const qty = parseFloat(newInvQty) || 0;
    const min = parseFloat(newInvMin) || 10;
    onAddInventoryItem({
      name: newInvName.trim(),
      initialQty: qty,
      qty: qty,
      unit: newInvUnit.trim() || 'قطعة',
      minThreshold: min
    });
    setNewInvName('');
    setShowAddInvModal(false);
  };

  const handleAddExpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpTitle.trim()) {
      setExpError('يرجى إدخال بيان المصروف');
      return;
    }
    const amt = parseFloat(newExpAmount);
    if (isNaN(amt) || amt <= 0) {
      setExpError('يرجى إدخال مبلغ صحيح أكبر من صفر');
      return;
    }
    onAddExpense({
      title: newExpTitle.trim(),
      amount: amt,
      category: newExpCat
    });
    setNewExpTitle('');
    setNewExpAmount('');
    setShowAddExpModal(false);
  };

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-stone-900 dark:text-stone-50">
              إدارة المستودع، مخزون الخبز، والمصاريف
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              حساب الخبز الأسمر المباع آلياً، موازنة المواد، وسجل المصروفات النقدية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setInvError(null);
              setShowAddInvModal(true);
            }}
            className="px-3.5 py-2 rounded-xl dynamic-btn text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مادة للمستودع</span>
          </button>

          <button
            onClick={() => {
              setExpError(null);
              setShowAddExpModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Wallet className="w-4 h-4" />
            <span>تسجيل مصروف</span>
          </button>

          <button
            onClick={onEndBusinessDay}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            title="إنهاء يوم العمل وأرشفة المبيعات وتصفير الصندوق"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>إنهاء يوم العمل (Z-Report)</span>
          </button>
        </div>
      </div>

      {/* Bread Stock Big KPI Cards */}
      {breadItem && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-500 dark:text-stone-400">الرصيد الافتتاحي للخبز</span>
              <Wheat className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-black text-stone-800 dark:text-stone-100 tabular-nums">
              {breadItem.initialQty} <span className="text-xs text-stone-400 font-normal">رغيف</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">بداية الوردية أو اليوم الحالي</p>
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-rose-200 dark:border-rose-950 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">إجمالي الخبز المباع</span>
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            </div>
            <div className="text-3xl font-black dynamic-text tabular-nums">
              {breadItem.soldQty} <span className="text-xs text-stone-400 font-normal">رغيف</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">يُخصم آلياً مع كل صفيحة تُباع</p>
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-950 shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">المتبقي حالياً بالمستودع</span>
              </div>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                {breadItem.qty} <span className="text-xs text-stone-400 font-normal">رغيف</span>
              </div>
              {breadItem.qty <= breadItem.minThreshold && (
                <div className="text-[11px] text-rose-500 font-bold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> تنبيه: اقتراب نفاد الخبز!
                </div>
              )}
            </div>

            <button
              onClick={() => openStockModal(breadItem)}
              className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition cursor-pointer"
              title="تعديل رصيد الخبز المتبقي يدوياً"
            >
              <PenSquare className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Materials Table & Cash Expenses Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Materials Table */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-stone-900 dark:text-stone-50">
              جدول المواد الخام والمستودع
            </h3>
            <span className="text-xs text-stone-400">{inventory.length} مواد مسجلة</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 pb-2">
                  <th className="py-2.5 font-bold">المادة</th>
                  <th className="py-2.5 font-bold text-center">الرصيد المتبقي</th>
                  <th className="py-2.5 font-bold text-center">المباع/المستهلك</th>
                  <th className="py-2.5 font-bold text-center">تعديل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {inventory.map(item => (
                  <tr key={item.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40">
                    <td className="py-3 font-bold text-stone-900 dark:text-stone-100">
                      <div>{item.name}</div>
                      {item.qty <= item.minThreshold && (
                        <span className="text-[10px] text-rose-500 font-bold">مخزون منخفض</span>
                      )}
                    </td>
                    <td className="py-3 text-center tabular-nums font-black text-emerald-600 dark:text-emerald-400">
                      {item.qty} {item.unit}
                    </td>
                    <td className="py-3 text-center tabular-nums font-bold text-stone-500 dark:text-stone-400">
                      {item.soldQty} {item.unit}
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => openStockModal(item)}
                        className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition cursor-pointer"
                        title="تعديل الكمية"
                      >
                        <PenSquare className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-sm text-stone-900 dark:text-stone-50">
                سجل المصاريف النقدية اليومية
              </h3>
              <p className="text-[11px] text-stone-400">تُخصم تلقائياً من صافي أرباح الصندوق</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-stone-400">المجموع: </span>
              <span className="font-black dynamic-text tabular-nums text-sm">
                {formatLbp(totalExpenses)}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            {expenses.length === 0 ? (
              <div className="text-center py-12 text-stone-400 dark:text-stone-500 text-xs font-bold">
                لا توجد مصاريف مسجلة اليوم
              </div>
            ) : (
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 pb-2">
                    <th className="py-2.5 font-bold">البيان</th>
                    <th className="py-2.5 font-bold">المبلغ</th>
                    <th className="py-2.5 font-bold text-center">التاريخ</th>
                    <th className="py-2.5 font-bold text-center">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {expenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40">
                      <td className="py-3 font-bold text-stone-900 dark:text-stone-100">
                        {exp.title}
                      </td>
                      <td className="py-3 font-black text-rose-600 dark:text-rose-400 tabular-nums">
                        {formatLbp(exp.amount)}
                      </td>
                      <td className="py-3 text-center text-stone-400 text-[11px]">
                        {exp.date}
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => setExpenseToDelete(exp)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Edit Stock Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 dark:border-stone-800 text-right space-y-4">
            <h3 className="font-black text-base text-stone-900 dark:text-stone-50 border-b border-stone-200 dark:border-stone-800 pb-2">
              تعديل رصيد المستودع: {editingItem.name}
            </h3>

            {stockError && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-bold">
                {stockError}
              </div>
            )}

            <form onSubmit={handleSaveStock} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-stone-500 dark:text-stone-400 mb-1">
                  الكمية الحالية المتوفرة بالمستودع ({editingItem.unit}):
                </label>
                <input
                  type="number"
                  value={editQtyValue}
                  onChange={(e) => setEditQtyValue(e.target.value)}
                  autoFocus
                  className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-center font-black text-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  حفظ وتحديث الرصيد
                </button>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="w-full py-2.5 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Inventory Item Modal */}
      {showAddInvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-stone-200 dark:border-stone-800 text-right space-y-4">
            <h3 className="font-black text-base text-stone-900 dark:text-stone-50 border-b border-stone-200 dark:border-stone-800 pb-2">
              إضافة مادة خام جديدة للمستودع
            </h3>

            {invError && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-bold">
                {invError}
              </div>
            )}

            <form onSubmit={handleAddInvSubmit} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-stone-500 dark:text-stone-400 mb-1">اسم المادة:</label>
                <input
                  type="text"
                  placeholder="مثال: طماطم طازجة، بصل، بهار حلو..."
                  value={newInvName}
                  onChange={(e) => setNewInvName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-500 dark:text-stone-400 mb-1">الكمية الافتتاحية:</label>
                  <input
                    type="number"
                    value={newInvQty}
                    onChange={(e) => setNewInvQty(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-stone-500 dark:text-stone-400 mb-1">الوحدة:</label>
                  <input
                    type="text"
                    value={newInvUnit}
                    onChange={(e) => setNewInvUnit(e.target.value)}
                    placeholder="رغيف / كغ / لتر"
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-500 dark:text-stone-400 mb-1">حد الإنذار بنقص الكمية:</label>
                <input
                  type="number"
                  value={newInvMin}
                  onChange={(e) => setNewInvMin(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl dynamic-btn text-white font-bold cursor-pointer"
                >
                  حفظ المادة
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddInvModal(false)}
                  className="w-full py-2.5 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 dark:border-stone-800 text-right space-y-4">
            <h3 className="font-black text-base text-stone-900 dark:text-stone-50 border-b border-stone-200 dark:border-stone-800 pb-2">
              تسجيل مصروف نقدي من الصندوق
            </h3>

            {expError && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-bold">
                {expError}
              </div>
            )}

            <form onSubmit={handleAddExpSubmit} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-stone-500 dark:text-stone-400 mb-1">البيان (اسم المصروف):</label>
                <input
                  type="text"
                  placeholder="مثال: فاتورة كهرباء، شراء خضار، صيانة فرن..."
                  value={newExpTitle}
                  onChange={(e) => setNewExpTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-stone-500 dark:text-stone-400 mb-1">المبلغ بالليرة اللبنانية (ل.ل):</label>
                <input
                  type="number"
                  placeholder="مثال: 500000"
                  value={newExpAmount}
                  onChange={(e) => setNewExpAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-black text-base"
                />
              </div>

              <div>
                <label className="block text-stone-500 dark:text-stone-400 mb-1">نوع المصروف:</label>
                <select
                  value={newExpCat}
                  onChange={(e) => setNewExpCat(e.target.value as ExpenseRecord['category'])}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold"
                >
                  <option value="supplies">مشتريات ومواد غذائية</option>
                  <option value="utilities">فواتير وكهرباء ومازوت</option>
                  <option value="salaries">أجور ويوميات موظفين</option>
                  <option value="maintenance">صيانة وتجهيزات</option>
                  <option value="other">مصاريف أخرى</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer"
                >
                  تسجيل وخصم من الصندوق
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddExpModal(false)}
                  className="w-full py-2.5 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Expense Confirmation Modal */}
      {expenseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 text-right space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-stone-900 dark:text-stone-50">
                  حذف المصروف
                </h3>
                <p className="text-xs text-stone-500">{expenseToDelete.title}</p>
              </div>
            </div>
            <p className="text-xs font-bold text-stone-600 dark:text-stone-300">
              هل أنت متأكد من حذف هذا المصروف بمبلغ {formatLbp(expenseToDelete.amount)}؟
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  onDeleteExpense(expenseToDelete.id);
                  setExpenseToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer"
              >
                نعم، حذف المصروف
              </button>
              <button
                onClick={() => setExpenseToDelete(null)}
                className="py-2.5 px-4 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
