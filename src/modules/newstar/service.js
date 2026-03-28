const prisma = require("../../services/prisma");

const RANK_ORDER = [
  "EPIC V",
  "EPIC IV",
  "EPIC III",
  "EPIC II",
  "EPIC I",
  "LEGEND V",
  "LEGEND IV",
  "LEGEND III",
  "LEGEND II",
  "LEGEND I",
  "เทพสงคราม"
];

function normalizeRank(input) {
  return String(input || "").trim().toUpperCase().replace(/\s+/g, " ");
}

function toStoredRank(input) {
  const raw = String(input || "").trim();
  const upper = normalizeRank(raw);

  const mapping = {
    "EPIC V": "EPIC V",
    "EPIC IV": "EPIC IV",
    "EPIC III": "EPIC III",
    "EPIC II": "EPIC II",
    "EPIC I": "EPIC I",
    "LEGEND V": "LEGEND V",
    "LEGEND IV": "LEGEND IV",
    "LEGEND III": "LEGEND III",
    "LEGEND II": "LEGEND II",
    "LEGEND I": "LEGEND I",
    "เทพสงคราม": "เทพสงคราม",
    "GOD OF WAR": "เทพสงคราม"
  };

  return mapping[upper] || null;
}

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

async function ensureState(guild) {
  await ensureGuild(guild);

  return prisma.newStarState.upsert({
    where: { guildId: guild.id },
    update: {},
    create: {
      guildId: guild.id,
      rank: "EPIC V",
      stars: 0
    }
  });
}

async function getState(guildId) {
  return prisma.newStarState.findUnique({
    where: { guildId }
  });
}

async function getOrCreateState(guild) {
  const existing = await prisma.newStarState.findUnique({
    where: { guildId: guild.id }
  });

  if (existing) return existing;
  return ensureState(guild);
}

async function setRank(guild, rank) {
  const storedRank = toStoredRank(rank);
  if (!storedRank) {
    throw new Error("INVALID_RANK");
  }

  await ensureGuild(guild);

  return prisma.newStarState.upsert({
    where: { guildId: guild.id },
    update: {
      rank: storedRank,
      stars: 0
    },
    create: {
      guildId: guild.id,
      rank: storedRank,
      stars: 0
    }
  });
}

function isStarRank(rank) {
  return rank === "เทพสงคราม";
}

function getDisplayRank(state) {
  if (state.rank === "เทพสงคราม" && state.stars >= 50) {
    return "มหาเทพสงคราม";
  }
  return state.rank;
}

async function incrementStar(guild) {
  const state = await getOrCreateState(guild);

  // เทพสงคราม: เพิ่มดาวได้ไม่จำกัด
  if (isStarRank(state.rank)) {
    return prisma.newStarState.update({
      where: { guildId: guild.id },
      data: { stars: state.stars + 1 }
    });
  }

  const nextStars = state.stars + 1;

  // ยังไม่เกิน 5 ดาว -> ค้าง rank เดิมก่อน
  if (nextStars <= 5) {
    return prisma.newStarState.update({
      where: { guildId: guild.id },
      data: { stars: nextStars }
    });
  }

  // กดตอน 5 ดาว -> ขยับ rank และเริ่มที่ 1 ดาว
  const currentIndex = RANK_ORDER.indexOf(state.rank);
  const nextRank = RANK_ORDER[Math.min(currentIndex + 1, RANK_ORDER.length - 1)];

  return prisma.newStarState.update({
    where: { guildId: guild.id },
    data: {
      rank: nextRank,
      stars: nextRank === "เทพสงคราม" ? 1 : 1
    }
  });
}

async function decrementStar(guild) {
  const state = await getOrCreateState(guild);

  if (state.rank === "เทพสงคราม") {
    if (state.stars > 0) {
      return prisma.newStarState.update({
        where: { guildId: guild.id },
        data: { stars: state.stars - 1 }
      });
    }

    return prisma.newStarState.update({
      where: { guildId: guild.id },
      data: {
        rank: "LEGEND I",
        stars: 4
      }
    });
  }

  if (state.stars > 0) {
    return prisma.newStarState.update({
      where: { guildId: guild.id },
      data: { stars: state.stars - 1 }
    });
  }

  const currentIndex = RANK_ORDER.indexOf(state.rank);
  if (currentIndex <= 0) {
    return state;
  }

  const prevRank = RANK_ORDER[currentIndex - 1];

  return prisma.newStarState.update({
    where: { guildId: guild.id },
    data: {
      rank: prevRank,
      stars: prevRank === "เทพสงคราม" ? 0 : 4
    }
  });
}

module.exports = {
  RANK_ORDER,
  getDisplayRank,
  getState,
  getOrCreateState,
  setRank,
  incrementStar,
  decrementStar
};