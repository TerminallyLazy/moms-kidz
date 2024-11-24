"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

const socialMediaSchema = z.object({
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  pinterest: z.string().optional(),
  tiktok: z.string().optional(),
})

type SocialMediaValues = z.infer<typeof socialMediaSchema>

interface SocialMediaFormProps {
  initialValues?: {
    instagram?: string
    facebook?: string
    pinterest?: string
    tiktok?: string
  }
  onUpdate?: (values: SocialMediaValues) => void
}

export function SocialMediaForm({ initialValues, onUpdate }: SocialMediaFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<SocialMediaValues>({
    resolver: zodResolver(socialMediaSchema),
    defaultValues: initialValues || {
      instagram: "",
      facebook: "",
      pinterest: "",
      tiktok: "",
    },
  })

  async function onSubmit(values: SocialMediaValues) {
    setIsLoading(true)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error("Not authenticated")

      const { error } = await supabase
        .from("profiles")
        .update({
          social_media: values,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      toast.success("Social media handles updated")
      onUpdate?.(values)
    } catch (error) {
      console.error("Error updating social media:", error)
      toast.error("Failed to update social media handles")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="instagram"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instagram Username</FormLabel>
              <FormControl>
                <Input placeholder="username" {...field} />
              </FormControl>
              <FormDescription>
                Your Instagram username without the @ symbol
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="facebook"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Facebook Page ID</FormLabel>
              <FormControl>
                <Input placeholder="page-name" {...field} />
              </FormControl>
              <FormDescription>
                Your Facebook page ID or username
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pinterest"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pinterest Username</FormLabel>
              <FormControl>
                <Input placeholder="username" {...field} />
              </FormControl>
              <FormDescription>
                Your Pinterest username
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tiktok"
          render={({ field }) => (
            <FormItem>
              <FormLabel>TikTok Username</FormLabel>
              <FormControl>
                <Input placeholder="@username" {...field} />
              </FormControl>
              <FormDescription>
                Your TikTok username with or without the @ symbol
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Updating..." : "Save Social Media Handles"}
        </Button>
      </form>
    </Form>
  )
}
