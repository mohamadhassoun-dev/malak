/**
 * ====================================================================
 * مطعم ملك الصفيحة زكرياعروب - كود Google Apps Script لقاعدة البيانات
 * Google Sheets Database & Backend API Web App
 * ====================================================================
 * 
 * تعليمات التثبيت البسيطة (خلال دقيقة واحدة):
 * 1. افتح جدول Google Sheets جديد في حسابك على Google Drive.
 * 2. من القائمة العلوية اضغط: الإضافات (Extensions) -> Apps Script.
 * 3. امسح أي كود موجود هناك، والصق هذا الملف بالكامل في ملف Code.gs.
 * 4. اضغط زر "حفظ" (أيقونة القرص أو Ctrl+S).
 * 5. اضغط زر "نشر" (Deploy) بالأعلى -> New deployment (نشر جديد).
 * 6. اختر نوع النشر: Web app (تطبيق ويب).
 * 7. اضبط الإعدادات:
 *    - Description: Restaurant POS Database
 *    - Execute as: Me (أنا - بحسابك)
 *    - Who has access: Anyone (أي شخص - حتى يتمكن المتجر من إرسال الطلبات)
 * 8. اضغط Deploy وامنح الصلاحيات، ثم انسخ رابط Web App URL والصقه في الموقع!
 */

// تهيئة أسماء الصفحات (Sheet Names)
var SHEETS = {
  ORDERS: "الطلبات_Orders",
  ORDER_ITEMS: "أصناف_الطلبات_Items",
  MENU: "قائمة_الطعام_Menu",
  INVENTORY: "المستودع_Inventory",
  CUSTOMERS: "الزبائن_Customers",
  EXPENSES: "المصاريف_Expenses",
  CLOSINGS: "الإغلاق_اليومي_ZReports",
  SETTINGS: "إعدادات_المطعم_Settings"
};

/**
 * دالة التعامل مع طلبات GET (جلب البيانات للموقع)
 */
function doGet(e) {
  try {
    initDatabaseSheets(); // التأكد من وجود الصفحات وتنسيقها
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "getAllData";
    var result = {};

    if (action === "ping") {
      result = { status: "success", message: "Google Sheets API متصل بنجاح بمطعم ملك الصفيحة!" };
    } else if (action === "getMenu") {
      result = { status: "success", menu: getSheetDataAsObjects(SHEETS.MENU) };
    } else if (action === "getInventory") {
      result = { status: "success", inventory: getSheetDataAsObjects(SHEETS.INVENTORY) };
    } else if (action === "getOrders") {
      result = { status: "success", orders: getSheetDataAsObjects(SHEETS.ORDERS) };
    } else {
      // إرجاع كافة بيانات النظام للموقع
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

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * دالة التعامل مع طلبات POST (تسجيل طلب جديد، تحديث المستودع، تسجيل زبون)
 */
function doPost(e) {
  try {
    initDatabaseSheets();
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    var action = data.action || "createOrder";
    var response = { status: "success" };

    if (action === "createOrder") {
      response.orderId = recordNewOrder(data.order);
      // خصم الخبز والمواد المستهلكة تلقائياً في الشيت
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
    } else if (action === "syncAll") {
      syncFullStateToSheets(data.state);
      response.message = "تمت مزامنة كافة بيانات السيستم في الشيت بنجاح!";
    }

    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * تسجيل طلب جديد في صفحة الطلبات وصفحة تفاصيل الأصناف
 */
function recordNewOrder(order) {
  if (!order) return null;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.ORDERS);
  var itemsSheet = ss.getSheetByName(SHEETS.ORDER_ITEMS);

  var itemsSummary = (order.items || []).map(function(i) {
    return i.name + " (" + i.quantity + "×)";
  }).join(" + ");

  var orderRow = [
    order.id || ("TRX-" + new Date().getTime().toString().slice(-6)),
    order.customerName || "عميل بدون اسم",
    order.customerPhone || "",
    order.customerAddress || "",
    order.type === "hall" ? "داخل الصالة" : (order.type === "takeaway" ? "سفري (تيك أواي)" : "توصيل دليفري"),
    order.tableNumber ? ("طاولة " + order.tableNumber) : "-",
    itemsSummary,
    order.totalLbp || 0,
    order.totalUsd || 0,
    order.usdRate || 89500,
    order.paymentMethod || "نقداً ل.ل",
    order.status || "قيد الاستلام",
    order.notes || "",
    order.createdAt || new Date().toLocaleString("ar-LB")
  ];

  sheet.appendRow(orderRow);

  // تسجيل أصناف الطلب تفصيلياً
  if (order.items && order.items.length) {
    for (var i = 0; i < order.items.length; i++) {
      var item = order.items[i];
      itemsSheet.appendRow([
        order.id,
        item.name,
        item.quantity,
        item.price,
        item.notes || "",
        new Date().toLocaleString("ar-LB")
      ]);
    }
  }

  return order.id;
}

/**
 * خصم أرغفة الخبز المستهلكة من صفحة المستودع تلقائياً
 */
function deductBreadFromSheet(items) {
  var breadDeductCount = 0;
  for (var i = 0; i < items.length; i++) {
    if (items[i].deductBread) {
      breadDeductCount += (items[i].quantity || 1);
    }
  }
  if (breadDeductCount === 0) return;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.INVENTORY);
  var data = sheet.getDataRange().getValues();

  for (var r = 1; r < data.length; r++) {
    var name = String(data[r][1] || "");
    if (name.indexOf("خبز") !== -1 || name.indexOf("رغيف") !== -1) {
      var currentSold = Number(data[r][3] || 0);
      var initialQty = Number(data[r][2] || 0);
      var newSold = currentSold + breadDeductCount;
      var newRemaining = Math.max(0, initialQty - newSold);

      sheet.getRange(r + 1, 4).setValue(newSold); // المباع
      sheet.getRange(r + 1, 5).setValue(newRemaining); // المتبقي
      break;
    }
  }
}

/**
 * تسجيل زبون جديد في صفحة الزبائن
 */
function recordNewCustomer(customer) {
  if (!customer) return null;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.CUSTOMERS);

  sheet.appendRow([
    customer.id || ("CUST-" + Math.floor(1000 + Math.random() * 9000)),
    customer.name,
    customer.phone,
    customer.address || "",
    customer.password || "1234",
    customer.createdAt || new Date().toLocaleString("ar-LB")
  ]);

  return customer.id;
}

/**
 * تسجيل مصروف في صفحة المصاريف
 */
function recordExpenseInSheet(expense) {
  if (!expense) return null;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.EXPENSES);

  sheet.appendRow([
    expense.id || new Date().getTime(),
    expense.title,
    expense.amount,
    expense.category || "عام",
    expense.date || new Date().toISOString().slice(0, 10),
    new Date().toLocaleString("ar-LB")
  ]);

  return expense.id;
}

/**
 * تسجيل الإغلاق اليومي (Z-Report)
 */
function recordDailyClosingInSheet(closing) {
  if (!closing) return null;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.CLOSINGS);

  sheet.appendRow([
    closing.id || ("Z-" + new Date().getTime()),
    closing.date,
    closing.totalSalesLbp,
    closing.totalSalesUsd,
    closing.totalExpensesLbp,
    closing.netCashLbp,
    closing.ordersCount,
    closing.breadSold,
    closing.closedBy || "الإدارة",
    closing.closedAt || new Date().toLocaleString("ar-LB")
  ]);

  return closing.id;
}

/**
 * تحديث جدول المستودع بالكامل
 */
function updateInventoryInSheet(inventory) {
  if (!inventory || !inventory.length) return false;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.INVENTORY);

  // مسح البيانات القديمة باستثناء الترويسة
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }

  for (var i = 0; i < inventory.length; i++) {
    var inv = inventory[i];
    sheet.appendRow([
      inv.id,
      inv.name,
      inv.initialQty,
      inv.soldQty,
      inv.qty,
      inv.unit,
      inv.minThreshold,
      inv.costPerUnit || 0
    ]);
  }
  return true;
}

/**
 * قراءة أي صفحة في الشيت وتحويلها لكائنات JSON
 */
function getSheetDataAsObjects(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var headers = data[0];
  var rows = [];

  for (var r = 1; r < data.length; r++) {
    var row = data[r];
    var obj = {};
    var hasData = false;
    for (var c = 0; c < headers.length; c++) {
      var header = String(headers[c]).trim();
      obj[header] = row[c];
      if (row[c] !== "" && row[c] !== null) hasData = true;
    }
    if (hasData) rows.push(obj);
  }

  return rows;
}

/**
 * الإنشاء التلقائي لكافة الصفحات وتنسيق الترويسة وألوان المطعم
 */
function initDatabaseSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var headersMap = {};
  headersMap[SHEETS.ORDERS] = ["رقم الفاتورة", "اسم الزبون", "رقم الهاتف", "العنوان", "نوع الطلب", "الطاولة", "ملخص الأصناف", "المجموع (ل.ل)", "المجموع ($)", "سعر الصرف", "طريقة الدفع", "حالة الطلب", "ملاحظات", "التاريخ والوقت"];
  headersMap[SHEETS.ORDER_ITEMS] = ["رقم الطلب", "اسم الصنف", "الكمية", "السعر (ل.ل)", "الملاحظات", "وقت الطلب"];
  headersMap[SHEETS.MENU] = ["المعرف", "اسم الصنف", "التصنيف", "السعر (ل.ل)", "خصم الخبز", "الوصف", "رابط الصورة", "شارة تميز", "متاح للطلب"];
  headersMap[SHEETS.INVENTORY] = ["المعرف", "اسم المادة", "الكمية الأولية", "المباع", "المتبقي", "الوحدة", "حد التنبيه", "سعر التكلفة"];
  headersMap[SHEETS.CUSTOMERS] = ["معرف الحساب", "اسم الزبون", "رقم الهاتف", "العنوان", "كلمة المرور", "تاريخ التسجيل"];
  headersMap[SHEETS.EXPENSES] = ["المعرف", "البيان / الوصف", "المبلغ (ل.ل)", "التصنيف", "التاريخ", "وقت التسجيل"];
  headersMap[SHEETS.CLOSINGS] = ["رقم الإغلاق", "التاريخ", "مجموع المبيعات (ل.ل)", "مجموع المبيعات ($)", "المصاريف (ل.ل)", "الصافي النقدي (ل.ل)", "عدد الطلبات", "أرغفة الخبز المباعة", "المسؤول", "وقت الإغلاق"];

  for (var key in headersMap) {
    var name = key;
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      sheet.appendRow(headersMap[key]);
      
      // تنسيق الترويسة بألوان ملك الصفيحة (خمرية وذهبية)
      var headerRange = sheet.getRange(1, 1, 1, headersMap[key].length);
      headerRange.setBackground("#881337");
      headerRange.setFontColor("#fef3c7");
      headerRange.setFontWeight("bold");
      headerRange.setFontFamily("Arial");
      sheet.setFrozenRows(1);
    }
  }

  // إضافة البيانات الافتراضية لقائمة الطعام إن كانت فارغة
  seedDefaultMenuIfEmpty();
  seedDefaultInventoryIfEmpty();
}

/**
 * تعبئة الأصناف الافتراضية
 */
function seedDefaultMenuIfEmpty() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.MENU);
  if (sheet.getLastRow() <= 1) {
    var defaultMenu = [
      [1, "صفيحة بلحمة طازجة", "صفيحة على الحطب", 70000, 1, "عجينة مقرمشة مع لحمة طازجة متبلة بخلطة بهاراتنا الخاصة ودبس الرمان والصنوبر", "", "الأكثر طلباً", 1],
      [2, "صفيحة كفتة ممتازة", "صفيحة على الحطب", 120000, 1, "كفتة بلدية مشوية على الفرن الحجري مع بصل وبقدونس وشرائح طماطم مشوية", "", "مميز", 1],
      [3, "صفيحة سجق حار", "صفيحة على الحطب", 120000, 1, "سجق لبناني أصيل متبل بالثوم والتوابل الحارة المشوية حتى النضوج", "", "حار", 1],
      [4, "صفيحة دبل جبنة", "صفيحة على الحطب", 150000, 1, "مزيج جبنة عكاوي بلدي مع موتزاريلا غنية وحبة البركة والسمسم المحمص", "", "نباتي", 1],
      [5, "صفيحة لحمة مع جبنة", "صفيحة على الحطب", 160000, 1, "أروع توليفة: خلطة لحمة الصفيحة المميزة مع طبقة ذائبة من الجبنة الغنية", "", "خلطة الشيف", 1],
      [6, "صحن حمص بلدي بطحينة", "مقبلات ومشاوي", 60000, 0, "حمص ناعم محضر يومياً بزيت الزيتون البكر والصنوبر والسماق البلدي", "", "", 1],
      [7, "لبن عيران بلدي بارد", "مشروبات ومرطبات", 40000, 0, "لبن عيران طازج مخفوق مع لمسة ملح خفيفة ونعناع منعش", "", "", 1],
      [8, "عصير برتقال طبيعي", "مشروبات ومرطبات", 50000, 0, "عصير برتقال طبيعي معصور طازج بدون أي إضافات أو سكر", "", "", 1]
    ];
    for (var i = 0; i < defaultMenu.length; i++) {
      sheet.appendRow(defaultMenu[i]);
    }
  }
}

/**
 * تعبئة المستودع الافتراضي
 */
function seedDefaultInventoryIfEmpty() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.INVENTORY);
  if (sheet.getLastRow() <= 1) {
    var defaultInv = [
      [1, "خبز أسمر (أرغفة صفيحة)", 250, 0, 250, "رغيف", 30, 15000],
      [2, "لحمة مفرومة بلدي", 25, 0, 25, "كغ", 5, 600000],
      [3, "جبنة عكاوي وموزاريلا", 18, 0, 18, "كغ", 4, 450000],
      [4, "سجق بلدي متبل", 10, 0, 10, "كغ", 2, 550000],
      [5, "دبس رمان طبيعي", 12, 0, 12, "قارورة", 3, 180000]
    ];
    for (var i = 0; i < defaultInv.length; i++) {
      sheet.appendRow(defaultInv[i]);
    }
  }
}
