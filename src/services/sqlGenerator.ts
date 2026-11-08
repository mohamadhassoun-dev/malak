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

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

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
  \`primary_hover_color\` VARCHAR(20) DEFAULT '#700f2d',
  \`btn_color\` VARCHAR(20) DEFAULT '#be123c',
  \`btn_hover_color\` VARCHAR(20) DEFAULT '#9f1239',
  \`btn_text_color\` VARCHAR(20) DEFAULT '#ffffff',
  \`accent_color\` VARCHAR(20) DEFAULT '#f59e0b',
  \`announcement_bg_color\` VARCHAR(20) DEFAULT '#881337',
  \`currency_symbol\` VARCHAR(20) DEFAULT 'ل.ل',
  \`announcement_text\` TEXT DEFAULT NULL,
  \`receipt_header_note\` TEXT DEFAULT NULL,
  \`receipt_footer_note\` TEXT DEFAULT NULL,
  \`show_receipt_logo\` TINYINT(1) DEFAULT 1,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table \`company_profile\`
INSERT INTO \`company_profile\` (\`id\`, \`name\`, \`sub_name\`, \`phone\`, \`whatsapp_phone\`, \`address\`, \`city\`, \`country\`, \`tax_number\`, \`establishment_year\`, \`usd_rate\`, \`primary_color\`, \`primary_hover_color\`, \`btn_color\`, \`btn_hover_color\`, \`btn_text_color\`, \`accent_color\`, \`currency_symbol\`, \`announcement_text\`, \`receipt_header_note\`, \`receipt_footer_note\`, \`show_receipt_logo\`) 
VALUES (1, ${escapeSql(state.company.name)}, ${escapeSql(state.company.subName)}, ${escapeSql(state.company.phone)}, ${escapeSql(state.company.whatsappPhone)}, ${escapeSql(state.company.address)}, ${escapeSql(state.company.city)}, ${escapeSql(state.company.country)}, ${escapeSql(state.company.taxNumber)}, ${escapeSql(state.company.establishmentYear)}, ${state.company.usdRate}, ${escapeSql(state.company.primaryColor)}, ${escapeSql(state.company.primaryHoverColor || '#700f2d')}, ${escapeSql(state.company.btnColor || '#be123c')}, ${escapeSql(state.company.btnHoverColor || '#9f1239')}, ${escapeSql(state.company.btnTextColor || '#ffffff')}, ${escapeSql(state.company.accentColor || '#f59e0b')}, ${escapeSql(state.company.currencySymbol)}, ${escapeSql(state.company.announcementText)}, ${escapeSql(state.company.receiptHeaderNote || '')}, ${escapeSql(state.company.receiptFooterNote || '')}, ${state.company.showReceiptLogo !== false ? 1 : 0})
ON DUPLICATE KEY UPDATE 
  \`name\` = VALUES(\`name\`),
  \`phone\` = VALUES(\`phone\`),
  \`usd_rate\` = VALUES(\`usd_rate\`),
  \`primary_color\` = VALUES(\`primary_color\`),
  \`btn_color\` = VALUES(\`btn_color\`);

-- --------------------------------------------------------
-- --------------------------------------------------------
-- Table structure for \`users\` (Admin & Staff Access)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`username\` VARCHAR(100) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`name\` VARCHAR(150) NOT NULL,
  \`role\` ENUM('admin','customer') NOT NULL DEFAULT 'customer',
  \`pin_code\` VARCHAR(50) NOT NULL DEFAULT '1234',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for \`users\` (Default admin user: malak / M@lAk1998)
${state.users.map(u => `INSERT INTO \`users\` (\`id\`, \`username\`, \`password\`, \`name\`, \`role\`, \`pin_code\`) VALUES (${u.id}, ${escapeSql(u.username || (u.role === 'admin' ? 'malak' : 'customer'))}, ${escapeSql(u.password || (u.role === 'admin' ? 'M@lAk1998' : '1234'))}, ${escapeSql(u.name)}, ${escapeSql(u.role)}, ${escapeSql(u.pin || '1234')}) ON DUPLICATE KEY UPDATE \`username\`=VALUES(\`username\`), \`password\`=VALUES(\`password\`), \`name\`=VALUES(\`name\`);`).join('\n')}

-- --------------------------------------------------------
-- Table structure for \`customers\` (Registered Customer Accounts & Details)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`customers\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`name\` VARCHAR(150) NOT NULL,
  \`phone\` VARCHAR(50) NOT NULL,
  \`address\` TEXT DEFAULT NULL,
  \`password\` VARCHAR(255) DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_phone\` (\`phone\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for \`customers\`
${(state.customers || []).map(c => `INSERT INTO \`customers\` (\`id\`, \`name\`, \`phone\`, \`address\`, \`password\`, \`created_at\`) VALUES (${escapeSql(c.id)}, ${escapeSql(c.name)}, ${escapeSql(c.phone)}, ${escapeSql(c.address || '')}, ${escapeSql(c.password || '')}, ${escapeSql(c.createdAt)}) ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`), \`phone\`=VALUES(\`phone\`), \`address\`=VALUES(\`address\`);`).join('\n')}

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
-- Table structure for \`orders\` (Supports Registered & Guest Customers)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`orders\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`customer_id\` VARCHAR(50) DEFAULT NULL,
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
  \`payment_method\` ENUM('cash_lbp','cash_usd','whish_money','mixed') NOT NULL DEFAULT 'cash_lbp',
  \`cashier_name\` VARCHAR(100) DEFAULT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_customer_id\` (\`customer_id\`),
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
  const insertOrder = `INSERT INTO \`orders\` (\`id\`, \`customer_id\`, \`order_type\`, \`table_number\`, \`customer_name\`, \`customer_phone\`, \`customer_address\`, \`total_lbp\`, \`total_usd\`, \`usd_rate\`, \`status\`, \`payment_method\`, \`created_at\`) VALUES (${escapeSql(t.id)}, ${t.customerId ? escapeSql(t.customerId) : 'NULL'}, ${escapeSql(t.type)}, ${t.tableNumber || 'NULL'}, ${escapeSql(t.customerName || 'عميل')}, ${escapeSql(t.customerPhone || '')}, ${escapeSql(t.customerAddress || '')}, ${t.totalLbp}, ${t.totalUsd}, ${t.usdRate}, ${escapeSql(t.status || 'completed')}, ${escapeSql(t.paymentMethod || 'cash_lbp')}, ${escapeSql(t.createdAt)}) ON DUPLICATE KEY UPDATE \`total_lbp\`=VALUES(\`total_lbp\`);`;
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

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

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
  const headers = ['رقم الفاتورة', 'معرف الحساب', 'النوع', 'اسم الزبون', 'الهاتف', 'العنوان', 'التفاصيل', 'المجموع (ل.ل)', 'المجموع ($)', 'طريقة الدفع', 'الحالة', 'التاريخ والوقت'];
  const rows = orders.map(o => [
    `"${o.id}"`,
    `"${o.customerId || ''}"`,
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

/**
 * Generates an Apache .htaccess configuration file for Hostinger deployment
 * ensuring clean client-side routing (no 404 on refresh) and gzip compression.
 */
export function generateHostingerHtaccess(): string {
  return `# ====================================================================
# Hostinger Apache Configuration - ملك الصفيحة زكرياعروب
# ====================================================================

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>

# Enable GZIP Compression for Fast Loading
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE application/xhtml+xml
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/x-javascript
  AddOutputFilterByType DEFLATE application/json
</IfModule>

# Browser Caching for Assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/pdf "access plus 1 month"
  ExpiresByType text/x-javascript "access plus 1 month"
  ExpiresByType application/x-shockwave-flash "access plus 1 month"
  ExpiresByType image/x-icon "access plus 1 year"
  ExpiresDefault "access plus 2 days"
</IfModule>
`;
}
