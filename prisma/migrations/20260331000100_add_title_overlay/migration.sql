ALTER TABLE "GuildSettings"
ADD COLUMN "titleChannelId" TEXT,
ADD COLUMN "titleMessageId" TEXT,
ADD COLUMN "titleText" TEXT DEFAULT 'NEWXG9 STREAM',
ADD COLUMN "titleDirection" TEXT NOT NULL DEFAULT 'right-to-left';