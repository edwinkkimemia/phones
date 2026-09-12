"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { kes } from "@/lib/utils";

interface Promo {
  id: string; code: string; type: "PERCENTAGE" | "FIXED"; value: number;
  minSubtotal: number; active: boolean; usedCount?: number;
}

export default function AdminPromotions() {
  const [rows, setRows] = useState<Promo[]>([]);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ code: "", type: "PERCENTAGE", value: "", minSubtotal: "0" });

  const load = () => {
    fetch("/api/promos").then((r) => r.json()).then((d) => setRows(d.promos ?? [])).catch(() => null);
  };
  useEffect(load, []);

  return (
    <div>
      <h1 className="section-title !text-2xl">Promotions</h1>
      <p className="text-xs text-slate-500">Discount codes validated live at checkout via <code>/api/promo/validate</code>.</p>

      <form
        className="card mt-4 grid gap-2.5 p-5 sm:grid-cols-5"
        onSubmit={async (e) => {
          e.preventDefault();
          setMsg("");
          const res = await fetch("/api/promos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: form.code, type: form.type, value: Number(form.value), minSubtotal: Number(form.minSubtotal) }),
          });
          const data = await res.json().catch(() => ({}));
          setMsg(res.ok ? `Code ${form.code.toUpperCase()} created.` : (data.error ?? "Failed"));
          if (res.ok) { setForm({ code: "", type: "PERCENTAGE", value: "", minSubtotal: "0" }); load(); }
        }}
      >
        <input className="input uppercase" placeholder="CODE" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
        <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="PERCENTAGE">% off</option>
          <option value="FIXED">KES off</option>
        </select>
        <input className="input" placeholder="Value" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required />
        <input className="input" placeholder="Min. spend" type="number" value={form.minSubtotal} onChange={(e) => setForm({ ...form, minSubtotal: e.target.value })} />
        <button className="btn-primary !py-2.5 text-sm"><Plus className="h-4 w-4" /> Create</button>
      </form>
      {msg && <p className="mt-2 text-xs font-bold text-slate-600">{msg}</p>}

      <div className="mt-3 space-y-2">
        {rows.map((p) => (
          <div key={p.id} className="card flex flex-wrap items-center gap-3 p-4">
            <div>
              <p className="font-extrabold tracking-wide">{p.code}</p>
              <p className="text-xs text-slate-500">
                {p.type === "PERCENTAGE" ? `${p.value}% off` : `${kes(p.value)} off`} • min {kes(p.minSubtotal)} • used {p.usedCount ?? 0}× • {p.active ? "Active" : "Paused"}
              </p>
            </div>
            <div className="ml-auto flex gap-1.5">
              <button
                onClick={async () => { await fetch("/api/promos", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: p.id, active: !p.active }) }); load(); }}
                className="btn-ghost !px-3 !py-1.5 text-xs"
              >
                {p.active ? "Pause" : "Enable"}
              </button>
              <button
                onClick={async () => { if (!confirm(`Delete ${p.code}?`)) return; await fetch(`/api/promos?id=${p.id}`, { method: "DELETE" }); load(); }}
                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
