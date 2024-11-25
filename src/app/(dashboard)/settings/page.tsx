"use client"

import { useState } from 'react'
import { SoundSettings } from '@/components/settings/sound-settings'
import { PrivacySettings } from '@/components/settings/privacy-settings'
import { GamificationSettings } from '@/components/settings/gamification-settings'
import { NotificationSettings } from '@/components/settings/notification-settings'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings,
  Volume2,
  Bell,
  Gamepad2,
  Shield,
  Sparkles
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const TABS = [
  {
    id: 'gamification',
    label: 'Gamification',
    icon: Gamepad2,
    color: 'text-green-500',
    component: GamificationSettings
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    color: 'text-blue-500',
    component: NotificationSettings
  },
  {
    id: 'sound',
    label: 'Sound',
    icon: Volume2,
    color: 'text-purple-500',
    component: SoundSettings
  },
  {
    id: 'privacy',
    label: 'Privacy',
    icon: Shield,
    color: 'text-red-500',
    component: PrivacySettings
  }
] as const

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<string>(TABS[0].id)

  return (
    <div className="container mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 space-y-2"
      >
        <div className="flex items-center space-x-2">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <p className="text-muted-foreground">
          Customize your gamification experience and privacy preferences
        </p>
      </motion.div>

      <Tabs 
        defaultValue={TABS[0].id} 
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-8"
      >
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <TabsList className="inline-flex h-auto w-full justify-start space-x-2 rounded-none border-b bg-transparent p-0">
            {TABS.map(({ id, label, icon: Icon, color }) => (
              <TabsTrigger
                key={id}
                value={id}
                className={`relative h-9 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground hover:text-foreground ${
                  activeTab === id ? 'border-primary text-foreground' : ''
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className={`h-4 w-4 ${activeTab === id ? color : ''}`} />
                  <span>{label}</span>
                </div>
                {activeTab === id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    initial={false}
                  />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="mt-4 space-y-4">
          <AnimatePresence mode="wait">
            {TABS.map(({ id, component: Component }) => (
              <TabsContent key={id} value={id} className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Component />
                </motion.div>
              </TabsContent>
            ))}
          </AnimatePresence>
        </div>
      </Tabs>

      {/* Settings Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-8 rounded-lg border p-4"
      >
        <div className="flex items-start space-x-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Personalization</p>
            <p className="text-sm text-muted-foreground">
              Your settings are automatically saved and synced across your devices.
              Changes take effect immediately.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
