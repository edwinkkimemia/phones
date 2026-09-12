"use client";
import { SessionProvider } from "next-auth/react";

export default function StoreProviders({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
