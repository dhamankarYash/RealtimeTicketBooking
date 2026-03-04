/*
  Warnings:

  - You are about to drop the column `Totalseat` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "Totalseat",
ADD COLUMN     "totalSeats" INTEGER NOT NULL DEFAULT 0;
