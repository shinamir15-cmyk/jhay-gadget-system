export default function DashboardLoading() {
  return (
    <div>
      <div className="h-7 w-40 animate-pulse rounded bg-ink-400/20" />
      <div className="mt-2 h-4 w-64 animate-pulse rounded bg-ink-400/20" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-ink-400/20" />
        ))}
      </div>
    </div>
  );
}