import { useMemo, useEffect, useRef, useState } from "react";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { createExtension, type Block } from "@blocknote/core";
import { createHighlightPlugin } from "prosemirror-highlight";
import { createParser } from "prosemirror-highlight/lowlight";
import { createLowlight } from "lowlight";

import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import cpp from "highlight.js/lib/languages/cpp";
import java from "highlight.js/lib/languages/java";
import cssLang from "highlight.js/lib/languages/css";
import xmlLang from "highlight.js/lib/languages/xml";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import sql from "highlight.js/lib/languages/sql";
import rust from "highlight.js/lib/languages/rust";
import go from "highlight.js/lib/languages/go";
import markdownLang from "highlight.js/lib/languages/markdown";
import "highlight.js/styles/github-dark.min.css";

// Register languages once. lowlight v3 returns HAST and reuses highlight.js
// grammars, so the emitted class names (`hljs-keyword`, `hljs-string`, …)
// stay compatible with the github-dark theme imported above.
const lowlight = createLowlight();
lowlight.register("javascript", javascript);
lowlight.registerAlias("javascript", ["js"]);
lowlight.register("typescript", typescript);
lowlight.registerAlias("typescript", ["ts"]);
lowlight.register("python", python);
lowlight.registerAlias("python", ["py"]);
lowlight.register("cpp", cpp);
lowlight.registerAlias("cpp", ["c++", "c"]);
lowlight.register("java", java);
lowlight.register("css", cssLang);
lowlight.register("xml", xmlLang);
lowlight.registerAlias("xml", ["html"]);
lowlight.register("json", json);
lowlight.register("bash", bash);
lowlight.registerAlias("bash", ["sh", "shell"]);
lowlight.register("sql", sql);
lowlight.register("rust", rust);
lowlight.register("go", go);
lowlight.register("markdown", markdownLang);
lowlight.registerAlias("markdown", ["md"]);

const LANGUAGES = [
  { value: "text", label: "Plain Text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "css", label: "CSS" },
  { value: "html", label: "HTML" },
  { value: "json", label: "JSON" },
  { value: "bash", label: "Bash" },
  { value: "sql", label: "SQL" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "markdown", label: "Markdown" },
];

// Use prosemirror-highlight's official lowlight adapter instead of a
// hand-rolled DOM-walking parser. It computes decoration offsets straight from
// the HAST tree (SSR-safe) and throws on unregistered languages, so we guard
// here and let text/plain fall through with no decorations.
const lowlightParser: Parameters<typeof createParser>[0] = {
  highlight(language, value) {
    if (!language || language === "text" || !lowlight.registered(language)) {
      return { type: "root", children: [] };
    }
    return lowlight.highlight(language, value);
  },
  highlightAuto(value) {
    return lowlight.highlightAuto(value);
  },
};
const hljsParser = createParser(lowlightParser);

type Props = {
  initialContent: Block[] | undefined;
  onChange: (blocks: Block[]) => void;
  editable?: boolean;
};

export default function NoteEditor({ initialContent, onChange, editable = true }: Props) {
  const codeHighlightExtension = useMemo(
    () =>
      createExtension({
        key: "codeHighlight",
        prosemirrorPlugins: [
          createHighlightPlugin({
            parser: hljsParser,
            nodeTypes: ["codeBlock"],
          }),
        ],
      }),
    []
  );

  const editor = useCreateBlockNote({
    initialContent:
      initialContent && initialContent.length > 0 ? initialContent : undefined,
    extensions: [codeHighlightExtension],
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");
  useEffect(() => {
    const check = () => {
      const t = document.documentElement.getAttribute("data-theme");
      setResolvedTheme(t === "light" ? "light" : "dark");
    };
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  // Overlay state for copy button and language selector
  const [hoveredBlock, setHoveredBlock] = useState<{ top: number; right: number; text: string; id: string; language: string; selectEl: HTMLSelectElement | null } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState<boolean>(false);
  const [searchLang, setSearchLang] = useState("");

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Don't update hover states if the language menu is open
      if (document.querySelector('.lang-menu')) return;

      if (!containerRef.current) return;
      const target = e.target as HTMLElement;
      const codeBlock = target.closest("div[data-content-type='codeBlock']") as HTMLElement;
      
      if (codeBlock) {
        const rect = codeBlock.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        
        const blockWithId = codeBlock.closest("[data-id]");
        const blockId = blockWithId ? blockWithId.getAttribute("data-id") || "" : "";
        const selectEl = codeBlock.querySelector("select");
        
        let language = "text";
        if (blockId) {
          const block = editor.getBlock(blockId);
          if (block && block.type === "codeBlock" && block.props.language) {
            language = block.props.language;
          }
        }

        // Extract text safely using the pre element to preserve formatting
        const pre = codeBlock.querySelector("pre");
        const text = pre ? pre.textContent || "" : codeBlock.textContent || "";
        
        setHoveredBlock({
          top: rect.top - containerRect.top + 8,
          right: containerRect.right - rect.right + 8,
          text,
          id: blockId,
          language,
          selectEl
        });
      } else {
        // Check if hovering the buttons themselves
        if (!target.closest('.copy-overlay-btn') && !target.closest('.lang-overlay-btn')) {
          setHoveredBlock(null);
          setCopied(false);
        }
      }
    };

    const el = containerRef.current;
    if (el) el.addEventListener('mousemove', handleMouseMove);
    return () => {
      if (el) el.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme}
        editable={editable}
        onChange={() => {
          onChange(editor.document);
        }}
      />
      
      {/* Absolute positioned overlay for language selector & copy button */}
      {hoveredBlock && (
        <div 
          className="absolute z-10 flex items-center gap-1.5"
          style={{ top: hoveredBlock.top, right: hoveredBlock.right }}
        >
          <button
            className="lang-overlay-btn flex h-7 items-center justify-between gap-1.5 rounded-md border border-white/10 bg-black/40 px-2 text-[11px] font-medium text-white/70 hover:bg-black/60 hover:text-white transition-colors backdrop-blur-sm"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowLangMenu(!showLangMenu);
            }}
          >
            {LANGUAGES.find(l => l.value === hoveredBlock.language)?.label || "Plain Text"}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          
          <button
            className="copy-overlay-btn flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-black/40 text-white/70 hover:bg-black/60 hover:text-white transition-colors backdrop-blur-sm"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigator.clipboard.writeText(hoveredBlock.text);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 8.5l3 3 5-6" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M11 5V3.5A1.5 1.5 0 009.5 2h-6A1.5 1.5 0 002 3.5v6A1.5 1.5 0 003.5 11H5" stroke="currentColor" strokeWidth="1.3"/></svg>
            )}
          </button>
        </div>
      )}

      {/* Language Selection Dropdown Menu */}
      {showLangMenu && hoveredBlock && (
        <div 
          className="lang-menu absolute z-50 rounded-xl border bg-[#1E1E1E]/95 backdrop-blur-xl p-1.5 shadow-2xl flex flex-col w-40"
          style={{ top: hoveredBlock.top + 32, right: hoveredBlock.right, borderColor: "rgba(255,255,255,0.15)" }}
        >
          <input 
            autoFocus
            placeholder="Search language..."
            className="bg-transparent border-b border-white/10 text-white text-[11px] px-2 py-1.5 outline-none mb-1 w-full placeholder:text-white/40"
            value={searchLang}
            onChange={(e) => setSearchLang(e.target.value)}
          />
          <div className="max-h-48 overflow-y-auto flex flex-col gap-0.5" style={{ scrollbarWidth: 'thin' }}>
            {LANGUAGES.filter(l => l.label.toLowerCase().includes(searchLang.toLowerCase())).map(lang => (
              <button 
                key={lang.value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  if (hoveredBlock.id) {
                    editor.updateBlock(hoveredBlock.id, { 
                      type: "codeBlock",
                      props: { language: lang.value } 
                    });
                  }
                  
                  setShowLangMenu(false);
                  setSearchLang("");
                  setHoveredBlock(prev => prev ? { ...prev, language: lang.value } : null);
                }}
                className="text-left text-[11px] font-medium text-white/70 hover:bg-white/10 hover:text-white px-2 py-1.5 rounded transition-colors"
              >
                {lang.label}
              </button>
            ))}
            {LANGUAGES.filter(l => l.label.toLowerCase().includes(searchLang.toLowerCase())).length === 0 && (
              <div className="px-2 py-2 text-[10px] text-white/40 text-center">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}