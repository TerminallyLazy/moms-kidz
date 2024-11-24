"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Keyboard } from "lucide-react"
import { useShortcuts, SHORTCUT_KEYS } from "@/hooks/use-shortcuts"
import { useCommand } from "@/hooks/use-command"

interface ShortcutItemProps {
  keys: string[]
  description: string
}

function ShortcutItem({ keys, description }: ShortcutItemProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">
        {description}
      </span>
      <div className="flex items-center gap-1">
        {keys.map((key, keyIndex) => (
          <React.Fragment key={keyIndex}>
            <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 inline-flex">
              {key}
            </kbd>
            {keyIndex < keys.length - 1 && (
              <span className="text-muted-foreground">+</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export function KeyboardShortcuts() {
  const { shortcuts, isAuthenticated } = useShortcuts()
  const { shortcutsOpen, setShortcutsOpen } = useCommand()

  return (
    <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="relative group"
        >
          <Keyboard className="h-4 w-4" />
          <span className="sr-only">Keyboard shortcuts</span>
          <kbd className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-muted px-1.5 py-1 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            {SHORTCUT_KEYS.SHORTCUTS.join('+')}
          </kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Keyboard shortcuts to help you navigate the app faster.
            {!isAuthenticated && (
              <span className="block mt-2 text-yellow-500 dark:text-yellow-400">
                Note: Some shortcuts require you to be signed in.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {shortcuts.map((shortcut, index) => (
            <ShortcutItem
              key={index}
              keys={shortcut.keys}
              description={shortcut.description}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
