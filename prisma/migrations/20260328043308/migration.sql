-- AlterTable
ALTER TABLE "GuildSettings" ADD COLUMN     "newstarChannelId" TEXT,
ADD COLUMN     "newstarMessageId" TEXT;

-- CreateTable
CREATE TABLE "NewStarState" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewStarState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NewStarState_guildId_key" ON "NewStarState"("guildId");

-- AddForeignKey
ALTER TABLE "NewStarState" ADD CONSTRAINT "NewStarState_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;
