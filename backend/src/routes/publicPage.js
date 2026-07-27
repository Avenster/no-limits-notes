const express = require("express");

const pageStore = require("../services/pageStore");

const router = express.Router();

// ============================================================
// Public read-only page fetch — no auth, no group membership check.
// Anyone with the link can view.
// ============================================================

router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const page = await pageStore.getPublicPageBySlug(slug);
    if (!page) {
      return res.status(404).json({ error: "This link isn't valid anymore." });
    }

    res.json({
      page: {
        id: page.id,
        title: page.title,
        icon: page.icon,
        content: page.content,
        updatedAt: page.updatedAt,
        lastEditedByName: page.lastEditedByName,
      },
    });
  } catch (err) {
    console.error("GET /public/pages/:slug failed:", err);
    res.status(500).json({ error: "Couldn't load this page." });
  }
});

module.exports = router;