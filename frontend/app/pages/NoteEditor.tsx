import { useEffect, useRef, useCallback, useState } from "react";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import type { Block } from "@blocknote/core";

import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import cpp from "highlight.js/lib/languages/cpp";
import java from "highlight.js/lib/languages/java";
import cssLang from "highlight.js/lib/languages/css";
import html from "highlight.js/lib/languages/xml";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import sql from "highlight.js/lib/languages/sql";
import rust from "highlight.js/lib/languages/rust";
import go from "highlight.js/lib/languages/go";
import markdownLang from "highlight.js/lib/languages/markdown";
import "highlight.js/styles/github-dark.min.css";

// Register once
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("c", cpp);
hljs.registerLanguage("java", java);
hljs.registerLanguage("css", cssLang);
hljs.registerLanguage("html", html);
hljs.registerLanguage("xml", html);
hljs.registerLanguage("json", json);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("shell", bash);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("go", go);
hljs.registerLanguage("markdown", markdownLang);

type Props = {
  initialContent: Block[] | undefined;
  onChange: (blocks: Block[]) => void;
  editable?: boolean;
};

export default function NoteEditor({ initialContent, onChange, editable = true }: Props) {
  const editor = useCreateBlockNote({
    initialContent:
      initialContent && initialContent.length > 0 ? initialContent : undefined,
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Safe highlighting using requestAnimationFrame
  const highlightCode = useCallback(() => {
    if (!containerRef.current) return;
    const codeBlocks = containerRef.current.querySelectorAll("div[data-content-type='codeBlock'] p");
    codeBlocks.forEach((block) => {
      // Find the select element to get language
      const wrapper = block.closest("div[data-content-type='codeBlock']");
      const select = wrapper?.querySelector("select");
      const lang = select?.value || "";
      
      // Basic highlighting attempt without breaking prosemirror DOM mapping
      // It's safer to let BlockNote handle its own DOM, but if we must highlight:
      try {
        if (block.getAttribute("data-highlighted") === "yes") return;
        if (lang) block.className = `language-${lang}`;
        hljs.highlightElement(block as HTMLElement);
      } catch (e) {
        // ignore hljs errors
      }
    });
  }, []);

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

  // Overlay state for copy button
  const [hoveredBlock, setHoveredBlock] = useState<{ top: number; right: number; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const target = e.target as HTMLElement;
      const codeBlock = target.closest("div[data-content-type='codeBlock']") as HTMLElement;
      
      if (codeBlock) {
        const rect = codeBlock.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        
        // Extract text safely using innerText to preserve newlines
        const textElements = Array.from(codeBlock.querySelectorAll("p"));
        const text = textElements.map(el => el.innerText || el.textContent || "").join("\n");
        
        setHoveredBlock({
          top: rect.top - containerRect.top + 8,
          right: containerRect.right - rect.right + 8,
          text
        });
      } else {
        // Check if hovering the button itself
        if (!target.closest('.copy-overlay-btn')) {
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
          requestAnimationFrame(highlightCode);
        }}
      />
      
      {/* Absolute positioned overlay copy button */}
      {hoveredBlock && (
        <button
          className= "copy-overlay-btn absolute z-10 flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-black/40 text-white/70 hover:bg-black/60 hover:text-white transition-colors backdrop-blur-sm"
          style={{ 
            top: hoveredBlock.top, 
            right: hoveredBlock.right,
          }}
          onClick={(e) => {
            e.preventDefault();
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
      )}
    </div>
  );
}