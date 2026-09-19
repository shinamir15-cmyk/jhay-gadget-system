-- AlterTable
ALTER TABLE `inventory_units` ADD COLUMN `currentBranchId` VARCHAR(191) NULL,
    MODIFY `status` ENUM('IN_STOCK', 'SOLD', 'REPAIR', 'SHIPPED') NOT NULL DEFAULT 'IN_STOCK';

-- CreateTable
CREATE TABLE `branches` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `isMain` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `branches_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipments` (
    `id` VARCHAR(191) NOT NULL,
    `unitId` VARCHAR(191) NOT NULL,
    `fromBranchId` VARCHAR(191) NOT NULL,
    `toBranchId` VARCHAR(191) NOT NULL,
    `shippedById` VARCHAR(191) NULL,
    `shippedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `shipments_unitId_idx`(`unitId`),
    INDEX `shipments_toBranchId_idx`(`toBranchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `inventory_units_currentBranchId_idx` ON `inventory_units`(`currentBranchId`);

-- AddForeignKey
ALTER TABLE `inventory_units` ADD CONSTRAINT `inventory_units_currentBranchId_fkey` FOREIGN KEY (`currentBranchId`) REFERENCES `branches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `inventory_units`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_fromBranchId_fkey` FOREIGN KEY (`fromBranchId`) REFERENCES `branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_toBranchId_fkey` FOREIGN KEY (`toBranchId`) REFERENCES `branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_shippedById_fkey` FOREIGN KEY (`shippedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
