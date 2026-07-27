import { useEffect, useRef, useState } from "react";
import type {
  MetaFunction,
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from "react-router";
import {
  useLoaderData,
  useFetcher,
  useParams,
  Link,
  redirect,
} from "react-router";
import type { Block } from "@blocknote/core";
import {
  getPage,
  savePage,
  listPages,
  listRevisions,
  setPageShare,
  mergeSetCookie,
} from "~/lib/pages.server";

export const meta: MetaFunction = () => [{ title: "Note · Notes" }];

export async function loader({ request, params }: LoaderFunctionArgs) {
  const groupId = params.groupId!;
  const pageId = params.pageId!;

  const [pageResult, pagesResult] = await Promise.all([
    getPage(request, groupId, pageId),
    listPages(request, groupId),
  ]);

  if (pageResult.status === 403) return redirect("/join");
  if (pageResult.status === 404) {
    throw new Response("Page not found.", { status: 404 });
  }
  if (!pageResult.ok) {
    throw new Response(pageResult.data?.error || "Couldn't load page.", {
      status: pageResult.status,
    });
  }

  const allPages = pagesResult.ok
    ? (pagesResult.data.pages as import("~/lib/pages.server").PageSummary[])
    : [];
  const groupInfo = pagesResult.ok && pagesResult.data.group
    ? (pagesResult.data.group as { name: string; code: string })
    : null;

  return {
    groupId,
    page: pageResult.data.page as import("~/lib/pages.server").Page,
    allPages,
    groupInfo,
    frontendOrigin: new URL(request.url).origin,
  };
}

// Single action endpoint on this route, dispatched by `intent` — keeps
// autosave, sharing, and history all under one route without extra files.
export async function action({ request, params }: ActionFunctionArgs) {
  const groupId = params.groupId!;
  const pageId = params.pageId!;
  const formData = await request.formData();
  const intent = String(formData.get("intent") || "");

  if (intent === "save") {
    const content = JSON.parse(String(formData.get("content") || "[]"));
    const title = String(formData.get("title") || "");

    const result = await savePage(request, groupId, pageId, { content, title });
    if (!result.ok) {
      return Response.json(
        { error: result.data?.error || "Couldn't save." },
        { status: result.status }
      );
    }
    const headers = mergeSetCookie(new Headers(), result.setCookie);
    return Response.json({ page: result.data.page }, { headers });
  }

  if (intent === "toggle-share") {
    const isPublic = formData.get("isPublic") === "true";
    const result = await setPageShare(request, groupId, pageId, isPublic);
    if (!result.ok) {
      return Response.json(
        { error: result.data?.error || "Couldn't update sharing." },
        { status: result.status }
      );
    }
    const headers = mergeSetCookie(new Headers(), result.setCookie);
    return Response.json({ page: result.data.page }, { headers });
  }

  if (intent === "list-history") {
    const result = await listRevisions(request, groupId, pageId);
    if (!result.ok) {
      return Response.json(
        { error: result.data?.error || "Couldn't load history." },
        { status: result.status }
      );
    }
    return Response.json({ revisions: result.data.revisions });
  }

  return Response.json({ error: "Unknown action." }, { status: 400 });
}

// BlockNote touches the DOM directly and can't run during SSR, so it's
// loaded lazily and only rendered client-side after mount.
function useIsMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export default function NotePage() {
  const { groupId, page, allPages, groupInfo, frontendOrigin } = useLoaderData<typeof loader>();
  const params = useParams();
  const mounted = useIsMounted();

  const saveFetcher = useFetcher();
  const shareFetcher = useFetcher();
  const historyFetcher = useFetcher();
  const newPageFetcher = useFetcher();

  const [title, setTitle] = useState(page.title);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy link");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const latestBlocksRef = useRef<Block[] | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initialContent = Array.isArray(page.content)
    ? (page.content as Block[])
    : undefined;

  function scheduleSave(blocks: Block[]) {
    latestBlocksRef.current = blocks;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    // Debounced autosave — matches the original plan's "debounced autosave
    // via fetcher" approach.
    saveTimeoutRef.current = setTimeout(() => {
      saveFetcher.submit(
        {
          intent: "save",
          content: JSON.stringify(latestBlocksRef.current),
          title,
        },
        { method: "post" }
      );
    }, 900);
  }

  function handleTitleBlur() {
    saveFetcher.submit(
      {
        intent: "save",
        content: JSON.stringify(latestBlocksRef.current ?? initialContent ?? []),
        title,
      },
      { method: "post" }
    );
  }

  function openHistory() {
    setHistoryOpen(true);
    historyFetcher.submit({ intent: "list-history" }, { method: "post" });
  }

  function toggleShare(next: boolean) {
    shareFetcher.submit(
      { intent: "toggle-share", isPublic: String(next) },
      { method: "post" }
    );
  }

  function createNewPage() {
    newPageFetcher.submit(
      { title: "Untitled" },
      { method: "post", action: `/group/${groupId}/pages` }
    );
  }

  const sharePage = (shareFetcher.data?.page as typeof page | undefined) ?? page;

  const publicUrl = sharePage.publicSlug
    ? `${frontendOrigin}/p/${sharePage.publicSlug}`
    : null;

  function downloadMarkdown() {
    // Lazy import so blocknote-to-markdown code doesn't load until needed.
    import("@blocknote/core").then(async ({ BlockNoteEditor }) => {
      const editor = BlockNoteEditor.create({
        initialContent: (latestBlocksRef.current ?? initialContent) || undefined,
      });
      const markdown = await editor.blocksToMarkdownLossy(editor.document);

      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "untitled"}.md`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  const savingLabel =
    saveFetcher.state === "submitting"
      ? "Saving…"
      : saveFetcher.data?.page
        ? "Saved"
        : "";

  return (
    <main className="flex min-h-screen bg-[#0a0a0a] text-[#e8e8e8]">
      <div aria-hidden className="pointer-events-none fixed left-1/2 top-[-15%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-white/[0.05] blur-[140px]" />

      {/* Sidebar */}
      <aside
        className={`note-sidebar ${
          sidebarOpen ? "note-sidebar--open" : "note-sidebar--closed"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/20 text-xs font-semibold text-violet-300">
              {groupInfo?.name?.slice(0, 1).toUpperCase() || "G"}
            </div>
            <span className="text-sm font-medium text-[#e8e8e8] truncate">
              {groupInfo?.name || "Group"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="flex h-6 w-6 items-center justify-center rounded-md text-white/40 hover:bg-white/[0.06] hover:text-white/70 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="px-3 py-3">
          <button
            type="button"
            onClick={createNewPage}
            disabled={newPageFetcher.state === "submitting"}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-white/60 hover:bg-white/[0.06] hover:text-[#e8e8e8] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {newPageFetcher.state === "submitting" ? "Creating…" : "New page"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-3">
          <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/25">
            Pages
          </p>
          <ul className="flex flex-col gap-0.5">
            {allPages.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/group/${groupId}/pages/${p.id}`}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
                    p.id === page.id
                      ? "bg-white/[0.08] text-[#e8e8e8] font-medium"
                      : "text-white/50 hover:bg-white/[0.04] hover:text-white/70"
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
                    <path d="M4 2h5l3 3v9H4V2z" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.3" strokeLinejoin="round" />
                    <path d="M9 2v3h3" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.3" strokeLinejoin="round" />
                  </svg>
                  <span className="truncate">{p.title || "Untitled"}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-white/[0.08] px-3 py-3">
          <Link
            to="/home"
            className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-white/40 hover:bg-white/[0.06] hover:text-white/70 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            All groups
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="relative flex items-center justify-between border-b border-white/[0.08] px-6 py-3">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.08] text-white/40 hover:bg-white/[0.06] hover:text-white/70 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>
            )}
            <Link
              to={`/group/${groupId}/pages`}
              className="flex items-center gap-2 text-xs text-white/40 transition-colors duration-150 hover:text-white/70"
            >
              <BackIcon />
              All pages
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-white/30">{savingLabel}</span>

            <button type="button" onClick={downloadMarkdown}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-white/60 transition-colors duration-150 hover:bg-white/[0.06] hover:text-[#e8e8e8]">
              <DownloadIcon /> .md
            </button>

            <button type="button" onClick={openHistory}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-white/60 transition-colors duration-150 hover:bg-white/[0.06] hover:text-[#e8e8e8]">
              <HistoryIcon /> History
            </button>

            <button type="button" onClick={() => setShareOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-gradient-to-r from-violet-500/20 to-blue-500/20 px-3 py-1.5 text-xs font-medium text-[#e8e8e8] transition-all duration-150 hover:from-violet-500/30 hover:to-blue-500/30">
              <ShareIcon /> Share
            </button>
          </div>
        </header>

        <section className="relative mx-auto w-full max-w-5xl flex-1 px-8 py-10">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder="Untitled"
            className="mb-2 w-full bg-transparent text-3xl font-semibold tracking-tight text-[#e8e8e8] outline-none placeholder:text-white/20"
          />
          <p className="mb-8 text-xs text-white/30">
            {page.lastEditedByName
              ? `Last edited by ${page.lastEditedByName}`
              : "No edits yet"}
          </p>
          <div className="note-editor-wrapper">
            {mounted ? (
              <NoteEditorLoader
                initialContent={initialContent}
                onChange={scheduleSave}
              />
            ) : (
              <div className="p-6 text-sm text-white/30">Loading editor…</div>
            )}
          </div>
        </section>
      </div>
      
      {historyOpen && (
        <HistoryPanel
          onClose={() => setHistoryOpen(false)}
          isLoading={historyFetcher.state === "submitting"}
          revisions={
            (historyFetcher.data?.revisions as
              | import("~/lib/pages.server").Revision[]
              | undefined) ?? []
          }
        />
      )}

      {shareOpen && (
        <SharePanel
          onClose={() => setShareOpen(false)}
          isPublic={sharePage.isPublic}
          publicUrl={publicUrl}
          onToggle={toggleShare}
          isSaving={shareFetcher.state === "submitting"}
          copyLabel={copyLabel}
          onCopy={() => {
            if (!publicUrl) return;
            navigator.clipboard.writeText(publicUrl);
            setCopyLabel("Copied!");
            setTimeout(() => setCopyLabel("Copy link"), 1500);
          }}
        />
      )}
    </main>
  );
}

// Split out so the dynamic import boundary is clear: this is the only
// place BlockNote's React bindings get pulled in.
function NoteEditorLoader({
  initialContent,
  onChange,
}: {
  initialContent: Block[] | undefined;
  onChange: (blocks: Block[]) => void;
}) {
  const [Editor, setEditor] = useState<null | React.ComponentType<{
    initialContent: Block[] | undefined;
    onChange: (blocks: Block[]) => void;
  }>>(null);

  useEffect(() => {
    import("./NoteEditor").then((mod) => setEditor(() => mod.default));
  }, []);

  if (!Editor) {
    return <div className="p-6 text-sm text-white/30">Loading editor…</div>;
  }

  return <Editor initialContent={initialContent} onChange={onChange} />;
}

function HistoryPanel({
  onClose,
  isLoading,
  revisions,
}: {
  onClose: () => void;
  isLoading: boolean;
  revisions: import("~/lib/pages.server").Revision[];
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
      <div
        className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#111] p-6 backdrop-blur-xl"
        style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-[#e8e8e8]">Edit history</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-white/40 hover:text-white/70"
          >
            Close
          </button>
        </div>

        {isLoading ? (
          <p className="text-sm text-white/40">Loading…</p>
        ) : revisions.length === 0 ? (
          <p className="text-sm text-white/40">
            No saved versions yet — history builds up as you keep editing.
          </p>
        ) : (
          <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto">
            {revisions.map((rev) => (
              <li
                key={rev.id}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5"
              >
                <p className="text-xs font-medium text-[#e8e8e8]">
                  {rev.editedByName || "Someone"}
                </p>
                <p className="text-xs text-white/30">
                  {new Date(rev.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SharePanel({
  onClose,
  isPublic,
  publicUrl,
  onToggle,
  isSaving,
  copyLabel,
  onCopy,
}: {
  onClose: () => void;
  isPublic: boolean;
  publicUrl: string | null;
  onToggle: (next: boolean) => void;
  isSaving: boolean;
  copyLabel: string;
  onCopy: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
      <div
        className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#111] p-6 backdrop-blur-xl"
        style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-[#e8e8e8]">Share page</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-white/40 hover:text-white/70"
          >
            Close
          </button>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
          <div>
            <p className="text-sm text-[#e8e8e8]">Public link</p>
            <p className="text-xs text-white/30">
              Anyone with the link can view — no account or code needed.
            </p>
          </div>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => onToggle(!isPublic)}
            className={`relative h-6 w-11 rounded-full transition-colors duration-150 ${
              isPublic ? "bg-emerald-500/70" : "bg-white/[0.12]"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-150 ${
                isPublic ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {isPublic && publicUrl && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5">
            <span className="flex-1 truncate text-xs text-white/60">
              {publicUrl}
            </span>
            <button
              type="button"
              onClick={onCopy}
              className="shrink-0 rounded-full border border-white/[0.08] px-3 py-1 text-xs font-medium text-white/70 hover:bg-white/[0.06] hover:text-[#e8e8e8]"
            >
              {copyLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M8 2v8m0 0L5 7m3 3l3-3M3 13h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function HistoryIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 8a5.5 5.5 0 1 1 1.7 3.98" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M2.5 5v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="12" cy="4" r="1.8" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="4" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="12" cy="12" r="1.8" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.6 7.1l4.8-2.2M5.6 8.9l4.8 2.2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}