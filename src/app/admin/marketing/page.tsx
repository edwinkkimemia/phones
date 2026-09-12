"use client";
import { useEffect, useState } from "react";
import { Download, Mail } from "lucide-react";

interface Sub {
  id: string; email: string; source: string; active: boolean; createdAt: string;
}

export default function AdminMarketing() {
  const [rows, setRows] = useState<Sub[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/api/newsletter").then((r) => r.json()).then((d) => setRows(d.subscribers ?? [])).catch(() => null);
  }, []);

  const shown = rows.filter((r) => `${r.email} ${r.source}`.toLowerCase().includes(q.toLowerCase()));

  const csv = () => {
    const lines = ["email,source,subscribed_at", ...shown.map((r) => `${r.email},${r.source},${r.createdAt}`)];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "phonelaptops-subscribers.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const bySource = rows.reduce<Record<string, number>>((m, r) => {
    m[r.source] = (m[r.source] ?? 0) + 1;
    return m;
  }, {});

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div>
          <h1 className="section-title !text-2xl">Marketing</h1>
          <p className="text-xs text-slate-500">{rows.length} email subscribers • captured by the homepage form + 10%-off popup</p>
        </div>
        <button onClick={csv} className="btn-ghost ml-auto !py-2.5 text-xs"><Download className="h-4 w-4" /> Export CSV</button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="card p-4"><p className="text-xs text-slate-500">Total subscribers</p><p className="font-display mt-1 text-xl font-extrabold">{rows.length}</p></div>
        {Object.entries(bySource).slice(0, 3).map(([s, n]) => (
          <div key={s} className="card p-4"><p className="text-xs text-slate-500">via {s}</p><p className="font-display mt-1 text-xl font-extrabold">{n}</p></div>
        ))}
      </div>

      <input className="input mt-4" placeholder="Search emails…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="card mt-3 overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[11px] uppercase tracking-wider text-slate-400">
              <th className="p-3">Email</th><th className="p-3">Source</th><th className="p-3 text-right">Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {shown.slice(0, 200).map((r) => (
              <tr key={r.id} className="border-t border-slate-50">
                <td className="flex items-center gap-2 p-3 font-semibold"><Mail className="h-4 w-4 text-slate-300" /> {r.email}</td>
                <td className="p-3"><span className="chip">{r.source}</span></td>
                <td className="p-3 text-right text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {shown.length === 0 && <div className="card mt-3 p-8 text-center text-sm text-slate-400">No subscribers yet — the popup + homepage form feed this list.</div>}
      <p className="mt-2 text-[11px] text-slate-400">Import the CSV into Mailchimp/Brevo/SendGrid for campaigns. Always include an unsubscribe link.</p>
    </div>
  );
}
