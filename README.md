# 📝 No-Limits Notes — Notion-like Collaborative Workspace

A modern, high-polish, full-stack **Notion-like collaborative workspace** application built with React Router v8, Express.js, Prisma ORM, PostgreSQL, and BlockNote.

---

## 🌟 Key Features

### 🎨 BlockNote Rich Text Editor

- **Rich Block-Based Editing**: Supports headings, bullet lists, ordered lists, callout boxes, check-lists, toggle blocks, and dividers.
- **Interactive Code Blocks**: Code snippets with syntax highlighting powered by `highlight.js` and a floating **one-click Copy** overlay button.
- **Markdown Export**: Download any page as a standard `.md` file with one click.
- **Font & Style Customization**: Pick from 13 editor fonts (Inter, System UI, Poppins, Roboto, Merriweather, Playfair Display, Lora, and more) in profile settings; the choice persists across reloads via `localStorage`.

### 🏢 Workspaces & Spaces (Groups)

- **Collaborative Group Spaces**: Create multiple workspaces with unique shareable join codes.
- **Role-Based Group Memberships**: Manage owners, editors, and viewers within spaces.
- **Page Tree Support (Schema-Level)**: The data model supports `parentId` parent-child page hierarchies; note that the UI for creating nested pages is still a work in progress (see [Roadmap](#-roadmap)).

### 🔑 Authentication & Guest Access

- **Dual Authentication**: Sign in via **Google OAuth 2.0** or **GitHub OAuth** with Passport.js.
- **Instant Guest Mode**: Anonymous users can create or join groups using display names without creating an account (authenticated via signed, persistent 30-day cookies).

### 🎨 Custom Design System & Dynamic Themes

- **Light & Dark Mode**: Flawless real-time theme switcher with CSS custom variables and anti-flash inline hydration scripts.
- **Accent Color Picker**: Choose between Violet, Blue, Emerald, Rose, Amber, and Cyan accents.
- **Command Palette (`⌘K` / `Ctrl+K`)**: Instant search across all joined workspaces and pages.

### 📜 Revision History & Page Management

- **Snapshot Revision History**: Every save creates an automatic revision snapshot, allowing users to view prior versions and restore content with undoable safety.
- **Page Operations**: Duplicate pages, rename on the fly, mark favorites/bookmarks, and delete pages.
- **Public Share Links**: Generate public read-only URLs (`/p/:slug`) to share notes with anyone outside the workspace.
- **Recent Activity Feed**: Real-time audit log of recent page edits across all user workspaces.

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 19, React Router v8 (SSR & Client Routing)
- **Editor**: BlockNote (`@blocknote/react`, `@blocknote/mantine`, `@blocknote/core`)
- **Styling**: Tailwind CSS v4, Vanilla CSS Custom Variables System
- **Icons**: `lucide-react`
- **Syntax Highlighting**: `highlight.js` + `lowlight`
- **Build Tool**: Vite v8, TypeScript

### Backend

- **Runtime**: Node.js & Express.js 5
- **Database ORM**: Prisma ORM 6
- **Database**: PostgreSQL
- **Authentication**: Passport.js (Google & GitHub OAuth), `cookie-session`, `cookie-parser`
- **Security**: Signed HTTP-only cookies, CORS credential policies

---

## 📁 Project Directory Structure

```
no-limits-notes/
├── README.md
├── backend/
│   ├── package.json
│   ├── server.js               # Express 5 application entrypoint & middleware configuration
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma relational data model
│   │   ├── seed.js             # Sample data seeder (e.g. C++ STL practice page)
│   │   ├── backend.env.example # Reference env file
│   │   └── migrations/         # Prisma migration history
│   └── src/
│       ├── passport.js         # Passport OAuth strategies configuration
│       ├── prisma.js           # Shared Prisma Client instance
│       ├── db/
│       │   └── db.js           # Database connection helper
│       ├── routes/
│       │   ├── activity.js     # GET /activity/recent feed
│       │   ├── auth.js         # OAuth login, logout, profile updates
│       │   ├── favorite.js     # Favorite page toggles & listing
│       │   ├── group.js        # Group create/join, member management, delete
│       │   ├── page.js         # Page CRUD, revision history, sharing
│       │   ├── publicPage.js   # Public read-only page slug routes
│       │   └── search.js       # Global search route (⌘K)
│       └── services/
│           ├── groupStore.js   # Group DB service helper logic
│           ├── membership.js   # Group authorization & guest membership validation
│           ├── pageStore.js    # Page DB service & revision snapshot helper logic
│           └── userStore.js    # User/guest session helpers
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── react-router.config.ts
    ├── Dockerfile
    └── app/
        ├── app.css             # Design tokens, themes, & utility classes
        ├── root.tsx            # HTML layout shell, theme hydration script, & providers
        ├── routes.ts           # React Router v8 sitemap definitions
        ├── components/
        │   ├── index.tsx           # Home dashboard view
        │   ├── CommandPalette.tsx  # Global search modal (⌘K)
        │   ├── ThemeToggle.tsx     # Theme switcher component
        │   ├── PageBackButton.tsx  # Back-navigation helper
        │   ├── icons.tsx           # Shared SVG icon set
        │   ├── CreateGroupModal.tsx
        │   ├── JoinGroupModal.tsx
        │   ├── RenameGroupModal.tsx
        │   ├── DeleteGroupModal.tsx
        │   └── ui/                 # Reusable UI primitives
        │       ├── CopyButton.tsx
        │       ├── EmptyState.tsx
        │       ├── Loader.tsx
        │       └── Skeleton.tsx
        ├── contexts/
        │   └── ThemeContext.tsx    # Theme + accent color provider
        ├── hooks/
        │   ├── useCountUp.ts
        │   ├── useIsMounted.ts
        │   └── useScrollReveal.tsx
        ├── lib/
        │   ├── auth.server.ts  # Server-side user authentication loaders
        │   ├── pages.server.ts # Server-side page & group fetchers
        │   ├── theme.tsx       # Theme mode resolution helpers
        │   └── glass.ts        # Glassmorphism style utilities
        ├── login/
        │   └── Login.tsx       # Login page view
        ├── pages/
        │   ├── create.tsx      # Create group workspace page
        │   ├── join.tsx        # Join group by code page
        │   ├── list.tsx        # Group page directory view
        │   ├── note.tsx        # Primary Note Editor layout & sidebar
        │   ├── NoteEditor.tsx  # BlockNote component wrapper & copy overlay
        │   └── profile.tsx     # User profile, theme settings, & font picker
        ├── routes/
        │   └── home.tsx        # Index redirect / landing route
        └── public-page/
            └── public-page.tsx # Public read-only note view
```

---

## 🗄️ Database Schema (`prisma/schema.prisma`)

```prisma
enum AuthProvider {
  google
  github
}

enum MemberRole {
  owner
  editor
  viewer
}

model User {
  id         String       @id @default(cuid())
  provider   AuthProvider
  providerId String
  name       String
  email      String?
  avatarUrl  String?
  createdAt  DateTime     @default(now())

  memberships GroupMember[]
  ownedGroups Group[]       @relation("GroupOwner")
  pagesCreated Page[]       @relation("PageCreatedBy")
  revisions   Revision[]
  favorites   Favorite[]

  @@unique([provider, providerId])
}

model Group {
  id          String   @id @default(cuid())
  name        String
  code        String   @unique
  isAnonymous Boolean  @default(true)
  ownerId     String?
  createdAt   DateTime @default(now())

  owner   User?         @relation("GroupOwner", fields: [ownerId], references: [id])
  members GroupMember[]
  pages   Page[]

  @@index([ownerId])
}

model GroupMember {
  id        String     @id @default(cuid())
  groupId   String
  userId    String?
  guestId   String?
  guestName String?
  role      MemberRole @default(editor)
  joinedAt  DateTime   @default(now())

  group Group @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user  User? @relation(fields: [userId], references: [id])

  @@unique([groupId, userId])
  @@unique([groupId, guestId])
  @@index([groupId])
}

model Page {
  id               String   @id @default(cuid())
  groupId          String
  parentId         String?
  title            String   @default("Untitled")
  icon             String?
  content          Json     @default("{}")
  order            Int      @default(0)
  createdBy        String?
  lastEditedByName String?
  isPublic         Boolean  @default(false)
  publicSlug       String?  @unique
  updatedAt        DateTime @updatedAt
  createdAt        DateTime @default(now())

  group     Group      @relation(fields: [groupId], references: [id], onDelete: Cascade)
  parent    Page?      @relation("PageTree", fields: [parentId], references: [id])
  children  Page[]     @relation("PageTree")
  creator   User?      @relation("PageCreatedBy", fields: [createdBy], references: [id])
  revisions Revision[]
  favorites Favorite[]

  @@index([groupId])
  @@index([parentId])
}

model Revision {
  id           String   @id @default(cuid())
  pageId       String
  memberId     String?
  editedByName String?
  snapshot     Json
  createdAt    DateTime @default(now())

  page Page  @relation(fields: [pageId], references: [id], onDelete: Cascade)
  user User? @relation(fields: [memberId], references: [id])

  @@index([pageId])
}

model Favorite {
  id      String  @id @default(cuid())
  userId  String?
  guestId String?
  pageId  String

  page Page  @relation(fields: [pageId], references: [id], onDelete: Cascade)
  user User? @relation(fields: [userId], references: [id])

  @@unique([userId, pageId])
  @@unique([guestId, pageId])
  @@index([pageId])
}
```

---

## 📡 Backend API Endpoints Reference

### 🔐 Auth (`/auth`)

| Method   | Endpoint                  | Description                              |
| -------- | ------------------------- | ---------------------------------------- |
| `GET`  | `/auth/me`              | Fetches currently logged-in user profile |
| `POST` | `/auth/logout`          | Clears current session                   |
| `PUT`  | `/auth/profile`         | Updates user display name                |
| `GET`  | `/auth/google`          | Initiates Google OAuth authentication    |
| `GET`  | `/auth/google/callback` | Google OAuth redirect callback handler   |
| `GET`  | `/auth/github`          | Initiates GitHub OAuth authentication    |
| `GET`  | `/auth/github/callback` | GitHub OAuth redirect callback handler   |

### 👥 Workspace Groups (`/group`)

| Method     | Endpoint                       | Description                                    |
| ---------- | ------------------------------ | ---------------------------------------------- |
| `GET`    | `/group/my-groups`           | Lists groups for current user or guest session |
| `POST`   | `/group/create`              | Creates a new group workspace                  |
| `POST`   | `/group/join`                | Joins a group by code (user or guest)          |
| `GET`    | `/group/:groupId/members`    | Returns member list for a workspace            |
| `PUT`    | `/group/:groupId`            | Renames a group workspace                      |
| `DELETE` | `/group/:groupId`            | Deletes a group workspace (owner only)         |
| `DELETE` | `/group/:groupId/members/me` | Leaves a group workspace                       |

### 📄 Pages & Revisions (`/group/:groupId/pages`)

| Method     | Endpoint                                              | Description                                           |
| ---------- | ----------------------------------------------------- | ----------------------------------------------------- |
| `GET`    | `/group/:groupId/pages`                             | Lists all pages in a group                            |
| `POST`   | `/group/:groupId/pages`                             | Creates a new page in a group                         |
| `GET`    | `/group/:groupId/pages/:pageId`                     | Fetches single page content                           |
| `PUT`    | `/group/:groupId/pages/:pageId`                     | Saves page title/content & captures revision snapshot |
| `DELETE` | `/group/:groupId/pages/:pageId`                     | Deletes a page                                        |
| `POST`   | `/group/:groupId/pages/:pageId/duplicate`           | Duplicates a page                                     |
| `GET`    | `/group/:groupId/pages/:pageId/revisions`           | Returns page edit history snapshots                   |
| `POST`   | `/group/:groupId/pages/:pageId/restore/:revisionId` | Restores a page to a previous revision                |
| `POST`   | `/group/:groupId/pages/:pageId/share`               | Toggles public link sharing (`isPublic`)            |
| `POST`   | `/group/:groupId/pages/:pageId/favorite`            | Toggles favorite state for a page                     |
| `GET`    | `/group/:groupId/pages/favorites`                   | Returns list of favorited page IDs                    |

### 🌐 Public Pages, Search, & Activity

| Method  | Endpoint                | Description                                      |
| ------- | ----------------------- | ------------------------------------------------ |
| `GET` | `/public/pages/:slug` | Reads a public read-only page by slug            |
| `GET` | `/search?q=...`       | Global page search across joined workspaces      |
| `GET` | `/activity/recent`    | Recent edit activity feed across user workspaces |

---

## 💻 Frontend Routes Sitemap

| Path                              | View Component                      | Description                                              |
| --------------------------------- | ----------------------------------- | -------------------------------------------------------- |
| `/`                             | `app/routes/home.tsx`             | Index redirect / landing page                            |
| `/home`                         | `app/component/index.tsx`         | Workspace Dashboard with quick actions & recent activity |
| `/login`                        | `app/login/Login.tsx`             | OAuth Sign-In options page                               |
| `/create`                       | `app/pages/create.tsx`            | Workspace creation page                                  |
| `/join`                         | `app/pages/join.tsx`              | Workspace join code entry page                           |
| `/profile`                      | `app/pages/profile.tsx`           | Profile settings, accent color picker, & font selector   |
| `/group/:groupId/pages`         | `app/pages/list.tsx`              | Space directory list page                                |
| `/group/:groupId/pages/:pageId` | `app/pages/note.tsx`              | Interactive Note Editor layout with collapsible sidebar  |
| `/p/:slug`                      | `app/public-page/public-page.tsx` | Public read-only note view                               |

---

## ⚡ Local Setup & Installation Guide

### Prerequisites

- **Node.js**: `v18.x` or higher
- **PostgreSQL**: Running instance on `localhost` (Port 5432)

---

### 1️⃣ Backend Setup

Navigate to the `backend` directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside `backend/` (a reference template is provided at `backend/prisma/backend.env.example`):

```env
PORT=4000

# URL of your frontend (used for CORS + post-login redirect)
FRONTEND_URL=http://localhost:5173

# Session cookie signing secret
SESSION_SECRET="change-this-to-a-long-random-string"

# Local Postgres connection string
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/notion_like_app"

# OAuth Keys (Optional for Local Dev — guest mode works without them)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
# Authorized redirect URI: http://localhost:4000/auth/google/callback

GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
# Authorization callback URL: http://localhost:4000/auth/github/callback
```

Initialize the Prisma database schema (and optionally seed sample data):

```bash
npx prisma db push      # sync the schema to your database
node prisma/seed.js     # optional: insert sample notes
```

Start the backend server:

```bash
npm start
```

The server will run on **http://localhost:4000**.

---

### 2️⃣ Frontend Setup

Open a new terminal and navigate to the `frontend` directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The app will run on **http://localhost:5173**.

---

## 🗺️ Roadmap

Features that are scaffolded but not yet complete (per the project's development notes):

- **Nested sub-pages** — the `parentId` tree exists in the schema, but creating/reordering child pages from the UI is still in progress.
- **Real-time collaboration** — live multi-user editing (e.g. via Yjs) is planned; currently each save produces a revision snapshot rather than concurrent live edits.
- **Full-text search inside page content** — global search currently matches page titles/metadata across workspaces; searching within page bodies is a planned enhancement.
- **In-page settings** — per-page and per-space settings panels are pending.

---

## 🛡️ License

Distributed under the MIT License.
