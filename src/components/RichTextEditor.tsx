"use client";
import { useEffect, useRef } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Heading3, Pilcrow, Link2, Eraser } from "lucide-react";

// Dependency-free rich text editor (contentEditable). Outputs clean HTML
// for product descriptions and content blocks.
export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write a compelling description…",
  minHeight = 160,
  disabled = false,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // null = never synced: guarantees the first run populates the editor with
  // the loaded value (previously the div stayed empty on edit pages because
  // the ref was initialised to `value`, so the sync was skipped on mount).
  const lastExternal = useRef<string | null>(null);

  // Sync external value (e.g. loaded product) without clobbering typing.
  useEffect(() => {
    if (ref.current && value !== lastExternal.current && document.activeElement !== ref.current) {
      ref.current.innerHTML = value || "";
      lastExternal.current = value;
    }
  }, [value]);

  const cmd = (command: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  };

  const emit = () => {
    const html = ref.current?.innerHTML ?? "";
    lastExternal.current = html;
    onChange(html);
  };

  const link = () => {
    const url = window.prompt("Link URL (https://…)");
    if (url) cmd("createLink", url);
  };

  const btn =
    "grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800";

  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100 ${disabled ? "opacity-60" : ""}`}>
      {!disabled && (
        <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-100 bg-slate-50/70 p-1.5">
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => cmd("bold")} className={btn} title="Bold" aria-label="Bold"><Bold className="h-4 w-4" /></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => cmd("italic")} className={btn} title="Italic" aria-label="Italic"><Italic className="h-4 w-4" /></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => cmd("underline")} className={btn} title="Underline" aria-label="Underline"><Underline className="h-4 w-4" /></button>
        <span className="mx-1 h-5 w-px bg-slate-200" />
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => cmd("formatBlock", "p")} className={btn} title="Paragraph" aria-label="Paragraph"><Pilcrow className="h-4 w-4" /></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => cmd("formatBlock", "h3")} className={btn} title="Heading" aria-label="Heading"><Heading3 className="h-4 w-4" /></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => cmd("insertUnorderedList")} className={btn} title="Bullet list" aria-label="Bullet list"><List className="h-4 w-4" /></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => cmd("insertOrderedList")} className={btn} title="Numbered list" aria-label="Numbered list"><ListOrdered className="h-4 w-4" /></button>
        <span className="mx-1 h-5 w-px bg-slate-200" />
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={link} className={btn} title="Insert link" aria-label="Insert link"><Link2 className="h-4 w-4" /></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => cmd("removeFormat")} className={btn} title="Clear formatting" aria-label="Clear formatting"><Eraser className="h-4 w-4" /></button>
        </div>
      )}
      <div
        ref={ref}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        data-placeholder={placeholder}
        className="richtext min-h-[120px] px-4 py-3 text-sm outline-none empty:before:font-normal empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)]"
        style={{ minHeight }}
      />
    </div>
  );
}
