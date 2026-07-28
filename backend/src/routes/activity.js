const express = require("express");
const prisma = require("../prisma");
const { requireMembership } = require("../services/membership");

const router = express.Router();

// GET /activity/recent — last 10 revisions across all the user's groups
router.get("/recent", async (req, res) => {
  try {
    // Get user's group IDs
    let groupIds = [];

    if (req.user) {
      const memberships = await prisma.groupMember.findMany({
        where: { userId: req.user.id },
        select: { groupId: true },
      });
      groupIds = memberships.map((m) => m.groupId);
    } else {
      const signedCookies = req.signedCookies || {};
      for (const [key, guestId] of Object.entries(signedCookies)) {
        if (key.startsWith("guest_")) {
          const groupId = key.slice(6);
          const membership = await prisma.groupMember.findUnique({
            where: { groupId_guestId: { groupId, guestId } },
          });
          if (membership) groupIds.push(groupId);
        }
      }
    }

    if (groupIds.length === 0) {
      return res.json({ activity: [] });
    }

    const revisions = await prisma.revision.findMany({
      where: {
        page: { groupId: { in: groupIds } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        page: {
          select: { id: true, title: true, groupId: true, group: { select: { name: true } } },
        },
      },
    });

    const activity = revisions.map((r) => ({
      id: r.id,
      editedByName: r.editedByName || "Someone",
      pageId: r.page.id,
      pageTitle: r.page.title,
      groupId: r.page.groupId,
      groupName: r.page.group.name,
      createdAt: r.createdAt,
    }));

    res.json({ activity });
  } catch (err) {
    console.error("GET /activity/recent failed:", err);
    res.status(500).json({ error: "Couldn't load activity." });
  }
});

module.exports = router;
