"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirm-dialog";

type ActionType = "sell" | "repair" | "return";

type ActionConfigEntry = {
  title: string;
  message: string;
  confirmLabel: string;
  variant: "primary" | "warning" | "success";
};

const ACTION_CONFIG: Record<ActionType, ActionConfigEntry> = {
  sell: {
    title: "Mark as Sold",
    message: "Are you sure you want to mark this unit as SOLD?",
    confirmLabel: "Mark Sold",
    variant: "primary",
  },
  repair: {
    title: "Send to Repair",
    message: "Are you sure you want to send this unit for repair?",
    confirmLabel: "Send to Repair",
    variant: "warning",
  },
  return: {
    title: "Return to Inventory",
    message: "Are you sure you want to return this unit to inventory?",
    confirmLabel: "Return",
    variant: "success",
  },
};

export default function UnitActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<ActionType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function confirmAction() {
    if (!pendingAction) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/inventory/${id}/${pendingAction}`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Action failed.");
        setSubmitting(false);
        setPendingAction(null);
        return;
      }

      setPendingAction(null);
      setSubmitting(false);
      router.refresh();
    } catch {
      setError("Something went wrong.");
      setSubmitting(false);
      setPendingAction(null);
    }
  }

  const config = pendingAction ? ACTION_CONFIG[pendingAction] : null;

  return (
    <>
      <div className="flex flex-col gap-1">
        {status === "IN_STOCK" && (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="primary" onClick={() => setPendingAction("sell")}>
              Mark Sold
            </Button>
            <Button size="sm" variant="warning" onClick={() => setPendingAction("repair")}>
              Send to Repair
            </Button>
          </div>
        )}
        {status === "REPAIR" && (
          <Button size="sm" variant="success" onClick={() => setPendingAction("return")}>
            Return to Inventory
          </Button>
        )}
        {(status === "SOLD" || status === "SHIPPED") && (
          <span className="text-xs text-ink-400">—</span>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      <ConfirmDialog
        open={pendingAction !== null}
        title={config?.title ?? ""}
        message={config?.message ?? ""}
        confirmLabel={config?.confirmLabel ?? "Confirm"}
        variant={config?.variant ?? "primary"}
        loading={submitting}
        onConfirm={confirmAction}
        onCancel={() => setPendingAction(null)}
      />
    </>
  );
}