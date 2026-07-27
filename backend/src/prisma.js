const { PrismaClient } = require("@prisma/client");

// A single shared client. In dev with nodemon restarting the process often,
// this is created fresh each run, which is fine — the issue this pattern
// normally guards against is hot-module-reload creating many clients within
// the *same* process (a frontend/Vite concern), not a plain Node process.
const prisma = new PrismaClient();

module.exports = prisma;