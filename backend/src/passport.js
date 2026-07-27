const passport = require("passport");

// Temporarily disabled Google OAuth
// const GoogleStrategy = require("passport-google-oauth20").Strategy;

const GitHubStrategy = require("passport-github2").Strategy;

const {
  upsertUser,
  findUserById,
} = require("./services/userStore");

// ============================================================
// Session Serialization
// ============================================================

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = findUserById(id);
  done(null, user);
});

// ============================================================
// Google OAuth
// Temporarily disabled
// ============================================================

/*
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      const user = upsertUser(profile, "google");
      done(null, user);
    }
  )
);
*/

// ============================================================
// GitHub OAuth
// ============================================================

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      const user = upsertUser(profile, "github");
      done(null, user);
    }
  )
);

module.exports = passport;