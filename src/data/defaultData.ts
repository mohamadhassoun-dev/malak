import { CompanyProfile, InventoryItem, MenuItem, AppUser, CustomerAccount } from '../types';

export const HERO_IMAGE = '/src/assets/images/bakery_hero_fire_oven_1794146705417.jpg';
export const SFIHA_MEAT_IMG = '/src/assets/images/sfiha_meat_fresh_1794146701983.jpg';
export const SFIHA_CHEESE_IMG = '/src/assets/images/sfiha_cheese_golden_1794146702566.jpg';
export const SFIHA_SUJUK_IMG = '/src/assets/images/sfiha_sujuk_spicy_1794146703291.jpg';
export const HUMMUS_IMG = '/src/assets/images/lebanese_hummus_mezze_1794146702748.jpg';

export const DEFAULT_LOGO = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><circle cx="120" cy="120" r="114" fill="%23881337" stroke="%23f59e0b" stroke-width="8"/><circle cx="120" cy="120" r="95" fill="%23be123c"/><path d="M120 45 L132 80 L168 80 L140 102 L150 138 L120 118 L90 138 L100 102 L72 80 L108 80 Z" fill="%23f59e0b"/><text x="50%" y="68%" font-family="system-ui, Tajawal" font-size="20" font-weight="900" text-anchor="middle" fill="%23ffffff">ملك الصفيحة</text><text x="50%" y="82%" font-family="system-ui, Tajawal" font-size="13" font-weight="700" text-anchor="middle" fill="%23fcd34d">زكرياعروب - 1998</text></svg>';

export const DEFAULT_COMPANY: CompanyProfile = {
  name: "ملك الصفيحة زكرياعروب",
  subName: "أشهى صفيحة طرابلسية على الحطب منذ 1998",
  phone: "03416224",
  whatsappPhone: "9613416224",
  address: "شارع الأرز، القبة",
  city: "طرابلس",
  country: "لبنان",
  taxNumber: "847291-01",
  establishmentYear: "1998",
  logo: DEFAULT_LOGO,
  receiptLogo: DEFAULT_LOGO,
  showReceiptLogo: true,
  receiptHeaderNote: "أشهى صفيحة طرابلسية على الحطب",
  receiptFooterNote: "شكراً لزيارتكم ونتمنى لكم وجبة شهية!",
  usdRate: 89500,
  primaryColor: "#881337",
  primaryHoverColor: "#700f2d",
  btnColor: "#be123c",
  btnHoverColor: "#9f1239",
  btnTextColor: "#ffffff",
  accentColor: "#f59e0b",
  announcementBgColor: "#881337",
  currencySymbol: "ل.ل",
  announcementText: "🔥 صفيحة طازجة تُخبز يومياً على الحطب - خدمة التوصيل السريع متوفرة في طرابلس والجوار!",
  headerTagline: "طرابلس - تأسيس 1998",
  headerOnlineBadge: "قائمة الطلب المباشر أونلاين عبر الواتساب",
  heroBadge: "أصالة المذاق الطرابلسي منذ عام 1998",
  heroTitle: "أشهى صفيحة طرابلسية طازجة تُخبز على الحطب",
  heroSubtitle: "عجينة مقرمشة، لحمة طازجة متبلة بأسرار التوابل العائلية، ودبس الرمان الطبيعي. استمتع بتجربة طعام أصيلة في مطعمنا أو اطلب مباشرة عبر الواتساب.",
  heroImage: HERO_IMAGE,
  heroCtaText: "استعرض القائمة واطلب الآن",
  footerCopyrightText: "ملك الصفيحة زكرياعروب · تأسيس 1998 · جميع الحقوق محفوظة",
  footerNote: "أشهى صفيحة طرابلسية على الحطب ومعجنات طازجة ومقبلات يومية"
};

export const DEFAULT_MENU: MenuItem[] = [
  {
    id: 1,
    name: "صفيحة بلحمة طازجة",
    category: "صفيحة على الحطب",
    price: 70000,
    deductBread: true,
    image: SFIHA_MEAT_IMG,
    description: "عجينة مقرمشة مع لحمة طازجة متبلة بخلطة بهاراتنا الخاصة ودبس الرمان والصنوبر",
    isAvailable: true,
    badge: "الأكثر طلباً"
  },
  {
    id: 2,
    name: "صفيحة كفتة ممتازة",
    category: "صفيحة على الحطب",
    price: 120000,
    deductBread: true,
    image: SFIHA_MEAT_IMG,
    description: "كفتة بلدية مشوية على الفرن الحجري مع بصل وبقدونس وشرائح طماطم مشوية",
    isAvailable: true,
    badge: "مميز"
  },
  {
    id: 3,
    name: "صفيحة سجق حار",
    category: "صفيحة على الحطب",
    price: 120000,
    deductBread: true,
    image: SFIHA_SUJUK_IMG,
    description: "سجق لبناني أصيل متبل بالثوم والتوابل الحارة المشوية حتى النضوج",
    isAvailable: true,
    badge: "حار"
  },
  {
    id: 4,
    name: "صفيحة دبل جبنة",
    category: "صفيحة على الحطب",
    price: 150000,
    deductBread: true,
    image: SFIHA_CHEESE_IMG,
    description: "مزيج جبنة عكاوي بلدي مع موتزاريلا غنية وحبة البركة والسمسم المحمص",
    isAvailable: true,
    badge: "نباتي"
  },
  {
    id: 5,
    name: "صفيحة لحمة مع جبنة",
    category: "صفيحة على الحطب",
    price: 160000,
    deductBread: true,
    image: SFIHA_CHEESE_IMG,
    description: "أروع توليفة: خلطة لحمة الصفيحة المميزة مع طبقة ذائبة من الجبنة الغنية",
    isAvailable: true,
    badge: "خلطة الشيف"
  },
  {
    id: 6,
    name: "صحن حمص بلدي بطحينة",
    category: "مقبلات ومشاوي",
    price: 60000,
    deductBread: false,
    image: HUMMUS_IMG,
    description: "حمص ناعم محضر يومياً بزيت الزيتون البكر والصنوبر والسماق البلدي",
    isAvailable: true
  },
  {
    id: 7,
    name: "لبن عيران بلدي بارد",
    category: "مشروبات ومرطبات",
    price: 40000,
    deductBread: false,
    image: SFIHA_SUJUK_IMG,
    description: "لبن عيران طازج مخفوق مع لمسة ملح خفيفة ونعناع منعش",
    isAvailable: true
  },
  {
    id: 8,
    name: "عصير برتقال طبيعي",
    category: "مشروبات ومرطبات",
    price: 50000,
    deductBread: false,
    image: SFIHA_MEAT_IMG,
    description: "عصير برتقال طبيعي معصور طازج بدون أي إضافات أو سكر",
    isAvailable: true
  }
];

export const DEFAULT_INVENTORY: InventoryItem[] = [
  {
    id: 1,
    name: "خبز أسمر (أرغفة صفيحة)",
    initialQty: 250,
    soldQty: 0,
    qty: 250,
    unit: "رغيف",
    minThreshold: 30,
    costPerUnit: 15000
  },
  {
    id: 2,
    name: "لحمة مفرومة بلدي",
    initialQty: 25,
    soldQty: 0,
    qty: 25,
    unit: "كغ",
    minThreshold: 5,
    costPerUnit: 600000
  },
  {
    id: 3,
    name: "جبنة عكاوي وموزاريلا",
    initialQty: 18,
    soldQty: 0,
    qty: 18,
    unit: "كغ",
    minThreshold: 4,
    costPerUnit: 450000
  },
  {
    id: 4,
    name: "سجق بلدي متبل",
    initialQty: 10,
    soldQty: 0,
    qty: 10,
    unit: "كغ",
    minThreshold: 2,
    costPerUnit: 550000
  },
  {
    id: 5,
    name: "دبس رمان طبيعي",
    initialQty: 12,
    soldQty: 0,
    qty: 12,
    unit: "قارورة",
    minThreshold: 3,
    costPerUnit: 180000
  }
];

export const DEFAULT_USERS: AppUser[] = [
  {
    id: 1,
    name: "إدارة ملك الصفيحة",
    username: "malak",
    password: "M@lAk1998",
    role: "admin",
    pin: "1234"
  },
  {
    id: 2,
    name: "وضع الزبون (طلب أونلاين)",
    username: "customer",
    role: "customer",
    pin: ""
  }
];

export const DEFAULT_CUSTOMERS: CustomerAccount[] = [
  {
    id: "CUST-1001",
    name: "أحمد العلي",
    phone: "03123456",
    address: "طرابلس، شارع الميناء",
    password: "123",
    createdAt: "2026-03-01 12:00:00"
  }
];


