"use client"

import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Bell, Check, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Notification {
  id: number
  title: string
  message: string
  read?: boolean
  timestamp?: string
}

interface NotificationsDropdownProps {
  notifications: Notification[]
  onDismiss?: (id: number) => void
  onMarkAsRead?: (id: number) => void
}

export function NotificationsDropdown({
  notifications,
  onDismiss,
  onMarkAsRead
}: NotificationsDropdownProps) {
  const [open, setOpen] = useState(false)
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 relative"
        >
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"
              >
                {unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 bg-white dark:bg-gray-900 p-2"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</p>
            {unreadCount > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {unreadCount} unread
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
            No notifications
          </div>
        ) : (
          <div className="max-h-96 overflow-auto">
            <AnimatePresence>
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <DropdownMenuItem
                    className="flex flex-col items-start p-4 space-y-1 focus:bg-gray-50 dark:focus:bg-gray-800"
                  >
                    <div className="flex justify-between items-start w-full">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {notification.message}
                        </p>
                        {notification.timestamp && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {notification.timestamp}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && onMarkAsRead && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => onMarkAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4 text-green-500" />
                          </Button>
                        )}
                        {onDismiss && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => onDismiss(notification.id)}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </DropdownMenuItem>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}