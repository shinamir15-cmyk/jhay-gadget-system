"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddUnitPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    product: "",
    model: "",
    storage: "",
    color: "",
    imei: "",
    serialNumber: "",
    purchasePrice: "",
    dateAdded: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to add unit.");
        setLoading(false);
        return;
      }

      router.push("/inventory");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const fields: { name: keyof typeof form; label: string; type?: string; required?: boolean }[] = [
    { name: "product", label: "Product", required: true },
    { name: "model", label: "Model", required: true },
    { name: "storage", label: "Storage" },
    { name: "color", label: "Color" },
    { name: "imei", label: "IMEI" },
    { name: "serialNumber", label: "Serial Number" },
    { name: "purchasePrice", label: "Purchase Price (₱)", type: "number", required: true },
    { name: "dateAdded", label: "Date Added", type: "date" },
  ];

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-800">Add Unit</h1>
      <p className="mt-1 text-sm text-gray-500">
        New units are automatically set to <span className="font-medium">IN STOCK</span>.
      </p>

      {error && (
        <div className="mt-4 rounded bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid grid-cols-1 gap-4 rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:grid-cols-2"
      >
        {fields.map((field) => (
          <div key={field.name}>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.type ?? "text"}
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              required={field.required}
              min={field.type === "number" ? 0 : undefined}
              step={field.type === "number" ? "0.01" : undefined}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        ))}

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 sm:w-auto sm:px-6"
          >
            {loading ? "Saving..." : "Save Unit"}
          </button>
        </div>
      </form>
    </div>
  );
}