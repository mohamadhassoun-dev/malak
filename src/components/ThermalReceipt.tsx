import React from 'react';
import { CompanyProfile, OrderRecord } from '../types';
import { formatLbp, formatUsd } from '../services/storageService';

interface ThermalReceiptProps {
  order: OrderRecord | null;
  company: CompanyProfile;
  reportData?: {
    date: string;
    totalSalesLbp: number;
    totalSalesUsd: number;
    totalExpensesLbp: number;
    netCashLbp: number;
    itemsSummary: { name: string; qty: number; total: number }[];
  } | null;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ order, company, reportData }) => {
  const receiptLogoToUse = company.receiptLogo || company.logo;
  const showLogo = company.showReceiptLogo !== false && Boolean(receiptLogoToUse);

  if (reportData) {
    return (
      <div id="printable-report" className="print-only">
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          {showLogo && (
            <img
              src={receiptLogoToUse}
              alt="Logo"
              style={{ width: '50px', height: '50px', margin: '0 auto 4px auto', borderRadius: '50%', objectFit: 'cover' }}
            />
          )}
          <div style={{ fontSize: '15px', fontWeight: 'bold' }}>{company.name}</div>
          {company.subName && <div style={{ fontSize: '10px' }}>{company.subName}</div>}
          <div style={{ fontSize: '10px' }}>{company.city} - {company.address}</div>
          <div style={{ fontSize: '10px' }}>هاتف: {company.phone} | واتساب: {company.whatsappPhone}</div>
          {company.receiptHeaderNote && (
            <div style={{ fontSize: '9px', fontStyle: 'italic', margin: '2px 0' }}>{company.receiptHeaderNote}</div>
          )}
          <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }}></div>
          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>تقرير المبيعات والإغلاق اليومي (Z-Report)</div>
          <div style={{ fontSize: '10px' }}>التاريخ: {reportData.date}</div>
          <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }}></div>
        </div>

        <div style={{ fontSize: '11px', marginBottom: '8px', lineHeight: '1.4' }}>
          <div><strong>إجمالي المبيعات:</strong> {formatLbp(reportData.totalSalesLbp)} ({formatUsd(reportData.totalSalesLbp, company.usdRate)})</div>
          <div><strong>إجمالي المصاريف:</strong> {formatLbp(reportData.totalExpensesLbp)}</div>
          <div style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '3px' }}>
            <strong>صافي الصندوق:</strong> {formatLbp(reportData.netCashLbp)}
          </div>
        </div>

        <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }}></div>
        <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>تفصيل مبيعات الأصناف:</div>

        <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #000' }}>
              <th style={{ padding: '2px 0' }}>الصنف</th>
              <th style={{ padding: '2px 0', textAlign: 'center' }}>الكمية</th>
              <th style={{ padding: '2px 0', textAlign: 'left' }}>المجموع</th>
            </tr>
          </thead>
          <tbody>
            {reportData.itemsSummary.map((item, idx) => (
              <tr key={idx}>
                <td style={{ padding: '2px 0' }}>{item.name}</td>
                <td style={{ padding: '2px 0', textAlign: 'center' }}>{item.qty}</td>
                <td style={{ padding: '2px 0', textAlign: 'left' }}>{formatLbp(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ borderTop: '1px dashed #000', margin: '10px 0 4px 0', paddingTop: '6px', textAlign: 'center', fontSize: '9px' }}>
          نظام المطبخ والكاشير - ملك الصفيحة زكرياعروب
        </div>
      </div>
    );
  }

  if (!order) return null;

  const typeLabel = order.type === 'hall'
    ? `طاولة رقم ${order.tableNumber || 1}`
    : order.type === 'takeaway'
    ? 'طلب سفري (تيك أواي)'
    : 'توصيل منزلي (دليفري)';

  return (
    <div id="printable-receipt" className="print-only">
      <div style={{ textAlign: 'center', marginBottom: '6px' }}>
        {showLogo && (
          <img
            src={receiptLogoToUse}
            alt="Logo"
            style={{ width: '52px', height: '52px', margin: '0 auto 4px auto', borderRadius: '50%', objectFit: 'cover' }}
          />
        )}
        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{company.name}</div>
        {company.subName && <div style={{ fontSize: '10px' }}>{company.subName}</div>}
        <div style={{ fontSize: '10px' }}>{company.city} - {company.address}</div>
        <div style={{ fontSize: '10px' }}>هاتف: {company.phone} | واتساب: {company.whatsappPhone}</div>
        {company.receiptHeaderNote && (
          <div style={{ fontSize: '9px', fontStyle: 'italic', margin: '2px 0' }}>{company.receiptHeaderNote}</div>
        )}
        {company.taxNumber && <div style={{ fontSize: '9px' }}>الرقم المالي: {company.taxNumber}</div>}
        <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }}></div>
        <div style={{ fontSize: '13px', fontWeight: 'bold' }}>فاتورة طلب: {order.id}</div>
        <div style={{ fontSize: '10px' }}>النوع: {typeLabel}</div>
        <div style={{ fontSize: '9px' }}>الوقت: {order.createdAt}</div>
        {order.customerName && order.customerName !== 'عميل' && (
          <div style={{ fontSize: '10px' }}>الزبون: {order.customerName} {order.customerPhone ? `- ${order.customerPhone}` : ''}</div>
        )}
        {order.customerAddress && (
          <div style={{ fontSize: '9px' }}>العنوان: {order.customerAddress}</div>
        )}
        <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }}></div>
      </div>

      <table style={{ width: '100%', fontSize: '10.5px', borderCollapse: 'collapse', textAlign: 'right' }}>
        <thead>
          <tr style={{ borderBottom: '1px dashed #000' }}>
            <th style={{ padding: '3px 0' }}>الصنف</th>
            <th style={{ padding: '3px 0', textAlign: 'center' }}>كمية</th>
            <th style={{ padding: '3px 0', textAlign: 'left' }}>المجموع</th>
          </tr>
        </thead>
        <tbody>
          {(order.items || []).map((item, idx) => (
            <tr key={idx}>
              <td style={{ padding: '3px 0' }}>
                <div>{item.name}</div>
                {item.notes && <div style={{ fontSize: '8.5px', color: '#444' }}>*{item.notes}</div>}
              </td>
              <td style={{ padding: '3px 0', textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ padding: '3px 0', textAlign: 'left' }}>{formatLbp(item.price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ borderTop: '1px dashed #000', marginTop: '6px', paddingTop: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold' }}>
          <span>المجموع بالليرة:</span>
          <span>{formatLbp(order.totalLbp)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', marginTop: '2px' }}>
          <span>المجموع بالدولار ($):</span>
          <span>{formatUsd(order.totalLbp, order.usdRate)}</span>
        </div>
        <div style={{ fontSize: '9px', textAlign: 'left', marginTop: '2px', color: '#333' }}>
          سعر الصرف: 1$ = {order.usdRate.toLocaleString('ar-LB')} ل.ل
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '10px', paddingTop: '6px', borderTop: '1px dashed #000', fontSize: '10px' }}>
        <div>{company.receiptFooterNote || 'أهلاً وسهلاً بكم وشكراً لثقتكم'}</div>
        <div style={{ fontSize: '8.5px', marginTop: '2px' }}>{company.name} - تأسيس {company.establishmentYear || '1998'}</div>
      </div>
    </div>
  );
};
