export default function LoginLoading() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        {/* Skeleton for title and description */}
        <div className="flex flex-col space-y-2 text-center">
          <div className="h-8 w-[200px] animate-pulse rounded-md bg-muted mx-auto" />
          <div className="h-4 w-[300px] animate-pulse rounded-md bg-muted mx-auto" />
        </div>

        <div className="grid gap-6">
          {/* Skeleton for form */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <div className="h-4 w-[40px] animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            </div>
            <div className="grid gap-2">
              <div className="h-4 w-[70px] animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            </div>
            <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
          </div>

          {/* Skeleton for divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <div className="h-4 w-[120px] animate-pulse rounded bg-muted" />
            </div>
          </div>

          {/* Skeleton for social buttons */}
          <div className="grid gap-2">
            <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
          </div>
        </div>

        {/* Skeleton for sign up link */}
        <div className="h-4 w-[250px] animate-pulse rounded bg-muted mx-auto" />
      </div>
    </div>
  )
}