const prisma = require("../prisma");

function getGuestCookieName(groupId) {
  return `guest_${groupId}`;
}

/**
 * Figures out "who is making this request" for a given group: either the
 * logged-in user (via req.user, set by Passport) or a guest identified by
 * their signed cookie for that specific group.
 *
 * Returns { ok: true, displayName, userId } if they're a member, or
 * { ok: false } if not — the route decides what status code to send.
 */
async function requireMembership(req, groupId) {
  if (req.user) {
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: req.user.id } },
    });
    if (!membership) return { ok: false };
    return { ok: true, userId: req.user.id, displayName: req.user.name };
  }

  const guestId = req.signedCookies?.[getGuestCookieName(groupId)];
  if (!guestId) return { ok: false };

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_guestId: { groupId, guestId } },
  });
  if (!membership) return { ok: false };

  return { ok: true, userId: null, displayName: membership.guestName || "Guest" };
}

module.exports = { requireMembership, getGuestCookieName };