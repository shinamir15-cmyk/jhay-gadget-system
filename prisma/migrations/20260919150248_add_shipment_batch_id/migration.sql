/*
  Warnings:

  - Made the column `currentBranchId` on table `inventory_units` required.
  - Added the required column `batchId` to the `shipments` table.

*/

-- DropForeignKey
ALTER TABLE `inventory_units` DROP FOREIGN KEY `inventory_units_currentBranchId_fkey`;

-- Backfill: assign any NULL currentBranchId to the main branch
UPDATE `inventory_units`
SET `currentBranchId` = (SELECT id FROM `branches` WHERE `isMain` = 1 LIMIT 1)
WHERE `currentBranchId` IS NULL;

-- AlterTable
ALTER TABLE `inventory_units` MODIFY `currentBranchId` VARCHAR(191) NOT NULL;

-- AlterTable: add batchId as nullable first
ALTER TABLE `shipments` ADD COLUMN `batchId` VARCHAR(191) NULL;

-- Backfill: each existing shipment row becomes its own batch
UPDATE `shipments` SET `batchId` = `id` WHERE `batchId` IS NULL;

-- Now enforce NOT NULL on batchId
ALTER TABLE `shipments` MODIFY `batchId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `shipments_batchId_idx` ON `shipments`(`batchId`);

-- AddForeignKey
ALTER TABLE `inventory_units` ADD CONSTRAINT `inventory_units_currentBranchId_fkey` FOREIGN KEY (`currentBranchId`) REFERENCES `branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;