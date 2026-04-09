-- 1. Create Database
CREATE DATABASE IF NOT EXISTS `dimsum_db`;
USE `dimsum_db`;

-- 2. Drop tables if they exist (to avoid errors on re-run)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `Admins`;
DROP TABLE IF EXISTS `Products`;
DROP TABLE IF EXISTS `Categories`;
DROP TABLE IF EXISTS `Resellers`;
DROP TABLE IF EXISTS `Settings`;
SET FOREIGN_KEY_CHECKS = 1;

-- 3. Create Tables
CREATE TABLE `Admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(255),
  `password` VARCHAR(255),
  `name` VARCHAR(255),
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
) ENGINE=InnoDB;

CREATE TABLE `Categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255),
  `slug` VARCHAR(255),
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
) ENGINE=InnoDB;

CREATE TABLE `Products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `categoryId` INT,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) UNIQUE,
  `description` TEXT,
  `price` INT DEFAULT 0,
  `resellerPrice` INT DEFAULT 0,
  `images` TEXT,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  `deletedAt` DATETIME,
  FOREIGN KEY (`categoryId`) REFERENCES `Categories`(`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE `Resellers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nameOwner` VARCHAR(255),
  `nameShop` VARCHAR(255),
  `whatsapp` VARCHAR(255),
  `city` VARCHAR(255),
  `address` TEXT,
  `status` VARCHAR(255),
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
) ENGINE=InnoDB;

CREATE TABLE `Settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(255),
  `value` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
) ENGINE=InnoDB;

-- 4. Insert Seed Data for Admins
-- Note: The password hash below represents 'admin123' using standard bcrypt
INSERT INTO `Admins` (`username`, `password`, `name`, `createdAt`, `updatedAt`) VALUES
('admin', '$2b$10$76kFfG5bY0Wp9/M9h.7BGe66u7H8v6I3qV.WfK/D2sS8vG6.G.K2W', 'Ibu Ani', NOW(), NOW());

-- 5. Insert Seed Data for Categories (Needed for Products)
INSERT INTO `Categories` (`id`, `name`, `slug`, `createdAt`, `updatedAt`) VALUES
(1, 'Dimsum Original', 'dimsum-original', NOW(), NOW()),
(2, 'Dimsum Mentai', 'dimsum-mentai', NOW(), NOW());

-- 6. Insert Product Data
INSERT INTO `Products` (`id`, `categoryId`, `name`, `slug`, `description`, `price`, `resellerPrice`, `images`, `status`, `createdAt`, `updatedAt`, `deletedAt`) VALUES
(1, 1, 'Paket Dimsum Ori Isi 4 Pcs', 'paket-dimsum-ori-isi-4-pcs', 'Paket dimsum original isi 4 pcs dengan pilihan ayam, udang, cumi, beef, dan mozzarella', 12000, 12000, '["1775721341639-411316678.png"]', 'active', '2026-04-09 07:47:03', '2026-04-09 07:55:41', NULL),
(2, 1, 'Paket Dimsum Ori Isi 6 Pcs', 'paket-dimsum-ori-isi-6-pcs', 'Paket dimsum original isi 6 pcs dengan pilihan ayam, udang, cumi, beef, dan mozzarella', 18000, 18000, '["1775721518695-942199954.png"]', 'active', '2026-04-09 07:47:42', '2026-04-09 07:58:38', NULL),
(3, 1, 'Paket Dimsum Ori Isi 10 Pcs', 'paket-dimsum-ori-isi-10-pcs', 'Paket dimsum original isi 10 pcs dengan pilihan ayam, udang, cumi, beef, dan mozzarella', 29000, 29000, '["1775721485464-129859744.png"]', 'active', '2026-04-09 07:48:12', '2026-04-09 07:58:05', NULL),
(4, 2, 'Paket Dimsum Mentai Isi 4 Pcs', 'paket-dimsum-mentai-isi-4-pcs', 'Paket dimsum mentai isi 4 pcs dengan pilihan ayam, udang, cumi, beef, dan mozzarella', 16000, 16000, '["1775721364525-38846642.png"]', 'active', '2026-04-09 07:48:48', '2026-04-09 07:56:04', NULL),
(5, 2, 'Paket Dimsum Mentai Isi 6 Pcs', 'paket-dimsum-mentai-isi-6-pcs', 'Paket dimsum mentai isi 6 pcs dengan pilihan ayam, udang, cumi, beef, dan mozzarella', 24000, 24000, '["1775721359218-423165217.png"]', 'active', '2026-04-09 07:49:11', '2026-04-09 07:55:59', NULL),
(6, 2, 'Paket Dimsum Mentai Isi 8 Pcs', 'paket-dimsum-mentai-isi-8-pcs', 'Paket dimsum mentai isi 8 pcs dengan pilihan ayam, udang, cumi, beef, dan mozzarella', 31000, 31000, '["1775721350532-146251327.png"]', 'active', '2026-04-09 07:49:30', '2026-04-09 07:55:50', NULL),
(7, 2, 'Paket Dimsum Mentai Isi 10 Pcs', 'paket-dimsum-mentai-isi-10-pcs', 'Paket dimsum mentai isi 10 pcs dengan pilihan ayam, udang, cumi, beef, dan mozzarella', 39000, 39000, '["1775721371912-611851570.png"]', 'active', '2026-04-09 07:49:57', '2026-04-09 07:56:11', NULL),
(8, 1, 'Paket Dimsum Ori Isi 8 Pcs', 'paket-dimsum-ori-isi-8-pcs', 'Paket dimsum original isi 8 pcs dengan pilihan ayam, udang, cumi, beef, dan mozzarella', 23000, 23000, '["1775721414592-757610956.png"]', 'active', '2026-04-09 07:56:54', '2026-04-09 07:56:54', NULL);