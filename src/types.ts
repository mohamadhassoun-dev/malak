export type OrderType = 'hall' | 'takeaway' | 'delivery';
export type UserRole = 'admin' | 'customer';
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash_lbp' | 'cash_usd' | 'whish_money' | 'mixed';

export interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number; // in Lebanese Pounds (LBP)
  deductBread: boolean;
  image: string;
  description?: string;
  isAvailable: boolean;
  badge?: string; // e.g. "الأكثر طلباً", "جديد"
}

export interface CartItem extends MenuItem {
  quantity: number;
  notes?: string;
}

export interface TableOrder {
  tableNumber: number;
  items: CartItem[];
  status: 'empty' | 'occupied' | 'billing';
  openedAt?: string;
}

export interface OrderRecord {
  id: string; // e.g. TRX-102938
  customerId?: string; // links to CustomerAccount if placed by registered customer
  type: OrderType;
  tableNumber?: number;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  notes?: string;
  items: CartItem[];
  totalLbp: number;
  totalUsd: number;
  usdRate: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  completedAt?: string;
  cashierName?: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  initialQty: number;
  soldQty: number;
  qty: number;
  unit: string;
  minThreshold: number; // Low stock alert
  costPerUnit?: number;
}

export interface ExpenseRecord {
  id: number;
  title: string;
  amount: number; // LBP
  category: 'supplies' | 'utilities' | 'salaries' | 'maintenance' | 'other';
  date: string;
  notes?: string;
}

export interface CustomerAccount {
  id: string; // e.g. CUST-1001
  name: string;
  phone: string;
  address?: string;
  password?: string;
  createdAt: string;
}

export interface CompanyProfile {
  name: string;
  subName: string;
  phone: string;
  whatsappPhone: string;
  address: string;
  city: string;
  country: string;
  taxNumber: string;
  establishmentYear: string;
  logo: string;
  receiptLogo?: string; // Custom dedicated logo for 80mm/72mm thermal receipts and Z-Reports
  showReceiptLogo?: boolean; // Whether to print logo on receipt/report
  receiptHeaderNote?: string;
  receiptFooterNote?: string;
  usdRate: number;
  primaryColor: string;
  primaryHoverColor?: string;
  btnColor?: string;
  btnHoverColor?: string;
  btnTextColor?: string;
  accentColor?: string;
  announcementBgColor?: string;
  currencySymbol: string;
  announcementText: string;
  headerTagline?: string;
  headerOnlineBadge?: string;
  heroBadge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  heroCtaText?: string;
  footerCopyrightText?: string;
  footerNote?: string;
}

export interface DailyClosingRecord {
  id: string;
  date: string;
  totalSalesLbp: number;
  totalSalesUsd: number;
  totalExpensesLbp: number;
  netCashLbp: number;
  ordersCount: number;
  breadSold: number;
  closedBy: string;
  closedAt: string;
}

export interface AppUser {
  id: number;
  name: string;
  username?: string; // 'malak'
  password?: string; // 'M@lAk1998'
  role: UserRole;
  pin?: string;
}

export interface AppState {
  menu: MenuItem[];
  tables: Record<number, CartItem[]>;
  activeTable: number;
  currentOrderType: OrderType;
  takeawayCart: CartItem[];
  deliveryCart: CartItem[];
  transactions: OrderRecord[];
  inventory: InventoryItem[];
  expenses: ExpenseRecord[];
  company: CompanyProfile;
  closings: DailyClosingRecord[];
  users: AppUser[];
  activeUser: AppUser;
  customers: CustomerAccount[];
  currentCustomer: CustomerAccount | null;
}
