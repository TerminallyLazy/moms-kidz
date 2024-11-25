"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Bold, Italic, List, Image as ImageIcon, 
  Link, Heading, Quote, Code, Loader2 
} from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import ContentUtils from '@/lib/content-utils'
import dynamic from 'next/dynamic'

// Dynamic import of TipTap editor to avoid SSR issues
const TipTapEditor = dynamic(() => import('@/components/ui/tiptap-editor'), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  ),
})

interface ArticleEditorProps {
  userId: string
  onArticleCreated?: () => void
}

export function ArticleEditor({ userId, onArticleCreated }: ArticleEditorProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState('')

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB')
        return
      }
      setCoverImage(file)
      toast.success('Cover image uploaded')
    }
  }

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault()
      if (tags.length >= 5) {
        toast.error('Maximum 5 tags allowed')
        return
      }
      if (tags.includes(currentTag.trim())) {
        toast.error('Tag already exists')
        return
      }
      setTags([...tags, currentTag.trim()])
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      let coverImageUrl = ''
      if (coverImage) {
        // Upload cover image to storage (implement your storage solution)
        coverImageUrl = await uploadImage(coverImage)
      }

      // Create article
      await ContentUtils.createArticle({
        userId,
        title: title.trim(),
        content,
        coverImage: coverImageUrl,
        metadata: {
          tags,
          readingTime: calculateReadingTime(content),
          wordCount: countWords(content)
        }
      })

      toast.success('Article published successfully')
      onArticleCreated?.()
      
      // Reset form
      setTitle('')
      setContent('')
      setCoverImage(null)
      setTags([])
    } catch (error) {
      toast.error('Failed to publish article')
      console.error('Article creation error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Implement this based on your storage solution (e.g., Supabase Storage)
  const uploadImage = async (file: File): Promise<string> => {
    // TODO: Implement image upload
    return 'image_url'
  }

  const calculateReadingTime = (text: string): number => {
    const wordsPerMinute = 200
    const words = countWords(text)
    return Math.ceil(words / wordsPerMinute)
  }

  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).length
  }

  return (
    <Card className="min-h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle>Write Article</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-4 flex-1">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter article title"
              className="text-lg"
            />
          </div>

          <div>
            <Label>Cover Image</Label>
            <div className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('cover-image')?.click()}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Upload Cover Image
              </Button>
              <input
                id="cover-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            {coverImage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2"
              >
                <img
                  src={URL.createObjectURL(coverImage)}
                  alt="Cover preview"
                  className="rounded-lg max-h-48 object-cover"
                />
              </motion.div>
            )}
          </div>

          <div className="flex-1">
            <Label>Content</Label>
            <div className="mt-2 border rounded-lg">
              <TipTapEditor
                content={content}
                onChange={setContent}
                className="min-h-[300px] prose dark:prose-invert max-w-none"
              />
            </div>
          </div>

          <div>
            <Label>Tags</Label>
            <div className="mt-2">
              <Input
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tags (press Enter)"
                maxLength={20}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 
                             text-purple-700 dark:text-purple-300 text-sm flex items-center"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-purple-500 hover:text-purple-700"
                    >
                      ×
                    </button>
                  </motion.span>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading || !title || !content}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              'Publish Article'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}