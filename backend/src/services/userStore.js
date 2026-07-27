// User store backed by Postgres via Prisma.
// Same function names as the old in-memory version so passport.js
// doesn't need to change.

const prisma = require("../prisma");

async function upsertUser(profile, provider) {
  const providerId = profile.id;

  const data = {
    provider,
    providerId,
    name: profile.displayName || profile.username || "Unknown",
    email: profile.emails?.[0]?.value || null,
    avatarUrl: profile.photos?.[0]?.value || null,
  };

  const user = await prisma.user.upsert({
    where: {
      provider_providerId: {
        provider,
        providerId,
      },
    },
    update: data,
    create: data,
  });

  return user;
}

async function findUserById(id) {
  if (!id) return null;
  return prisma.user.findUnique({ where: { id } });
}

module.exports = {
  upsertUser,
  findUserById,
};