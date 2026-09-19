import { prisma } from "@/lib/prisma";
import BranchRowActions from "./branch-row-actions";
import BranchForm from "./branch-form";

export const dynamic = "force-dynamic";

export default async function BranchesPage() {
  const branches = await prisma.branch.findMany({
    orderBy: [{ isMain: "desc" }, { name: "asc" }],
    include: { _count: { select: { units: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink-950">Branches</h1>
      <p className="mt-1 text-sm text-ink-600">
        Locations units can be shipped to.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-x-auto rounded-lg bg-card shadow-sm ring-1 ring-ink-400/15">
            <table className="min-w-full divide-y divide-ink-400/15 text-sm">
              <thead className="bg-surface">
                <tr>
                  {["Name", "Code", "Units Here", "Actions"].map((header) => (
                    <th key={header} className="px-4 py-3 text-left font-medium text-ink-600">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-400/10">
                {branches.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-ink-400">
                      No branches yet. Add one using the form.
                    </td>
                  </tr>
                ) : (
                  branches.map((branch) => (
                    <BranchRowActions key={branch.id} branch={branch} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <BranchForm />
      </div>
    </div>
  );
}