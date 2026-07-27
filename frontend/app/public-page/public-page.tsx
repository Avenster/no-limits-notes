import { useEffect, useState } from "react";
import type { MetaFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import type { Block } from "@blocknote/core";
import { getBackendUrl } from "~/lib/auth.server";

export const meta: MetaFunction = () => [{ title: "Shared note" }];

export async function loader({ params }: LoaderFunctionArgs) {
  const backendUrl = getBackendUrl();
  const res = await fetch(`${backendUrl}/public/pages/${params.slug}`);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Response(data?.error || "This link isn't valid anymore.", {
      status: res.status,
    });
  }

  return { page: data.page };
}

export default function PublicPage() {
  const { page } = useLoaderData<typeof loader>();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const content = Array.isArray(page.content) ? (page.content as Block[]) : [];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8]">
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-[-15%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-white/[0.05] blur-[140px]"
      />

      <header className="relative border-b border-white/[0.08] px-8 py-4">
        <span className="rounded-full border border-white/[0.1] px-2.5 py-1 text-[11px] text-white/40">
          Public view — read only
        </span>
      </header>

      <section className="relative mx-auto max-w-3xl px-8 py-12">
        <h1 className="mb-2 text-3xl font-semibold tracking-tight text-[#e8e8e8]">
          {page.title || "Untitled"}
        </h1>
        <p className="mb-8 text-xs text-white/30">
          {page.lastEditedByName
            ? `Last edited by ${page.lastEditedByName}`
            : null}
        </p>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-2">
          {mounted ? (
            <ReadOnlyEditorLoader content={content} />
          ) : (
            <div className="p-6 text-sm text-white/30">Loading…</div>
          )}
        </div>
      </section>
    </main>
  );
}

function ReadOnlyEditorLoader({ content }: { content: Block[] }) {
  const [Editor, setEditor] = useState<null | React.ComponentType<{
    initialContent: Block[] | undefined;
    onChange: (blocks: Block[]) => void;
    editable?: boolean;
  }>>(null);

  useEffect(() => {
    import("../pages/NoteEditor").then((mod) => setEditor(() => mod.default));
  }, []);

  if (!Editor) {
    return <div className="p-6 text-sm text-white/30">Loading…</div>;
  }

  return <Editor initialContent={content} onChange={() => {}} editable={false} />;
}