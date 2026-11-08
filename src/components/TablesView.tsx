import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Utensils,
  AlertTriangle,
  X,
  Check,
  RefreshCw
} from 'lucide-react';
import { CartItem, CompanyProfile } from '../types';
import { formatLbp, formatUsd } from '../services/storageService';

interface TablesViewProps {
  tables: Record<number, CartItem[]>;
  activeTable: number;
  company: CompanyProfile;
  onSelectTable: (tableNum: number) => void;
  onAddTable: (tableNum: number) => void;
  onRemoveTable: (tableNum: number) => void;
  onClearTable: (tableNum: number) => void;
}

export const TablesView: React.FC<TablesViewProps> = ({
  tables,
  activeTable,
  company,
  onSelectTable,
  onAddTable,
  onRemoveTable,
  onClearTable,
}) => {
  const [newTableNum, setNewTableNum] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addError, setAddError] = useState<string | null>(null);

  // In-app confirmation states (No browser confirm/alert popups)
  const [tableToDelete, setTableToDelete] = useState<number | null>(null);
  const [tableToClear, setTableToClear] = useState<number | null>(null);

  const tableNumbers = Object.keys(tables).map(Number).sort((a, b) => a - b);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    const val = parseInt(newTableNum, 10);
    if (isNaN(val) || val <= 0) {
      setAddError('يرجى إدخال رقم طاولة صحيح أكبر من صفر');
      return;
    }
    if (tables[val]) {
      setAddError(`طاولة رقم ${val} مضافة مسبقاً في المخطط`);
      return;
    }
    onAddTable(val);
    setNewTableNum('');
    setShowAddModal(false);
  };

  const handleConfirmDelete = () => {
    if (tableToDelete !== null) {
      onRemoveTable(tableToDelete);
      setTableToDelete(null);
    }
  };

  const handleConfirmClear = () => {
    if (tableToClear !== null) {
      onClearTable(tableToClear);
      setTableToClear(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header and Controls */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-stone-900 dark:text-stone-50">
            مخطط طاولات الصالة الحية
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400 font-medium">
            مراقبة الطاولات المشغولة، إجمالي الحساب لكل طاولة، وإضافة أو حذف الطاولات
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setAddError(null);
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة طاولة جديدة</span>
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tableNumbers.map(num => {
          const items = tables[num] || [];
          const isOccupied = items.length > 0;
          const totalLbp = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

          return (
            <div
              key={num}
              className={`rounded-2xl border-2 p-4 transition-all flex flex-col justify-between ${
                isOccupied
                  ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900/80'
                  : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-amber-400'
              } ${activeTable === num ? 'ring-2 ring-amber-400 shadow-md' : 'shadow-sm'}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-stone-900 dark:text-stone-50">
                      طاولة {num}
                    </span>
                    {activeTable === num && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-400 text-stone-950">
                        محددة
                      </span>
                    )}
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      isOccupied
                        ? 'bg-rose-100 text-rose-900 dark:bg-rose-900/60 dark:text-rose-200'
                        : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isOccupied ? 'bg-rose-600' : 'bg-emerald-600'}`} />
                    <span>{isOccupied ? 'مشغولة' : 'فارغة'}</span>
                  </span>
                </div>

                {isOccupied ? (
                  <div className="space-y-2 mb-4">
                    <div className="text-lg font-black dynamic-text tabular-nums">
                      {formatLbp(totalLbp)}
                      <span className="text-xs text-stone-600 dark:text-stone-400 mr-2 font-normal">
                        ({formatUsd(totalLbp, company.usdRate)})
                      </span>
                    </div>

                    <div className="text-xs text-stone-800 dark:text-stone-200 font-bold">
                      {totalItemsCount} طلبات مسجلة:
                    </div>

                    <div className="space-y-1 max-h-28 overflow-y-auto pr-1 text-xs text-stone-700 dark:text-stone-300">
                      {items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px] font-medium">
                          <span className="truncate">{it.name} ({it.quantity}×)</span>
                          <span className="tabular-nums font-bold shrink-0 text-stone-900 dark:text-stone-100">
                            {formatLbp(it.price * it.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-stone-500 dark:text-stone-400 font-bold">
                    جاهزة لاستقبال الزبائن والطلب
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center gap-2">
                <button
                  onClick={() => onSelectTable(num)}
                  className="flex-1 py-2 px-3 rounded-xl dynamic-btn text-white font-black text-xs shadow-sm transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span>{isOccupied ? 'متابعة الطلب' : 'فتح طلب'}</span>
                </button>

                {isOccupied && (
                  <button
                    onClick={() => setTableToClear(num)}
                    className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 transition cursor-pointer"
                    title="تفريغ سلة الطاولة"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}

                {tableNumbers.length > 1 && (
                  <button
                    onClick={() => setTableToDelete(num)}
                    className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                    title="حذف الطاولة من المخطط"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Table Confirmation Modal (In-App Modal - 100% Reliable in iframes) */}
      {tableToDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 text-right space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-stone-900 dark:text-stone-50">
                  حذف طاولة رقم {tableToDelete}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  تأكيد إزالة الطاولة نهائياً من المخطط
                </p>
              </div>
            </div>

            <p className="text-xs font-bold text-stone-700 dark:text-stone-300 leading-relaxed">
              {tables[tableToDelete] && tables[tableToDelete].length > 0 ? (
                <span className="text-rose-600 dark:text-rose-400">
                  تنبيه: هذه الطاولة تحتوي على طلبات نشطة بقيمة{' '}
                  {formatLbp(tables[tableToDelete].reduce((s, i) => s + i.price * i.quantity, 0))}. سيتم إلغاء الطلبات وحذف الطاولة!
                </span>
              ) : (
                'هل أنت متأكد من حذف هذه الطاولة؟ يمكنك دائماً إعادة إضافتها لاحقاً.'
              )}
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow transition cursor-pointer"
              >
                نعم، احذف الطاولة
              </button>
              <button
                onClick={() => setTableToDelete(null)}
                className="py-2.5 px-4 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs transition cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Table Items Confirmation Modal */}
      {tableToClear !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 text-right space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-stone-900 dark:text-stone-50">
                  تفريغ سلة طاولة رقم {tableToClear}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  إعادة الطاولة لحالة فارغة
                </p>
              </div>
            </div>

            <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
              هل تريد مسح جميع الأصناف المسجلة على طاولة {tableToClear} والبدء من جديد؟
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleConfirmClear}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs shadow transition cursor-pointer"
              >
                نعم، تفريغ الطاولة
              </button>
              <button
                onClick={() => setTableToClear(null)}
                className="py-2.5 px-4 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 dark:border-stone-800 text-right space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
              <h3 className="font-black text-base text-stone-900 dark:text-stone-50">
                إضافة طاولة جديدة للصالة
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addError && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold">
                {addError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-stone-700 dark:text-stone-300 mb-1">
                  رقم الطاولة:
                </label>
                <input
                  type="number"
                  placeholder="مثال: 9"
                  value={newTableNum}
                  onChange={(e) => setNewTableNum(e.target.value)}
                  autoFocus
                  className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-50 text-base font-black text-center focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  حفظ وإضافة
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full py-2.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
