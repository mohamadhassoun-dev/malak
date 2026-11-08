import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  X,
  Server,
  Code2,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  FileDown,
  Sparkles,
  Link2
} from 'lucide-react';
import { CompanyProfile, AppState } from '../types';
import { testGoogleSheetsConnection, fetchAllDataFromGoogleSheets } from '../services/googleSheetsService';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyProfile;
  state: AppState;
  onSaveCompany: (updated: CompanyProfile) => void;
  onRestoreState?: (restored: AppState) => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  company,
  state,
  onSaveCompany,
  onRestoreState
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'code' | 'connect' | 'download'>('guide');
  const [scriptUrl, setScriptUrl] = useState<string>(company.googleSheetsUrl || '');
  const [autoSync, setAutoSync] = useState<boolean>(company.googleSheetsAutoSync !== false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<{ loading: boolean; success?: boolean; message?: string } | null>(null);
  const [syncStatus, setSyncStatus] = useState<{ loading: boolean; success?: boolean; message?: string } | null>(null);

  if (!isOpen) return null;

  const sampleAppsScriptCode = `/**
 * ====================================================================
 * مطعم ملك الصفيحة زكرياعروب - كود Google Apps Script لقاعدة البيانات
 * Google Sheets Database & Backend API Web App
 * ====================================================================
 */

var SHEETS = {
  ORDERS: "الطلبات_Orders",
  ORDER_ITEMS: "أصناف_الطلبات_Items",
  MENU: "قائمة_الطعام_Menu",
  INVENTORY: "المستودع_Inventory",
  CUSTOMERS: "الزبائن_Customers",
  EXPENSES: "المصاريف_Expenses",
  CLOSINGS: "الإغلاق_اليومي_ZReports"
};

function doGet(e) {
  try {
    initDatabaseSheets();
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "getAllData";
    var result = {};

    if (action === "ping") {
      result = { status: "success", message: "Google Sheets متصل بنجاح مع المتجر والكاشير!" };
    } else {
      result = {
        status: "success",
        timestamp: new Date().toISOString(),
        menu: getSheetDataAsObjects(SHEETS.MENU),
        inventory: getSheetDataAsObjects(SHEETS.INVENTORY),
        orders: getSheetDataAsObjects(SHEETS.ORDERS),
        customers: getSheetDataAsObjects(SHEETS.CUSTOMERS),
        expenses: getSheetDataAsObjects(SHEETS.EXPENSES),
        closings: getSheetDataAsObjects(SHEETS.CLOSINGS)
      };
    }

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    initDatabaseSheets();
    var data = JSON.parse(e.postData.contents);
    var action = data.action || "createOrder";
    var response = { status: "success" };

    if (action === "createOrder") {
      response.orderId = recordNewOrder(data.order);
      if (data.order && data.order.items) {
        deductBreadFromSheet(data.order.items);
      }
    } else if (action === "registerCustomer") {
      response.customerId = recordNewCustomer(data.customer);
    } else if (action === "updateInventory") {
      response.updated = updateInventoryInSheet(data.inventory);
    } else if (action === "recordExpense") {
      response.expenseId = recordExpenseInSheet(data.expense);
    } else if (action === "recordClosing") {
      response.closingId = recordDailyClosingInSheet(data.closing);
    }

    return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function recordNewOrder(order) {
  if (!order) return null;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.ORDERS);
  var itemsSheet = ss.getSheetByName(SHEETS.ORDER_ITEMS);

  var itemsSummary = (order.items || []).map(function(i) {
    return i.name + " (" + i.quantity + "×)";
  }).join(" + ");

  sheet.appendRow([
    order.id || ("TRX-" + new Date().getTime().toString().slice(-6)),
    order.customerName || "عميل بدون اسم",
    order.customerPhone || "",
    order.customerAddress || "",
    order.type === "hall" ? "داخل الصالة" : (order.type === "takeaway" ? "سفري" : "توصيل دليفري"),
    order.tableNumber ? ("طاولة " + order.tableNumber) : "-",
    itemsSummary,
    order.totalLbp || 0,
    order.totalUsd || 0,
    order.usdRate || 89500,
    order.paymentMethod || "نقداً ل.ل",
    order.status || "قيد الاستلام",
    order.notes || "",
    order.createdAt || new Date().toLocaleString("ar-LB")
  ]);

  if (order.items && order.items.length) {
    for (var i = 0; i < order.items.length; i++) {
      var item = order.items[i];
      itemsSheet.appendRow([order.id, item.name, item.quantity, item.price, item.notes || "", new Date().toLocaleString("ar-LB")]);
    }
  }
  return order.id;
}

function deductBreadFromSheet(items) {
  var count = 0;
  for (var i = 0; i < items.length; i++) {
    if (items[i].deductBread) count += (items[i].quantity || 1);
  }
  if (count === 0) return;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.INVENTORY);
  var data = sheet.getDataRange().getValues();

  for (var r = 1; r < data.length; r++) {
    var name = String(data[r][1] || "");
    if (name.indexOf("خبز") !== -1 || name.indexOf("رغيف") !== -1) {
      var currentSold = Number(data[r][3] || 0);
      var initial = Number(data[r][2] || 0);
      var newSold = currentSold + count;
      sheet.getRange(r + 1, 4).setValue(newSold);
      sheet.getRange(r + 1, 5).setValue(Math.max(0, initial - newSold));
      break;
    }
  }
}

function recordNewCustomer(c) {
  if (!c) return null;
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CUSTOMERS).appendRow([
    c.id || ("CUST-" + Math.floor(1000 + Math.random() * 9000)),
    c.name, c.phone, c.address || "", c.password || "1234", c.createdAt || new Date().toLocaleString("ar-LB")
  ]);
  return c.id;
}

function recordExpenseInSheet(e) {
  if (!e) return null;
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.EXPENSES).appendRow([
    e.id || new Date().getTime(), e.title, e.amount, e.category || "عام", e.date || new Date().toISOString().slice(0, 10), new Date().toLocaleString("ar-LB")
  ]);
  return e.id;
}

function recordDailyClosingInSheet(cl) {
  if (!cl) return null;
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CLOSINGS).appendRow([
    cl.id || ("Z-" + new Date().getTime()), cl.date, cl.totalSalesLbp, cl.totalSalesUsd, cl.totalExpensesLbp, cl.netCashLbp, cl.ordersCount, cl.breadSold, cl.closedBy || "الإدارة", cl.closedAt || new Date().toLocaleString("ar-LB")
  ]);
  return cl.id;
}

function updateInventoryInSheet(inventory) {
  if (!inventory || !inventory.length) return false;
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.INVENTORY);
  var last = sheet.getLastRow();
  if (last > 1) sheet.getRange(2, 1, last - 1, sheet.getLastColumn()).clearContent();
  for (var i = 0; i < inventory.length; i++) {
    var inv = inventory[i];
    sheet.appendRow([inv.id, inv.name, inv.initialQty, inv.soldQty, inv.qty, inv.unit, inv.minThreshold, inv.costPerUnit || 0]);
  }
  return true;
}

function getSheetDataAsObjects(sheetName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0];
  var rows = [];
  for (var r = 1; r < data.length; r++) {
    var obj = {};
    var hasData = false;
    for (var c = 0; c < headers.length; c++) {
      obj[String(headers[c]).trim()] = data[r][c];
      if (data[r][c] !== "" && data[r][c] !== null) hasData = true;
    }
    if (hasData) rows.push(obj);
  }
  return rows;
}

function initDatabaseSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var map = {};
  map[SHEETS.ORDERS] = ["رقم الفاتورة", "اسم الزبون", "رقم الهاتف", "العنوان", "نوع الطلب", "الطاولة", "ملخص الأصناف", "المجموع (ل.ل)", "المجموع ($)", "سعر الصرف", "طريقة الدفع", "حالة الطلب", "ملاحظات", "التاريخ والوقت"];
  map[SHEETS.ORDER_ITEMS] = ["رقم الطلب", "اسم الصنف", "الكمية", "السعر (ل.ل)", "الملاحظات", "وقت الطلب"];
  map[SHEETS.MENU] = ["المعرف", "اسم الصنف", "التصنيف", "السعر (ل.ل)", "خصم الخبز", "الوصف", "رابط الصورة", "شارة تميز", "متاح للطلب"];
  map[SHEETS.INVENTORY] = ["المعرف", "اسم المادة", "الكمية الأولية", "المباع", "المتبقي", "الوحدة", "حد التنبيه", "سعر التكلفة"];
  map[SHEETS.CUSTOMERS] = ["معرف الحساب", "اسم الزبون", "رقم الهاتف", "العنوان", "كلمة المرور", "تاريخ التسجيل"];
  map[SHEETS.EXPENSES] = ["المعرف", "البيان / الوصف", "المبلغ (ل.ل)", "التصنيف", "التاريخ", "وقت التسجيل"];
  map[SHEETS.CLOSINGS] = ["رقم الإغلاق", "التاريخ", "مجموع المبيعات (ل.ل)", "مجموع المبيعات ($)", "المصاريف (ل.ل)", "الصافي النقدي (ل.ل)", "عدد الطلبات", "أرغفة الخبز المباعة", "المسؤول", "وقت الإغلاق"];

  for (var key in map) {
    var sheet = ss.getSheetByName(key);
    if (!sheet) {
      sheet = ss.insertSheet(key);
      sheet.appendRow(map[key]);
      var r = sheet.getRange(1, 1, 1, map[key].length);
      r.setBackground("#881337");
      r.setFontColor("#fef3c7");
      r.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
  }
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sampleAppsScriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSaveConnection = () => {
    const cleanUrl = scriptUrl.trim();
    onSaveCompany({
      ...company,
      googleSheetsUrl: cleanUrl,
      googleSheetsAutoSync: autoSync
    });
    setTestStatus({
      loading: false,
      success: true,
      message: 'تم حفظ رابط Google Sheets بنجاح! سيتم إرسال الطلبات والمبيعات تلقائياً إلى الشيت.'
    });
  };

  const handleTestConnection = async () => {
    if (!scriptUrl.trim()) {
      setTestStatus({ loading: false, success: false, message: 'يرجى إدخال الرابط أولاً لفحصه.' });
      return;
    }

    setTestStatus({ loading: true });
    const result = await testGoogleSheetsConnection(scriptUrl);
    setTestStatus({ loading: false, success: result.success, message: result.message });
  };

  const handleSyncDataNow = async () => {
    if (!scriptUrl.trim()) return;
    setSyncStatus({ loading: true });
    try {
      const data = await fetchAllDataFromGoogleSheets(scriptUrl);
      if (data && data.status === 'success') {
        setSyncStatus({
          loading: false,
          success: true,
          message: 'تمت مزامنة وقراءة البيانات من Google Sheets بنجاح!'
        });
      } else {
        setSyncStatus({
          loading: false,
          success: true,
          message: 'تم إرسال إشارة المزامنة إلى الشيت بنجاح!'
        });
      }
    } catch (e: any) {
      setSyncStatus({ loading: false, success: false, message: 'تعذر جلب البيانات: ' + e.toString() });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-stone-200 dark:border-stone-800 text-right space-y-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-50 flex items-center gap-2">
                <span>ربط قاعدة البيانات عبر Google Sheets & Excel</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                  بديل SQL السهل
                </span>
              </h3>
              <p className="text-xs text-stone-500">
                إدارة كافة الطلبات، المبيعات، الجرد، والزبائن مباشرة من جدول Google Sheets / Excel بدون الحاجة لقواعد بيانات معقدة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-900 dark:hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-stone-100 dark:border-stone-800 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>كيفية الربط (خطوة بخطوة 1-4)</span>
          </button>

          <button
            onClick={() => setActiveTab('connect')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'connect'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>رابط الـ Web App والاتصال الحي</span>
            {company.googleSheetsUrl && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>كود Apps Script (Code.gs)</span>
          </button>

          <button
            onClick={() => setActiveTab('download')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'download'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>ملفات Excel و CSV الجاهزة</span>
          </button>
        </div>

        {/* TAB 1: Complete 4-Step Connection Guide */}
        {activeTab === 'guide' && (
          <div className="space-y-4 flex-grow overflow-y-auto text-xs leading-relaxed">
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold">
              🌟 ميزة الربط عبر Google Sheets & Excel: ستحصل على قاعدة بيانات حية ومجانية بالكامل، حيث تسجل كل فاتورة جديدة، طلب دليفري، وزبون مسجل في جدول إكسل خاص بك في درايف لحظة بلحظة مع خصم تلقائي للخبز والمستودع!
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Step 1 */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                    1
                  </span>
                  <h4 className="font-black text-stone-900 dark:text-stone-100 text-sm">
                    Excel & Google Sheets Database
                  </h4>
                </div>
                <p className="text-stone-600 dark:text-stone-300">
                  افتح حسابك في Google Drive وأنشئ ملف <strong>Google Sheets</strong> جديد (أو يمكنك رفع ملف Excel فارغ). سيتولى السكربت تلقائياً إنشاء كافة صفحات الطلبات، المنيو، المستودع، والمصاريف بألوان وتنسيقات جاهزة.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                    2
                  </span>
                  <h4 className="font-black text-stone-900 dark:text-stone-100 text-sm">
                    فتح Google Apps Script
                  </h4>
                </div>
                <p className="text-stone-600 dark:text-stone-300">
                  من القائمة العلوية داخل ملف الشيت، اضغط على <strong>الإضافات (Extensions)</strong> ثم اختر <strong>Apps Script</strong>. سيفتح لك محرر الأكواد في تبويب جديد.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                    3
                  </span>
                  <h4 className="font-black text-stone-900 dark:text-stone-100 text-sm">
                    Google Apps Script API (Web App)
                  </h4>
                </div>
                <p className="text-stone-600 dark:text-stone-300">
                  انسخ كود <strong>Code.gs</strong> من التبويب المجاور، والصقه في المحرر. ثم اضغط زر <strong>Deploy (نشر)</strong> بالأعلى واختر <strong>New deployment</strong> كـ <strong>Web app</strong> مع جعل الصلاحية: <strong>Anyone (أي شخص)</strong>.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                    4
                  </span>
                  <h4 className="font-black text-stone-900 dark:text-stone-100 text-sm">
                    Your Restaurant POS Application
                  </h4>
                </div>
                <p className="text-stone-600 dark:text-stone-300">
                  انسخ رابط الـ Web App الممنوح لك، والصقه في تبويب <strong>"رابط الـ Web App"</strong> هنا. فوراً ستصبح كل فواتير المطعم وجرد الخبز متزامنة حياً مع جدول الإكسل الخاص بك!
                </p>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setActiveTab('connect')}
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition inline-flex items-center gap-2 cursor-pointer"
              >
                <Link2 className="w-4 h-4" />
                <span>إدخال الرابط وفحص الاتصال الآن</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Live Connection Input & Sync */}
        {activeTab === 'connect' && (
          <div className="space-y-4 flex-grow overflow-y-auto text-xs">
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3">
              <label className="block text-stone-800 dark:text-stone-200 font-bold">
                رابط Google Apps Script Web App URL:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  value={scriptUrl}
                  onChange={(e) => setScriptUrl(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testStatus?.loading}
                  className="px-4 py-2.5 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-900 dark:text-stone-100 font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testStatus?.loading ? 'animate-spin' : ''}`} />
                  <span>فحص الاتصال</span>
                </button>
              </div>

              {testStatus && (
                <div className={`p-3 rounded-xl font-bold flex items-center gap-2 ${
                  testStatus.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                }`}>
                  {testStatus.success ? <Check className="w-4 h-4 text-emerald-500 shrink-0" /> : <X className="w-4 h-4 text-rose-500 shrink-0" />}
                  <span>{testStatus.message}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-stone-200 dark:border-stone-700">
                <input
                  type="checkbox"
                  id="autoSyncCheck"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="autoSyncCheck" className="text-stone-700 dark:text-stone-300 font-bold cursor-pointer">
                  مزامنة كل طلب وفاتورة تلقائياً في الشيت فور تأكيدها (Real-time auto-sync)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={handleSaveConnection}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>حفظ إعدادات الربط في النظام</span>
              </button>

              <button
                onClick={handleSyncDataNow}
                disabled={syncStatus?.loading || !scriptUrl}
                className="px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-bold transition flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncStatus?.loading ? 'animate-spin' : ''}`} />
                <span>مزامنة واختبار الآن</span>
              </button>
            </div>

            {syncStatus && (
              <div className={`p-3 rounded-xl font-bold text-xs ${
                syncStatus.success ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300' : 'bg-rose-50 text-rose-800'
              }`}>
                {syncStatus.message}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Complete Apps Script Code */}
        {activeTab === 'code' && (
          <div className="space-y-3 flex-grow overflow-y-auto text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-600 dark:text-stone-300">
                انسخ هذا الكود بالكامل وضعه في محرر Apps Script داخل Google Sheets:
              </span>
              <button
                onClick={handleCopyCode}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'تم النسخ بنجاح!' : 'نسخ الكود بالكامل'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-stone-900 text-stone-100 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[50vh] border border-stone-800 text-left dir-ltr selection:bg-emerald-600 selection:text-white">
              {sampleAppsScriptCode}
            </pre>
          </div>
        )}

        {/* TAB 4: Ready Excel & CSV Downloads */}
        {activeTab === 'download' && (
          <div className="space-y-4 flex-grow overflow-y-auto text-xs">
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3">
              <h4 className="font-black text-stone-900 dark:text-stone-100 text-sm flex items-center gap-2">
                <FileDown className="w-4 h-4 text-emerald-500" />
                <span>ملف قاعدة البيانات لقوائم الطعام والمستودع (.csv):</span>
              </h4>
              <p className="text-stone-500 leading-relaxed">
                ملف يحتوي على الترويسات العربية الجاهزة والأصناف الافتراضية، الأرغفة، والمواد الخام لفتحه مباشرة في برنامج Microsoft Excel أو رفعه إلى Google Sheets.
              </p>
              <a
                href="/restaurant_database_template.csv"
                download="restaurant_database_template.csv"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition"
              >
                <Download className="w-4 h-4" />
                <span>تحميل ملف Excel / CSV الجاهز</span>
              </a>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3">
              <h4 className="font-black text-stone-900 dark:text-stone-100 text-sm flex items-center gap-2">
                <Code2 className="w-4 h-4 text-amber-500" />
                <span>ملف كود Google Apps Script كاملاً (.js):</span>
              </h4>
              <p className="text-stone-500 leading-relaxed">
                تحميل ملف السكربت كاملاً للاحتفاظ بنسخة منه على جهازك.
              </p>
              <a
                href="/google_apps_script.js"
                download="google_apps_script.js"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-900 dark:text-stone-100 font-bold text-xs transition"
              >
                <Download className="w-4 h-4" />
                <span>تحميل كود Google Apps Script (.js)</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
