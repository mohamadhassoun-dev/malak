import React, { useState, useMemo } from 'react';
import {
  Search,
  Printer,
  PenSquare,
  Trash2,
  Receipt,
  Plus,
  Minus,
  Check,
  X,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import { CartItem, CompanyProfile, OrderRecord } from '../types';
import { formatLbp, formatUsd } from '../services/storageService';
import { exportOrdersToCSV, downloadFile } from '../services/sqlGenerator';

interface TransactionsViewProps {
  transactions: OrderRecord[];
  company: CompanyProfile;
  onReprintReceipt: (order: OrderRecord) => void;
  onUpdateTransaction: (orderId: string, updatedItems: CartItem[]) => void;
  onDeleteTransaction: (orderId: string) => void;
  onClearAllTransactions: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  company,
  onReprintReceipt,
  onUpdateTransaction,
  onDeleteTransaction,
  onClearAllTransactions,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');

  // Edit Invoice modal
  const [editingOrder, setEditingOrder] = useState<OrderRecord | null>(null);
  const [tempItems, setTempItems] = useState<CartItem[]>([]);

  // In-app confirmation dialogs (replacing window.confirm)
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [showZeroItemsConfirm, setShowZeroItemsConfirm] = useState<boolean>(false);

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.customerPhone && t.customerPhone.includes(searchQuery)) ||
        t.items.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchType = filterType === 'all' || t.type === filterType;
      return matchSearch && matchType;
    });
  }, [transactions, searchQuery, filterType]);

  const openEditModal = (order: OrderRecord) => {
    setEditingOrder(order);
    setTempItems(JSON.parse(JSON.stringify(order.items || [])));
  };

  const handleUpdateItemQty = (idx: number, delta: number) => {
    setTempItems(prev => {
      const next = [...prev];
      next[idx].quantity += delta;
      if (next[idx].quantity <= 0) {
        next.splice(idx, 1);
      }
      return next;
    });
  };

  const saveEditedOrder = () => {
    if (!editingOrder) return;
    if (tempItems.length === 0) {
      setShowZeroItemsConfirm(true);
      return;
    }
    onUpdateTransaction(editingOrder.id, tempItems);
    setEditingOrder(null);
  };

  const confirmZeroItemsDeletion = () => {
    if (editingOrder) {
      onDeleteTransaction(editingOrder.id);
      setEditingOrder(null);
      setShowZeroItemsConfirm(false);
    }
  };

  const handleExportCSV = () => {
    const csv = exportOrdersToCSV(filtered);
    downloadFile(csv, `orders_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
  };

  const editTotalLbp = tempItems.reduce((s, i) => s + (i.price * i.quantity), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-stone-900 dark:text-stone-50">
            سجل الفواتير والمعاملات والمبيعات
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            البحث في الفواتير السابقة، إعادة الطباعة الحرارية، وتعديل بنود الفاتورة
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            title="تصدير الفواتير الحالية كملف Excel / CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير Excel (CSV)</span>
          </button>

          {transactions.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>مسح السجل</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm text-xs font-bold">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث برقم الفاتورة (مثال: TRX-102938)، اسم الزبون، أو الصنف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          />
        </div>

        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
          >
            <option value="all">جميع أنواع الطلبات</option>
            <option value="hall">طاولات الصالة</option>
            <option value="takeaway">سفري (تيك أواي)</option>
            <option value="delivery">دليفري (توصيل)</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-stone-400 dark:text-stone-500 text-xs font-bold">
            لا توجد فواتير مطابقة لخيارات البحث
          </div>
        ) : (
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 pb-3">
                <th className="py-3 font-bold">رقم الفاتورة</th>
                <th className="py-3 font-bold">النوع</th>
                <th className="py-3 font-bold">الزبون / العنوان</th>
                <th className="py-3 font-bold">الأصناف المسجلة</th>
                <th className="py-3 font-bold">المجموع (ل.ل)</th>
                <th className="py-3 font-bold">الوقت والتاريخ</th>
                <th className="py-3 font-bold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filtered.map(order => {
                const typeLabel = order.type === 'hall'
                  ? `طاولة ${order.tableNumber || 1}`
                  : order.type === 'takeaway'
                  ? 'سفري'
                  : 'دليفري';

                return (
                  <tr key={order.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition">
                    <td className="py-3 font-mono font-black text-stone-900 dark:text-stone-100">
                      {order.id}
                    </td>

                    <td className="py-3">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        {typeLabel}
                      </span>
                    </td>

                    <td className="py-3 font-bold text-stone-700 dark:text-stone-300">
                      <div>{order.customerName}</div>
                      {order.customerPhone && (
                        <div className="text-[10px] text-stone-400 font-normal">{order.customerPhone}</div>
                      )}
                    </td>

                    <td className="py-3 text-stone-600 dark:text-stone-300 font-medium max-w-xs truncate">
                      {order.items.map(i => `${i.name} (${i.quantity})`).join(', ')}
                    </td>

                    <td className="py-3 font-black dynamic-text tabular-nums">
                      <div>{formatLbp(order.totalLbp)}</div>
                      <div className="text-[10px] text-stone-400 font-normal">
                        {formatUsd(order.totalLbp, order.usdRate)}
                      </div>
                    </td>

                    <td className="py-3 text-stone-400 text-[11px] font-medium whitespace-nowrap">
                      {order.createdAt}
                    </td>

                    <td className="py-3 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onReprintReceipt(order)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                          title="إعادة طباعة حرارية"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>طباعة</span>
                        </button>

                        <button
                          onClick={() => openEditModal(order)}
                          className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition cursor-pointer"
                          title="تعديل بنود الفاتورة"
                        >
                          <PenSquare className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setOrderToDelete(order.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 transition cursor-pointer"
                          title="حذف الفاتورة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Invoice Items Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 text-right space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="font-black text-base text-stone-900 dark:text-stone-50">
                تعديل بنود الفاتورة: {editingOrder.id}
              </h3>
              <button onClick={() => setEditingOrder(null)} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {tempItems.length === 0 ? (
                <p className="text-center py-6 text-rose-500 font-bold text-xs">
                  الفاتورة خالية من الأصناف (سيؤدي الحفظ إلى حذفها)
                </p>
              ) : (
                tempItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-stone-900 dark:text-stone-100">{item.name}</div>
                      <div className="text-[11px] dynamic-text font-black tabular-nums">
                        {formatLbp(item.price * item.quantity)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white dark:bg-stone-900 p-1 rounded-lg border border-stone-200 dark:border-stone-700">
                      <button
                        onClick={() => handleUpdateItemQty(idx, -1)}
                        className="w-6 h-6 rounded bg-stone-100 dark:bg-stone-800 font-black text-stone-700 dark:text-stone-300 flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-5 text-center font-black">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateItemQty(idx, 1)}
                        className="w-6 h-6 rounded dynamic-bg text-white font-black flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs font-bold">
              <span>المجموع التراكمي الجديد:</span>
              <span className="text-base font-black dynamic-text tabular-nums">
                {formatLbp(editTotalLbp)}
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={saveEditedOrder}
                className="w-full py-2.5 rounded-xl dynamic-btn text-white font-black text-xs shadow transition cursor-pointer"
              >
                حفظ التعديلات وتحديث السجل
              </button>
              <button
                onClick={() => setEditingOrder(null)}
                className="w-full py-2.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs cursor-pointer hover:bg-stone-300 dark:hover:bg-stone-700 transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Order Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 text-right space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-stone-900 dark:text-stone-50">
                  حذف الفاتورة نهائياً
                </h3>
                <p className="text-xs font-mono text-stone-500">{orderToDelete}</p>
              </div>
            </div>
            <p className="text-xs font-bold text-stone-600 dark:text-stone-300">
              هل أنت متأكد من حذف هذه المعاملة من السجل؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  onDeleteTransaction(orderToDelete);
                  setOrderToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer"
              >
                نعم، احذف الفاتورة
              </button>
              <button
                onClick={() => setOrderToDelete(null)}
                className="py-2.5 px-4 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Transactions Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 text-right space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-stone-900 dark:text-stone-50">
                  مسح جميع الفواتير
                </h3>
                <p className="text-xs text-stone-500">تفريغ سجل المبيعات بالكامل</p>
              </div>
            </div>
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
              تحذير: سيتم حذف جميع الفواتير المسجلة ({transactions.length} فاتورة). يُنصح بتصدير نسخة Excel أو SQL احتياطية أولاً!
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  onClearAllTransactions();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer"
              >
                نعم، مسح السجل كاملاً
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="py-2.5 px-4 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zero items deletion confirm modal */}
      {showZeroItemsConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 text-right space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-stone-900 dark:text-stone-50">
                  الفاتورة فارغة
                </h3>
                <p className="text-xs text-stone-500">لا توجد أصناف متبقية</p>
              </div>
            </div>
            <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
              الفاتورة لا تحتوي على أي أصناف، هل تريد إلغاء وحذف الفاتورة بالكامل من السجل؟
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={confirmZeroItemsDeletion}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer"
              >
                نعم، حذف الفاتورة
              </button>
              <button
                onClick={() => setShowZeroItemsConfirm(false)}
                className="py-2.5 px-4 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs cursor-pointer"
              >
                رجوع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
