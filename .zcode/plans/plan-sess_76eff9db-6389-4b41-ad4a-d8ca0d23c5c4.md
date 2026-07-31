## Add "Download as PDF" via native print — white page, same text style

**What you'll get:** A clean **white page with dark text**, but the **typography matches the editor** — same Inter font, same heading sizes, same code-block formatting & syntax-highlight token colors, same list/table/blockquote structure. The dark theme backgrounds are **not** carried over. User clicks **PDF** → browser print dialog → chooses "Save as PDF".

**Why native print:** zero dependencies, reuses the live DOM (so text styling is automatically correct), and one `window.print()` call. The work is just print CSS that strips theme colors down to a paper-friendly look.

### Files to change

**1. `frontend/app/app.css`** — append a `@media print` block (after the `.bn-editor` rule ~line 554):

- **Force a paper palette** (only in print, screen untouched): override the theme variables to white/ink values — `--bg-primary: #fff`, `--text-primary: #1a1a1a`, `--text-secondary: #444`, `--text-tertiary: #777`, `--border: #e5e5e5`. This makes headings, body, captions all print as dark text on white — i.e. "same text style" but on white.
- **Hide everything except the note:** `body * { visibility: hidden }` then reveal only `.note-print-root, .note-print-root *`. This keeps the title + editor content visible while hiding the sidebar, toolbar, and editor chrome without breaking flex layout.
- **Hide editor chrome & UI:** `.note-no-print` (the header), `.note-sidebar` (already a class), and BlockNote's interactive bits — `.bn-side-menu`, `.bn-drag-handle-menu`, `.bn-action-toolbar`, `.bn-toolbar`, `.bn-threads-sidebar`, `.bn-table-handle`, `.bn-table-cell-handle`, `.bn-suggestion-menu`, `.bn-menu-dropdown`, `.bn-colors-menu-*`.
- **Code blocks for print:** light background (`#f6f6f6`), dark text, keep the `.hljs-*` token colors so code stays highlighted and readable on white. Drop any dark block backgrounds.
- **Strip cosmetic chrome on the content container:** remove rounded corners, shadows, and the card background on `.note-editor-section` / `.note-print-root` so content runs cleanly to the page margins.
- `@page { margin: 1.5cm; }` and base print font = existing editor font stack (`var(--font-editor, var(--font-sans))`).
- `print-color-adjust: exact;` scoped to code tokens so browsers keep the highlight colors.

**2. `frontend/app/pages/note.tsx`** — small edits:

- **Add the print button** in the right-side action group, right next to the existing `.md` button (~line 845):
  ```jsx
  <HeaderButton onClick={downloadPdf}>
    <FileText size={14} strokeWidth={2} /> PDF
  </HeaderButton>
  ```
  `FileText` is **already imported** (`note.tsx:20`); `HeaderButton` already exists. No new imports.
- **Add `downloadPdf()`** next to `downloadMarkdown()` (~line 366): `function downloadPdf() { window.print(); }` — single call; latest content is already in the DOM, so we don't need `latestBlocksRef`.
- **Tag two elements** (className only, no behavior change): add `note-print-root` to the note wrapper div at `note.tsx:799`, and `note-no-print` to the `<header>` at `note.tsx:808`. The `<aside>` already has `.note-sidebar`.

### Out of scope
- No new npm dependencies.
- Public/shared page (`public-page.tsx`) export not included this pass — matches the existing `.md` scope.
- Browser controls the filename in its dialog (can't reliably force `${title}.pdf`); that's expected for native print.

### Verification
- `cd frontend && npm run typecheck`.
- Manual: open a note with headings + a code block + a table + a blockquote → click **PDF** → confirm: only the note prints (no sidebar/header), **white background with dark text**, fonts/headings match the screen, code tokens still highlighted. Test from both a dark and a light screen theme to confirm print output is consistently white-with-dark-text.