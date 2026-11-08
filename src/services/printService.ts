import { CompanyProfile, OrderRecord } from '../types';
import { formatLbp, formatUsd } from './storageService';

export interface ZReportPrintParams {
  date: string;
  time?: string;
  company: CompanyProfile;
  totalSalesLbp: number;
  totalSalesUsd: number;
  totalExpensesLbp: number;
  netCashLbp: number;
  ordersCount: number;
  breadSold: number;
  breadRemaining: number;
  itemsSummary: { name: string; qty: number; total: number }[];
  closedBy?: string;
}

/**
 * Executes a clean, isolated print job for thermal printers (80mm / 72mm)
 * by creating an isolated iframe document. This bypasses any modal backdrops,
 * parent CSS display:none, dark mode issues, or layout shifts.
 */
export function printThermalDocument(htmlBody: string, title: string = 'إيصال حراري'): boolean {
  try {
    let printIframe = document.getElementById('thermal-print-frame') as HTMLIFrameElement | null;
    if (!printIframe) {
      printIframe = document.createElement('iframe');
      printIframe.id = 'thermal-print-frame';
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = '0';
      printIframe.style.opacity = '0';
      printIframe.style.pointerEvents = 'none';
      document.body.appendChild(printIframe);
    }

    const iframeDoc = printIframe.contentDocument || printIframe.contentWindow?.document;
    if (!iframeDoc) {
      // Direct window fallback
      window.print();
      return true;
    }

    const fullDocument = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      width: 76mm;
      max-width: 76mm;
      margin: 0 auto;
      padding: 4mm 2mm 8mm 2mm;
      font-family: 'Courier New', Courier, monospace, 'Segoe UI', Tahoma, sans-serif;
      font-size: 11px;
      line-height: 1.35;
      color: #000;
      background: #fff;
      direction: rtl;
      text-align: right;
    }
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .text-right { text-align: right; }
    .bold { font-weight: 900; }
    .title-lg { font-size: 14px; font-weight: 900; }
    .title-md { font-size: 12px; font-weight: 900; }
    .text-sm { font-size: 9.5px; }
    .text-xs { font-size: 8.5px; }
    .divider {
      border-bottom: 1px dashed #000;
      margin: 5px 0;
      height: 1px;
    }
    .divider-double {
      border-bottom: 2px dashed #000;
      margin: 6px 0;
      height: 2px;
    }
    .logo {
      width: 44px;
      height: 44px;
      margin: 0 auto 4px auto;
      border-radius: 50%;
      object-fit: cover;
      display: block;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      margin: 4px 0;
    }
    th {
      border-bottom: 1px solid #000;
      padding: 3px 0;
      font-weight: 900;
    }
    td {
      padding: 2.5px 0;
      vertical-align: top;
    }
    .row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 1.5px 0;
    }
    .highlight-box {
      border: 1px solid #000;
      padding: 4px;
      margin: 5px 0;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  ${htmlBody}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 100);
    };
  </script>
</body>
</html>
    `;

    iframeDoc.open();
    iframeDoc.write(fullDocument);
    iframeDoc.close();

    // Trigger print safely after content render
    setTimeout(() => {
      try {
        printIframe?.contentWindow?.focus();
        printIframe?.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print failed, falling back to window.print', err);
        window.print();
      }
    }, 200);

    return true;
  } catch (err) {
    console.error('Print execution error:', err);
    window.print();
    return false;
  }
}

/**
 * Builds HTML for daily Z-Report
 */
export function buildZReportHtml(params: ZReportPrintParams): string {
  const {
    date,
    time = new Date().toLocaleTimeString('ar-LB', { hour: '2-digit', minute: '2-digit' }),
    company,
    totalSalesLbp,
    totalExpensesLbp,
    netCashLbp,
    ordersCount,
    breadSold,
    breadRemaining,
    itemsSummary,
    closedBy = 'المشرف'
  } = params;

  const itemsRows = itemsSummary.length === 0
    ? `<tr><td colspan="3" class="text-center" style="padding: 6px 0;">لا توجد مبيعات مسجلة</td></tr>`
    : itemsSummary.map(item => `
        <tr>
          <td>${item.name}</td>
          <td class="text-center bold">${item.qty}</td>
          <td class="text-left bold">${formatLbp(item.total)}</td>
        </tr>
      `).join('');

  const receiptLogoToUse = company.receiptLogo || company.logo;
  const showLogo = company.showReceiptLogo !== false && Boolean(receiptLogoToUse);

  return `
    <div class="text-center">
      ${showLogo ? `<img src="${receiptLogoToUse}" class="logo" alt="Logo" />` : ''}
      <div class="title-lg">${company.name}</div>
      <div class="text-sm">${company.subName || ''}</div>
      <div class="text-sm">${company.city} - ${company.address}</div>
      <div class="text-sm">هاتف: ${company.phone} | واتساب: ${company.whatsappPhone}</div>
      ${company.receiptHeaderNote ? `<div class="text-xs" style="font-style: italic; margin: 2px 0;">${company.receiptHeaderNote}</div>` : ''}
      ${company.taxNumber ? `<div class="text-xs">الرقم المالي: ${company.taxNumber}</div>` : ''}
      <div class="divider"></div>
      <div class="title-md">تقرير الإغلاق المالي اليومي</div>
      <div class="title-md">(Z-REPORT)</div>
      <div class="text-sm">التاريخ: ${date} | الوقت: ${time}</div>
      <div class="text-xs">المسؤول: ${closedBy}</div>
      <div class="divider-double"></div>
    </div>

    <div class="highlight-box">
      <div class="row">
        <span>إجمالي المبيعات (ل.ل):</span>
        <span class="bold title-md">${formatLbp(totalSalesLbp)}</span>
      </div>
      <div class="row text-sm">
        <span>المعادل بالدولار:</span>
        <span class="bold">${formatUsd(totalSalesLbp, company.usdRate)}</span>
      </div>
      <div class="row text-xs">
        <span>عدد الطلبات المكتملة:</span>
        <span>${ordersCount} طلبات</span>
      </div>
      <div class="divider"></div>
      <div class="row">
        <span>إجمالي المصاريف:</span>
        <span class="bold">${formatLbp(totalExpensesLbp)}</span>
      </div>
      <div class="divider"></div>
      <div class="row" style="font-size: 12px;">
        <span class="bold">صافي الصندوق المتوفر:</span>
        <span class="bold title-md">${formatLbp(netCashLbp)}</span>
      </div>
      <div class="row text-xs">
        <span>صافي الصندوق بالدولار:</span>
        <span class="bold">${formatUsd(netCashLbp, company.usdRate)}</span>
      </div>
    </div>

    <div class="highlight-box">
      <div class="bold text-sm" style="margin-bottom: 2px;">حركة مخزون الخبز الأسمر اليوم:</div>
      <div class="row text-sm">
        <span>الكمية المباعة اليوم:</span>
        <span class="bold">${breadSold} رغيف</span>
      </div>
      <div class="row text-sm">
        <span>الرصيد المتبقي بالفرن:</span>
        <span class="bold">${breadRemaining} رغيف</span>
      </div>
    </div>

    <div class="divider"></div>
    <div class="bold text-sm" style="margin-bottom: 3px;">تفصيل مبيعات الأصناف:</div>
    <table>
      <thead>
        <tr>
          <th>الصنف</th>
          <th class="text-center">كمية</th>
          <th class="text-left">المجموع</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div class="divider-double"></div>
    <div class="text-center text-xs" style="margin-top: 6px;">
      <div>نظام الكاشير والمطبخ - ${company.name}</div>
      <div>تأسيس ${company.establishmentYear || '1998'} · طرابلس</div>
      <div style="margin-top: 3px;">*** نهاية التقرير اليومي ***</div>
    </div>
  `;
}

/**
 * Builds HTML for customer invoice / kitchen ticket
 */
export function buildOrderReceiptHtml(order: OrderRecord, company: CompanyProfile): string {
  const typeLabel = order.type === 'hall'
    ? `طاولة رقم ${order.tableNumber || 1}`
    : order.type === 'takeaway'
    ? 'طلب سفري (تيك أواي)'
    : 'توصيل منزلي (دليفري)';

  const itemsRows = (order.items || []).map(item => `
    <tr>
      <td>
        <div class="bold">${item.name}</div>
        ${item.notes ? `<div class="text-xs" style="color: #444;">*${item.notes}</div>` : ''}
      </td>
      <td class="text-center bold title-md">${item.quantity}</td>
      <td class="text-left bold">${formatLbp(item.price * item.quantity)}</td>
    </tr>
  `).join('');

  const receiptLogoToUse = company.receiptLogo || company.logo;
  const showLogo = company.showReceiptLogo !== false && Boolean(receiptLogoToUse);

  return `
    <div class="text-center">
      ${showLogo ? `<img src="${receiptLogoToUse}" class="logo" alt="Logo" />` : ''}
      <div class="title-lg">${company.name}</div>
      <div class="text-sm">${company.subName || ''}</div>
      <div class="text-sm">${company.city} - ${company.address}</div>
      <div class="text-sm">هاتف: ${company.phone} | واتساب: ${company.whatsappPhone}</div>
      ${company.receiptHeaderNote ? `<div class="text-xs" style="font-style: italic; margin: 2px 0;">${company.receiptHeaderNote}</div>` : ''}
      <div class="divider"></div>
      <div class="title-md">فاتورة طلب: ${order.id}</div>
      <div class="bold text-sm" style="margin-top: 2px;">النوع: ${typeLabel}</div>
      <div class="text-xs">الوقت: ${order.createdAt}</div>
      ${order.customerName && order.customerName !== 'عميل' && order.customerName !== 'زبون' ? `<div class="text-sm">الزبون: ${order.customerName} ${order.customerPhone ? `(${order.customerPhone})` : ''}</div>` : ''}
      ${order.customerAddress ? `<div class="text-xs">العنوان: ${order.customerAddress}</div>` : ''}
      ${order.notes ? `<div class="text-xs bold" style="margin-top: 2px;">ملاحظة: ${order.notes}</div>` : ''}
      <div class="divider-double"></div>
    </div>

    <table>
      <thead>
        <tr>
          <th>الصنف</th>
          <th class="text-center">كمية</th>
          <th class="text-left">المجموع</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div class="divider"></div>
    <div class="row title-md">
      <span>المجموع بالليرة:</span>
      <span class="bold">${formatLbp(order.totalLbp)}</span>
    </div>
    <div class="row text-sm">
      <span>المجموع بالدولار ($):</span>
      <span class="bold">${formatUsd(order.totalLbp, order.usdRate)}</span>
    </div>
    <div class="text-xs text-left" style="margin-top: 2px; color: #444;">
      سعر الصرف: 1$ = ${order.usdRate.toLocaleString('ar-LB')} ل.ل
    </div>

    <div class="divider-double"></div>
    <div class="text-center text-sm" style="margin-top: 6px;">
      <div class="bold">${company.receiptFooterNote || 'أهلاً وسهلاً بكم وشكراً لزيارتكم'}</div>
      <div class="text-xs" style="margin-top: 2px;">${company.name} - تأسيس ${company.establishmentYear || '1998'}</div>
    </div>
  `;
}

/**
 * Direct print functions
 */
export function printThermalZReport(params: ZReportPrintParams): boolean {
  const html = buildZReportHtml(params);
  return printThermalDocument(html, `Z-Report-${params.date}`);
}

export function printThermalOrder(order: OrderRecord, company: CompanyProfile): boolean {
  const html = buildOrderReceiptHtml(order, company);
  return printThermalDocument(html, `Receipt-${order.id}`);
}

/**
 * Plain text export for Bluetooth / WhatsApp
 */
export function generateZReportPlainText(params: ZReportPrintParams): string {
  const { date, company, totalSalesLbp, totalExpensesLbp, netCashLbp, ordersCount, breadSold, breadRemaining, itemsSummary } = params;

  let text = `================================\n`;
  text += `   ${company.name}\n`;
  text += `   تقرير الإغلاق المالي (Z-Report)\n`;
  text += `   التاريخ: ${date}\n`;
  text += `================================\n`;
  text += `إجمالي المبيعات: ${formatLbp(totalSalesLbp)} (${formatUsd(totalSalesLbp, company.usdRate)})\n`;
  text += `عدد الطلبات: ${ordersCount}\n`;
  text += `إجمالي المصاريف: ${formatLbp(totalExpensesLbp)}\n`;
  text += `--------------------------------\n`;
  text += `صافي الصندوق: ${formatLbp(netCashLbp)} (${formatUsd(netCashLbp, company.usdRate)})\n`;
  text += `--------------------------------\n`;
  text += `الخبز الأسمر المباع: ${breadSold} رغيف\n`;
  text += `الخبز المتبقي: ${breadRemaining} رغيف\n`;
  text += `================================\n`;
  text += `الأصناف المباعة:\n`;
  itemsSummary.forEach(i => {
    text += `- ${i.name} × ${i.qty} = ${formatLbp(i.total)}\n`;
  });
  text += `================================\n`;
  text += `نظام ملك الصفيحة زكرياعروب\n`;
  return text;
}
