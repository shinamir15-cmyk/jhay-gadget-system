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
    { label: "Total Units", value: stats.total, color: "bg-gray-800" },
    { label: "Available", value: stats.available, color: "bg-green-600" },
    { label: "Sold", value: stats.sold, color: "bg-blue-600" },
    { label: "Repair", value: stats.repair, color: "bg-amber-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">
        Live overview of your gadget inventory.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200"
          >
            <div className={`h-1 ${card.color}`} />
            <div className="p-5">
              <p className="text-sm font-medium text-gray-500">
                {card.label}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}