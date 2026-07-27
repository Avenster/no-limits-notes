// In-memory user "store"
// This is a placeholder until Prisma + Postgres is wired in.

const usersById = new Map();

function upsertUser(profile, provider) {
  const providerId = profile.id;
  const id = `${provider}:${providerId}`;

  const user = {
    id,
    provider,
    providerId,
    name: profile.displayName || profile.username || "Unknown",
    email: profile.emails?.[0]?.value || null,
    avatarUrl: profile.photos?.[0]?.value || null,
  };

  usersById.set(id, user);

  return user;
}

function findUserById(id) {
  return usersById.get(id) || null;
}

module.exports = {
  upsertUser,
  findUserById,
};