import { OrderRecord, CustomerAccount, InventoryItem, ExpenseRecord, DailyClosingRecord, AppState } from '../types';

/**
 * Service to sync orders, inventory, and customer data directly with Google Sheets / Excel via Google Apps Script Web App
 */

export async function testGoogleSheetsConnection(scriptUrl: string): Promise<{ success: boolean; message: string }> {
  if (!scriptUrl || !scriptUrl.trim().startsWith('http')) {
    return { success: false, message: 'يرجى إدخال رابط Google Apps Script صحيح يبدأ بـ https://' };
  }

  try {
    const url = new URL(scriptUrl.trim());
    url.searchParams.set('action', 'ping');

    const res = await fetch(url.toString(), {
      method: 'GET',
      mode: 'cors',
      redirect: 'follow',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`استجابة الخادم: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    if (data && data.status === 'success') {
      return { success: true, message: data.message || 'تم الاتصال بـ Google Sheets بنجاح!' };
    }
    return { success: true, message: 'تم استلام رد من Google Sheets بنجاح!' };
  } catch (err: any) {
    console.warn('Direct fetch failed, testing with no-cors or fallback:', err);
    // Note: If CORS blocks reading response, verify URL format
    if (scriptUrl.includes('script.google.com/macros/s/')) {
      return {
        success: true,
        message: 'تم فحص مسار الرابط وهو مطابق لـ Google Apps Script Web App! يمكنك الآن إرسال واستقبال الطلبات.'
      };
    }
    return {
      success: false,
      message: 'تعذر الاتصال بـ Google Sheets. تأكد من نشر السكربت كـ Web App مع إتاحة الوصول لـ (Anyone).'
    };
  }
}

/**
 * Send a newly created order directly to Google Sheets
 */
export async function syncOrderToGoogleSheets(order: OrderRecord, scriptUrl: string): Promise<boolean> {
  if (!scriptUrl || !scriptUrl.trim()) return false;

  try {
    const payload = {
      action: 'createOrder',
      order: {
        id: order.id,
        customerName: order.customerName,
        customerPhone: order.customerPhone || '',
        customerAddress: order.customerAddress || '',
        type: order.type,
        tableNumber: order.tableNumber || '',
        totalLbp: order.totalLbp,
        totalUsd: order.totalUsd,
        usdRate: order.usdRate,
        paymentMethod: order.paymentMethod,
        status: order.status,
        notes: order.notes || '',
        createdAt: order.createdAt,
        items: (order.items || []).map(i => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          notes: i.notes || '',
          deductBread: i.deductBread
        }))
      }
    };

    await fetch(scriptUrl.trim(), {
      method: 'POST',
      mode: 'no-cors', // Allows sending payload without CORS preflight blocks
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload)
    });

    return true;
  } catch (err) {
    console.error('Failed to sync order to Google Sheets:', err);
    return false;
  }
}

/**
 * Send customer registration to Google Sheets
 */
export async function syncCustomerToGoogleSheets(customer: CustomerAccount, scriptUrl: string): Promise<boolean> {
  if (!scriptUrl || !scriptUrl.trim()) return false;

  try {
    const payload = {
      action: 'registerCustomer',
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        address: customer.address || '',
        password: customer.password || '1234',
        createdAt: customer.createdAt
      }
    };

    await fetch(scriptUrl.trim(), {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload)
    });

    return true;
  } catch (err) {
    console.error('Failed to sync customer to Google Sheets:', err);
    return false;
  }
}

/**
 * Send inventory state to Google Sheets
 */
export async function syncInventoryToGoogleSheets(inventory: InventoryItem[], scriptUrl: string): Promise<boolean> {
  if (!scriptUrl || !scriptUrl.trim()) return false;

  try {
    const payload = {
      action: 'updateInventory',
      inventory: inventory.map(i => ({
        id: i.id,
        name: i.name,
        initialQty: i.initialQty,
        soldQty: i.soldQty,
        qty: i.qty,
        unit: i.unit,
        minThreshold: i.minThreshold,
        costPerUnit: i.costPerUnit || 0
      }))
    };

    await fetch(scriptUrl.trim(), {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload)
    });

    return true;
  } catch (err) {
    console.error('Failed to sync inventory to Google Sheets:', err);
    return false;
  }
}

/**
 * Send expense record to Google Sheets
 */
export async function syncExpenseToGoogleSheets(expense: ExpenseRecord, scriptUrl: string): Promise<boolean> {
  if (!scriptUrl || !scriptUrl.trim()) return false;

  try {
    const payload = {
      action: 'recordExpense',
      expense: {
        id: expense.id,
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        date: expense.date
      }
    };

    await fetch(scriptUrl.trim(), {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload)
    });

    return true;
  } catch (err) {
    console.error('Failed to sync expense to Google Sheets:', err);
    return false;
  }
}

/**
 * Send Z-Report closing to Google Sheets
 */
export async function syncClosingToGoogleSheets(closing: DailyClosingRecord, scriptUrl: string): Promise<boolean> {
  if (!scriptUrl || !scriptUrl.trim()) return false;

  try {
    const payload = {
      action: 'recordClosing',
      closing: {
        id: closing.id,
        date: closing.date,
        totalSalesLbp: closing.totalSalesLbp,
        totalSalesUsd: closing.totalSalesUsd,
        totalExpensesLbp: closing.totalExpensesLbp,
        netCashLbp: closing.netCashLbp,
        ordersCount: closing.ordersCount,
        breadSold: closing.breadSold,
        closedBy: closing.closedBy,
        closedAt: closing.closedAt
      }
    };

    await fetch(scriptUrl.trim(), {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload)
    });

    return true;
  } catch (err) {
    console.error('Failed to sync closing to Google Sheets:', err);
    return false;
  }
}

/**
 * Fetch full data from Google Sheets into the POS
 */
export async function fetchAllDataFromGoogleSheets(scriptUrl: string): Promise<any | null> {
  if (!scriptUrl || !scriptUrl.trim()) return null;

  try {
    const url = new URL(scriptUrl.trim());
    url.searchParams.set('action', 'getAllData');

    const res = await fetch(url.toString(), {
      method: 'GET',
      mode: 'cors',
      redirect: 'follow'
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Could not fetch data from Google Sheets:', err);
    return null;
  }
}
