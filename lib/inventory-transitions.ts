export type UnitStatus = "IN_STOCK" | "SOLD" | "REPAIR";

type TransitionRule = {
  from: UnitStatus;
  to: UnitStatus;
  action: string;
};

export const TRANSITIONS: Record<"sell" | "repair" | "return", TransitionRule> = {
  sell: { from: "IN_STOCK", to: "SOLD", action: "mark as sold" },
  repair: { from: "IN_STOCK", to: "REPAIR", action: "send to repair" },
  return: { from: "REPAIR", to: "IN_STOCK", action: "return to inventory" },
};

export function validateTransition(
  actionKey: keyof typeof TRANSITIONS,
  currentStatus: string
): { ok: true; nextStatus: UnitStatus } | { ok: false; error: string } {
  const rule = TRANSITIONS[actionKey];

  if (currentStatus !== rule.from) {
    return {
      ok: false,
      error: `Cannot ${rule.action}: unit is currently ${currentStatus}.`,
    };
  }

  return { ok: true, nextStatus: rule.to };
}