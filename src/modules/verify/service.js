const prisma = require("../../services/prisma");

function getAccountAgeDays(user) {
  const createdAt = user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt);
  const diffMs = Date.now() - createdAt.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

async function getPendingRequest(guildId, userId) {
  return prisma.verifyRequest.findFirst({
    where: {
      guildId,
      userId,
      status: "PENDING"
    },
    orderBy: {
      requestedAt: "desc"
    }
  });
}

async function createPendingRequest(guildId, user) {
  const existing = await getPendingRequest(guildId, user.id);
  if (existing) return existing;

  return prisma.verifyRequest.create({
    data: {
      guildId,
      userId: user.id,
      accountCreatedAt: user.createdAt,
      accountAgeDays: getAccountAgeDays(user),
      status: "PENDING"
    }
  });
}

async function attachStaffMessageId(requestId, staffMessageId) {
  return prisma.verifyRequest.update({
    where: { id: requestId },
    data: { staffMessageId }
  });
}

async function markApproved(requestId, reviewerId) {
  return prisma.verifyRequest.update({
    where: { id: requestId },
    data: {
      status: "APPROVED",
      reviewerId,
      reviewedAt: new Date()
    }
  });
}

async function markRejected(requestId, reviewerId) {
  return prisma.verifyRequest.update({
    where: { id: requestId },
    data: {
      status: "REJECTED",
      reviewerId,
      reviewedAt: new Date()
    }
  });
}

async function getRequestById(requestId) {
  return prisma.verifyRequest.findUnique({
    where: { id: requestId }
  });
}

async function grantVerifyRoles(member, roleIds) {
  const uniqueRoleIds = [...new Set((roleIds || []).filter(Boolean))];
  if (!uniqueRoleIds.length) return;

  await member.roles.add(uniqueRoleIds);
}

module.exports = {
  getAccountAgeDays,
  getPendingRequest,
  createPendingRequest,
  attachStaffMessageId,
  markApproved,
  markRejected,
  getRequestById,
  grantVerifyRoles
};