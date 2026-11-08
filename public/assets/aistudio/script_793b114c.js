// ساعة حية
function updateLiveClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ar-LB');
    const clockEl = document.getElementById('live-clock');
    if(clockEl) clockEl.textContent = timeStr;
}
setInterval(updateLiveClock, 1000);

// تخصيص الألوان
function changeThemeColor(hexColor) {
    document.documentElement.style.setProperty('--primary-color', hexColor);
    document.documentElement.style.setProperty('--btn-color', hexColor);
    document.documentElement.style.setProperty('--btn-hover', adjustColorBrightness(hexColor, -20));
    setSecureItem('malak_theme_color', hexColor);
}

function adjustColorBrightness(hex, percent) {
    let num = parseInt(hex.replace("#",""), 16);
    let amt = Math.round(2.55 * percent);
    let R = (num >> 16) + amt;
    let G = (num >> 8 & 0x00FF) + amt;
    let B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
}

const DEFAULT_LOGO = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="100%" height="100%" fill="%23881337"/><circle cx="100" cy="100" r="85" fill="%23be123c" stroke="%23f59e0b" stroke-width="6"/><text x="50%" y="48%" font-family="sans-serif" font-size="44" text-anchor="middle" dominant-baseline="middle">🥙</text><text x="50%" y="74%" font-family="sans-serif" font-size="14" font-weight="900" text-anchor="middle" fill="%23f59e0b">ملك الصفيحة</text></svg>';

function genSVG(title) {
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="100%" height="100%" fill="%23fff1f2"/><text x="50%" y="45%" font-family="sans-serif" font-size="45" text-anchor="middle" dominant-baseline="middle">🥙</text><text x="50%" y="78%" font-family="sans-serif" font-size="15" font-weight="bold" text-anchor="middle" fill="%23881337">' + encodeURIComponent(title || 'ملك الصفيحة') + '</text></svg>';
}

const INITIAL_MENU = [
    { id: 1, name: "صفيحة بلحمة", price: 70000, deductBread: true, img: genSVG("صفيحة بلحمة") },
    { id: 2, name: "صفيحة كفتة", price: 120000, deductBread: true, img: genSVG("صفيحة كفتة") },
    { id: 3, name: "صفيحة سجق", price: 120000, deductBread: true, img: genSVG("صفيحة سجق") },
    { id: 4, name: "صفيحة زائد جبنة", price: 150000, deductBread: true, img: genSVG("صفيحة زائد جبنة") },
    { id: 5, name: "عصير", price: 50000, deductBread: false, img: genSVG("عصير") },
    { id: 6, name: "عيران", price: 40000, deductBread: false, img: genSVG("عيران") },
    { id: 7, name: "حمص", price: 60000, deductBread: false, img: genSVG("حمص") }
];

function formatMoney(amt) { return Number(amt || 0).toLocaleString('ar-LB') + ' ل.ل'; }

let memoryCache = {};
function setSecureItem(key, val) {
    try { localStorage.setItem(key, val); memoryCache[key] = val; } catch(e) { memoryCache[key] = val; }
}
function getSecureItem(key) {
    try { let v = localStorage.getItem(key); return v !== null ? v : (memoryCache[key] || null); } catch(e) { return memoryCache[key] || null; }
}

// ملف الشركة
let companyProfile = JSON.parse(getSecureItem('malak_company_profile') || JSON.stringify({
    name: "ملك الصفيحة زكرياعروب",
    phone: "03416224",
    address: "شارع الأرز",
    city: "طرابلس - القبة",
    country: "لبنان",
    tax: ""
}));

function applyCompanyProfileToUI() {
    document.getElementById('header-company-name').textContent = companyProfile.name;
    document.getElementById('header-company-sub').innerHTML = `<i class="fas fa-map-marker-alt text-amber-400"></i> ${companyProfile.city} - ${companyProfile.address} | تأسيس 1998 | هاتف: ${companyProfile.phone}`;
    
    if(document.getElementById('comp-name')) document.getElementById('comp-name').value = companyProfile.name;
    if(document.getElementById('comp-phone')) document.getElementById('comp-phone').value = companyProfile.phone;
    if(document.getElementById('comp-address')) document.getElementById('comp-address').value = companyProfile.address;
    if(document.getElementById('comp-city')) document.getElementById('comp-city').value = companyProfile.city;
    if(document.getElementById('comp-country')) document.getElementById('comp-country').value = companyProfile.country;
    if(document.getElementById('comp-tax')) document.getElementById('comp-tax').value = companyProfile.tax || '';
}

function saveCompanyProfile() {
    companyProfile.name = document.getElementById('comp-name').value.trim() || "ملك الصفيحة زكرياعروب";
    companyProfile.phone = document.getElementById('comp-phone').value.trim() || "03416224";
    companyProfile.address = document.getElementById('comp-address').value.trim() || "";
    companyProfile.city = document.getElementById('comp-city').value.trim() || "";
    companyProfile.country = document.getElementById('comp-country').value.trim() || "";
    companyProfile.tax = document.getElementById('comp-tax').value.trim() || "";
    
    setSecureItem('malak_company_profile', JSON.stringify(companyProfile));
    applyCompanyProfileToUI();
    alert('تم حفظ ملف الشركة وتحديث بيانات الإيصالات بنجاح!');
}

let usdRate = parseFloat(getSecureItem('malak_usd_rate')) || 89500;
document.getElementById('usd-rate-input').value = usdRate;
function updateUsdRate(val) {
    usdRate = parseFloat(val) || 89500;
    setSecureItem('malak_usd_rate', usdRate);
    renderCart();
}
function formatUSD(lbpAmt) { return '$' + (lbpAmt / usdRate).toFixed(2); }

let logoImage = getSecureItem('malak_logo') || DEFAULT_LOGO;
document.getElementById('main-logo').src = logoImage;

let savedThemeColor = getSecureItem('malak_theme_color') || '#881337';
document.getElementById('primary-color-picker').value = savedThemeColor;
changeThemeColor(savedThemeColor);

// التحكم بحجم الصور في القائمة
let currentImgSize = getSecureItem('malak_img_size') || 'medium';

function setImageSize(size) {
    currentImgSize = size;
    setSecureItem('malak_img_size', size);
    updateImageSizeButtonsUI();
    renderMenu();
}

function updateImageSizeButtonsUI() {
    ['small', 'medium', 'large', 'hidden'].forEach(s => {
        const btn = document.getElementById(`img-size-${s}`);
        if (btn) {
            if (s === currentImgSize) {
                btn.className = 'px-2.5 py-1 rounded-lg dynamic-btn text-white shadow font-black';
            } else {
                btn.className = 'px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-300 transition';
            }
        }
    });
}

async function resizeAndCompressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width, height = img.height;
                const maxDim = 250;
                if (width > height) { if (width > maxDim) { height *= maxDim / width; width = maxDim; } }
                else { if (height > maxDim) { width *= maxDim / height; height = maxDim; } }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

async function uploadLogo(event) {
    if (isCustomerMode) return;
    const file = event.target.files[0];
    if (file) {
        logoImage = await resizeAndCompressImage(file);
        saveData(); document.getElementById('main-logo').src = logoImage;
        alert('تم حفظ الشعار بنجاح!');
    }
}

let menuItems = INITIAL_MENU;
let savedMenuJson = getSecureItem('malak_menu');
if (savedMenuJson) {
    try {
        let parsed = JSON.parse(savedMenuJson);
        if (Array.isArray(parsed) && parsed.length > 0) menuItems = parsed;
    } catch(e) {}
}

let tablesData = JSON.parse(getSecureItem('malak_tables') || '{"1":[],"2":[],"3":[],"4":[],"5":[],"6":[],"7":[],"8":[]}');
let activeTable = 1;
let currentOrderType = 'hall';
let takeawayCart = JSON.parse(getSecureItem('malak_takeaway_cart') || '[]');
let deliveryCart = JSON.parse(getSecureItem('malak_delivery_cart') || '[]');
let isCustomerMode = true;
let isDarkMode = getSecureItem('malak_dark') === 'true';
let transactionsLog = JSON.parse(getSecureItem('malak_trx') || '[]');
let expensesLog = JSON.parse(getSecureItem('malak_exp') || '[]');
let inventoryStock = JSON.parse(getSecureItem('malak_inv') || '[{"id":1,"name":"خبز أسمر","initialQty":200,"soldQty":0,"qty":200,"unit":"رغيف"}]');

function saveData() {
    try {
        setSecureItem('malak_logo', logoImage);
        setSecureItem('malak_menu', JSON.stringify(menuItems));
        setSecureItem('malak_tables', JSON.stringify(tablesData));
        setSecureItem('malak_takeaway_cart', JSON.stringify(takeawayCart));
        setSecureItem('malak_delivery_cart', JSON.stringify(deliveryCart));
        setSecureItem('malak_trx', JSON.stringify(transactionsLog));
        setSecureItem('malak_exp', JSON.stringify(expensesLog));
        setSecureItem('malak_inv', JSON.stringify(inventoryStock));
    } catch(e) {}
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    setSecureItem('malak_dark', isDarkMode);
    applyTheme();
}
function applyTheme() {
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
        document.getElementById('theme-icon').className = 'fas fa-sun';
    } else {
        document.documentElement.classList.remove('dark');
        document.getElementById('theme-icon').className = 'fas fa-moon';
    }
}

function switchMainTab(tabId) {
    if (isCustomerMode && tabId !== 'pos') return;
    ['pos', 'tables', 'inventory', 'menu_edit', 'company', 'transactions', 'reports'].forEach(t => {
        const c = document.getElementById(`tab-content-${t}`);
        const b = document.getElementById(`nav-btn-${t}`);
        if (c) c.classList.toggle('hidden', t !== tabId);
        if (b) {
            if (t === tabId) {
                b.className = 'px-3 py-1.5 rounded-lg font-black text-xs transition flex items-center gap-1.5 dynamic-btn text-white shadow';
            } else {
                b.className = 'px-3 py-1.5 rounded-lg font-bold text-xs transition flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white';
            }
        }
    });
    if (tabId === 'tables') renderTables();
    if (tabId === 'inventory') renderInventory();
    if (tabId === 'menu_edit') renderMenuEditTable();
    if (tabId === 'company') applyCompanyProfileToUI();
    if (tabId === 'transactions') renderTransactions();
    if (tabId === 'reports') renderReports();
}

function exitCustomerMode() {
    if (isCustomerMode) {
        let pass = prompt('أدخل كلمة سر المشرف (1234):');
        if (pass === '1234' || pass === '03416224') { isCustomerMode = false; applyMode(); }
        else if (pass !== null) alert('كلمة المرور غير صحيحة.');
    } else { isCustomerMode = true; applyMode(); }
}

function applyMode() {
    document.querySelectorAll('.admin-only').forEach(el => el.classList.toggle('hidden', isCustomerMode));
    const nav = document.getElementById('main-nav-bar');
    if (nav) nav.style.display = isCustomerMode ? 'none' : 'flex';
    document.getElementById('admin-mode-btn-text').textContent = isCustomerMode ? 'دخول الإدارة' : 'وضع الزبون';
    document.getElementById('admin-mode-icon').className = isCustomerMode ? 'fas fa-lock' : 'fas fa-unlock-alt';
    switchMainTab(isCustomerMode ? 'pos' : 'tables');
    renderMenu(); renderTables(); renderInventory(); applyCompanyProfileToUI();
}

function setOrderType(type) {
    currentOrderType = type;
    ['hall', 'takeaway', 'delivery'].forEach(t => {
        const btn = document.getElementById(`tab-${t}`);
        if (btn) {
            if (t === type) {
                btn.className = 'px-3 py-1 rounded-lg font-black text-xs transition flex items-center gap-1 dynamic-btn text-white shadow';
            } else {
                btn.className = 'px-3 py-1 rounded-lg font-bold text-xs transition flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white';
            }
        }
    });
    document.getElementById('section-takeaway').classList.toggle('hidden', type !== 'takeaway');
    document.getElementById('section-delivery').classList.toggle('hidden', type !== 'delivery');
    
    if (type === 'hall') document.getElementById('cart-box-title').textContent = `سلة طاولة رقم ${activeTable}`;
    else if (type === 'takeaway') document.getElementById('cart-box-title').textContent = 'سلة تيك أواي (سفري)';
    else if (type === 'delivery') document.getElementById('cart-box-title').textContent = 'سلة دليفري (توصيل)';
    renderTables(); renderCart();
}

function getCurrentCart() {
    if (currentOrderType === 'hall') return tablesData[activeTable] || [];
    if (currentOrderType === 'takeaway') return takeawayCart;
    if (currentOrderType === 'delivery') return deliveryCart;
    return [];
}

function setCurrentCart(cart) {
    if (currentOrderType === 'hall') tablesData[activeTable] = cart;
    else if (currentOrderType === 'takeaway') takeawayCart = cart;
    else if (currentOrderType === 'delivery') deliveryCart = cart;
    saveData();
}

function renderTables() {
    const container = document.getElementById('tables-container');
    if (!container) return;
    container.innerHTML = '';
    Object.keys(tablesData).map(Number).sort((a,b)=>a-b).forEach(tNum => {
        const cart = tablesData[tNum] || [];
        const occ = cart.length > 0;
        const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
        const div = document.createElement('div');
        div.className = `p-4 rounded-xl text-xs font-bold border-2 cursor-pointer flex flex-col justify-between transition ${activeTable === tNum ? 'ring-2 ring-amber-400 shadow-md' : ''} ${occ ? 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40' : 'bg-slate-50 text-slate-800 border-slate-200 dark:bg-slate-900 dark:text-slate-200'}`;
        div.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <span class="font-black text-sm"><i class="fas fa-chair text-amber-500"></i> طاولة ${tNum}</span>
                <span class="w-3 h-3 rounded-full ${occ ? 'bg-rose-500' : 'bg-emerald-500'}"></span>
            </div>
            <div class="text-xs font-black text-slate-700 dark:text-slate-300 mb-1">${occ ? formatMoney(total) : 'فارغة'}</div>
            <div class="text-[10px] dynamic-text font-bold">${occ ? cart.length + ' أصناف مسجلة' : 'انقر للاختيار والطلب'}</div>
        `;
        div.onclick = () => { 
            activeTable = tNum; 
            currentOrderType = 'hall'; 
            setOrderType('hall');
            switchMainTab('pos');
        };
        container.appendChild(div);
    });
}

function openAddTableModal() {
    document.getElementById('new-table-num-input').value = '';
    document.getElementById('add-table-modal').classList.remove('hidden');
}

function closeAddTableModal() {
    document.getElementById('add-table-modal').classList.add('hidden');
}

function saveNewTable() {
    let val = parseInt(document.getElementById('new-table-num-input').value);
    if (isNaN(val) || val <= 0) return alert('أدخل رقم طاولة صحيح!');
    if (tablesData[val]) return alert('هذه الطاولة موجودة مسبقاً!');

    tablesData[val] = [];
    activeTable = val;
    currentOrderType = 'hall';
    setOrderType('hall');
    saveData();
    renderTables();
    closeAddTableModal();
    switchMainTab('pos');
    alert(`تمت إضافة واختيار الطاولة رقم ${val} بنجاح!`);
}

function removeSelectedTable() {
    if (Object.keys(tablesData).length <= 1) return alert('يجب الإبقاء على طاولة واحدة على الأقل.');
    if (confirm(`حذف الطاولة رقم ${activeTable}؟`)) {
        delete tablesData[activeTable];
        activeTable = Object.keys(tablesData).map(Number)[0];
        saveData(); renderTables(); renderCart();
    }
}

function clearActiveTable() {
    if (currentOrderType === 'hall') tablesData[activeTable] = [];
    else if (currentOrderType === 'takeaway') takeawayCart = [];
    else if (currentOrderType === 'delivery') deliveryCart = [];
    saveData(); renderTables(); renderCart();
}

function renderMenu() {
    const grid = document.getElementById('menu-grid');
    if (!grid) return;

    let imgHeightClass = 'h-20'; // صغير
    if (currentImgSize === 'medium') imgHeightClass = 'h-36';
    else if (currentImgSize === 'large') imgHeightClass = 'h-52';

    grid.innerHTML = menuItems.map(item => `
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-3 border shadow-sm flex flex-col justify-between">
            ${currentImgSize !== 'hidden' ? `
            <div class="relative overflow-hidden rounded-xl mb-2 ${imgHeightClass} bg-slate-100 flex items-center justify-center cursor-pointer transition-all duration-200" onclick="addToCart(${item.id})">
                <img src="${item.img}" class="w-full h-full object-cover">
            </div>` : ''}
            <div>
                <h4 class="font-black text-sm mb-1 text-slate-800 dark:text-slate-100">${item.name}</h4>
                <p class="font-black dynamic-text text-sm mb-3">${formatMoney(item.price)} <span class="text-[10px] text-slate-400">(${formatUSD(item.price)})</span></p>
            </div>
            <button onclick="addToCart(${item.id})" class="w-full dynamic-btn text-white font-bold py-2.5 rounded-xl text-xs shadow transition"><i class="fas fa-plus"></i> إضافة للسلة</button>
        </div>
    `).join('');
    updateImageSizeButtonsUI();
}

function renderMenuEditTable() {
    if (isCustomerMode) return;
    const tbody = document.getElementById('menu-edit-table-body');
    if (!tbody) return;
    tbody.innerHTML = menuItems.map(item => `
        <tr class="border-b dark:border-slate-800">
            <td class="p-3"><img src="${item.img}" class="w-12 h-12 object-cover rounded-lg border"></td>
            <td class="p-3 font-bold">${item.name}</td>
            <td class="p-3 font-black dynamic-text">${formatMoney(item.price)}</td>
            <td class="p-3 text-center"><span class="px-2 py-1 rounded text-xs font-bold ${item.deductBread ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}">${item.deductBread ? 'نعم (يخصم خبز)' : 'لا'}</span></td>
            <td class="p-3">
                <label for="img-file-${item.id}" class="bg-indigo-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer inline-block"><i class="fas fa-camera"></i> تغيير</label>
                <input type="file" id="img-file-${item.id}" accept="image/*" class="hidden" onchange="updateItemImage(event, ${item.id})">
            </td>
            <td class="p-3 flex gap-2">
                <button onclick="openEditItemModal(${item.id})" class="bg-amber-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold"><i class="fas fa-edit"></i> تعديل</button>
                <button onclick="deleteMenuItem(${item.id})" class="bg-rose-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold"><i class="fas fa-trash"></i> حذف</button>
            </td>
        </tr>
    `).join('');
}

async function updateItemImage(event, itemId) {
    if (isCustomerMode) return;
    const file = event.target.files[0];
    if (file) {
        let img = await resizeAndCompressImage(file);
        let item = menuItems.find(m => m.id === itemId);
        if (item) { item.img = img; saveData(); renderMenu(); renderMenuEditTable(); alert('تم حفظ الصورة!'); }
    }
}

function openAddModal() {
    if (isCustomerMode) return;
    document.getElementById('item-modal-title').textContent = 'إضافة صنف جديد';
    document.getElementById('edit-item-id').value = '';
    document.getElementById('item-name-input').value = '';
    document.getElementById('item-price-input').value = '';
    document.getElementById('item-deduct-bread').checked = true;
    document.getElementById('item-modal').classList.remove('hidden');
}

function openEditItemModal(id) {
    if (isCustomerMode) return;
    let item = menuItems.find(m => m.id === id);
    if (!item) return;
    document.getElementById('item-modal-title').textContent = 'تعديل صنف';
    document.getElementById('edit-item-id').value = item.id;
    document.getElementById('item-name-input').value = item.name;
    document.getElementById('item-price-input').value = item.price;
    document.getElementById('item-deduct-bread').checked = !!item.deductBread;
    document.getElementById('item-modal').classList.remove('hidden');
}

function closeModal() { document.getElementById('item-modal').classList.add('hidden'); }

function saveMenuItem() {
    if (isCustomerMode) return;
    let editId = document.getElementById('edit-item-id').value;
    let name = document.getElementById('item-name-input').value.trim();
    let price = parseFloat(document.getElementById('item-price-input').value);
    let deductBread = document.getElementById('item-deduct-bread').checked;
    if (!name || isNaN(price)) return alert('أدخل بيانات صحيحة');

    if (editId) {
        let item = menuItems.find(m => m.id === parseInt(editId));
        if (item) { item.name = name; item.price = price; item.deductBread = deductBread; }
    } else {
        menuItems.push({ id: Date.now(), name, price, deductBread, img: genSVG(name) });
    }
    saveData(); renderMenu(); renderMenuEditTable(); closeModal(); alert('تم الحفظ بنجاح!');
}

function deleteMenuItem(id) {
    if (isCustomerMode) return;
    if (confirm('حذف هذا الصنف؟')) {
        menuItems = menuItems.filter(m => m.id !== id);
        saveData(); renderMenu(); renderMenuEditTable();
    }
}

function addToCart(id) {
    const item = menuItems.find(m => m.id === id);
    if (!item) return;
    let cart = getCurrentCart();
    let ext = cart.find(c => c.id === id);
    if (ext) ext.quantity++;
    else cart.push({ ...item, quantity: 1 });
    setCurrentCart(cart); renderTables(); renderCart();
}

function updateQty(id, delta) {
    let cart = getCurrentCart();
    let idx = cart.findIndex(c => c.id === id);
    if (idx !== -1) {
        cart[idx].quantity += delta;
        if (cart[idx].quantity <= 0) cart.splice(idx, 1);
    }
    setCurrentCart(cart); renderTables(); renderCart();
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total-price');
    const totalUsdEl = document.getElementById('cart-total-usd');
    if (!container) return;
    let cart = getCurrentCart();
    let total = 0;
    container.innerHTML = cart.length ? cart.map(i => {
        total += i.price * i.quantity;
        return `<div class="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border">
            <div><strong>${i.name}</strong><br><span class="dynamic-text">${formatMoney(i.price * i.quantity)}</span></div>
            <div class="flex items-center gap-1.5">
                <button onclick="updateQty(${i.id}, -1)" class="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded font-bold">-</button>
                <span class="w-5 text-center font-black">${i.quantity}</span>
                <button onclick="updateQty(${i.id}, 1)" class="w-6 h-6 dynamic-btn text-white rounded font-bold">+</button>
            </div>
        </div>`;
    }).join('') : '<p class="text-xs text-slate-400 text-center py-4">السلة فارغة</p>';
    
    totalEl.textContent = formatMoney(total);
    totalUsdEl.textContent = formatUSD(total);
    renderTables();
}

function deductInventory(cart) {
    let sfihaCount = 0;
    cart.forEach(cartItem => {
        let menuItem = menuItems.find(m => m.name === cartItem.name);
        if (menuItem && menuItem.deductBread) sfihaCount += cartItem.quantity;
    });
    if (sfihaCount > 0) {
        let bread = inventoryStock.find(i => i.name.includes('خبز') || i.name.includes('رغيف'));
        if (!bread) {
            bread = { id: 1, name: "خبز أسمر", initialQty: 200, soldQty: 0, qty: 200, unit: "رغيف" };
            inventoryStock.push(bread);
        }
        if (bread.initialQty === undefined) bread.initialQty = bread.qty + (bread.soldQty || 0);
        if (bread.soldQty === undefined) bread.soldQty = 0;
        bread.soldQty += sfihaCount;
        bread.qty = Math.max(0, bread.initialQty - bread.soldQty);
        saveData(); renderInventory();
    }
}

function recordTrx(cart, total, typeText) {
    let rawItems = cart.map(i => ({ id: i.id || Date.now(), name: i.name, quantity: i.quantity, price: i.price, deductBread: i.deductBread, img: i.img }));
    transactionsLog.unshift({
        id: 'TRX-' + Math.floor(100000 + Math.random()*900000),
        type: typeText,
        summary: cart.map(i => `${i.name} (${i.quantity})`).join(', '),
        items: rawItems,
        total: total,
        date: new Date().toLocaleString('ar-LB')
    });
    deductInventory(cart); 
    saveData(); 
    renderTransactions();
    renderReports();
}

function resetTrxFilters() {
    document.getElementById('trx-search-input').value = '';
    document.getElementById('trx-filter-type').value = 'all';
    renderTransactions();
}

function renderTransactions() {
    const tbody = document.getElementById('transactions-table-body');
    if (!tbody) return;

    let searchVal = (document.getElementById('trx-search-input')?.value || '').toLowerCase().trim();
    let filterType = document.getElementById('trx-filter-type')?.value || 'all';

    let filtered = transactionsLog.filter(t => {
        let matchesSearch = t.id.toLowerCase().includes(searchVal) || t.summary.toLowerCase().includes(searchVal) || t.type.toLowerCase().includes(searchVal);
        let matchesType = filterType === 'all' || t.type.includes(filterType);
        return matchesSearch && matchesType;
    });

    if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-6 text-slate-400 font-bold">لا توجد معاملات مطابقة للبحث</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(t => `
        <tr class="border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
            <td class="p-3 font-mono font-black text-slate-700 dark:text-slate-200">${t.id}</td>
            <td class="p-3"><span class="px-2.5 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-lg text-[11px] font-black">${t.type}</span></td>
            <td class="p-3 font-bold text-slate-800 dark:text-slate-100">${t.summary}</td>
            <td class="p-3 font-black dynamic-text text-sm">${formatMoney(t.total)}</td>
            <td class="p-3 text-slate-500 text-[11px] font-medium">${t.date}</td>
            <td class="p-3">
                <div class="flex items-center justify-center gap-1.5">
                    <button onclick="reprintReceiptFromLog('${t.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1" title="إعادة طباعة الفاتورة حرارياً"><i class="fas fa-print"></i> طباعة</button>
                    <button onclick="openEditTrxModal('${t.id}')" class="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 admin-only ${isCustomerMode ? 'hidden' : ''}" title="تعديل عناصر المعاملة"><i class="fas fa-edit"></i> تعديل</button>
                    <button onclick="deleteTrx('${t.id}')" class="bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950 dark:text-rose-300 px-2 py-1.5 rounded-lg text-xs font-bold transition admin-only ${isCustomerMode ? 'hidden' : ''}" title="حذف المعاملة"><i class="fas fa-trash-alt"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function reprintReceiptFromLog(trxId) {
    let trx = transactionsLog.find(t => t.id === trxId);
    if (!trx) return alert('المعاملة غير موجودة!');

    let receiptHtml = `
        <div style="text-align: center; font-family: monospace; width: 100%;">
            <img src="${logoImage}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 50%; margin: 0 auto 3px auto; display: block;" />
            <strong style="font-size: 13px; font-weight: 900;">${companyProfile.name}</strong><br>
            <span>${companyProfile.city} - ${companyProfile.address}</span><br>
            <span>هاتف: ${companyProfile.phone}</span><br>
            ----------------------------------<br>
            <span>نسخة فاتورة أعيد طباعتها</span><br>
            <span>رقم الفاتورة: ${trx.id}</span><br>
            <span>النوع: ${trx.type}</span><br>
            <span>التاريخ: ${trx.date}</span><br>
            ----------------------------------
        </div>
        <table style="width: 100%; font-family: monospace; border-collapse: collapse; font-size: 11px; margin-top: 4px;">
            <thead>
                <tr style="border-bottom: 1px dashed #000;">
                    <th style="text-align: right; padding: 2px 0;">الصنف</th>
                    <th style="text-align: center; padding: 2px 0;">كمية</th>
                    <th style="text-align: left; padding: 2px 0;">المجموع</th>
                </tr>
            </thead>
            <tbody>
    `;
    (trx.items || []).forEach(i => {
        receiptHtml += `<tr>
            <td style="padding: 2px 0; text-align: right;">${i.name}</td>
            <td style="padding: 2px 0; text-align: center;">${i.quantity}</td>
            <td style="padding: 2px 0; text-align: left;">${Number(i.price * i.quantity).toLocaleString('ar-LB')}</td>
        </tr>`;
    });
    receiptHtml += `</tbody></table>
        <div style="font-family: monospace; font-weight: bold; text-align: center; border-top: 1px dashed #000; margin-top: 6px; padding-top: 4px; font-size: 12px;">
            المجموع الكلي: ${formatMoney(trx.total)}
        </div>
        <div style="text-align: center; font-family: monospace; font-size: 10px; margin-top: 6px;">
            شكراً لزيارتكم - ملك الصفيحة زكرياعروب
        </div>
    `;
    
    const receiptDiv = document.getElementById('printable-receipt');
    const reportDiv = document.getElementById('printable-report');
    reportDiv.innerHTML = ''; reportDiv.style.display = 'none';

    receiptDiv.innerHTML = receiptHtml;
    receiptDiv.style.display = 'block';

    setTimeout(() => {
        window.print();
        receiptDiv.style.display = 'none';
    }, 300);
}

let editingTrxTempItems = [];
function openEditTrxModal(trxId) {
    if (isCustomerMode) return;
    let trx = transactionsLog.find(t => t.id === trxId);
    if (!trx) return;

    document.getElementById('edit-trx-id-input').value = trxId;
    document.getElementById('edit-trx-modal-title').textContent = `تعديل عناصر الفاتورة (${trx.id})`;
    editingTrxTempItems = JSON.parse(JSON.stringify(trx.items || []));
    renderEditTrxModalItems();
    document.getElementById('edit-trx-modal').classList.remove('hidden');
}

function closeEditTrxModal() {
    document.getElementById('edit-trx-modal').classList.add('hidden');
}

function updateTrxTempQty(idx, delta) {
    editingTrxTempItems[idx].quantity += delta;
    if (editingTrxTempItems[idx].quantity <= 0) {
        editingTrxTempItems.splice(idx, 1);
    }
    renderEditTrxModalItems();
}

function renderEditTrxModalItems() {
    const container = document.getElementById('edit-trx-items-list');
    const totalEl = document.getElementById('edit-trx-new-total');
    let sum = 0;

    if (!editingTrxTempItems.length) {
        container.innerHTML = '<p class="text-center py-4 text-rose-500 font-bold">الفاتورة أصبحت فارغة (سيؤدي حفظها إلى الغائها)</p>';
        totalEl.textContent = '0 ل.ل';
        return;
    }

    container.innerHTML = editingTrxTempItems.map((item, idx) => {
        let itemTotal = item.price * item.quantity;
        sum += itemTotal;
        return `
            <div class="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border text-xs">
                <div>
                    <span class="font-bold">${item.name}</span>
                    <div class="text-[11px] dynamic-text font-black">${formatMoney(itemTotal)}</div>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="updateTrxTempQty(${idx}, -1)" class="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded font-bold text-sm text-center">-</button>
                    <span class="w-6 text-center font-black">${item.quantity}</span>
                    <button onclick="updateTrxTempQty(${idx}, 1)" class="w-6 h-6 dynamic-btn text-white rounded font-bold text-sm text-center">+</button>
                </div>
            </div>
        `;
    }).join('');

    totalEl.textContent = formatMoney(sum);
}

function saveTrxChanges() {
    if (isCustomerMode) return;
    let trxId = document.getElementById('edit-trx-id-input').value;
    let trxIndex = transactionsLog.findIndex(t => t.id === trxId);
    if (trxIndex === -1) return;

    if (!editingTrxTempItems.length) {
        if (confirm('هل تريد حذف الفاتورة بالكامل لعدم وجود أصناف؟')) {
            transactionsLog.splice(trxIndex, 1);
        } else {
            return;
        }
    } else {
        let newTotal = editingTrxTempItems.reduce((s, i) => s + (i.price * i.quantity), 0);
        transactionsLog[trxIndex].items = editingTrxTempItems;
        transactionsLog[trxIndex].total = newTotal;
        transactionsLog[trxIndex].summary = editingTrxTempItems.map(i => `${i.name} (${i.quantity})`).join(', ');
    }

    saveData();
    renderTransactions();
    renderReports();
    closeEditTrxModal();
    alert('تم تعديل وحفظ بيانات الفاتورة بنجاح!');
}

function clearTransactionsLog() {
    if (isCustomerMode) return;
    if (confirm('مسح سجل المعاملات بالكامل؟')) {
        transactionsLog = [];
        saveData();
        renderTransactions();
        renderReports();
    }
}

function deleteTrx(id) {
    if (isCustomerMode) return;
    if (confirm('حذف هذه المعاملة نهائياً من السجل؟')) {
        transactionsLog = transactionsLog.filter(t => t.id !== id);
        saveData();
        renderTransactions();
        renderReports();
    }
}

function renderReports() {
    const totalSalesEl = document.getElementById('report-total-sales');
    const totalExpEl = document.getElementById('report-total-expenses');
    const netProfitEl = document.getElementById('report-net-profit');
    const breakdownBody = document.getElementById('items-sales-breakdown-body');
    
    let totalSales = transactionsLog.reduce((s, t) => s + t.total, 0);
    let totalExp = expensesLog.reduce((s, e) => s + e.amount, 0);
    let net = totalSales - totalExp;

    if (totalSalesEl) totalSalesEl.textContent = formatMoney(totalSales);
    if (totalExpEl) totalExpEl.textContent = formatMoney(totalExp);
    if (netProfitEl) {
        netProfitEl.textContent = formatMoney(net);
        netProfitEl.className = `text-2xl font-black ${net >= 0 ? 'text-emerald-700' : 'text-rose-600'}`;
    }

    let itemsSummary = {};
    transactionsLog.forEach(t => {
        if (t.items && Array.isArray(t.items)) {
            t.items.forEach(i => {
                if (!itemsSummary[i.name]) {
                    itemsSummary[i.name] = { qty: 0, total: 0 };
                }
                itemsSummary[i.name].qty += i.quantity;
                itemsSummary[i.name].total += i.price * i.quantity;
            });
        }
    });

    if (breakdownBody) {
        let keys = Object.keys(itemsSummary);
        if (!keys.length) {
            breakdownBody.innerHTML = '<tr><td colspan="3" class="text-center py-3 text-slate-400">لا توجد مبيعات مسجلة اليوم</td></tr>';
        } else {
            breakdownBody.innerHTML = keys.map(name => `
                <tr class="border-b dark:border-slate-800">
                    <td class="py-2 font-bold">${name}</td>
                    <td class="py-2 font-black text-rose-600">${itemsSummary[name].qty} قطعة</td>
                    <td class="py-2 font-black dynamic-text">${formatMoney(itemsSummary[name].total)}</td>
                </tr>
            `).join('');
        }
    }
}

function checkoutActiveTable() {
    let cart = getCurrentCart();
    if (!cart.length) return alert('السلة فارغة!');
    let total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    let typeText = currentOrderType === 'hall' ? `طاولة رقم ${activeTable}` : currentOrderType === 'takeaway' ? 'تيك أواي' : 'دليفري';
    
    let receiptHtml = `
        <div style="text-align: center; font-family: monospace; width: 100%;">
            <img src="${logoImage}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 50%; margin: 0 auto 3px auto; display: block;" />
            <strong style="font-size: 13px; font-weight: 900;">${companyProfile.name}</strong><br>
            <span>${companyProfile.city} - ${companyProfile.address}</span><br>
            <span>هاتف: ${companyProfile.phone}</span>
            ${companyProfile.tax ? '<br><span>س.ت: ' + companyProfile.tax + '</span>' : ''}<br>
            ----------------------------------<br>
            <span>النوع: ${typeText}</span><br>
            <span>الوقت: ${new Date().toLocaleTimeString('ar-LB')}</span><br>
            ----------------------------------
        </div>
        <table style="width: 100%; font-family: monospace; border-collapse: collapse; font-size: 11px; margin-top: 4px;">
            <thead>
                <tr style="border-bottom: 1px dashed #000;">
                    <th style="text-align: right; padding: 2px 0;">الصنف</th>
                    <th style="text-align: center; padding: 2px 0;">كمية</th>
                    <th style="text-align: left; padding: 2px 0;">المجموع</th>
                </tr>
            </thead>
            <tbody>
    `;
    cart.forEach(i => {
        receiptHtml += `<tr>
            <td style="padding: 2px 0; text-align: right;">${i.name}</td>
            <td style="padding: 2px 0; text-align: center;">${i.quantity}</td>
            <td style="padding: 2px 0; text-align: left;">${Number(i.price * i.quantity).toLocaleString('ar-LB')}</td>
        </tr>`;
    });
    receiptHtml += `</tbody></table>
        <div style="font-family: monospace; font-weight: bold; text-align: center; border-top: 1px dashed #000; margin-top: 6px; padding-top: 4px; font-size: 12px;">
            المجموع الكلي: ${formatMoney(total)}
        </div>
        <div style="text-align: center; font-family: monospace; font-size: 10px; margin-top: 6px;">
            شكراً لزيارتكم - ملك الصفيحة زكرياعروب
        </div>
    `;
    
    const receiptDiv = document.getElementById('printable-receipt');
    const reportDiv = document.getElementById('printable-report');
    reportDiv.innerHTML = ''; reportDiv.style.display = 'none';

    receiptDiv.innerHTML = receiptHtml;
    receiptDiv.style.display = 'block';

    recordTrx(cart, total, typeText);
    
    setTimeout(() => {
        window.print();
        receiptDiv.style.display = 'none';
        clearActiveTable();
    }, 300);
}

function printDailyReport() {
    if (isCustomerMode) return;
    let sales = transactionsLog.reduce((s, t) => s + t.total, 0);
    let exp = expensesLog.reduce((s, e) => s + e.amount, 0);
    let net = sales - exp;

    let reportHtml = `
        <div style="text-align: center; font-family: monospace; width: 100%;">
            <img src="${logoImage}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 50%; margin: 0 auto 3px auto; display: block;" />
            <strong style="font-size: 13px; font-weight: 900;">${companyProfile.name}</strong><br>
            <span>كشف الحساب والتقارير اليومية</span><br>
            <span>التاريخ: ${new Date().toLocaleDateString('ar-LB')} | الوقت: ${new Date().toLocaleTimeString('ar-LB')}</span><br>
            ----------------------------------<br>
        </div>
        <div style="font-family: monospace; font-size: 11px; margin-top: 5px;">
            <strong>إجمالي المبيعات:</strong> ${formatMoney(sales)}<br>
            <strong>إجمالي المصاريف:</strong> ${formatMoney(exp)}<br>
            <strong>صافي الصندوق:</strong> ${formatMoney(net)}<br>
            ----------------------------------<br>
            <strong>تفصيل الكميات المباعة:</strong><br>
        </div>
        <table style="width: 100%; font-family: monospace; border-collapse: collapse; font-size: 10px; margin-top: 4px;">
            <thead>
                <tr style="border-bottom: 1px dashed #000;">
                    <th style="text-align: right; padding: 2px 0;">الصنف</th>
                    <th style="text-align: center; padding: 2px 0;">الكمية</th>
                    <th style="text-align: left; padding: 2px 0;">المجموع</th>
                </tr>
            </thead>
            <tbody>
    `;

    let itemsSummary = {};
    transactionsLog.forEach(t => {
        if (t.items && Array.isArray(t.items)) {
            t.items.forEach(i => {
                if (!itemsSummary[i.name]) itemsSummary[i.name] = { qty: 0, total: 0 };
                itemsSummary[i.name].qty += i.quantity;
                itemsSummary[i.name].total += i.price * i.quantity;
            });
        }
    });

    let keys = Object.keys(itemsSummary);
    if (!keys.length) {
        reportHtml += `<tr><td colspan="3" style="text-align:center; padding: 5px;">لا توجد مبيعات مسجلة</td></tr>`;
    } else {
        keys.forEach(name => {
            reportHtml += `<tr>
                <td style="padding: 2px 0; text-align: right;">${name}</td>
                <td style="padding: 2px 0; text-align: center;">${itemsSummary[name].qty}</td>
                <td style="padding: 2px 0; text-align: left;">${formatMoney(itemsSummary[name].total)}</td>
            </tr>`;
        });
    }

    reportHtml += `</tbody></table>
        <div style="font-family: monospace; font-size: 10px; text-align: center; border-top: 1px dashed #000; margin-top: 8px; padding-top: 4px;">
            ملك الصفيحة زكرياعروب - طرابلس القبة
        </div>
    `;

    const receiptDiv = document.getElementById('printable-receipt');
    const reportDiv = document.getElementById('printable-report');
    receiptDiv.innerHTML = ''; receiptDiv.style.display = 'none';

    reportDiv.innerHTML = reportHtml;
    reportDiv.style.display = 'block';

    setTimeout(() => {
        window.print();
        reportDiv.style.display = 'none';
    }, 300);
}

function sendOrderViaWhatsApp() {
    let cart = getCurrentCart();
    if (!cart.length) return alert('السلة فارغة!');
    let total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    
    let customerName = currentOrderType === 'hall' ? `طاولة رقم ${activeTable}` : document.getElementById(currentOrderType + '-name').value.trim() || 'زبون';
    let customerPhone = currentOrderType === 'hall' ? companyProfile.phone : document.getElementById(currentOrderType + '-phone').value.trim() || 'غير متوفر';
    let customerAddress = currentOrderType === 'delivery' ? document.getElementById('delivery-address').value.trim() : '';

    recordTrx(cart, total, currentOrderType);

    let msg = `*طلب جديد - ${companyProfile.name}*%0A`;
    msg += `👤 *الاسم:* ${customerName}%0A📞 *الهاتف:* ${customerPhone}%0A`;
    if (customerAddress) msg += `🏠 *العنوان:* ${customerAddress}%0A`;
    msg += `----------------------------------%0A`;
    cart.forEach(i => msg += `▪️ ${i.name} (${i.quantity}×) - ${formatMoney(i.price * i.quantity)}%0A`);
    msg += `----------------------------------%0A💰 *المجموع:* *${formatMoney(total)}*`;
    
    window.open(`https://wa.me/961${companyProfile.phone.replace(/^0/, '')}?text=${msg}`, '_blank');
    clearActiveTable();
}

function endBusinessDay() {
    if (isCustomerMode) return;
    if (confirm('إنهاء يوم العمل وتصفير المبيعات؟')) {
        transactionsLog = []; expensesLog = [];
        inventoryStock.forEach(i => { if (i.initialQty !== undefined) { i.initialQty = i.qty; i.soldQty = 0; } });
        saveData(); renderInventory(); renderTransactions(); renderReports(); alert('تم بدء يوم جديد بنجاح!');
    }
}

function renderInventory() {
    if (isCustomerMode) return;
    let bread = inventoryStock.find(i => i.name.includes('خبز') || i.name.includes('رغيف')) || { initialQty: 200, soldQty: 0, qty: 200 };
    document.getElementById('bread-initial-stat').textContent = (bread.initialQty !== undefined ? bread.initialQty : bread.qty) + ' رغيف';
    document.getElementById('bread-sold-stat').textContent = (bread.soldQty || 0) + ' رغيف';
    document.getElementById('bread-remaining-stat').textContent = bread.qty + ' رغيف';

    document.getElementById('inventory-table-body').innerHTML = inventoryStock.map(i => `
        <tr class="border-b dark:border-slate-800">
            <td class="py-2 font-bold">${i.name}</td>
            <td class="py-2 font-black text-emerald-600">${i.qty} ${i.unit}</td>
            <td class="py-2 text-rose-600 font-bold">${i.soldQty || 0} ${i.unit}</td>
            <td class="py-2"><button onclick="openDirectInventoryEditModal('${i.name}')" class="bg-indigo-600 text-white px-2 py-1 rounded text-[10px]"><i class="fas fa-pen"></i></button></td>
        </tr>
    `).join('');

    document.getElementById('expenses-table-body').innerHTML = expensesLog.length ? expensesLog.map(e => `
        <tr class="border-b dark:border-slate-800"><td class="py-2">${e.title}</td><td class="py-2 font-bold text-rose-600">${formatMoney(e.amount)}</td><td class="py-2"><button onclick="deleteExp(${e.id})" class="text-rose-500"><i class="fas fa-trash"></i></button></td></tr>
    `).join('') : '<tr><td colspan="3" class="text-center py-2 text-slate-400">لا توجد مصاريف</td></tr>';
}

function openDirectInventoryEditModal(name) {
    if (isCustomerMode) return;
    let item = inventoryStock.find(i => i.name === name);
    document.getElementById('edit-inv-name-target').value = name;
    document.getElementById('direct-modal-title').textContent = `تعديل رصيد (${name})`;
    document.getElementById('direct-bread-qty').value = item ? item.qty : 0;
    document.getElementById('direct-inventory-modal').classList.remove('hidden');
}
function closeDirectInventoryEditModal() { document.getElementById('direct-inventory-modal').classList.add('hidden'); }
function saveDirectBreadQty() {
    if (isCustomerMode) return;
    let name = document.getElementById('edit-inv-name-target').value;
    let qty = parseInt(document.getElementById('direct-bread-qty').value);
    let item = inventoryStock.find(i => i.name === name);
    if (item) {
        item.qty = qty;
        if (name.includes('خبز') || name.includes('رغيف')) item.initialQty = qty + (item.soldQty || 0);
    }
    saveData(); closeDirectInventoryEditModal(); renderInventory(); alert('تم التحديث!');
}

function openInventoryModal() { document.getElementById('inventory-modal').classList.remove('hidden'); }
function saveInventoryItem() {
    let name = document.getElementById('inv-name').value.trim();
    let qty = parseFloat(document.getElementById('inv-qty').value);
    let unit = document.getElementById('inv-unit').value.trim();
    if (!name) return;
    inventoryStock.push({ id: Date.now(), name, initialQty: qty, soldQty: 0, qty, unit });
    saveData(); document.getElementById('inventory-modal').classList.add('hidden'); renderInventory();
}

function openExpenseModal() { document.getElementById('expense-modal').classList.remove('hidden'); }
function saveExpenseItem() {
    let title = document.getElementById('exp-title').value.trim();
    let amount = parseFloat(document.getElementById('exp-amount').value);
    if (!title || isNaN(amount)) return;
    expensesLog.unshift({ id: Date.now(), title, amount });
    saveData(); document.getElementById('expense-modal').classList.add('hidden'); renderInventory(); renderReports();
}
function deleteExp(id) { expensesLog = expensesLog.filter(e => e.id !== id); saveData(); renderInventory(); renderReports(); }

window.onload = () => {
    applyTheme();
    updateLiveClock();
    renderTables();
    updateImageSizeButtonsUI();
    renderMenu();
    renderCart();
    applyMode();
    applyCompanyProfileToUI();
    renderTransactions();
    renderReports();
};