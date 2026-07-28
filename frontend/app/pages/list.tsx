import type {
  MetaFunction,
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from "react-router";
import { redirect, useLoaderData, Link, Form, useNavigation } from "react-router";
import { listPages, createPage, mergeSetCookie } from "~/lib/pages.server";

export const meta: MetaFunction = () => [{ title: "Pages · Notes" }];

export async function loader({ request, params }: LoaderFunctionArgs) {
  const groupId = params.groupId!;
  const result = await listPages(request, groupId);

  if (result.status === 403) {
    return redirect("/join");
  }
  if (!result.ok) {
    throw new Response(result.data?.error || "Couldn't load pages.", {
      status: result.status,
    });
  }

  return { groupId, pages: result.data.pages as import("~/lib/pages.server").PageSummary[] };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const groupId = params.groupId!;
  const formData = await request.formData();
  const title = String(formData.get("title") || "").trim();

  const result = await createPage(request, groupId, title || "Untitled");

  if (!result.ok) {
    throw new Response(result.data?.error || "Couldn't create page.", {
      status: result.status,
    });
  }

  const headers = mergeSetCookie(new Headers(), result.setCookie);
  return redirect(`/group/${groupId}/pages/${result.data.page.id}`, { headers });
}

export default function PagesListPage() {
  const { groupId, pages } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isCreating = navigation.state === "submitting";

  return (
    <main 
      className="min-h-screen"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-[-15%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-white/[0.05] blur-[140px]"
      />

      <header 
        className="relative flex items-center justify-between border-b px-8 py-4"
        style={{ borderColor: 'var(--border)' }}
      >
        <Link to="/home" className="flex items-center gap-2.5">
          <div 
            className="flex h-8 w-8 items-center justify-center rounded-lg border bg-white/[0.04]"
            style={{ borderColor: 'var(--border)' }}
          >
            <NotesMark />
          </div>
          <span className="text-sm font-medium tracking-tight">Notes</span>
        </Link>

        <Form method="post">
          <input type="hidden" name="title" value="Untitled" />
          <button
            type="submit"
            disabled={isCreating}
            className="flex items-center gap-2 rounded-full border bg-white/[0.08] px-4 py-1.5 text-xs font-medium transition-all duration-150 hover:bg-white/[0.14] active:scale-[0.98] disabled:opacity-50"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <PlusIcon />
            {isCreating ? "Creating…" : "New page"}
          </button>
        </Form>
      </header>

      <section className="relative mx-auto max-w-3xl px-8 py-16">
        <h1 
          className="mb-8 text-2xl font-medium tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Pages
        </h1>

        {pages.length === 0 ? (
          <div 
            className="rounded-2xl border px-10 py-10 text-center"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
          >
            <p className="text-sm text-white/40">
              No pages yet — create the first one to get started.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {pages.map((page) => (
              <li key={page.id}>
                <Link
                  to={`/group/${groupId}/pages/${page.id}`}
                  className="group flex items-center justify-between rounded-xl border bg-white/[0.04] px-5 py-3.5 backdrop-blur-xl transition-all duration-150 hover:bg-white/[0.07] hover:border-white/[0.14]"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center gap-3">
                    <DocIcon />
                    <span 
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {page.title || "Untitled"}
                    </span>
                    {page.isPublic && (
                      <span className="rounded-full border border-white/[0.1] px-2 py-0.5 text-[10px] text-white/40">
                        Public
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-white/30">
                    {page.lastEditedByName
                      ? `Edited by ${page.lastEditedByName}`
                      : "No edits yet"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function NotesMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="2" width="14" height="16" rx="2" stroke="var(--text-primary)" strokeOpacity="0.7" strokeWidth="1.4" />
      <path d="M6.5 7H13.5" stroke="var(--text-primary)" strokeOpacity="0.7" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6.5 10.5H13.5" stroke="var(--text-primary)" strokeOpacity="0.7" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 2h5l3 3v9H4V2z" stroke="var(--text-primary)" strokeOpacity="0.4" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M9 2v3h3" stroke="var(--text-primary)" strokeOpacity="0.4" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}