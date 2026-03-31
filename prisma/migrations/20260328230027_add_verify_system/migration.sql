/*
  Warnings:

  - Made the column `newstarTemplate` on table `GuildSettings` required. This step will fail if there are existing NULL values in that column.
  - Made the column `winloseTemplate` on table `GuildSettings` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "GuildSettings" ALTER COLUMN "newstarTemplate" SET NOT NULL,
ALTER COLUMN "winloseTemplate" SET NOT NULL;
