import React, { useState } from 'react';
import {
  Printer,
  X,
  CalendarCheck,
  TrendingUp,
  CreditCard,
  DollarSign,
  Wheat,
  FileText,
  Copy,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
import { CompanyProfile, ExpenseRecord, OrderRecord } from '../types';
import { formatLbp, formatUsd } from '../services/storageService';
import { printThermalZReport, generateZReportPlainText } from '../services/printService';

interface ZReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: OrderRecord[];
  expenses: ExpenseRecord[];
  company: CompanyProfile;
  breadSold: number;
  breadRemaining: number;
  onPrintThermal: () => void;
  onConfirmEndDay: () => void;
}

export const ZReportModal: React.FC<ZReportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  expenses,
  company,
  breadSold,
  breadRemaining,
  onPrintThermal,
  onConfirmEndDay,
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTapePreview, setShowTapePreview] = useState(false);

  if (!isOpen) return null;

  const totalSalesLbp = transactions.reduce((s, t) => s + t.totalLbp, 0);
  const totalSalesUsd = totalSalesLbp / (company.usdRate || 89500);
  const totalExpensesLbp = expenses.reduce((s, e) => s + e.amount, 0);
  const netCashLbp = totalSalesLbp - totalExpensesLbp;

  // Breakdown of items sold
  const itemMap: Record<string, { qty: number; total: number }> = {};
  transactions.forEach(t => {
    t.items.forEach(i => {
      if (!itemMap[i.name]) itemMap[i.name] = { qty: 0, total: 0 };
      itemMap[i.name].qty += i.quantity;
      itemMap[i.name].total += (i.price * i.quantity);
    });
  });

  const sortedItems = Object.entries(itemMap).sort((a, b) => b[1].total - a[1].total);
  const itemsSummary = sortedItems.map(([name, val]) => ({ name, qty: val.qty, total: val.total }));
  const todayDateStr = new Date().toLocaleDateString('ar-LB');
  const nowTimeStr = new Date().toLocaleTimeString('ar-LB', { hour: '2-digit', minute: '2-digit' });

  const reportParams = {
    date: todayDateStr,
    time: nowTimeStr,
    company,
    totalSalesLbp,
    totalSalesUsd,
    totalExpensesLbp,
    netCashLbp,
    ordersCount: transactions.length,
    breadSold,
    breadRemaining,
    itemsSummary
  };

  const handleExecuteThermalPrint = () => {
    setIsPrinting(true);

    // 1. Isolated 80mm/72mm thermal print engine (reliable in all browsers & iframes)
    printThermalZReport(reportParams);

    // 2. Also trigger standard print event as backup
    onPrintThermal();

    setTimeout(() => {
      setIsPrinting(false);
    }, 1500);
  };

  const handleCopyText = () => {
    const text = generateZReportPlainText(reportParams);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 text-right space-y-5 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950 text-[#881337] dark:text-rose-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900 dark:text-stone-50">
                كشف الإغلاق والحساب المالي اليومي (Z-Report)
              </h3>
              <p className="text-xs text-stone-400">
                {company.name} · التاريخ: {todayDateStr} | {nowTimeStr}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="space-y-4 flex-grow overflow-y-auto pr-1 text-xs">
          {/* Main Financial KPI Strips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-bold">
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
              <div className="text-stone-500 mb-1 flex items-center justify-between">
                <span>إجمالي مبيعات اليوم:</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-xl font-black text-stone-900 dark:text-stone-100 tabular-nums">
                {formatLbp(totalSalesLbp)}
              </div>
              <div className="text-[11px] text-stone-400 tabular-nums font-normal">
                {formatUsd(totalSalesLbp, company.usdRate)} ({transactions.length} طلبات)
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
              <div className="text-stone-500 mb-1 flex items-center justify-between">
                <span>إجمالي المصاريف:</span>
                <CreditCard className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <div className="text-xl font-black text-rose-600 dark:text-rose-400 tabular-nums">
                {formatLbp(totalExpensesLbp)}
              </div>
              <div className="text-[11px] text-stone-400 font-normal">
                {expenses.length} سندات صرف مسجلة
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
              <div className="text-emerald-800 dark:text-emerald-300 mb-1 flex items-center justify-between">
                <span>صافي الصندوق المتوفر:</span>
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className={`text-xl font-black tabular-nums ${netCashLbp >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600'}`}>
                {formatLbp(netCashLbp)}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 tabular-nums font-normal">
                يعادل {formatUsd(netCashLbp, company.usdRate)}
              </div>
            </div>
          </div>

          {/* Bread Stock Summary */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between font-bold">
            <div className="flex items-center gap-2">
              <Wheat className="w-4 h-4 text-amber-600" />
              <span className="text-stone-800 dark:text-stone-200">حركة مخزون الخبز الأسمر اليوم:</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-black">
              <span>المباع: <strong className="text-rose-600">{breadSold} رغيف</strong></span>
              <span>المتبقي: <strong className="text-emerald-600">{breadRemaining} رغيف</strong></span>
            </div>
          </div>

          {/* Optional: Authentic 80mm Thermal Receipt Tape Preview */}
          {showTapePreview ? (
            <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800 border-2 border-stone-300 dark:border-stone-700 flex flex-col items-center">
              <div className="w-full max-w-[320px] bg-white text-black p-4 font-mono text-[11px] shadow-lg rounded-sm border-t-4 border-b-4 border-dashed border-stone-400 space-y-2">
                {company.showReceiptLogo !== false && (company.receiptLogo || company.logo) && (
                  <div className="flex justify-center mb-1">
                    <img
                      src={company.receiptLogo || company.logo}
                      alt="Logo"
                      className="w-11 h-11 rounded-full object-cover border border-stone-300"
                    />
                  </div>
                )}
                <div className="text-center font-bold text-sm">{company.name}</div>
                <div className="text-center text-[10px]">{company.city} - {company.address}</div>
                <div className="text-center text-[10px]">هاتف: {company.phone} | واتساب: {company.whatsappPhone}</div>
                {company.receiptHeaderNote && (
                  <div className="text-center text-[9px] italic">{company.receiptHeaderNote}</div>
                )}
                <div className="border-b border-dashed border-black my-1"></div>
                <div className="text-center font-bold">تقرير الإغلاق المالي (Z-REPORT)</div>
                <div className="text-center text-[10px]">التاريخ: {todayDateStr} | {nowTimeStr}</div>
                <div className="border-b-2 border-dashed border-black my-1"></div>
                <div className="flex justify-between"><span>المبيعات:</span><strong>{formatLbp(totalSalesLbp)}</strong></div>
                <div className="flex justify-between"><span>المصاريف:</span><strong>{formatLbp(totalExpensesLbp)}</strong></div>
                <div className="flex justify-between font-bold text-xs"><span>صافي الصندوق:</span><strong>{formatLbp(netCashLbp)}</strong></div>
                <div className="border-b border-dashed border-black my-1"></div>
                <div className="font-bold text-[10px]">الأصناف المباعة:</div>
                {sortedItems.map(([name, val]) => (
                  <div key={name} className="flex justify-between text-[10px]">
                    <span>{name} × {val.qty}</span>
                    <span>{formatLbp(val.total)}</span>
                  </div>
                ))}
                <div className="border-t-2 border-dashed border-black my-2 pt-1 text-center text-[9px]">
                  *** نهاية كشف اليومية ***
                </div>
              </div>
            </div>
          ) : (
            /* Items breakdown table */
            <div className="space-y-2">
              <div className="flex items-center justify-between font-bold text-stone-700 dark:text-stone-300">
                <span>تفصيل الأصناف المباعة خلال اليوم:</span>
                <span className="text-[11px] text-stone-400">{sortedItems.length} أصناف</span>
              </div>

              <div className="border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-right">
                  <thead className="bg-stone-50 dark:bg-stone-800 text-stone-500">
                    <tr>
                      <th className="p-2.5 font-bold">الصنف</th>
                      <th className="p-2.5 font-bold text-center">الكمية</th>
                      <th className="p-2.5 font-bold">المجموع (ل.ل)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {sortedItems.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-stone-400 font-bold">
                          لا توجد مبيعات مسجلة في هذا اليوم
                        </td>
                      </tr>
                    ) : (
                      sortedItems.map(([name, val]) => (
                        <tr key={name} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40">
                          <td className="p-2.5 font-bold text-stone-900 dark:text-stone-100">{name}</td>
                          <td className="p-2.5 text-center font-black text-rose-600 tabular-nums">{val.qty} قطعة</td>
                          <td className="p-2.5 font-black dynamic-text tabular-nums">{formatLbp(val.total)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2">
          {/* Target Element for CSS Selector 1 */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExecuteThermalPrint}
              disabled={isPrinting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-75"
              title="طباعة إيصال حراري 80mm فوراً"
            >
              <Printer className={`w-4 h-4 ${isPrinting ? 'animate-bounce text-amber-300' : ''}`} />
              <span>{isPrinting ? 'جاري إرسال الأمر للطابعة الحرارية...' : 'طباعة الإيصال الحراري فوراً (Thermal Print)'}</span>
            </button>

            <button
              onClick={() => setShowTapePreview(!showTapePreview)}
              className="px-3 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs transition flex items-center gap-1.5"
              title="معاينة شريط الورق الحراري 80mm على الشاشة"
            >
              {showTapePreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showTapePreview ? 'إخفاء شريط الورق' : 'معاينة الورق'}</span>
            </button>

            <button
              onClick={handleCopyText}
              className="px-3 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs transition flex items-center gap-1.5"
              title="نسخ ملخص اليومية نصياً للبلوتوث أو الواتساب"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ!' : 'نسخ نصياً'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onConfirmEndDay}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow transition flex items-center gap-1.5"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>تأكيد الإغلاق وبدء يوم جديد</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs hover:bg-stone-300 transition"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
