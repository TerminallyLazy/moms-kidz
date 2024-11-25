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
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { logger } from "@/lib/logger"

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  })
  const router = useRouter()
  const { signUp, signInWithProvider } = useAuth()

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true)
      logger.info('Attempting Google sign up')
      await signInWithProvider('google')
    } catch (error) {
      logger.error('Google sign up error:', error as Error)
      toast.error("Failed to sign up with Google")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      logger.info('Attempting email sign up', { email: formData.email, username: formData.username })
      
      await signUp(formData.email, formData.password, formData.username)
      
      logger.info('Sign up successful')
      toast.success("Sign up successful! Please check your email to verify your account.")
      router.push('/login')
    } catch (error) {
      logger.error('Email sign up error:', error as Error)
      toast.error("Failed to create account. Please try again.")
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
