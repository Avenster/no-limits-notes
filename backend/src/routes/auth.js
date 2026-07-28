const express = require("express");
const passport = require("../passport");

const router = express.Router();

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

// ============================================================
// Current User
// ============================================================

router.get("/me", (req, res) => {
  if (req.user) {
    res.json({
      user: req.user,
    });
  } else {
    res.status(401).json({
      user: null,
    });
  }
});

// ============================================================
// Logout
// ============================================================

router.post("/logout", (req, res) => {
  req.logout(() => {
    req.session = null;

    res.json({
      ok: true,
    });
  });
});

// ============================================================
// Google OAuth
// Temporarily disabled
// ============================================================


router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${FRONTEND_URL}/login?error=google`,
    session: true,
  }),
  (req, res) => {
    res.redirect(`${FRONTEND_URL}/`);
  }
);

router.put("/profile", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not logged in." });
  }
  const { name } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Name is required." });
  }
  try {
    const prisma = require("../prisma");
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name: name.trim() },
    });
    res.json({ user });
  } catch (err) {
    console.error("PUT /auth/profile failed:", err);
    res.status(500).json({ error: "Couldn't update profile." });
  }
});

// ============================================================
// GitHub OAuth
// ============================================================

router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email"],
  })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: `${FRONTEND_URL}/login?error=github`,
    session: true,
  }),
  (req, res) => {
    res.redirect(`${FRONTEND_URL}/home`);
  }
);

module.exports = router;