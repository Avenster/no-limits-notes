import { useEffect, useState } from "react";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import type { Block } from "@blocknote/core";

type Props = {
  initialContent: Block[] | undefined;
  onChange: (blocks: Block[]) => void;
  editable?: boolean;
};

/**
 * Thin wrapper around BlockNote so the rest of the app doesn't need to know
 * about its API directly. BlockNote is client-only (it touches the DOM
 * heavily), so this component should only ever render after mount — the
 * parent route handles that via a mounted-check, since BlockNote also
 * doesn't tolerate SSR.
 */
export default function NoteEditor({ initialContent, onChange, editable = true }: Props) {
  const editor = useCreateBlockNote({
    initialContent:
      initialContent && initialContent.length > 0 ? initialContent : undefined,
  });

  return (
    <BlockNoteView
      editor={editor}
      theme="dark"
      editable={editable}
      onChange={() => {
        onChange(editor.document);
      }}
    />
  );
}