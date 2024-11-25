export default function ProfileLoading() {
  return (
    <div className="container max-w-2xl space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-[150px] animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-[250px] animate-pulse rounded-md bg-muted" />
      </div>

      {/* Profile Information Card Skeleton */}
      <div className="rounded-lg border bg-card">
        <div className="p-6 space-y-2">
          <div className="h-6 w-[200px] animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-[300px] animate-pulse rounded-md bg-muted" />
        </div>
        <div className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full animate-pulse bg-muted" />
            <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            </div>

            {/* Submit Button */}
            <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      </div>

      {/* Danger Zone Card Skeleton */}
      <div className="rounded-lg border border-destructive">
        <div className="p-6 space-y-2">
          <div className="h-6 w-[150px] animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-[250px] animate-pulse rounded-md bg-muted" />
        </div>
        <div className="p-6 space-y-4">
          <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-[300px] animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    </div>
  )
}