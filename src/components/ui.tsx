import { Star, StarHalf } from "lucide-react";
import { cn, kes, discountPct, savings } from "@/lib/utils";

export function Price({
  price,
  compareAt,
  size = "md",
  className,
}: {
  price: number;
  compareAt?: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const pct = discountPct(price, compareAt);
  const save = savings(price, compareAt);
  const sizes = {
    sm: "text-sm font-bold",
    md: "text-lg font-extrabold",
    lg: "text-2xl font-extrabold",
    xl: "text-3xl font-extrabold",
  };
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span className={cn("tracking-tight text-slate-900", sizes[size])}>
        {kes(price)}
      </span>
      {compareAt && compareAt > price && (
        <span className="text-sm font-medium text-slate-400 line-through">
          {kes(compareAt)}
        </span>
      )}
      {pct !== null && (
        <span className="rounded-md bg-red-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
          -{pct}%
        </span>
      )}
      {save !== null && size !== "sm" && (
        <span className="w-full text-xs font-semibold text-emerald-700">
          SAVE {kes(save)}
        </span>
      )}
    </div>
  );
}

export function Rating({
  value,
  count,
  className,
}: {
  value: number;
  count?: number;
  className?: string;
}) {
  const full = Math.floor(value);
  const half = value - full >= 0.4;
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5 text-amber-400">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < full)
            return <Star key={i} className="h-3.5 w-3.5 fill-current" />;
          if (i === full && half)
            return (
              <span key={i} className="relative inline-flex">
                <Star className="h-3.5 w-3.5 text-slate-200 fill-current" />
                <StarHalf className="absolute inset-0 h-3.5 w-3.5 fill-current" />
              </span>
            );
          return (
            <Star key={i} className="h-3.5 w-3.5 text-slate-200 fill-current" />
          );
        })}
      </div>
      <span className="text-xs font-semibold text-slate-700">
        {value.toFixed(1)}
      </span>
      {typeof count === "number" && (
        <span className="text-xs text-slate-400">({count})</span>
      )}
    </div>
  );
}

export function StockBadge({ status, qty }: { status: string; qty: number }) {
  if (status === "OUT_OF_STOCK")
    return (
      <span className="chip border-red-200 bg-red-50 text-red-700">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Out of stock
      </span>
    );
  if (status === "LOW_STOCK" || (qty > 0 && qty <= 8))
    return (
      <span className="chip border-amber-200 bg-amber-50 text-amber-800">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />{" "}
        Only {qty} left
      </span>
    );
  if (status === "PREORDER")
    return <span className="chip">Pre-order</span>;
  return (
    <span className="chip border-emerald-200 bg-emerald-50 text-emerald-700">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> In stock
    </span>
  );
}

export function ConditionBadge({ condition }: { condition: string }) {
  if (condition === "NEW")
    return (
      <span className="rounded-md bg-ink-950 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
        Brand New
      </span>
    );
  return (
    <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
      {condition === "PRE_OWNED" ? "Pre-Owned" : "Refurbished"}
    </span>
  );
}
