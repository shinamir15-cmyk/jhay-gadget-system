"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";

type UnitOption = {
  id: string;
  label: string;
  currentBranchId: string | null;
  imei: string | null;
  serialNumber: string | null;
  product: string;
  model: string;
  storage: string;
  color: string;
};

type BranchOption = { id: string; name: string };

export default function ShipmentForm({
  units,
  branches,
}: {
  units: UnitOption[];
  branches: BranchOption[];
}) {
  const router = useRouter();
  const [fromBranchId, setFromBranchId] = useState("");
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [toBranchId, setToBranchId] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const branchesWithStock = useMemo(() => {
    const ids = new Set(units.map((u) => u.currentBranchId).filter(Boolean));
    return branches.filter((b) => ids.has(b.id));
  }, [units, branches]);

  const unitsAtBranch = useMemo(
    () => units.filter((u) => u.currentBranchId === fromBranchId),
    [units, fromBranchId]
  );

    const availableUnits = useMemo(() => {
    const words = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return unitsAtBranch;

    return unitsAtBranch.filter((u) => {
        const haystack = [u.imei, u.serialNumber, u.product, u.model, u.storage, u.color]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
        return words.every((word) => haystack.includes(word));
    });
    }, [unitsAtBranch, search]);

  const destinationOptions = branches.filter((b) => b.id !== fromBranchId);

  function toggleUnit(id: string) {
    setSelectedUnitIds((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  }

  function toggleAllVisible() {
    const visibleIds = availableUnits.map((u) => u.id);
    const allVisibleSelected = visibleIds.every((id) => selectedUnitIds.includes(id));
    if (allVisibleSelected) {
      setSelectedUnitIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedUnitIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!fromBranchId) {
      setError("Select a source branch.");
      return;
    }
    if (selectedUnitIds.length === 0) {
      setError("Select at least one unit.");
      return;
    }
    if (!toBranchId) {
      setError("Select a destination branch.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitIds: selectedUnitIds, toBranchId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to create shipment.");
        setLoading(false);
        return;
      }

      router.push(`/print/shipments/${data.batchId}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (branchesWithStock.length === 0) {
    return (
      <div className="mt-6 rounded-lg bg-card p-6 text-sm text-ink-600 shadow-sm ring-1 ring-ink-400/15">
        No in-stock units available to ship.
      </div>
    );
  }

  const allVisibleSelected =
    availableUnits.length > 0 &&
    availableUnits.every((u) => selectedUnitIds.includes(u.id));

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 flex flex-col gap-4 rounded-lg bg-card p-6 shadow-sm ring-1 ring-ink-400/15"
    >
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-800">
          From Branch <span className="text-red-600">*</span>
        </label>
        <select
          value={fromBranchId}
          onChange={(e) => {
            setFromBranchId(e.target.value);
            setSelectedUnitIds([]);
            setToBranchId("");
            setSearch("");
          }}
          className="w-full rounded-md border border-ink-400/30 px-3 py-2 text-sm text-ink-950 focus:border-brand-600 focus:outline-none"
        >
          <option value="">Select branch…</option>
          {branchesWithStock.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {fromBranchId && (
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm font-medium text-ink-800">
              Units <span className="text-red-600">*</span>
            </label>
            <button
              type="button"
              onClick={toggleAllVisible}
              className="text-xs font-medium text-brand-600 hover:underline"
            >
              {allVisibleSelected ? "Deselect visible" : "Select all visible"}
            </button>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search IMEI, serial, product, model, storage, color…"
            className="mb-2 w-full rounded-md border border-ink-400/30 px-3 py-2 text-sm text-ink-950 focus:border-brand-600 focus:outline-none"
          />

          <div className="max-h-64 overflow-y-auto rounded-md border border-ink-400/30">
            {availableUnits.length === 0 ? (
              <p className="px-3 py-4 text-sm text-ink-400">
                {unitsAtBranch.length === 0
                  ? "No in-stock units at this branch."
                  : "No units match your search."}
              </p>
            ) : (
              availableUnits.map((u) => (
                <label
                  key={u.id}
                  className="flex items-start gap-2 border-b border-ink-400/10 px-3 py-2 text-sm last:border-b-0 hover:bg-surface"
                >
                  <input
                    type="checkbox"
                    checked={selectedUnitIds.includes(u.id)}
                    onChange={() => toggleUnit(u.id)}
                    className="mt-0.5 h-4 w-4 rounded border-ink-400/30 text-brand-600 focus:ring-brand-600"
                  />
                  <div>
                    <div className="font-medium text-ink-950">
                      {u.product} {u.model}
                      {u.storage && ` · ${u.storage}`}
                      {u.color && ` · ${u.color}`}
                    </div>
                    <div className="text-xs text-ink-400">
                      {u.imei ? `IMEI: ${u.imei}` : "No IMEI"}
                      {u.serialNumber ? ` · SN: ${u.serialNumber}` : ""}
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>
          <p className="mt-1 text-xs text-ink-400">{selectedUnitIds.length} selected</p>
        </div>
      )}

      {fromBranchId && (
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-800">
            Destination Branch <span className="text-red-600">*</span>
          </label>
          <select
            value={toBranchId}
            onChange={(e) => setToBranchId(e.target.value)}
            className="w-full rounded-md border border-ink-400/30 px-3 py-2 text-sm text-ink-950 focus:border-brand-600 focus:outline-none"
          >
            <option value="">Select branch…</option>
            {destinationOptions.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full sm:w-auto sm:px-6">
        {loading ? "Shipping…" : "Ship & Print Slip"}
      </Button>
    </form>
  );
}