"use client";
import { usePathname } from "next/navigation";
import AdminProviders from "./providers";

// Login page renders standalone; everything else gets a full-width console
// shell (section navbar lives in the admin layout, no sidebar).
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
    <div className="container-x py-6">
      <div className="min-w-0">
        <AdminProviders>{children}</AdminProviders>
      </div>
    </div>
  );
}
