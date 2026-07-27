const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;

const userStore = require("./services/userStore");

// ============================================================
// Session serialization
// We only store the user id in the session cookie; full profile is
// looked up from Postgres on each request.
// ============================================================

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userStore.findUserById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// ============================================================
// Google strategy
// Temporarily disabled to match routes/auth.js
// ============================================================

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await userStore.upsertUser(profile, "google");
          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );
}

// ============================================================
// GitHub strategy
// ============================================================

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await userStore.upsertUser(profile, "github");
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

module.exports = passport;