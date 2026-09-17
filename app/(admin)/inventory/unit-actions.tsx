"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ActionType = "sell" | "repair" | "return";

export default function UnitActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<ActionType | null>(null);
  const [error, setError] = useState("");

  async function handleAction(action: ActionType, confirmMessage: string) {
    if (!confirm(confirmMessage)) return;

    setLoading(action);
    setError("");

    try {
      const res = await fetch(`/api/inventory/${id}/${action}`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Action failed.");
        setLoading(null);
        return;
      }

      router.refresh();
    } catch {
      setError("Something went wrong.");
      setLoading(null);
    }
  }

  if (status === "IN_STOCK") {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex gap-2">
          <button
            onClick={() =>
              handleAction("sell", "Are you sure you want to mark this unit as SOLD?")
            }
            disabled={loading !== null}
            className="rounded bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading === "sell" ? "..." : "Mark Sold"}
          </button>
          <button
            onClick={() =>
              handleAction(
                "repair",
                "Are you sure you want to send this unit for repair?"
              )
            }
            disabled={loading !== null}
            className="rounded bg-amber-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {loading === "repair" ? "..." : "Send to Repair"}
          </button>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  if (status === "REPAIR") {
    return (
      <div className="flex flex-col gap-1">
        <button
          onClick={() =>
            handleAction(
              "return",
              "Are you sure you want to return this unit to inventory?"
            )
          }
          disabled={loading !== null}
          className="rounded bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {loading === "return" ? "..." : "Return to Inventory"}
        </button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return <span className="text-xs text-gray-400">—</span>;
}