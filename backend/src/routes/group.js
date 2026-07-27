const express = require("express");
const crypto = require("crypto");

const groupStore = require("../services/groupStore");
const prisma = require("../prisma");

const router = express.Router();

function getGuestCookieName(groupId) {
  return `guest_${groupId}`;
}

function setGuestCookie(res, groupId, guestId) {
  res.cookie(getGuestCookieName(groupId), guestId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    signed: true,
  });
}

// ============================================================
// Get my groups
// ============================================================

router.get("/my-groups", async (req, res) => {
  try {
    if (req.user) {
      const groups = await groupStore.getGroupsForUser(req.user.id);
      return res.json({
        groups: groups.map((g) => ({
          id: g.id,
          name: g.name,
          code: g.code,
          createdAt: g.createdAt,
        })),
      });
    }

    const signedCookies = req.signedCookies || {};
    const validGroupIds = [];

    for (const [key, guestId] of Object.entries(signedCookies)) {
      if (key.startsWith("guest_")) {
        const groupId = key.slice(6);
        const membership = await prisma.groupMember.findUnique({
          where: { groupId_guestId: { groupId, guestId } },
        });
        if (membership) {
          validGroupIds.push(groupId);
        }
      }
    }

    if (validGroupIds.length > 0) {
      const groups = await groupStore.getGroupsByIds(validGroupIds);
      return res.json({
        groups: groups.map((g) => ({
          id: g.id,
          name: g.name,
          code: g.code,
          createdAt: g.createdAt,
        })),
      });
    }

    return res.json({ groups: [] });
  } catch (err) {
    console.error("GET /group/my-groups failed:", err);
    res.status(500).json({ error: "Something went wrong fetching your groups." });
  }
});

// ============================================================
// Create a group
// Works for both logged-in users and anonymous guests. The creator
// becomes the "owner" member right away.
// ============================================================

router.post("/create", async (req, res) => {
  try {
    const { name, displayName } = req.body || {};

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Enter a group name." });
    }

    const isLoggedIn = Boolean(req.user);

    if (!isLoggedIn && (!displayName || !displayName.trim())) {
      return res
        .status(400)
        .json({ error: "Enter a display name to create a group." });
    }

    const group = await groupStore.createGroup({
      name: name.trim(),
      ownerId: isLoggedIn ? req.user.id : null,
    });

    let member;

    if (isLoggedIn) {
      member = await groupStore.addMember(group.id, {
        userId: req.user.id,
        role: "owner",
      });
    } else {
      const guestId = `guest_${crypto.randomUUID()}`;

      member = await groupStore.addMember(group.id, {
        guestId,
        guestName: displayName.trim(),
        role: "owner",
      });

      setGuestCookie(res, group.id, guestId);
    }

    res.json({
      group: { id: group.id, name: group.name, code: group.code },
      member,
    });
  } catch (err) {
    console.error("POST /group/create failed:", err);
    res.status(500).json({ error: "Something went wrong creating the group." });
  }
});

// ============================================================
// Join a group by code
// Works for both logged-in users (req.user set by Passport) and
// anonymous guests (displayName provided, no account).
// ============================================================

router.post("/join", async (req, res) => {
  try {
    const { code, displayName } = req.body || {};

    if (!code || typeof code !== "string" || !code.trim()) {
      return res.status(400).json({ error: "A group code is required." });
    }

    const isLoggedIn = Boolean(req.user);

    if (!isLoggedIn && (!displayName || !displayName.trim())) {
      return res
        .status(400)
        .json({ error: "Enter a display name to join as a guest." });
    }

    const { group, created } = await groupStore.findOrCreateGroupByCode(
      code.trim()
    );

    let member;

    if (isLoggedIn) {
      member = await groupStore.addMember(group.id, {
        userId: req.user.id,
        role: created ? "owner" : "editor",
      });
    } else {
      const existingGuestId = req.signedCookies?.[getGuestCookieName(group.id)];
      const guestId = existingGuestId || `guest_${crypto.randomUUID()}`;

      member = await groupStore.addMember(group.id, {
        guestId,
        guestName: displayName.trim(),
        role: created ? "owner" : "editor",
      });

      setGuestCookie(res, group.id, guestId);
    }

    res.json({
      group: { id: group.id, name: group.name, code: group.code, created },
      member,
    });
  } catch (err) {
    console.error("POST /group/join failed:", err);
    res.status(500).json({ error: "Something went wrong joining the group." });
  }
});

module.exports = router;