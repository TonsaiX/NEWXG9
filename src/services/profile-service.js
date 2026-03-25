const prisma = require("./prisma");

async function ensureGuild(guild) {
  return prisma.guild.upsert({
    where: { id: guild.id },
    update: { name: guild.name },
    create: {
      id: guild.id,
      name: guild.name
    }
  });
}

async function createProfile(guild, name) {
  await ensureGuild(guild);

  return prisma.profile.create({
    data: {
      guildId: guild.id,
      name,
      overlayState: {
        create: {}
      }
    },
    include: {
      overlayState: true
    }
  });
}

async function listProfiles(guildId) {
  return prisma.profile.findMany({
    where: { guildId },
    include: { overlayState: true },
    orderBy: { createdAt: "asc" }
  });
}

async function setActiveProfile(guildId, profileId) {
  const profile = await prisma.profile.findFirst({
    where: {
      id: profileId,
      guildId
    }
  });

  if (!profile) {
    throw new Error("Profile not found in this guild");
  }

  await prisma.$transaction([
    prisma.profile.updateMany({
      where: { guildId },
      data: { isActive: false }
    }),
    prisma.profile.update({
      where: { id: profileId },
      data: { isActive: true }
    })
  ]);
}

async function getActiveProfile(guildId) {
  return prisma.profile.findFirst({
    where: {
      guildId,
      isActive: true
    },
    include: {
      overlayState: true
    }
  });
}

async function deleteProfile(guildId, profileId) {
  return prisma.profile.delete({
    where: {
      id: profileId
    }
  });
}

async function cycleActiveProfile(guildId) {
  const profiles = await prisma.profile.findMany({
    where: { guildId },
    orderBy: { createdAt: "asc" },
    include: { overlayState: true }
  });

  if (!profiles.length) return null;

  const currentIndex = profiles.findIndex(p => p.isActive);
  const nextProfile =
    currentIndex === -1
      ? profiles[0]
      : profiles[(currentIndex + 1) % profiles.length];

  await prisma.$transaction([
    prisma.profile.updateMany({
      where: { guildId },
      data: { isActive: false }
    }),
    prisma.profile.update({
      where: { id: nextProfile.id },
      data: { isActive: true }
    })
  ]);

  return prisma.profile.findUnique({
    where: { id: nextProfile.id },
    include: { overlayState: true }
  });
}

module.exports = {
  ensureGuild,
  createProfile,
  listProfiles,
  setActiveProfile,
  getActiveProfile,
  deleteProfile,
  cycleActiveProfile
};