const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const cppSTLContent = [
  {
    id: "1",
    type: "heading",
    props: { textColor: "default", backgroundColor: "default", textAlignment: "left", level: 1 },
    content: [{ type: "text", text: "🏆 C++ STL — Custom Practice Questions & Answers", styles: {} }],
    children: [],
  },
  {
    id: "2",
    type: "paragraph",
    props: { textColor: "default", backgroundColor: "default", textAlignment: "left" },
    content: [
      { type: "text", text: "Goal: ", styles: { bold: true } },
      { type: "text", text: "Master each data structure from the inside out before touching LeetCode.", styles: {} },
    ],
    children: [],
  },
  {
    id: "3",
    type: "paragraph",
    props: { textColor: "default", backgroundColor: "default", textAlignment: "left" },
    content: [
      { type: "text", text: "Format: ", styles: { bold: true } },
      { type: "text", text: "Question → What it tests → Full C++ solution → Key takeaway", styles: {} },
    ],
    children: [],
  },
  {
    id: "4",
    type: "paragraph",
    props: { textColor: "default", backgroundColor: "default", textAlignment: "left" },
    content: [
      { type: "text", text: "Difficulty: ", styles: { bold: true } },
      { type: "text", text: "🟢 Basic · 🟡 Medium · 🔴 Tricky", styles: {} },
    ],
    children: [],
  },
  {
    id: "5",
    type: "heading",
    props: { textColor: "default", backgroundColor: "default", textAlignment: "left", level: 2 },
    content: [{ type: "text", text: "📌 How to use this", styles: {} }],
    children: [],
  },
  {
    id: "6",
    type: "numberedListItem",
    props: { textColor: "default", backgroundColor: "default", textAlignment: "left" },
    content: [{ type: "text", text: "Read the question.", styles: {} }],
    children: [],
  },
  {
    id: "7",
    type: "numberedListItem",
    props: { textColor: "default", backgroundColor: "default", textAlignment: "left" },
    content: [
      { type: "text", text: "Write the code yourself first", styles: { bold: true } },
      { type: "text", text: " — even if you get it wrong.", styles: {} },
    ],
    children: [],
  },
  {
    id: "8",
    type: "numberedListItem",
    props: { textColor: "default", backgroundColor: "default", textAlignment: "left" },
    content: [{ type: "text", text: "Compare with the solution.", styles: {} }],
    children: [],
  },
  {
    id: "9",
    type: "numberedListItem",
    props: { textColor: "default", backgroundColor: "default", textAlignment: "left" },
    content: [
      { type: "text", text: "Read the ", styles: {} },
      { type: "text", text: "Key Takeaway", styles: { bold: true } },
      { type: "text", text: " — that's the concept that will transfer to interviews.", styles: {} },
    ],
    children: [],
  },
  {
    id: "10",
    type: "heading",
    props: { textColor: "default", backgroundColor: "default", textAlignment: "left", level: 2 },
    content: [{ type: "text", text: "📦 Section 1: vector", styles: {} }],
    children: [],
  },
  {
    id: "11",
    type: "heading",
    props: { textColor: "default", backgroundColor: "default", textAlignment: "left", level: 3 },
    content: [{ type: "text", text: "Q1 🟢 — Print all elements, their index, and whether they're even or odd", styles: {} }],
    children: [],
  },
  {
    id: "12",
    type: "paragraph",
    props: { textColor: "default", backgroundColor: "default", textAlignment: "left" },
    content: [
      { type: "text", text: "Problem: ", styles: { bold: true } },
      { type: "text", text: "Given v = {3, 8, 1, 6, 9, 4}, print each element with its index and label it EVEN or ODD.", styles: {} },
    ],
    children: [],
  },
  {
    id: "13",
    type: "paragraph",
    props: { textColor: "default", backgroundColor: "default", textAlignment: "left" },
    content: [{ type: "text", text: "Expected Output:", styles: { bold: true } }],
    children: [],
  },
  {
    id: "14",
    type: "codeBlock",
    props: { language: "text" },
    content: [
      {
        type: "text",
        text: "[0] 3 → ODD\n[1] 8 → EVEN\n[2] 1 → ODD\n[3] 6 → EVEN\n[4] 9 → ODD\n[5] 4 → EVEN",
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: "15",
    type: "paragraph",
    props: { textColor: "default", backgroundColor: "default", textAlignment: "left" },
    content: [{ type: "text", text: "Solution:", styles: { bold: true } }],
    children: [],
  },
  {
    id: "16",
    type: "codeBlock",
    props: { language: "cpp" },
    content: [
      {
        type: "text",
        text: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> v = {3, 8, 1, 6, 9, 4};\n    for (int i = 0; i < v.size(); i++) {\n        cout << "[" << i << "] " << v[i]\n             << " → " << (v[i] % 2 == 0 ? "EVEN" : "ODD") << "\\n";\n    }\n    return 0;\n}',
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: "17",
    type: "paragraph",
    props: { textColor: "default", backgroundColor: "default", textAlignment: "left" },
    content: [
      { type: "text", text: "Key Takeaway: ", styles: { bold: true } },
      { type: "text", text: "Use index-based for loop when you need the position. v.size() returns size_t (unsigned) — safe to compare with int i.", styles: {} },
    ],
    children: [],
  },
];

async function main() {
  // Step 1 — find your user
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error("❌ No user found. Log in to the app once first, then re-run the seed.");
    process.exit(1);
  }

  // Step 2 — find or create a group to put this page in
  let group = await prisma.group.findFirst({
    where: { ownerId: user.id },
  });

  if (!group) {
    group = await prisma.group.create({
      data: {
        name: "My Workspace",
        code: "cpp-stl-" + Date.now(),
        isAnonymous: false,
        ownerId: user.id,
      },
    });
    console.log("✅ Created group: My Workspace");
  }

  // Step 3 — check if page already exists
  const existing = await prisma.page.findFirst({
    where: {
      title: "C++ STL — Custom Practice Questions & Answers",
      groupId: group.id,
    },
  });

  if (existing) {
    console.log("⚠️  Seed page already exists. Skipping.");
    return;
  }

  // Step 4 — create the page
  await prisma.page.create({
    data: {
      title: "C++ STL — Custom Practice Questions & Answers",
      icon: "🏆",
      content: cppSTLContent,
      groupId: group.id,
      createdBy: user.id,
      lastEditedByName: user.name,
      isPublic: false,
      order: 0,
    },
  });

  console.log("✅ C++ STL Q&A page seeded successfully into group:", group.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());