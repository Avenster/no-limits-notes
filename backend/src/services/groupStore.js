// Group store backed by Postgres via Prisma.

const crypto = require("crypto");
const prisma = require("../prisma");

function generateCode() {
  // 6 chars, uppercase alphanumeric, easy to read aloud/type
  return crypto.randomBytes(4).toString("hex").slice(0, 6).toUpperCase();
}

async function findGroupByCode(code) {
  if (!code) return null;
  return prisma.group.findUnique({ where: { code: code.toUpperCase() } });
}

/**
 * Creates a new group. `ownerId` is set only if the creator is logged in;
 * anonymous creation is fully supported (ownerId stays null, isAnonymous
 * stays true).
 */
async function createGroup({ name, code, ownerId = null }) {
  let candidateCode = code ? code.toUpperCase() : generateCode();

  // Guard against the rare random-code collision when no code was supplied.
  if (!code) {
    for (let attempts = 0; attempts < 5; attempts++) {
      const existing = await prisma.group.findUnique({
        where: { code: candidateCode },
      });
      if (!existing) break;
      candidateCode = generateCode();
    }
  }

  return prisma.group.create({
    data: {
      name: name?.trim() || "Untitled group",
      code: candidateCode,
      isAnonymous: !ownerId,
      ownerId,
    },
  });
}

/**
 * Finds a group by code, or creates one on the spot if it doesn't exist yet.
 * Used by the /join flow (placeholder behavior until join-only-existing
 * groups is required).
 */
async function findOrCreateGroupByCode(code) {
  const existing = await findGroupByCode(code);
  if (existing) return { group: existing, created: false };

  const group = await createGroup({ name: `Group ${code.toUpperCase()}`, code });
  return { group, created: true };
}

async function addMember(groupId, { userId = null, guestId = null, guestName = null, role = "editor" }) {
  const where = userId
    ? { groupId_userId: { groupId, userId } }
    : { groupId_guestId: { groupId, guestId } };

  const data = {
    groupId,
    userId,
    guestId,
    guestName,
    role,
  };

  // Upsert so re-joining the same group (same user or same guest cookie)
  // doesn't create duplicate membership rows.
  return prisma.groupMember.upsert({
    where,
    update: { guestName, role },
    create: data,
  });
}

async function getMembers(groupId) {
  return prisma.groupMember.findMany({ where: { groupId } });
}

async function getGroupsForUser(userId) {
  const members = await prisma.groupMember.findMany({
    where: { userId },
    include: { group: true },
  });
  return members.map((m) => m.group);
}

async function getGroupsByIds(groupIds) {
  if (!groupIds || groupIds.length === 0) return [];
  return prisma.group.findMany({
    where: { id: { in: groupIds } },
  });
}

async function renameGroup(id, newName) {
  return prisma.group.update({
    where: { id },
    data: { name: newName }
  });
}

module.exports = {
  findGroupByCode,
  createGroup,
  findOrCreateGroupByCode,
  addMember,
  getMembers,
  getGroupsForUser,
  getGroupsByIds,
  renameGroup,
};