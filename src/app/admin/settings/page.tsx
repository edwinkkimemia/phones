"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, Save, KeyRound, Loader2 } from "lucide-react";
import { kes } from "@/lib/utils";
import { SITE_FIELDS } from "@/lib/site-settings";
import PasswordInput from "@/components/PasswordInput";

interface Zone {
  id: string; county: string; town: string; fee: number; eta?: string | null; active: boolean;
}

function DeliveryZones() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ county: "", town: "", fee: "", eta: "" });

  const load = () => {
    fetch("/api/delivery-zones").then((r) => r.json()).then((d) => setZones(d.zones ?? [])).catch(() => null);
  };
  useEffect(load, []);

  return (
    <div className="card p-5">
      <p className="font-extrabold">Delivery zones</p>
      <p className="text-xs text-slate-500">These fees feed the dropdown at checkout.</p>
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
  );
}

function SiteSettingsEditor() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/site-settings").then((r) => r.json()).then((d) => setValues(d.settings ?? {})).catch(() => null);
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/site-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: values }),
    });
    const data = await res.json().catch(() => ({}));
    setMsg(res.ok ? `Saved ${data.updated ?? 0} settings. Changes appear across the site immediately.` : (data.error ?? "Failed"));
    setSaving(false);
  };

  return (
    <form onSubmit={save} className="card space-y-3 p-5">
      <div>
        <p className="font-extrabold">Site settings</p>
        <p className="text-xs text-slate-500">Store identity, contacts and announcement — applied to the header, footer and every WhatsApp button.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {SITE_FIELDS.map((f) => (
          <div key={f.key} className={f.key === "announcement" || f.key === "address" ? "sm:col-span-2" : ""}>
            <label className="label">{f.label}</label>
            <input
              className="input"
              value={values[f.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              placeholder={f.hint}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button disabled={saving} className="btn-primary !py-2.5 text-sm disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : "Save settings"}
        </button>
        {msg && <p className="text-xs font-bold text-slate-600">{msg}</p>}
      </div>
    </form>
  );
}

function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setOk(false);
    if (form.newPassword !== form.confirm) {
      setMsg("New passwords don't match.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/admin/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setMsg(data.error ?? "Failed");
      return;
    }
    setOk(true);
    setMsg("Password changed. Use it next time you sign in.");
    setForm({ currentPassword: "", newPassword: "", confirm: "" });
  };

  return (
    <form onSubmit={submit} className="card space-y-3 p-5">
      <div>
        <p className="flex items-center gap-2 font-extrabold"><KeyRound className="h-4 w-4 text-brand-600" /> Change password</p>
        <p className="text-xs text-slate-500">Signed in as this admin account. Minimum 8 characters.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <PasswordInput label="Current password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} required autoComplete="current-password" />
        <PasswordInput label="New password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required minLength={8} autoComplete="new-password" />
        <PasswordInput label="Confirm new password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required minLength={8} autoComplete="new-password" />
      </div>
      <div className="flex items-center gap-3">
        <button disabled={saving} className="btn-accent !py-2.5 text-sm disabled:opacity-60">
          {saving ? "Updating…" : "Update password"}
        </button>
        {msg && <p className={`text-xs font-bold ${ok ? "text-emerald-700" : "text-red-600"}`}>{msg}</p>}
      </div>
    </form>
  );
}

export default function AdminSettings() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="section-title !text-2xl">Settings</h1>
        <p className="text-xs text-slate-500">Identity, security and delivery for the whole store.</p>
      </div>
      <SiteSettingsEditor />
      <ChangePassword />
      <DeliveryZones />
      <div className="card space-y-2 p-5 text-sm text-slate-600">
        <p className="font-extrabold text-slate-900">Configuration notes</p>
        <p>M-Pesa keys, the database URL and session secret live in environment variables (<code>MPESA_*</code>, <code>DATABASE_URL</code>, <code>NEXTAUTH_SECRET</code>).</p>
        <p>Product descriptions support rich text (paragraphs, lists, bold) — paste HTML from any editor into the product record.</p>
        <p>Image ads are managed under <strong>Ads & Banners</strong>: WIDE for breadcrumb banners, SQUARE for the product sidebar.</p>
      </div>
    </div>
  );
}
