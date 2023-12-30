/*
  Warnings:

  - A unique constraint covering the columns `[refreshToken]` on the table `Auth` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `refreshToken` to the `Auth` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Auth" ADD COLUMN     "refreshToken" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Auth_refreshToken_key" ON "Auth"("refreshToken");
