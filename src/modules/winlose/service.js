const prisma = require("../../services/prisma");

async function incrementWin(profileId) {
  return prisma.overlayState.update({
    where: { profileId },
    data: {
      wins: { increment: 1 }
    }
  });
}

async function incrementLoss(profileId) {
  return prisma.overlayState.update({
    where: { profileId },
    data: {
      losses: { increment: 1 }
    }
  });
}

async function reset(profileId) {
  return prisma.overlayState.update({
    where: { profileId },
    data: {
      wins: 0,
      losses: 0,
      draws: 0
    }
  });
}

async function getOverlayState(profileId) {
  return prisma.overlayState.findUnique({
    where: { profileId }
  });
}

async function decrementWin(profileId) {
  const state = await prisma.overlayState.findUnique({
    where: { profileId }
  });

  if (!state) return null;

  return prisma.overlayState.update({
    where: { profileId },
    data: {
      wins: Math.max(0, state.wins - 1)
    }
  });
}

async function decrementLoss(profileId) {
  const state = await prisma.overlayState.findUnique({
    where: { profileId }
  });

  if (!state) return null;

  return prisma.overlayState.update({
    where: { profileId },
    data: {
      losses: Math.max(0, state.losses - 1)
    }
  });
}

module.exports = {
  incrementWin,
  incrementLoss,
  decrementWin,
  decrementLoss,
  reset,
  getOverlayState
};