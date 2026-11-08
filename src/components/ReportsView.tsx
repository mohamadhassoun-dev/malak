import React from 'react';
import {
  TrendingUp,
  Printer,
  DollarSign,
  PieChart,
  Calendar,
  CreditCard,
  Wheat,
  ShoppingBag
} from 'lucide-react';
import { CompanyProfile, DailyClosingRecord, ExpenseRecord, OrderRecord } from '../types';
import { formatLbp, formatUsd } from '../services/storageService';

interface ReportsViewProps {
  transactions: OrderRecord[];
  expenses: ExpenseRecord[];
  closings: DailyClosingRecord[];
  company: CompanyProfile;
  onPrintDailyReport: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  expenses,
  closings,
  company,
  onPrintDailyReport,
}) => {
  // Aggregate sales
  const totalSalesLbp = transactions.reduce((s, t) => s + t.totalLbp, 0);
  const totalSalesUsd = totalSalesLbp / (company.usdRate || 89500);
  const totalExpensesLbp = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfitLbp = totalSalesLbp - totalExpensesLbp;
  const netProfitUsd = netProfitLbp / (company.usdRate || 89500);

  // Aggregate items breakdown
  const itemMap: Record<string, { qty: number; total: number }> = {};
  transactions.forEach(t => {
    t.items.forEach(i => {
      if (!itemMap[i.name]) itemMap[i.name] = { qty: 0, total: 0 };
      itemMap[i.name].qty += i.quantity;
      itemMap[i.name].total += (i.price * i.quantity);
    });
  });

  const sortedItems = Object.entries(itemMap).sort((a, b) => b[1].total - a[1].total);

  // Order type breakdown
  const typeCounts = {
    hall: transactions.filter(t => t.type === 'hall').length,
    takeaway: transactions.filter(t => t.type === 'takeaway').length,
    delivery: transactions.filter(t => t.type === 'delivery').length
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-stone-900 dark:text-stone-50">
            التقارير اليومية والأرباح وحركة الصندوق
          </h2>
          <p className="text-xs text-stone-500">
            تحليل المبيعات، خصم المصاريف، طباعة كشف الحساب اليومي وأرشيف الإغلاقات
          </p>
        </div>

        <button
          onClick={onPrintDailyReport}
          className="px-4 py-2.5 rounded-xl dynamic-btn text-white text-xs font-bold shadow transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>طباعة كشف الحساب اليومي (Z-Report)</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-500">إجمالي مبيعات اليوم</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-stone-900 dark:text-stone-100 tabular-nums">
            {formatLbp(totalSalesLbp)}
          </div>
          <p className="text-[11px] text-stone-400 mt-1 tabular-nums">
            يعادل {formatUsd(totalSalesLbp, company.usdRate)} ({transactions.length} فواتير)
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-500">إجمالي المصاريف اليومية</span>
            <CreditCard className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 tabular-nums">
            {formatLbp(totalExpensesLbp)}
          </div>
          <p className="text-[11px] text-stone-400 mt-1 tabular-nums">
            {expenses.length} بنود مصاريف مدفوعة
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-950 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">صافي الصندوق المتوفر</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className={`text-2xl font-black tabular-nums ${netProfitLbp >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
            {formatLbp(netProfitLbp)}
          </div>
          <p className="text-[11px] text-stone-400 mt-1 tabular-nums">
            يعادل {formatUsd(netProfitLbp, company.usdRate)} صافي حقيقي
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-500">متوسط قيمة الفاتورة</span>
            <ShoppingBag className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-400 tabular-nums">
            {formatLbp(transactions.length ? Math.round(totalSalesLbp / transactions.length) : 0)}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            معدل الصرف للطلب الواحد
          </p>
        </div>
      </div>

      {/* Breakdown Grid: Items sold & Order channels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items Sold Breakdown */}
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-stone-900 dark:text-stone-50">
              تفصيل كميات ومبيعات كل صنف اليوم
            </h3>
            <span className="text-xs text-stone-400">{sortedItems.length} أصناف مباعة</span>
          </div>

          <div className="overflow-x-auto">
            {sortedItems.length === 0 ? (
              <div className="text-center py-10 text-stone-400 text-xs font-bold">
                لا توجد مبيعات مسجلة حتى الآن
              </div>
            ) : (
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 pb-2">
                    <th className="py-2.5 font-bold">الصنف</th>
                    <th className="py-2.5 font-bold text-center">الكمية المباعة</th>
                    <th className="py-2.5 font-bold">الإجمالي المحقق (ل.ل)</th>
                    <th className="py-2.5 font-bold text-center">نسبة المساهمة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {sortedItems.map(([name, data]) => {
                    const pct = totalSalesLbp > 0 ? ((data.total / totalSalesLbp) * 100).toFixed(1) : '0';
                    return (
                      <tr key={name} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40">
                        <td className="py-3 font-bold text-stone-900 dark:text-stone-100">
                          {name}
                        </td>
                        <td className="py-3 text-center tabular-nums font-black text-rose-600 dark:text-rose-400">
                          {data.qty} قطعة
                        </td>
                        <td className="py-3 font-black dynamic-text tabular-nums">
                          {formatLbp(data.total)}
                        </td>
                        <td className="py-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                            %{pct}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Order Types & Channels */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm space-y-4">
          <h3 className="font-black text-sm text-stone-900 dark:text-stone-50">
            توزيع قنوات الطلبات
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
              <div>
                <div className="font-bold text-stone-900 dark:text-stone-100">طاولات الصالة</div>
                <div className="text-[11px] text-stone-400">خدمة داخل المطعم</div>
              </div>
              <div className="text-base font-black dynamic-text tabular-nums">
                {typeCounts.hall} طلب
              </div>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
              <div>
                <div className="font-bold text-stone-900 dark:text-stone-100">سفري (تيك أواي)</div>
                <div className="text-[11px] text-stone-400">استلام من المحل</div>
              </div>
              <div className="text-base font-black text-amber-600 dark:text-amber-400 tabular-nums">
                {typeCounts.takeaway} طلب
              </div>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
              <div>
                <div className="font-bold text-stone-900 dark:text-stone-100">دليفري (توصيل)</div>
                <div className="text-[11px] text-stone-400">طلبات الواتساب والهاتف</div>
              </div>
              <div className="text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                {typeCounts.delivery} طلب
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Closing Archive (Z-Reports) */}
      {closings.length > 0 && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm space-y-4">
          <h3 className="font-black text-sm text-stone-900 dark:text-stone-50">
            أرشيف إغلاقات الصندوق والأيام السابقة (Z-Reports)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 pb-2">
                  <th className="py-2.5 font-bold">التاريخ</th>
                  <th className="py-2.5 font-bold">المبيعات</th>
                  <th className="py-2.5 font-bold">المصاريف</th>
                  <th className="py-2.5 font-bold">الصافي</th>
                  <th className="py-2.5 font-bold text-center">الطلبات</th>
                  <th className="py-2.5 font-bold text-center">أرغفة خبز</th>
                  <th className="py-2.5 font-bold">أغلق بواسطة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {closings.map(c => (
                  <tr key={c.id}>
                    <td className="py-2.5 font-mono font-bold text-stone-800 dark:text-stone-200">{c.date}</td>
                    <td className="py-2.5 font-bold text-emerald-600 tabular-nums">{formatLbp(c.totalSalesLbp)}</td>
                    <td className="py-2.5 font-bold text-rose-600 tabular-nums">{formatLbp(c.totalExpensesLbp)}</td>
                    <td className="py-2.5 font-black dynamic-text tabular-nums">{formatLbp(c.netCashLbp)}</td>
                    <td className="py-2.5 text-center font-bold">{c.ordersCount}</td>
                    <td className="py-2.5 text-center font-bold">{c.breadSold}</td>
                    <td className="py-2.5 text-stone-500">{c.closedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
