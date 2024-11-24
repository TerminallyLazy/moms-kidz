"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  LogOut,
  Moon,
  Sun,
  Search,
  Keyboard,
  Loader2,
  Tag,
  Trophy,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { useAuthContext } from "@/contexts/auth-context"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { useShortcuts, SHORTCUT_KEYS } from "@/hooks/use-shortcuts"
import { useCommand } from "@/hooks/use-command"
import { useSearch, type SearchableItem } from "@/hooks/use-search"
import { Badge } from "@/components/ui/badge"

interface CommandDialogProps extends DialogProps, React.PropsWithChildren {}

export function CommandMenu() {
  const { setTheme, theme } = useTheme()
  const router = useRouter()
  const { user, signOut } = useAuthContext()
  const {
    isOpen,
    setOpen,
    shortcutsOpen,
    setShortcutsOpen,
    openCommandMenu,
    closeCommandMenu,
  } = useCommand()

  // Use the shortcuts hook
  useShortcuts({
    onCommandPalette: openCommandMenu,
    onShortcutsDialog: () => setShortcutsOpen(true),
  })

  const {
    query,
    setQuery,
    items: searchResults,
    isLoading: isSearching,
    navigateToItem,
    clearSearch,
  } = useSearch()

  const runCommand = React.useCallback((command: () => void) => {
    closeCommandMenu()
    clearSearch()
    command()
  }, [closeCommandMenu, clearSearch])

  const renderShortcut = (keys: string[]) => (
    <CommandShortcut>
      {keys.map((key, i) => (
        <React.Fragment key={i}>
          {i > 0 && "+"}
          {key}
        </React.Fragment>
      ))}
    </CommandShortcut>
  )

  const renderSearchResult = (item: SearchableItem) => (
    <CommandItem
      key={`${item.type}-${item.id}`}
      onSelect={() => {
        navigateToItem(item)
        closeCommandMenu()
        clearSearch()
      }}
    >
      <div className="flex items-center gap-2">
        {getItemIcon(item)}
        <div className="flex flex-col">
          <span>{item.title}</span>
          {item.description && (
            <span className="text-xs text-muted-foreground">
              {item.description}
            </span>
          )}
        </div>
      </div>
      {item.category && (
        <Badge variant="secondary" className="ml-auto">
          <Tag className="w-3 h-3 mr-1" />
          {item.category}
        </Badge>
      )}
    </CommandItem>
  )

  const getItemIcon = (item: SearchableItem) => {
    switch (item.type) {
      case 'activity':
        return <Calendar className="w-4 h-4" />
      case 'achievement':
        return <Smile className="w-4 h-4" />
      case 'article':
        return <CreditCard className="w-4 h-4" />
      case 'challenge':
        return <Trophy className="w-4 h-4" />
      default:
        return <Search className="w-4 h-4" />
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={openCommandMenu}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
        >
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <span className="hidden md:inline-flex">Search...</span>
          <kbd className="pointer-events-none ml-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 md:inline-flex">
            {SHORTCUT_KEYS.COMMAND_PALETTE.join('+')}
          </kbd>
        </button>
        <KeyboardShortcuts />
      </div>
      <CommandDialog open={isOpen} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Type to search..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {isSearching ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              "No results found."
            )}
          </CommandEmpty>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <CommandGroup heading="Search Results">
              {searchResults.map(renderSearchResult)}
            </CommandGroup>
          )}

          {/* Show default commands when not searching */}
          {!query && (
            <>
              {user ? (
                <CommandGroup heading="Navigation">
                  <CommandItem onSelect={() => runCommand(() => router.push('/member'))}>
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </CommandItem>
                  <CommandItem onSelect={() => runCommand(() => router.push('/care-log'))}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Care Log
                    {renderShortcut([...SHORTCUT_KEYS.CARE_LOG])}
                  </CommandItem>
                  <CommandItem onSelect={() => runCommand(() => router.push('/activities'))}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Activities
                    {renderShortcut([...SHORTCUT_KEYS.ACTIVITIES])}
                  </CommandItem>
                  <CommandItem onSelect={() => runCommand(() => router.push('/achievements'))}>
                    <Smile className="mr-2 h-4 w-4" />
                    Achievements
                  </CommandItem>
                </CommandGroup>
              ) : (
                <CommandGroup heading="Authentication">
                  <CommandItem onSelect={() => runCommand(() => router.push('/login'))}>
                    Sign In
                  </CommandItem>
                  <CommandItem onSelect={() => runCommand(() => router.push('/signup'))}>
                    Sign Up
                  </CommandItem>
                </CommandGroup>
              )}
              <CommandSeparator />
              <CommandGroup heading="Settings">
                <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
                  <Sun className="mr-2 h-4 w-4" />
                  Light Mode
                  {renderShortcut([...SHORTCUT_KEYS.THEME])}
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark Mode
                  {renderShortcut([...SHORTCUT_KEYS.THEME])}
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => setShortcutsOpen(true))}>
                  <Keyboard className="mr-2 h-4 w-4" />
                  Keyboard Shortcuts
                  {renderShortcut([...SHORTCUT_KEYS.SHORTCUTS])}
                </CommandItem>
                {user && (
                  <>
                    <CommandItem onSelect={() => runCommand(() => router.push('/profile'))}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                      {renderShortcut([...SHORTCUT_KEYS.PROFILE])}
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => signOut())}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </CommandItem>
                  </>
                )}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
