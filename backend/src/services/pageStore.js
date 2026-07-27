const crypto = require("crypto");
const prisma = require("../prisma");

function generatePublicSlug() {
  return crypto.randomBytes(9).toString("base64url"); // ~12 chars, URL-safe
}

async function listPagesForGroup(groupId) {
  return prisma.page.findMany({
    where: { groupId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      icon: true,
      updatedAt: true,
      createdAt: true,
      lastEditedByName: true,
      isPublic: true,
    },
  });
}

async function getPage(pageId) {
  return prisma.page.findUnique({ where: { id: pageId } });
}

async function getPageInGroup(groupId, pageId) {
  return prisma.page.findFirst({ where: { id: pageId, groupId } });
}

async function createPage({ groupId, title, createdBy, editorName }) {
  return prisma.page.create({
    data: {
      groupId,
      title: title?.trim() || "Untitled",
      createdBy: createdBy || null,
      lastEditedByName: editorName || null,
      content: {},
    },
  });
}

/**
 * Saves new content for a page and writes a Revision snapshot of the
 * *previous* content, so history shows what the page looked like at each
 * save point (not a duplicate of the just-saved state).
 */
async function savePageContent({ pageId, content, title, userId, editorName }) {
  const existing = await prisma.page.findUnique({ where: { id: pageId } });
  if (!existing) return null;

  await prisma.revision.create({
    data: {
      pageId,
      memberId: userId || null,
      editedByName: existing.lastEditedByName || "Someone",
      snapshot: existing.content,
    },
  });

  return prisma.page.update({
    where: { id: pageId },
    data: {
      content,
      title: title?.trim() || existing.title,
      lastEditedByName: editorName || existing.lastEditedByName,
    },
  });
}

async function listRevisions(pageId) {
  return prisma.revision.findMany({
    where: { pageId },
    orderBy: { createdAt: "desc" },
  });
}

async function getRevision(pageId, revisionId) {
  return prisma.revision.findFirst({ where: { id: revisionId, pageId } });
}

async function setPublic(pageId, isPublic) {
  const existing = await prisma.page.findUnique({ where: { id: pageId } });
  if (!existing) return null;

  const publicSlug = isPublic
    ? existing.publicSlug || generatePublicSlug()
    : existing.publicSlug; // keep the slug around even when turned off, so re-enabling reuses the same link

  return prisma.page.update({
    where: { id: pageId },
    data: { isPublic, publicSlug },
  });
}

async function getPublicPageBySlug(slug) {
  return prisma.page.findFirst({
    where: { publicSlug: slug, isPublic: true },
  });
}

module.exports = {
  listPagesForGroup,
  getPage,
  getPageInGroup,
  createPage,
  savePageContent,
  listRevisions,
  getRevision,
  setPublic,
  getPublicPageBySlug,
};