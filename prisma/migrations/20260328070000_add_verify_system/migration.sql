ALTER TABLE "GuildSettings"
ADD COLUMN "verifyChannelId" TEXT,
ADD COLUMN "verifyMessageId" TEXT,
ADD COLUMN "verifyStaffChannelId" TEXT,
ADD COLUMN "verifyRoleIds" JSONB,
ADD COLUMN "verifyMinAccountAgeDays" INTEGER NOT NULL DEFAULT 30;

CREATE TABLE "VerifyRequest" (
  "id" TEXT NOT NULL,
  "guildId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "accountCreatedAt" TIMESTAMP(3) NOT NULL,
  "accountAgeDays" INTEGER NOT NULL,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" TIMESTAMP(3),
  "reviewerId" TEXT,
  "staffMessageId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "VerifyRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VerifyRequest_guildId_userId_status_idx"
ON "VerifyRequest"("guildId", "userId", "status");

ALTER TABLE "VerifyRequest"
ADD CONSTRAINT "VerifyRequest_guildId_fkey"
FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;