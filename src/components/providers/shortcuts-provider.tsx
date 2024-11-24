"use client"

import { useShortcuts } from "@/hooks/use-shortcuts"
import { useCommand } from "@/hooks/use-command"

export function ShortcutsProvider({ children }: { children: React.ReactNode }) {
  const { openCommandMenu, openShortcuts } = useCommand()

  // Initialize global shortcuts
  useShortcuts({
    onCommandPalette: openCommandMenu,
    onShortcutsDialog: openShortcuts,
  })

  return <>{children}</>
}

// Usage example in client-providers.tsx:
// <ShortcutsProvider>
//   <CommandMenu />
//   {children}
// </ShortcutsProvider>