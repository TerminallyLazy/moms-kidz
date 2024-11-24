import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-[#27272a] text-white hover:bg-[#3f3f46] dark:hover:bg-[#18181b]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border-2 border-[#27272a] dark:border-slate-700 hover:bg-[#27272a] hover:text-white dark:hover:bg-slate-700",
        secondary:
          "bg-[#27272a]/10 text-[#27272a] hover:bg-[#27272a]/20 dark:text-slate-200 dark:hover:bg-slate-800",
        ghost: "hover:bg-[#27272a]/10 dark:hover:bg-slate-800 dark:text-slate-200",
        link: "underline-offset-4 hover:underline text-[#27272a] dark:text-slate-200",
        gradient: "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
