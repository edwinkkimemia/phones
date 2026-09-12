"use client";
import { useRef, useState } from "react";
import { Upload, Loader2, ImagePlus } from "lucide-react";

// Reusable admin image uploader → POSTs to /api/uploads, returns public URLs.
export default function ImageUploader({
  onUploaded,
  multiple = true,
  label = "Upload images",
  compact = false,
}: {
  onUploaded: (urls: string[]) => void;
  multiple?: boolean;
  label?: string;
  compact?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const send = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    setErr("");
    try {
      const form = new FormData();
      Array.from(files).slice(0, 8).forEach((f) => form.append("files", f));
      const res = await fetch("/api/uploads", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onUploaded(data.urls as string[]);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        multiple={multiple}
        className="hidden"
        onChange={(e) => send(e.target.files)}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        className={
          compact
            ? "inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 hover:border-brand-400 hover:text-brand-700 disabled:opacity-50"
            : "flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 px-4 py-6 text-sm font-bold text-slate-500 transition hover:border-brand-400 hover:bg-brand-50/50 hover:text-brand-700 disabled:opacity-50"
        }
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : compact ? <Upload className="h-3.5 w-3.5" /> : <ImagePlus className="h-5 w-5" />}
        {busy ? "Uploading…" : label}
      </button>
      {err && <p className="mt-1.5 text-xs font-semibold text-red-600">{err}</p>}
      <p className="mt-1 text-[11px] text-slate-400">JPG / PNG / WebP / AVIF / GIF • max 5MB each</p>
    </div>
  );
}
