export default function SettingsLoading() {
  return (
    <div className="container max-w-2xl space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-[150px] animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-[250px] animate-pulse rounded-md bg-muted" />
      </div>

      {/* Password Change Card Skeleton */}
      <div className="rounded-lg border bg-card">
        <div className="p-6 space-y-2">
          <div className="h-6 w-[200px] animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-[300px] animate-pulse rounded-md bg-muted" />
        </div>
        <div className="p-6 space-y-4">
          {/* Password Form Fields */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            </div>
          ))}
          <div className="h-10 w-40 animate-pulse rounded-md bg-muted" />
        </div>
      </div>

      {/* Notifications Card Skeleton */}
      <div className="rounded-lg border bg-card">
        <div className="p-6 space-y-2">
          <div className="h-6 w-[150px] animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-[250px] animate-pulse rounded-md bg-muted" />
        </div>
        <div className="p-6 space-y-6">
          {/* Notification Settings */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                <div className="h-4 w-60 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-6 w-11 animate-pulse rounded-full bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Security Card Skeleton */}
      <div className="rounded-lg border bg-card">
        <div className="p-6 space-y-2">
          <div className="h-6 w-[100px] animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-[200px] animate-pulse rounded-md bg-muted" />
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-48 animate-pulse rounded bg-muted" />
              <div className="h-4 w-72 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-6 w-11 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </div>
    </div>
  )
}