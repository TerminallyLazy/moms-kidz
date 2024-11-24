"use client"

import { create } from 'zustand'

interface CommandStore {
  isOpen: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
  shortcutsOpen: boolean
  setShortcutsOpen: (open: boolean) => void
  toggleShortcuts: () => void
}

export const useCommandStore = create<CommandStore>((set) => ({
  isOpen: false,
  setOpen: (open) => set({ isOpen: open }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  shortcutsOpen: false,
  setShortcutsOpen: (open) => set({ shortcutsOpen: open }),
  toggleShortcuts: () => set((state) => ({ shortcutsOpen: !state.shortcutsOpen })),
}))

export function useCommand() {
  const {
    isOpen,
    setOpen,
    toggle,
    shortcutsOpen,
    setShortcutsOpen,
    toggleShortcuts,
  } = useCommandStore()

  const openCommandMenu = () => setOpen(true)
  const closeCommandMenu = () => setOpen(false)
  const openShortcuts = () => setShortcutsOpen(true)
  const closeShortcuts = () => setShortcutsOpen(false)

  return {
    isOpen,
    setOpen,
    toggle,
    openCommandMenu,
    closeCommandMenu,
    shortcutsOpen,
    setShortcutsOpen,
    toggleShortcuts,
    openShortcuts,
    closeShortcuts,
  }
}