import { LoadingGrid } from "@/components/ui/loading"

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Skeleton for Welcome Section */}
      <div className="space-y-2">
        <div className="h-8 w-[250px] animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-[350px] animate-pulse rounded-md bg-muted" />
      </div>

      {/* Skeleton for Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6">
            <div className="space-y-2">
              <div className="h-4 w-[100px] animate-pulse rounded bg-muted" />
              <div className="h-8 w-[60px] animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton for Recent Activities */}
      <div className="space-y-4">
        <div className="h-6 w-[200px] animate-pulse rounded-md bg-muted" />
        <LoadingGrid count={3} />
      </div>

      {/* Skeleton for Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-10 animate-pulse rounded-md bg-muted"
          />
        ))}
      </div>

      {/* Skeleton for Account Info */}
      <div className="rounded-lg border bg-card">
        <div className="p-6 space-y-4">
          <div className="h-6 w-[150px] animate-pulse rounded bg-muted" />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-4 w-[80px] animate-pulse rounded bg-muted" />
              <div className="h-4 w-[120px] animate-pulse rounded bg-muted" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-[100px] animate-pulse rounded bg-muted" />
              <div className="h-4 w-[140px] animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}