const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

// GET /search?q=... — search pages across all groups the user belongs to
router.get("/", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) return res.json({ results: [] });

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

    if (groupIds.length === 0) return res.json({ results: [] });

    const pages = await prisma.page.findMany({
      where: {
        groupId: { in: groupIds },
        title: { contains: q, mode: "insensitive" },
      },
      take: 20,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        groupId: true,
        group: { select: { name: true } },
      },
    });

    const results = pages.map((p) => ({
      id: p.id,
      title: p.title,
      groupId: p.groupId,
      groupName: p.group.name,
    }));

    res.json({ results });
  } catch (err) {
    console.error("GET /search failed:", err);
    res.status(500).json({ error: "Search failed." });
  }
});

module.exports = router;
