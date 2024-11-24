"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FcGoogle } from "react-icons/fc"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from "sonner"

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  })
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })

      if (error) {
        toast.error("Failed to sign up with Google")
        console.error("Error:", error)
        return
      }

      if (!data.url) {
        toast.error("No redirect URL received")
        return
      }

      window.location.href = data.url
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)

      // First check if username is unique
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', formData.username)
        .single()

      if (existingUser) {
        toast.error("Username is already taken")
        setIsLoading(false)
        return
      }

      if (checkError && checkError.code !== 'PGRST116') {
        toast.error("Error checking username availability")
        setIsLoading(false)
        return
      }

      // Sign up with email/password
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        toast.error(error.message)
        return
      }

      if (!data?.user) {
        toast.error("No user data received")
        return
      }

      // Create profile entry
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            username: formData.username,
            email: formData.email,
          }
        ])

      if (profileError) {
        toast.error("Failed to create profile")
        return
      }

      toast.success("Sign up successful! Please check your email to verify your account.")
      router.push('/login')
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r dark:border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Image
            src="/mklogo.png"
            alt="Logo"
            width={40}
            height={40}
            className="mr-2"
          />
          Moms Kidz
        </div>
        <motion.div
          className="relative z-20 mt-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Start your journey with us and connect with fellow enthusiasts."
            </p>
          </blockquote>
        </motion.div>
      </div>
      <div className="lg:p-8 bg-white dark:bg-gray-950">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Card className="bg-white dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Create an account</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">Enter your details to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                variant="outline"
                onClick={handleGoogleSignUp}
                disabled={isLoading}
              >
                <FcGoogle className="mr-2 h-4 w-4" />
                Sign up with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t dark:border-gray-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground dark:bg-gray-900 dark:text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>

              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="dark:text-gray-200">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="dark:text-gray-200">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    required
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="dark:text-gray-200">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
                  />
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white dark:from-purple-500 dark:to-pink-500 dark:hover:from-purple-600 dark:hover:to-pink-600"
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center text-muted-foreground dark:text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline dark:text-purple-400 dark:hover:text-purple-300">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
