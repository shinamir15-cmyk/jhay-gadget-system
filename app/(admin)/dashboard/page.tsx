import { prisma } from "@/lib/prisma";

async function getStats() {
  const [total, available, sold, repair] = await Promise.all([
    prisma.inventoryUnit.count(),
    prisma.inventoryUnit.count({ where: { status: "IN_STOCK" } }),
    prisma.inventoryUnit.count({ where: { status: "SOLD" } }),
    prisma.inventoryUnit.count({ where: { status: "REPAIR" } }),
  ]);

  return { total, available, sold, repair };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: "Total Units", value: stats.total, edge: "bg-ink-950" },
    { label: "Available", value: stats.available, edge: "bg-teal-600" },
    { label: "Sold", value: stats.sold, edge: "bg-brand-600" },
    { label: "Repair", value: stats.repair, edge: "bg-amber-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink-950">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-600">
        Live overview of your gadget inventory.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="overflow-hidden rounded-lg bg-card shadow-sm ring-1 ring-ink-400/15"
          >
            <div className={`h-1 ${card.edge}`} />
            <div className="p-5">
              <p className="text-sm font-medium text-ink-600">{card.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-ink-950">
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}