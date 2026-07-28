const express = require("express");
const prisma = require("../prisma");
const { requireMembership } = require("../services/membership");

const router = express.Router({ mergeParams: true });

// POST /group/:groupId/pages/:pageId/favorite — toggle favorite
router.post("/:pageId/favorite", async (req, res) => {
  try {
    const { groupId, pageId } = req.params;

    const membership = await requireMembership(req, groupId);
    if (!membership.ok) {
      return res.status(403).json({ error: "Not a member." });
    }

    const where = membership.userId
      ? { userId_pageId: { userId: membership.userId, pageId } }
      : { guestId_pageId: { guestId: membership.guestId, pageId } };

    const existing = await prisma.favorite.findUnique({ where });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return res.json({ favorited: false });
    }

    await prisma.favorite.create({
      data: {
        pageId,
        userId: membership.userId || null,
        guestId: membership.guestId || null,
      },
    });

    res.json({ favorited: true });
  } catch (err) {
    console.error("POST favorite failed:", err);
    res.status(500).json({ error: "Couldn't toggle favorite." });
  }
});

// GET /group/:groupId/favorites — list favorited page IDs
router.get("/favorites", async (req, res) => {
  try {
    const { groupId } = req.params;

    const membership = await requireMembership(req, groupId);
    if (!membership.ok) {
      return res.status(403).json({ error: "Not a member." });
    }

    const filter = membership.userId
      ? { userId: membership.userId }
      : { guestId: membership.guestId };

    const favorites = await prisma.favorite.findMany({
      where: {
        ...filter,
        page: { groupId },
      },
      select: { pageId: true },
    });

    res.json({ favoritePageIds: favorites.map((f) => f.pageId) });
  } catch (err) {
    console.error("GET favorites failed:", err);
    res.status(500).json({ error: "Couldn't load favorites." });
  }
});

module.exports = router;
