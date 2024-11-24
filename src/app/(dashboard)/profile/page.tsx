"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar } from "@/components/ui/avatar"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { useAuthContext } from "@/contexts/auth-context"
import { useProfile } from "@/hooks/use-profile"
import { toast } from "sonner"
import { Camera, Save, Trash, Trophy, User } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading"

function ProfileDashboard() {
  const { user, stats } = useAuthContext()
  const { profile, isLoading, updateProfile, uploadAvatar, deleteAvatar } = useProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: profile?.username || "",
    full_name: profile?.full_name || "",
  })

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { success, error } = await updateProfile(formData)

      if (!success) throw error

      toast.success("Profile updated successfully")
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const { success, error } = await uploadAvatar(file)

      if (!success) throw error

      toast.success("Avatar uploaded successfully")
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast.error("Failed to upload avatar")
    }
  }

  const handleDeleteAvatar = async () => {
    try {
      const { success, error } = await deleteAvatar()

      if (!success) throw error

      toast.success("Avatar removed successfully")
    } catch (error) {
      console.error("Error deleting avatar:", error)
      toast.error("Failed to remove avatar")
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <main className="container py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your profile details and avatar</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <Avatar className="w-20 h-20">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={profile.username}
                          className="object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10" />
                      )}
                    </Avatar>
                    {profile?.avatar_url && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handleDeleteAvatar}
                        type="button"
                        disabled={isLoading}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <Button variant="outline" className="relative" disabled={isLoading}>
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={isLoading}
                      />
                      {isLoading ? (
                        <LoadingSpinner className="mr-2" />
                      ) : (
                        <Camera className="w-4 h-4 mr-2" />
                      )}
                      Change Avatar
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      disabled={!isEditing || isLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      disabled={!isEditing || isLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  {isEditing ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <LoadingSpinner className="mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button type="button" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your Stats</CardTitle>
              <CardDescription>Your achievements and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Level</p>
                    <p className="text-2xl font-bold">{stats?.level || 1}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Points</p>
                  <p className="text-2xl font-bold">{stats?.totalPoints || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Achievements</p>
                  <p className="text-2xl font-bold">{stats?.achievements?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileDashboard />
    </ProtectedRoute>
  )
}
