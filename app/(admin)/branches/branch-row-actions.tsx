"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Branch = {
  id: string;
  name: string;
  code: string | null;
  isMain: boolean;
  _count: { units: number };
};

export default function BranchRowActions({ branch }: { branch: Branch }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: branch.name,
    code: branch.code ?? "",
    isMain: branch.isMain,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  function cancelEdit() {
    setForm({ name: branch.name, code: branch.code ?? "", isMain: branch.isMain });
    setError("");
    setEditing(false);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError("Branch name is required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/branches/${branch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to update branch.");
        setLoading(false);
        return;
      }
      setEditing(false);
      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${branch.name}"? This can't be undone.`)) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/branches/${branch.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to delete branch.");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  if (editing) {
    return (
      <tr className="bg-surface">
        <td className="px-4 py-3">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-md border border-ink-400/30 px-2 py-1 text-sm text-ink-950 focus:border-brand-600 focus:outline-none"
          />
        </td>
        <td className="px-4 py-3">
          <input
            name="code"
            value={form.code}
            onChange={handleChange}
            placeholder="Code"
            className="w-full rounded-md border border-ink-400/30 px-2 py-1 text-sm text-ink-950 focus:border-brand-600 focus:outline-none"
          />
        </td>
        <td className="px-4 py-3 text-ink-800">
          <label className="flex items-center gap-1.5 text-xs text-ink-600">
            <input
              type="checkbox"
              name="isMain"
              checked={form.isMain}
              onChange={handleChange}
              className="h-3.5 w-3.5 rounded border-ink-400/30 text-brand-600 focus:ring-brand-600"
            />
            Main
          </label>
        </td>
        <td className="px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="rounded-md bg-brand-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? "Saving…" : "Save"}
            </button>
            <button
              onClick={cancelEdit}
              disabled={loading}
              className="rounded-md px-2.5 py-1 text-xs font-medium text-ink-600 hover:bg-card"
            >
              Cancel
            </button>
          </div>
          {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-surface">
      <td className="px-4 py-3 font-medium text-ink-950">
        {branch.name}
        {branch.isMain && (
          <span className="ml-2 rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
            Main
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-ink-800">{branch.code ?? "—"}</td>
      <td className="px-4 py-3 text-ink-800">{branch._count.units}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditing(true)}
            className="text-xs font-medium text-brand-600 hover:underline"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
          >
            Delete
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
      </td>
    </tr>
  );
}