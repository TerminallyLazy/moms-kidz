import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md px-3 py-2 text-sm",
          "bg-white dark:bg-slate-950",
          "border-2 border-slate-200 dark:border-slate-800",
          "ring-offset-white dark:ring-offset-slate-950",
          "placeholder:text-slate-500 dark:placeholder:text-slate-400",
          "hover:border-slate-300 dark:hover:border-slate-700",
          "focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-800",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-200",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
