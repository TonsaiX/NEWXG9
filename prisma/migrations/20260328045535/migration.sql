-- AlterTable
ALTER TABLE "GuildSettings" ADD COLUMN     "newstarTemplate" TEXT DEFAULT 'compact',
ADD COLUMN     "winloseTemplate" TEXT DEFAULT 'compact';
