const express = require("express");

const prisma = require("../prisma");
const pageStore = require("../services/pageStore");
const { requireMembership } = require("../services/membership");

// mergeParams so we can read :groupId from the parent mount path
const router = express.Router({ mergeParams: true });

// ============================================================
// List pages in a group
// ============================================================

router.get("/", async (req, res) => {
  try {
    const { groupId } = req.params;

    const membership = await requireMembership(req, groupId);
    if (!membership.ok) {
      return res.status(403).json({ error: "You're not a member of this group." });
    }

    const [pages, group] = await Promise.all([
      pageStore.listPagesForGroup(groupId),
      prisma.group.findUnique({ where: { id: groupId }, select: { name: true, code: true } }),
    ]);
    res.json({ pages, group });
  } catch (err) {
    console.error("GET /group/:groupId/pages failed:", err);
    res.status(500).json({ error: "Couldn't load pages." });
  }
});

// ============================================================
// Create a page
// ============================================================

router.post("/", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { title } = req.body || {};

    const membership = await requireMembership(req, groupId);
    if (!membership.ok) {
      return res.status(403).json({ error: "You're not a member of this group." });
    }

    const page = await pageStore.createPage({
      groupId,
      title,
      createdBy: membership.userId,
      editorName: membership.displayName,
    });

    res.json({ page });
  } catch (err) {
    console.error("POST /group/:groupId/pages failed:", err);
    res.status(500).json({ error: "Couldn't create the page." });
  }
});

// ============================================================
// Get a single page
// ============================================================

router.get("/:pageId", async (req, res) => {
  try {
    const { groupId, pageId } = req.params;

    const membership = await requireMembership(req, groupId);
    if (!membership.ok) {
      return res.status(403).json({ error: "You're not a member of this group." });
    }

    const page = await pageStore.getPageInGroup(groupId, pageId);
    if (!page) return res.status(404).json({ error: "Page not found." });

    res.json({ page });
  } catch (err) {
    console.error("GET /group/:groupId/pages/:pageId failed:", err);
    res.status(500).json({ error: "Couldn't load the page." });
  }
});

// ============================================================
// Save page content (writes a Revision snapshot of the prior content)
// ============================================================

router.put("/:pageId", async (req, res) => {
  try {
    const { groupId, pageId } = req.params;
    const { content, title } = req.body || {};

    const membership = await requireMembership(req, groupId);
    if (!membership.ok) {
      return res.status(403).json({ error: "You're not a member of this group." });
    }

    const existing = await pageStore.getPageInGroup(groupId, pageId);
    if (!existing) return res.status(404).json({ error: "Page not found." });

    const page = await pageStore.savePageContent({
      pageId,
      content: content ?? existing.content,
      title,
      userId: membership.userId,
      editorName: membership.displayName,
    });

    res.json({ page });
  } catch (err) {
    console.error("PUT /group/:groupId/pages/:pageId failed:", err);
    res.status(500).json({ error: "Couldn't save the page." });
  }
});

// ============================================================
// List revisions (edit history)
// ============================================================

router.get("/:pageId/revisions", async (req, res) => {
  try {
    const { groupId, pageId } = req.params;

    const membership = await requireMembership(req, groupId);
    if (!membership.ok) {
      return res.status(403).json({ error: "You're not a member of this group." });
    }

    const existing = await pageStore.getPageInGroup(groupId, pageId);
    if (!existing) return res.status(404).json({ error: "Page not found." });

    const revisions = await pageStore.listRevisions(pageId);
    res.json({ revisions });
  } catch (err) {
    console.error("GET /group/:groupId/pages/:pageId/revisions failed:", err);
    res.status(500).json({ error: "Couldn't load history." });
  }
});

// ============================================================
// Toggle public sharing
// ============================================================

router.post("/:pageId/share", async (req, res) => {
  try {
    const { groupId, pageId } = req.params;
    const { isPublic } = req.body || {};

    const membership = await requireMembership(req, groupId);
    if (!membership.ok) {
      return res.status(403).json({ error: "You're not a member of this group." });
    }

    const existing = await pageStore.getPageInGroup(groupId, pageId);
    if (!existing) return res.status(404).json({ error: "Page not found." });

    const page = await pageStore.setPublic(pageId, Boolean(isPublic));
    res.json({ page });
  } catch (err) {
    console.error("POST /group/:groupId/pages/:pageId/share failed:", err);
    res.status(500).json({ error: "Couldn't update sharing." });
  }
});

router.delete("/:pageId", async (req, res) => {
  try {
    const { groupId, pageId } = req.params;
    const membership = await requireMembership(req, groupId);
    if (!membership.ok) {
      return res.status(403).json({ error: "You're not a member of this group." });
    }
    const existing = await pageStore.getPageInGroup(groupId, pageId);
    if (!existing) return res.status(404).json({ error: "Page not found." });

    await prisma.page.delete({ where: { id: pageId } });
    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE page failed:", err);
    res.status(500).json({ error: "Couldn't delete the page." });
  }
});

router.post("/:pageId/duplicate", async (req, res) => {
  try {
    const { groupId, pageId } = req.params;
    const membership = await requireMembership(req, groupId);
    if (!membership.ok) {
      return res.status(403).json({ error: "You're not a member of this group." });
    }
    const existing = await pageStore.getPageInGroup(groupId, pageId);
    if (!existing) return res.status(404).json({ error: "Page not found." });

    const newPage = await prisma.page.create({
      data: {
        groupId,
        title: `${existing.title} (copy)`,
        content: existing.content,
        createdBy: membership.userId || null,
        lastEditedByName: membership.displayName || existing.lastEditedByName,
      },
    });
    res.json({ page: newPage });
  } catch (err) {
    console.error("POST duplicate failed:", err);
    res.status(500).json({ error: "Couldn't duplicate the page." });
  }
});

router.post("/:pageId/restore/:revisionId", async (req, res) => {
  try {
    const { groupId, pageId, revisionId } = req.params;
    const membership = await requireMembership(req, groupId);
    if (!membership.ok) {
      return res.status(403).json({ error: "You're not a member of this group." });
    }
    const existing = await pageStore.getPageInGroup(groupId, pageId);
    if (!existing) return res.status(404).json({ error: "Page not found." });

    const revision = await pageStore.getRevision(pageId, revisionId);
    if (!revision) return res.status(404).json({ error: "Revision not found." });

    // Save current content as a revision first (so restore is undoable)
    await prisma.revision.create({
      data: {
        pageId,
        memberId: membership.userId || null,
        editedByName: membership.displayName || "Someone",
        snapshot: existing.content,
      },
    });

    const page = await prisma.page.update({
      where: { id: pageId },
      data: {
        content: revision.snapshot,
        lastEditedByName: membership.displayName || existing.lastEditedByName,
      },
    });
    res.json({ page });
  } catch (err) {
    console.error("POST restore failed:", err);
    res.status(500).json({ error: "Couldn't restore revision." });
  }
});

module.exports = router;