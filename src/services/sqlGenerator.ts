import { AppState, OrderRecord } from '../types';

/**
 * Generates an production-ready SQL script (MySQL 5.7+ / MariaDB 10.3+ / Hostinger phpMyAdmin compatible)
 * with complete schema, indexes, constraints, and current data inserts.
 */
export function generateHostingerSQL(state: AppState): string {
  const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  return `-- ====================================================================
-- ملك الصفيحة زكرياعروب - نظام إدارة المطعم والمبيعات
-- Hostinger MySQL Database Schema & Data Dump
-- Generated At: ${dateStr}
-- Server type: MySQL / MariaDB (Hostinger Custom Code Deployment)
-- Character Set: utf8mb4_unicode_ci
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+02:00";

-- --------------------------------------------------------
-- Table structure for \`company_profile\`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`company_profile\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(255) NOT NULL,
  \`sub_name\` VARCHAR(255) DEFAULT NULL,
  \`phone\` VARCHAR(50) NOT NULL,
  \`whatsapp_phone\` VARCHAR(50) NOT NULL,
  \`address\` VARCHAR(255) DEFAULT NULL,
  \`city\` VARCHAR(100) DEFAULT NULL,
  \`country\` VARCHAR(100) DEFAULT 'Lebanon',
  \`tax_number\` VARCHAR(100) DEFAULT NULL,
  \`establishment_year\` VARCHAR(10) DEFAULT '1998',
  \`usd_rate\` DECIMAL(15,2) DEFAULT '89500.00',
  \`primary_color\` VARCHAR(20) DEFAULT '#881337',
  \`currency_symbol\` VARCHAR(20) DEFAULT 'ل.ل',
  \`announcement_text\` TEXT DEFAULT NULL,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table \`company_profile\`
INSERT INTO \`company_profile\` (\`id\`, \`name\`, \`sub_name\`, \`phone\`, \`whatsapp_phone\`, \`address\`, \`city\`, \`country\`, \`tax_number\`, \`establishment_year\`, \`usd_rate\`, \`primary_color\`, \`currency_symbol\`, \`announcement_text\`) 
VALUES (1, ${escapeSql(state.company.name)}, ${escapeSql(state.company.subName)}, ${escapeSql(state.company.phone)}, ${escapeSql(state.company.whatsappPhone)}, ${escapeSql(state.company.address)}, ${escapeSql(state.company.city)}, ${escapeSql(state.company.country)}, ${escapeSql(state.company.taxNumber)}, ${escapeSql(state.company.establishmentYear)}, ${state.company.usdRate}, ${escapeSql(state.company.primaryColor)}, ${escapeSql(state.company.currencySymbol)}, ${escapeSql(state.company.announcementText)})
ON DUPLICATE KEY UPDATE 
  \`name\` = VALUES(\`name\`),
  \`phone\` = VALUES(\`phone\`),
  \`usd_rate\` = VALUES(\`usd_rate\`);

-- --------------------------------------------------------
-- Table structure for \`users\` (Staff & Team Members)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(150) NOT NULL,
  \`role\` ENUM('admin','customer') NOT NULL DEFAULT 'customer',
  \`pin_code\` VARCHAR(50) NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for \`users\`
${state.users.map(u => `INSERT INTO \`users\` (\`id\`, \`name\`, \`role\`, \`pin_code\`) VALUES (${u.id}, ${escapeSql(u.name)}, ${escapeSql(u.role)}, ${escapeSql(u.pin)}) ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`), \`role\`=VALUES(\`role\`), \`pin_code\`=VALUES(\`pin_code\`);`).join('\n')}

-- --------------------------------------------------------
-- Table structure for \`menu_items\`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`menu_items\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(200) NOT NULL,
  \`category\` VARCHAR(100) NOT NULL DEFAULT 'صفيحة على الحطب',
  \`price\` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  \`deduct_bread\` TINYINT(1) NOT NULL DEFAULT 1,
  \`description\` TEXT DEFAULT NULL,
  \`image_url\` TEXT DEFAULT NULL,
  \`badge\` VARCHAR(50) DEFAULT NULL,
  \`is_available\` TINYINT(1) NOT NULL DEFAULT 1,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_category\` (\`category\`),
  INDEX \`idx_available\` (\`is_available\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for \`menu_items\`
${state.menu.map(m => `INSERT INTO \`menu_items\` (\`id\`, \`name\`, \`category\`, \`price\`, \`deduct_bread\`, \`description\`, \`image_url\`, \`badge\`, \`is_available\`) VALUES (${m.id}, ${escapeSql(m.name)}, ${escapeSql(m.category)}, ${m.price}, ${m.deductBread ? 1 : 0}, ${escapeSql(m.description || '')}, ${escapeSql(m.image)}, ${escapeSql(m.badge || '')}, ${m.isAvailable ? 1 : 0}) ON DUPLICATE KEY UPDATE \`price\`=VALUES(\`price\`), \`name\`=VALUES(\`name\`), \`deduct_bread\`=VALUES(\`deduct_bread\`);`).join('\n')}

-- --------------------------------------------------------
-- Table structure for \`inventory\` (Materials & Bread Stock)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`inventory\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(150) NOT NULL,
  \`initial_qty\` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  \`sold_qty\` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  \`remaining_qty\` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  \`unit\` VARCHAR(50) NOT NULL DEFAULT 'رغيف',
  \`min_threshold\` DECIMAL(10,2) NOT NULL DEFAULT '10.00',
  \`cost_per_unit\` DECIMAL(15,2) DEFAULT '0.00',
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uniq_name\` (\`name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for \`inventory\`
${state.inventory.map(i => `INSERT INTO \`inventory\` (\`id\`, \`name\`, \`initial_qty\`, \`sold_qty\`, \`remaining_qty\`, \`unit\`, \`min_threshold\`, \`cost_per_unit\`) VALUES (${i.id}, ${escapeSql(i.name)}, ${i.initialQty}, ${i.soldQty}, ${i.qty}, ${escapeSql(i.unit)}, ${i.minThreshold}, ${i.costPerUnit || 0}) ON DUPLICATE KEY UPDATE \`remaining_qty\`=VALUES(\`remaining_qty\`), \`sold_qty\`=VALUES(\`sold_qty\`), \`initial_qty\`=VALUES(\`initial_qty\`);`).join('\n')}

-- --------------------------------------------------------
-- Table structure for \`orders\`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`orders\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`order_type\` ENUM('hall','takeaway','delivery') NOT NULL,
  \`table_number\` INT(11) DEFAULT NULL,
  \`customer_name\` VARCHAR(150) NOT NULL,
  \`customer_phone\` VARCHAR(50) DEFAULT NULL,
  \`customer_address\` TEXT DEFAULT NULL,
  \`notes\` TEXT DEFAULT NULL,
  \`total_lbp\` DECIMAL(15,2) NOT NULL,
  \`total_usd\` DECIMAL(10,2) NOT NULL,
  \`usd_rate\` DECIMAL(15,2) NOT NULL,
  \`status\` ENUM('pending','preparing','ready','completed','cancelled') NOT NULL DEFAULT 'completed',
  \`payment_method\` ENUM('cash_lbp','cash_usd','card','mixed') NOT NULL DEFAULT 'cash_lbp',
  \`cashier_name\` VARCHAR(100) DEFAULT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_created_at\` (\`created_at\`),
  INDEX \`idx_order_type\` (\`order_type\`),
  INDEX \`idx_status\` (\`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for \`order_items\`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`order_items\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`order_id\` VARCHAR(50) NOT NULL,
  \`menu_item_id\` INT(11) DEFAULT NULL,
  \`item_name\` VARCHAR(200) NOT NULL,
  \`quantity\` INT(11) NOT NULL DEFAULT 1,
  \`price_lbp\` DECIMAL(15,2) NOT NULL,
  \`notes\` TEXT DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_order_id\` (\`order_id\`),
  CONSTRAINT \`fk_order_id\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping recent transactions (Orders & Order Items)
${state.transactions.slice(0, 100).map(t => {
  const insertOrder = `INSERT INTO \`orders\` (\`id\`, \`order_type\`, \`table_number\`, \`customer_name\`, \`customer_phone\`, \`customer_address\`, \`total_lbp\`, \`total_usd\`, \`usd_rate\`, \`status\`, \`payment_method\`, \`created_at\`) VALUES (${escapeSql(t.id)}, ${escapeSql(t.type)}, ${t.tableNumber || 'NULL'}, ${escapeSql(t.customerName || 'عميل')}, ${escapeSql(t.customerPhone || '')}, ${escapeSql(t.customerAddress || '')}, ${t.totalLbp}, ${t.totalUsd}, ${t.usdRate}, ${escapeSql(t.status || 'completed')}, ${escapeSql(t.paymentMethod || 'cash_lbp')}, ${escapeSql(t.createdAt)}) ON DUPLICATE KEY UPDATE \`total_lbp\`=VALUES(\`total_lbp\`);`;
  const insertItems = (t.items || []).map(item => `INSERT INTO \`order_items\` (\`order_id\`, \`menu_item_id\`, \`item_name\`, \`quantity\`, \`price_lbp\`, \`notes\`) VALUES (${escapeSql(t.id)}, ${item.id}, ${escapeSql(item.name)}, ${item.quantity}, ${item.price}, ${escapeSql(item.notes || '')});`).join('\n');
  return insertOrder + (insertItems ? '\n' + insertItems : '');
}).join('\n')}

-- --------------------------------------------------------
-- Table structure for \`expenses\`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`expenses\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`title\` VARCHAR(255) NOT NULL,
  \`amount\` DECIMAL(15,2) NOT NULL,
  \`category\` VARCHAR(100) DEFAULT 'other',
  \`date\` VARCHAR(50) NOT NULL,
  \`notes\` TEXT DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_exp_date\` (\`date\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping expenses
${state.expenses.map(e => `INSERT INTO \`expenses\` (\`id\`, \`title\`, \`amount\`, \`category\`, \`date\`) VALUES (${e.id}, ${escapeSql(e.title)}, ${e.amount}, ${escapeSql(e.category)}, ${escapeSql(e.date)}) ON DUPLICATE KEY UPDATE \`amount\`=VALUES(\`amount\`);`).join('\n')}

-- --------------------------------------------------------
-- Table structure for \`daily_closings\` (Z-Reports / Day Closures)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`daily_closings\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`date\` VARCHAR(50) NOT NULL,
  \`total_sales_lbp\` DECIMAL(15,2) NOT NULL,
  \`total_sales_usd\` DECIMAL(10,2) NOT NULL,
  \`total_expenses_lbp\` DECIMAL(15,2) NOT NULL,
  \`net_cash_lbp\` DECIMAL(15,2) NOT NULL,
  \`orders_count\` INT(11) NOT NULL,
  \`bread_sold\` INT(11) NOT NULL,
  \`closed_by\` VARCHAR(100) NOT NULL,
  \`closed_at\` DATETIME NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

-- ====================================================================
-- End of SQL Export for ملك الصفيحة زكرياعروب
-- ====================================================================
`;
}

function escapeSql(val: string | null | undefined): string {
  if (val === null || val === undefined) return 'NULL';
  return `'${String(val).replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
    switch (char) {
      case "\0": return "\\0";
      case "\x08": return "\\b";
      case "\x09": return "\\t";
      case "\x1a": return "\\z";
      case "\n": return "\\n";
      case "\r": return "\\r";
      case "\"":
      case "'":
      case "\\":
      case "%":
        return "\\" + char;
      default:
        return char;
    }
  })}'`;
}

/**
 * Trigger browser file download
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export orders as CSV
 */
export function exportOrdersToCSV(orders: OrderRecord[]): string {
  const headers = ['رقم الفاتورة', 'النوع', 'اسم الزبون', 'الهاتف', 'العنوان', 'التفاصيل', 'المجموع (ل.ل)', 'المجموع ($)', 'طريقة الدفع', 'الحالة', 'التاريخ والوقت'];
  const rows = orders.map(o => [
    `"${o.id}"`,
    `"${o.type === 'hall' ? `طاولة ${o.tableNumber || ''}` : o.type === 'takeaway' ? 'تيك أواي' : 'دليفري'}"`,
    `"${o.customerName || ''}"`,
    `"${o.customerPhone || ''}"`,
    `"${o.customerAddress || ''}"`,
    `"${(o.items || []).map(i => `${i.name} (${i.quantity})`).join(', ')}"`,
    `"${o.totalLbp}"`,
    `"${o.totalUsd}"`,
    `"${o.paymentMethod}"`,
    `"${o.status}"`,
    `"${o.createdAt}"`
  ]);

  return '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
