"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { kes } from "@/lib/utils";

interface Zone {
  id: string; county: string; town: string; fee: number; eta?: string | null; active: boolean;
}

export default function AdminSettings() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ county: "", town: "", fee: "", eta: "" });

  const load = () => {
    fetch("/api/delivery-zones").then((r) => r.json()).then((d) => setZones(d.zones ?? [])).catch(() => null);
  };
  useEffect(load, []);

  return (
    <div>
      <h1 className="section-title !text-2xl">Settings</h1>
      <p className="text-xs text-slate-500">Delivery zones feed the fee dropdown at checkout.</p>

      <div className="card mt-4 p-5">
        <p className="font-extrabold">Delivery zones</p>
        <div className="mt-3 space-y-2">
          {zones.map((z) => (
            <div key={z.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm">
              <div className="flex-1">
                <p className="font-bold">{z.town}</p>
                <p className="text-xs text-slate-500">{z.county} • {z.eta ?? "ETA on request"}</p>
              </div>
              <strong>{kes(z.fee)}</strong>
              <button
                onClick={async () => { if (!confirm(`Delete zone “${z.town}”?`)) return; await fetch(`/api/delivery-zones?id=${z.id}`, { method: "DELETE" }); load(); }}
                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <form
          className="mt-4 grid gap-2.5 sm:grid-cols-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setMsg("");
            const res = await fetch("/api/delivery-zones", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ county: form.county, town: form.town, fee: Number(form.fee), eta: form.eta || undefined }),
            });
            const data = await res.json().catch(() => ({}));
            setMsg(res.ok ? "Zone added." : (data.error ?? "Failed"));
            if (res.ok) { setForm({ county: "", town: "", fee: "", eta: "" }); load(); }
          }}
        >
          <input className="input" placeholder="County" value={form.county} onChange={(e) => setForm({ ...form, county: e.target.value })} required />
          <input className="input" placeholder="Town / zone" value={form.town} onChange={(e) => setForm({ ...form, town: e.target.value })} required />
          <input className="input" placeholder="Fee (KES)" type="number" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} required />
          <input className="input" placeholder="ETA (e.g. 1–2 days)" value={form.eta} onChange={(e) => setForm({ ...form, eta: e.target.value })} />
          <button className="btn-primary !py-2.5 text-sm sm:col-span-4"><Plus className="h-4 w-4" /> Add zone</button>
        </form>
        {msg && <p className="mt-2 text-xs font-bold text-slate-600">{msg}</p>}
      </div>

      <div className="card mt-4 space-y-2 p-5 text-sm text-slate-600">
        <p className="font-extrabold text-slate-900">Store configuration</p>
        <p>WhatsApp number, M-Pesa keys and site URL live in <code>.env</code> (<code>NEXT_PUBLIC_WHATSAPP_NUMBER=254715135141</code>, <code>MPESA_*</code>).</p>
        <p>Product descriptions support rich text (paragraphs, lists, bold) — paste HTML from any editor into the product record.</p>
        <p>Image ads are managed under <strong>Ads & Banners</strong>: WIDE for breadcrumb banners, SQUARE for the product sidebar.</p>
      </div>
    </div>
  );
}
