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
      const memberships = await prisma.groupMember.findMany({
        where: { userId: req.user.id },
        select: { groupId: true },
      });
      const groupIds = memberships.map((m) => m.groupId);
      const groups = await prisma.group.findMany({
        where: { id: { in: groupIds } },
        include: {
          _count: { select: { pages: true, members: true } },
          pages: { orderBy: { updatedAt: "desc" }, take: 1, select: { updatedAt: true } },
        },
      });
      return res.json({
        groups: groups.map((g) => ({
          id: g.id,
          name: g.name,
          code: g.code,
          createdAt: g.createdAt,
          pageCount: g._count.pages,
          memberCount: g._count.members,
          lastActivity: g.pages[0]?.updatedAt || g.createdAt,
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
      const groups = await prisma.group.findMany({
        where: { id: { in: validGroupIds } },
        include: {
          _count: { select: { pages: true, members: true } },
          pages: { orderBy: { updatedAt: "desc" }, take: 1, select: { updatedAt: true } },
        },
      });
      return res.json({
        groups: groups.map((g) => ({
          id: g.id,
          name: g.name,
          code: g.code,
          createdAt: g.createdAt,
          pageCount: g._count.pages,
          memberCount: g._count.members,
          lastActivity: g.pages[0]?.updatedAt || g.createdAt,
        })),
      });
    }

    return res.json({ groups: [] });
  } catch (err) {
    console.error("GET /group/my-groups failed:", err);
    res.status(500).json({ error: "Something went wrong fetching your groups." });
  }
});

router.get("/:groupId/members", async (req, res) => {
  try {
    const { groupId } = req.params;
    const members = await prisma.groupMember.findMany({
      where: { groupId },
      include: { user: { select: { name: true, avatarUrl: true } } },
    });
    res.json({
      members: members.map((m) => ({
        id: m.id,
        name: m.user?.name || m.guestName || "Guest",
        avatarUrl: m.user?.avatarUrl || null,
        role: m.role,
        isGuest: !m.userId,
      })),
    });
  } catch (err) {
    console.error("GET members failed:", err);
    res.status(500).json({ error: "Couldn't load members." });
  }
});

router.put("/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name } = req.body || {};
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required." });
    }
    const group = await prisma.group.update({
      where: { id: groupId },
      data: { name: name.trim() },
    });
    res.json({ group });
  } catch (err) {
    console.error("PUT group failed:", err);
    res.status(500).json({ error: "Couldn't rename group." });
  }
});

router.delete("/:groupId/members/me", async (req, res) => {
  try {
    const { groupId } = req.params;
    if (req.user) {
      await prisma.groupMember.deleteMany({
        where: { groupId, userId: req.user.id },
      });
    } else {
      const guestId = req.signedCookies?.[`guest_${groupId}`];
      if (guestId) {
        await prisma.groupMember.deleteMany({
          where: { groupId, guestId },
        });
        res.clearCookie(`guest_${groupId}`);
      }
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE member failed:", err);
    res.status(500).json({ error: "Couldn't leave group." });
  }
});

// ============================================================
// Rename a group
// ============================================================

router.patch("/:id/rename", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Name is required." });
    }
    
    let membership = null;
    if (req.user) {
      membership = await prisma.groupMember.findFirst({
        where: { groupId: id, userId: req.user.id }
      });
    } else {
      const guestId = req.signedCookies?.[`guest_${id}`];
      if (guestId) {
        membership = await prisma.groupMember.findFirst({
          where: { groupId: id, guestId }
        });
      }
    }
    
    if (!membership) {
      return res.status(403).json({ error: "You don't have permission to rename this group." });
    }
    
    const updated = await groupStore.renameGroup(id, name.trim());
    res.json({ group: updated });
  } catch (err) {
    console.error("PATCH /:id/rename failed:", err);
    res.status(500).json({ error: "Failed to rename group." });
  }
});

// ============================================================
// Delete a group (Owner only)
// ============================================================

router.delete("/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;

    // 1. Identify the user/guest and check permissions
    let membership = null;
    if (req.user) {
      membership = await prisma.groupMember.findFirst({
        where: { groupId, userId: req.user.id },
      });
    } else {
      const guestId = req.signedCookies?.[getGuestCookieName(groupId)];
      if (guestId) {
        membership = await prisma.groupMember.findFirst({
          where: { groupId, guestId },
        });
      }
    }

    if (!membership) {
      return res.status(403).json({ error: "You don't have permission to delete this group." });
    }

    if (membership.role !== "owner") {
      return res.status(403).json({ error: "Only the owner can delete this group." });
    }

    // 2. Delete the group. 
    // Prisma schema handles cascading deletes automatically for:
    // -> GroupMember
    // -> Page (which further cascades to Revision & Favorite)
    await prisma.group.delete({
      where: { id: groupId },
    });

    // 3. Clear the guest cookie if a guest deleted it
    if (!req.user) {
      res.clearCookie(getGuestCookieName(groupId));
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /group/:groupId failed:", err);
    res.status(500).json({ error: "Couldn't delete the group." });
  }
});

// ============================================================
// Create a group
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