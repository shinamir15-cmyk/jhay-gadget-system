-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_units` (
    `id` VARCHAR(191) NOT NULL,
    `product` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `storage` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `imei` VARCHAR(191) NULL,
    `serialNumber` VARCHAR(191) NULL,
    `purchasePrice` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('IN_STOCK', 'SOLD', 'REPAIR') NOT NULL DEFAULT 'IN_STOCK',
    `dateAdded` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `inventory_units_imei_key`(`imei`),
    UNIQUE INDEX `inventory_units_serialNumber_key`(`serialNumber`),
    INDEX `inventory_units_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
