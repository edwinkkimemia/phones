"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Customer {
  id: string; name: string; phone: string; email?: string | null;
  town?: string | null; createdAt: string; _count?: { orders: number };
}

export default function AdminCustomers() {
  const [rows, setRows] = useState<Customer[]>([]);
  const [source, setSource] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/api/customers").then((r) => r.json()).then((d) => { setRows(d.customers ?? []); setSource(d.source); }).catch(() => null);
  }, []);

  const shown = rows.filter((c) => `${c.name} ${c.phone} ${c.email ?? ""}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <h1 className="section-title !text-2xl">Customers</h1>
      <p className="text-xs text-slate-500">{shown.length} profiles • Source: {source === "db" ? "Live database" : "Demo (connect DB)"}</p>
      <input className="input mt-3" placeholder="Search name, phone, email…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="card mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[11px] uppercase tracking-wider text-slate-400">
              <th className="p-3">Name</th><th className="p-3">Phone</th><th className="p-3">Email</th><th className="p-3">Town</th><th className="p-3 text-right">Orders</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((c) => (
              <tr key={c.id} className="border-t border-slate-50 transition hover:bg-slate-50/60">
                <td className="p-3"><Link href={`/admin/customers/${c.id}`} className="font-bold hover:text-brand-700 hover:underline">{c.name}</Link></td>
                <td className="p-3">{c.phone}</td>
                <td className="p-3 text-slate-500">{c.email ?? "—"}</td>
                <td className="p-3 text-slate-500">{c.town ?? "—"}</td>
                <td className="p-3 text-right font-bold">{c._count?.orders ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {shown.length === 0 && <div className="card mt-3 p-8 text-center text-sm text-slate-400">No customer profiles yet — they are created automatically at checkout.</div>}
    </div>
  );
}
