"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "IN_STOCK", label: "In Stock" },
  { value: "SOLD", label: "Sold" },
  { value: "REPAIR", label: "Repair" },
];

export default function SearchFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const status = searchParams.get("status") ?? "ALL";

  function updateUrl(nextQuery: string, nextStatus: string) {
    const params = new URLSearchParams();
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    if (nextStatus && nextStatus !== "ALL") params.set("status", nextStatus);

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      updateUrl(query, status);
    }, 350);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    updateUrl(query, e.target.value);
  }

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search IMEI, serial, product, model, storage, color…"
        className="w-full rounded-md border border-ink-400/30 bg-card px-3 py-2 text-sm text-ink-950 placeholder:text-ink-400 focus:border-brand-600 focus:outline-none sm:max-w-sm"
      />
      <select
        value={status}
        onChange={handleStatusChange}
        className="w-full rounded-md border border-ink-400/30 bg-card px-3 py-2 text-sm text-ink-950 focus:border-brand-600 focus:outline-none sm:w-auto"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}