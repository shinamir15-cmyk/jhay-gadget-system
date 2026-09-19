"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";

export default function BranchForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    code: "",
    isMain: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to add branch.");
        setLoading(false);
        return;
      }

      setForm({ name: "", code: "", isMain: false });
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg bg-card p-6 shadow-sm ring-1 ring-ink-400/15">
      <h2 className="text-base font-semibold text-ink-950">Add Branch</h2>
      <p className="mt-1 text-sm text-ink-600">
        Create a new location for shipping units.
      </p>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-800">
            Branch Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-ink-400/30 px-3 py-2 text-sm text-ink-950 focus:border-brand-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink-800">Branch Code</label>
          <input
            type="text"
            name="code"
            value={form.code}
            onChange={handleChange}
            placeholder="e.g. MAIN, BR2"
            className="w-full rounded-md border border-ink-400/30 px-3 py-2 text-sm text-ink-950 focus:border-brand-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isMain"
            name="isMain"
            checked={form.isMain}
            onChange={handleChange}
            className="h-4 w-4 rounded border-ink-400/30 text-brand-600 focus:ring-brand-600"
          />
          <label htmlFor="isMain" className="text-sm font-medium text-ink-800">
            Set as main branch
          </label>
        </div>
        <p className="-mt-2 text-xs text-ink-400">
          Only one branch can be main. This will unmark any existing main branch.
        </p>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Saving…" : "Save Branch"}
        </Button>
      </form>
    </div>
  );
}