import React from 'react';
import { Flame, Clock, CheckCircle, ChefHat, Bell, AlertTriangle } from 'lucide-react';
import { OrderRecord, OrderStatus } from '../types';
import { playChime } from '../services/storageService';

interface KitchenViewProps {
  orders: OrderRecord[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

export const KitchenView: React.FC<KitchenViewProps> = ({ orders, onUpdateOrderStatus }) => {
  // Kitchen cares about pending and preparing tickets (and recently completed)
  const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready').slice(0, 6);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return { label: 'طلب جديد للفرن', color: 'bg-rose-500 text-white animate-pulse' };
      case 'preparing':
        return { label: 'قيد الخبز والتحضير', color: 'bg-amber-500 text-stone-900' };
      case 'ready':
        return { label: 'جاهز للتسليم', color: 'bg-emerald-600 text-white' };
      default:
        return { label: status, color: 'bg-stone-500 text-white' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-stone-900 dark:text-stone-50">
              شاشة المطبخ والفرن الحجري (KDS)
            </h2>
            <p className="text-xs text-stone-500">
              متابعة مباشرة لطلبات الصفيحة على الحطب والتحضير الفوري
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-black border border-rose-200">
            {activeOrders.length} تذاكر قيد التحضير
          </span>
        </div>
      </div>

      {/* Active Orders Grid */}
      {activeOrders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
          <Flame className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-700 dark:text-stone-300">
            لا توجد طلبات معلقة حالياً أمام الفرن
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            ستظهر الطلبات الجديدة تلقائياً فور تسجيلها من الكاشير أو الزبائن
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeOrders.map(order => {
            const badge = getStatusBadge(order.status);
            const typeLabel = order.type === 'hall'
              ? `طاولة رقم ${order.tableNumber || 1}`
              : order.type === 'takeaway'
              ? 'سفري (تيك أواي)'
              : 'دليفري (توصيل)';

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-stone-900 rounded-2xl border-2 border-amber-400/80 p-4 shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 mb-3">
                    <div>
                      <span className="text-xs font-mono font-black text-stone-400">
                        {order.id}
                      </span>
                      <h3 className="text-base font-black text-stone-900 dark:text-stone-50">
                        {typeLabel}
                      </h3>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Customer details if any */}
                  {order.customerName && order.customerName !== 'عميل' && (
                    <div className="text-xs text-stone-600 dark:text-stone-300 font-bold mb-2">
                      👤 {order.customerName} {order.customerPhone ? `· ${order.customerPhone}` : ''}
                    </div>
                  )}

                  {/* Items List */}
                  <div className="space-y-2 mb-4">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 flex items-start justify-between"
                      >
                        <div>
                          <div className="font-black text-stone-900 dark:text-stone-100 text-sm">
                            {item.quantity}× {item.name}
                          </div>
                          {item.notes && (
                            <div className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                              ⚠️ ملاحظة: {item.notes}
                            </div>
                          )}
                        </div>
                        {item.deductBread && (
                          <span className="text-[10px] bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 px-1.5 py-0.5 rounded font-bold">
                            عجين حطب
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-xs font-bold mb-4">
                      ملاحظة الطلب: {order.notes}
                    </div>
                  )}
                </div>

                {/* Workflow Buttons */}
                <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex gap-2">
                  {order.status === 'pending' ? (
                    <button
                      onClick={() => {
                        playChime('add');
                        onUpdateOrderStatus(order.id, 'preparing');
                      }}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs shadow transition flex items-center justify-center gap-1.5"
                    >
                      <Flame className="w-4 h-4" />
                      <span>بدء الخبز والتحضير</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        playChime('success');
                        onUpdateOrderStatus(order.id, 'ready');
                      }}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow transition flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>جاهز للتسليم في الصالة/الدليفري</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed / Ready recent tickets */}
      {readyOrders.length > 0 && (
        <div className="pt-6 border-t border-stone-200 dark:border-stone-800">
          <h3 className="font-black text-sm text-stone-700 dark:text-stone-300 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>طلبات جاهزة للتسليم للزبائن ({readyOrders.length})</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {readyOrders.map(ro => (
              <div
                key={ro.id}
                className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-center"
              >
                <div className="font-black text-emerald-800 dark:text-emerald-300">
                  {ro.type === 'hall' ? `طاولة ${ro.tableNumber}` : ro.type === 'takeaway' ? 'سفري' : 'دليفري'}
                </div>
                <div className="text-[10px] text-stone-500 font-mono mt-1">{ro.id}</div>
                <button
                  onClick={() => onUpdateOrderStatus(ro.id, 'completed')}
                  className="mt-2 w-full py-1 text-[10px] bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700"
                >
                  تم التسليم
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
