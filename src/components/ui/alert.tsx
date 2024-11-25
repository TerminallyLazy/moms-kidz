"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-red-500/50 text-red-600 dark:border-red-500 [&>svg]:text-red-600 bg-red-50 dark:bg-red-900/10",
        success:
          "border-green-500/50 text-green-600 dark:border-green-500 [&>svg]:text-green-600 bg-green-50 dark:bg-green-900/10",
        warning:
          "border-yellow-500/50 text-yellow-600 dark:border-yellow-500 [&>svg]:text-yellow-600 bg-yellow-50 dark:bg-yellow-900/10",
        info:
          "border-blue-500/50 text-blue-600 dark:border-blue-500 [&>svg]:text-blue-600 bg-blue-50 dark:bg-blue-900/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof alertVariants> & {
      icon?: React.ReactNode
      onClose?: () => void
      animate?: boolean
    }
>(({ className, variant, children, icon, onClose, animate = true, ...props }, ref) => {
  const Icon = icon || {
    default: Info,
    destructive: XCircle,
    success: CheckCircle2,
    warning: AlertCircle,
    info: Info,
  }[variant || "default"]

  const alertContent = (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <Icon className="h-4 w-4" />
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <XCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  )

  if (animate) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {alertContent}
        </motion.div>
      </AnimatePresence>
    )
  }

  return alertContent
})
Alert.displayName = "Alert"

// Animated Alert List for multiple alerts
interface AlertListProps {
  alerts: {
    id: string | number
    message: string
    variant?: VariantProps<typeof alertVariants>["variant"]
    icon?: React.ReactNode
  }[]
  onDismiss?: (id: string | number) => void
}

function AlertList({ alerts, onDismiss }: AlertListProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
      <AnimatePresence mode="sync">
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <Alert
              variant={alert.variant}
              icon={alert.icon}
              onClose={onDismiss ? () => onDismiss(alert.id) : undefined}
              animate={false}
            >
              {alert.message}
            </Alert>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export { Alert, AlertList, alertVariants }