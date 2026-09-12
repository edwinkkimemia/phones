"use client";
import { usePathname } from "next/navigation";
import AdminNav from "./nav";
import AdminProviders from "./providers";

// Login page renders standalone (no sidebar); everything else gets the console shell.
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path === "/admin/login") {
    return (
      <div className="container-x py-6">
        <AdminProviders>{children}</AdminProviders>
      </div>
    );
  }
  return (
    <div className="container-x grid gap-6 py-6 lg:grid-cols-[230px_1fr]">
      <AdminProviders>
        <AdminNav />
      </AdminProviders>
      <div className="min-w-0">
        <AdminProviders>{children}</AdminProviders>
      </div>
    </div>
  );
}
