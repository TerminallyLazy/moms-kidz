"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    activityReminders: true,
    weeklyDigest: true,
    twoFactorAuth: false,
  })

  if (!user) return null

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const currentPassword = (form.elements.namedItem('currentPassword') as HTMLInputElement).value
    const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value
    const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value

    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match")
      return
    }

    try {
      setIsLoading(true)
      // TODO: Implement password change
      toast.success("Password changed successfully")
      form.reset()
    } catch (error) {
      console.error("Error changing password:", error)
      toast.error("Failed to change password")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSettingChange = (setting: keyof typeof settings) => {
    setSettings(prev => {
      const newSettings = { ...prev, [setting]: !prev[setting] }
      // TODO: Save settings to backend
      toast.success("Settings updated")
      return newSettings
    })
  }

  return (
    <div className="container max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Configure how you want to receive notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive activity updates via email
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={() => handleSettingChange('emailNotifications')}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications on your device
              </p>
            </div>
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={() => handleSettingChange('pushNotifications')}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Activity Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminded about logging activities
              </p>
            </div>
            <Switch
              checked={settings.activityReminders}
              onCheckedChange={() => handleSettingChange('activityReminders')}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Digest</Label>
              <p className="text-sm text-muted-foreground">
                Receive a weekly summary of activities
              </p>
            </div>
            <Switch
              checked={settings.weeklyDigest}
              onCheckedChange={() => handleSettingChange('weeklyDigest')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Manage your account security settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              checked={settings.twoFactorAuth}
              onCheckedChange={() => handleSettingChange('twoFactorAuth')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}