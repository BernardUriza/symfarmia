/*
  Warnings:

  - Added the required column `name` to the `MedicalReport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MedicalReport" ADD COLUMN     "name" TEXT NOT NULL;
