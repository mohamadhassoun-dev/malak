-- ====================================================================
-- ملك الصفيحة زكرياعروب - نظام إدارة المطعم ونقاط البيع (POS)
-- Hostinger MySQL / MariaDB Complete Database Schema & Seed Data
-- Compatible with Hostinger phpMyAdmin & MySQL 5.7+ / 8.0+ / MariaDB 10.3+
-- Character Set: utf8mb4 / utf8mb4_unicode_ci
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
-- Table structure for `company_profile`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `company_profile`;
CREATE TABLE `company_profile` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `sub_name` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `whatsapp_phone` VARCHAR(50) NOT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `country` VARCHAR(100) DEFAULT 'لبنان',
  `tax_number` VARCHAR(100) DEFAULT NULL,
  `establishment_year` VARCHAR(10) DEFAULT '1998',
  `usd_rate` DECIMAL(15,2) DEFAULT '89500.00',
  `primary_color` VARCHAR(20) DEFAULT '#881337',
  `primary_hover_color` VARCHAR(20) DEFAULT '#700f2d',
  `btn_color` VARCHAR(20) DEFAULT '#be123c',
  `btn_hover_color` VARCHAR(20) DEFAULT '#9f1239',
  `btn_text_color` VARCHAR(20) DEFAULT '#ffffff',
  `accent_color` VARCHAR(20) DEFAULT '#f59e0b',
  `announcement_bg_color` VARCHAR(20) DEFAULT '#881337',
  `currency_symbol` VARCHAR(20) DEFAULT 'ل.ل',
  `announcement_text` TEXT DEFAULT NULL,
  `receipt_header_note` TEXT DEFAULT NULL,
  `receipt_footer_note` TEXT DEFAULT NULL,
  `show_receipt_logo` TINYINT(1) DEFAULT 1,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Data for `company_profile`
INSERT INTO `company_profile` (
  `id`, `name`, `sub_name`, `phone`, `whatsapp_phone`, `address`, `city`, `country`, 
  `tax_number`, `establishment_year`, `usd_rate`, `primary_color`, `primary_hover_color`, 
  `btn_color`, `btn_hover_color`, `btn_text_color`, `accent_color`, `currency_symbol`, 
  `announcement_text`, `receipt_header_note`, `receipt_footer_note`, `show_receipt_logo`
) VALUES (
  1, 
  'ملك الصفيحة زكرياعروب', 
  'أشهى صفيحة طرابلسية على الحطب منذ 1998', 
  '03416224', 
  '9613416224', 
  'شارع الأرز، القبة', 
  'طرابلس', 
  'لبنان', 
  '847291-01', 
  '1998', 
  89500.00, 
  '#881337', 
  '#700f2d', 
  '#be123c', 
  '#9f1239', 
  '#ffffff', 
  '#f59e0b', 
  'ل.ل', 
  '🔥 صفيحة طازجة تُخبز يومياً على الحطب - خدمة التوصيل السريع متوفرة في طرابلس والجوار!', 
  'أشهى صفيحة طرابلسية على الحطب', 
  'شكراً لزيارتكم ونتمنى لكم وجبة شهية!', 
  1
);

-- --------------------------------------------------------
-- Table structure for `users` (System & Admin Management Access)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `role` ENUM('admin','customer') NOT NULL DEFAULT 'customer',
  `pin_code` VARCHAR(50) NOT NULL DEFAULT '1234',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Data for `users` (Management login: malak / M@lAk1998)
INSERT INTO `users` (`id`, `username`, `password`, `name`, `role`, `pin_code`) VALUES
(1, 'malak', 'M@lAk1998', 'إدارة ملك الصفيحة', 'admin', '1234'),
(2, 'customer', 'customer123', 'وضع الزبون (طلب أونلاين)', 'customer', '1234');

-- --------------------------------------------------------
-- Table structure for `customers` (Customer Accounts & Saved Profiles)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `address` TEXT DEFAULT NULL,
  `password` VARCHAR(255) DEFAULT '1234',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Data for `customers`
INSERT INTO `customers` (`id`, `name`, `phone`, `address`, `password`, `created_at`) VALUES
('CUST-1001', 'أحمد العلي', '03123456', 'طرابلس، شارع الميناء', '123', '2026-03-01 12:00:00');

-- --------------------------------------------------------
-- Table structure for `menu_items` (Restaurant Catalog)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `menu_items`;
CREATE TABLE `menu_items` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL,
  `category` VARCHAR(100) NOT NULL DEFAULT 'صفيحة على الحطب',
  `price` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `deduct_bread` TINYINT(1) NOT NULL DEFAULT 1,
  `description` TEXT DEFAULT NULL,
  `image_url` TEXT DEFAULT NULL,
  `badge` VARCHAR(50) DEFAULT NULL,
  `is_available` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_category` (`category`),
  INDEX `idx_available` (`is_available`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Data for `menu_items`
INSERT INTO `menu_items` (`id`, `name`, `category`, `price`, `deduct_bread`, `description`, `image_url`, `badge`, `is_available`) VALUES
(1, 'صفيحة بلحمة طازجة', 'صفيحة على الحطب', 70000.00, 1, 'عجينة مقرمشة مع لحمة طازجة متبلة بخلطة بهاراتنا الخاصة ودبس الرمان والصنوبر', '/src/assets/images/sfiha_meat_fresh_1794146701983.jpg', 'الأكثر طلباً', 1),
(2, 'صفيحة كفتة ممتازة', 'صفيحة على الحطب', 120000.00, 1, 'كفتة بلدية مشوية على الفرن الحجري مع بصل وبقدونس وشرائح طماطم مشوية', '/src/assets/images/sfiha_meat_fresh_1794146701983.jpg', 'مميز', 1),
(3, 'صفيحة سجق حار', 'صفيحة على الحطب', 120000.00, 1, 'سجق لبناني أصيل متبل بالثوم والتوابل الحارة المشوية حتى النضوج', '/src/assets/images/sfiha_sujuk_spicy_1794146703291.jpg', 'حار', 1),
(4, 'صفيحة دبل جبنة', 'صفيحة على الحطب', 150000.00, 1, 'مزيج جبنة عكاوي بلدي مع موتزاريلا غنية وحبة البركة والسمسم المحمص', '/src/assets/images/sfiha_cheese_golden_1794146702566.jpg', 'نباتي', 1),
(5, 'صفيحة لحمة مع جبنة', 'صفيحة على الحطب', 160000.00, 1, 'أروع توليفة: خلطة لحمة الصفيحة المميزة مع طبقة ذائبة من الجبنة الغنية', '/src/assets/images/sfiha_cheese_golden_1794146702566.jpg', 'خلطة الشيف', 1),
(6, 'صحن حمص بلدي بطحينة', 'مقبلات ومشاوي', 60000.00, 0, 'حمص ناعم محضر يومياً بزيت الزيتون البكر والصنوبر والسماق البلدي', '/src/assets/images/lebanese_hummus_mezze_1794146702748.jpg', NULL, 1),
(7, 'لبن عيران بلدي بارد', 'مشروبات ومرطبات', 40000.00, 0, 'لبن عيران طازج مخفوق مع لمسة ملح خفيفة ونعناع منعش', '/src/assets/images/sfiha_sujuk_spicy_1794146703291.jpg', NULL, 1),
(8, 'عصير برتقال طبيعي', 'مشروبات ومرطبات', 50000.00, 0, 'عصير برتقال طبيعي معصور طازج بدون أي إضافات أو سكر', '/src/assets/images/sfiha_meat_fresh_1794146701983.jpg', NULL, 1);

-- --------------------------------------------------------
-- Table structure for `inventory` (Stock & Materials Control)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `inventory`;
CREATE TABLE `inventory` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `initial_qty` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  `sold_qty` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  `remaining_qty` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  `unit` VARCHAR(50) NOT NULL DEFAULT 'رغيف',
  `min_threshold` DECIMAL(10,2) NOT NULL DEFAULT '10.00',
  `cost_per_unit` DECIMAL(15,2) DEFAULT '0.00',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Data for `inventory`
INSERT INTO `inventory` (`id`, `name`, `initial_qty`, `sold_qty`, `remaining_qty`, `unit`, `min_threshold`, `cost_per_unit`) VALUES
(1, 'خبز أسمر (أرغفة صفيحة)', 250.00, 0.00, 250.00, 'رغيف', 30.00, 15000.00),
(2, 'لحمة مفرومة بلدي', 25.00, 0.00, 25.00, 'كغ', 5.00, 600000.00),
(3, 'جبنة عكاوي وموزاريلا', 18.00, 0.00, 18.00, 'كغ', 4.00, 450000.00),
(4, 'سجق بلدي متبل', 10.00, 0.00, 10.00, 'كغ', 2.00, 550000.00),
(5, 'دبس رمان طبيعي', 12.00, 0.00, 12.00, 'قارورة', 3.00, 180000.00);

-- --------------------------------------------------------
-- Table structure for `orders` (Hall, Takeaway & Delivery Transactions)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` VARCHAR(50) NOT NULL,
  `customer_id` VARCHAR(50) DEFAULT NULL,
  `order_type` ENUM('hall','takeaway','delivery') NOT NULL,
  `table_number` INT(11) DEFAULT NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_phone` VARCHAR(50) DEFAULT NULL,
  `customer_address` TEXT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `total_lbp` DECIMAL(15,2) NOT NULL,
  `total_usd` DECIMAL(10,2) NOT NULL,
  `usd_rate` DECIMAL(15,2) NOT NULL,
  `status` ENUM('pending','preparing','ready','completed','cancelled') NOT NULL DEFAULT 'completed',
  `payment_method` ENUM('cash_lbp','cash_usd','whish_money','mixed') NOT NULL DEFAULT 'cash_lbp',
  `cashier_name` VARCHAR(100) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_customer_id` (`customer_id`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_order_type` (`order_type`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `order_items`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `order_id` VARCHAR(50) NOT NULL,
  `menu_item_id` INT(11) DEFAULT NULL,
  `item_name` VARCHAR(200) NOT NULL,
  `quantity` INT(11) NOT NULL DEFAULT 1,
  `price_lbp` DECIMAL(15,2) NOT NULL,
  `notes` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_order_id` (`order_id`),
  CONSTRAINT `fk_order_items_order_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `expenses` (Cash Outflows & Daily Expenditures)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `expenses`;
CREATE TABLE `expenses` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `category` VARCHAR(100) DEFAULT 'other',
  `date` VARCHAR(50) NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_exp_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `daily_closings` (Z-Reports / Day End Closures)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `daily_closings`;
CREATE TABLE `daily_closings` (
  `id` VARCHAR(50) NOT NULL,
  `date` VARCHAR(50) NOT NULL,
  `total_sales_lbp` DECIMAL(15,2) NOT NULL,
  `total_sales_usd` DECIMAL(10,2) NOT NULL,
  `total_expenses_lbp` DECIMAL(15,2) NOT NULL,
  `net_cash_lbp` DECIMAL(15,2) NOT NULL,
  `orders_count` INT(11) NOT NULL,
  `bread_sold` INT(11) NOT NULL,
  `closed_by` VARCHAR(100) NOT NULL,
  `closed_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- ====================================================================
-- End of Hostinger Database SQL Dump for ملك الصفيحة زكرياعروب
-- ====================================================================
