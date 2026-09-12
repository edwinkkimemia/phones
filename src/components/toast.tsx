"use client";
import { create } from "zustand";

interface Toast {
  id: number;
  title: string;
  body?: string;
}

interface ToastState {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
}

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  push: (t) => {
    const id = Date.now() + Math.random();
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
    }, 3200);
  },
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

export function Toasts() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="pointer-events-none fixed bottom-20 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 sm:left-auto sm:right-6 sm:translate-x-0 md:bottom-6">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          className="toast-in pointer-events-auto rounded-2xl border border-slate-800 bg-ink-950 p-4 text-left text-white shadow-pop"
        >
          <p className="text-sm font-bold">{t.title}</p>
          {t.body && <p className="mt-0.5 text-xs text-slate-300">{t.body}</p>}
        </button>
      ))}
    </div>
  );
}

export function toast(title: string, body?: string) {
  useToast.getState().push({ title, body });
}
