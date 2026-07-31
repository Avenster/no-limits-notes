require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const cookieParser = require("cookie-parser");

const passport = require("./src/passport");
const authRoutes = require("./src/routes/auth");
const groupRoutes = require("./src/routes/group");
const pageRoutes = require("./src/routes/page");
const publicPageRoutes = require("./src/routes/publicPage");

const app = express();
app.set("trust proxy", 1);

const PORT = process.env.PORT || 4000;
const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

// ============================================================
// Core Middleware
// ============================================================

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));

app.use(cookieParser(process.env.SESSION_SECRET || "dev-secret-change-me"));

app.use(
  cookieSession({
    name: "session",
    keys: [
      process.env.SESSION_SECRET || "dev-secret-change-me",
    ],
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  })
);

// ============================================================
// Passport Session Compatibility
// ============================================================

app.use((req, res, next) => {
  if (req.session && !req.session.regenerate) {
    req.session.regenerate = (cb) => cb();
  }

  if (req.session && !req.session.save) {
    req.session.save = (cb) => cb();
  }

  next();
});

// ============================================================
// Passport
// ============================================================

app.use(passport.initialize());
app.use(passport.session());

// ============================================================
// Health Check
// ============================================================

app.get("/health", (req, res) => {
  res.json({
    ok: true,
  });
});

// ============================================================
// Authentication Routes
// ============================================================

app.use("/auth", authRoutes);

// ============================================================
// Group Routes
// ============================================================

app.use("/group", groupRoutes);

// ============================================================
// Page Routes (nested under a group)
// ============================================================

app.use("/group/:groupId/pages", pageRoutes);

const activityRouter = require("./src/routes/activity");
const searchRouter = require("./src/routes/search");
const favoriteRouter = require("./src/routes/favorite");

app.use("/activity", activityRouter);
app.use("/search", searchRouter);
app.use("/group/:groupId/pages", favoriteRouter);

// ============================================================
// Public Page Routes (no auth — read-only share links)
// ============================================================

app.use("/public/pages", publicPageRoutes);

// ============================================================
// Start Server
// ============================================================

app.listen(PORT, () => {
  console.log(
    `Backend listening on http://localhost:${PORT}`
  );
});