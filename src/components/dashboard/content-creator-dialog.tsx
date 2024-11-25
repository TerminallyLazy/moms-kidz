"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PodcastCreator } from './podcast-creator'
import { ArticleEditor } from './article-editor'
import { Mic, Newspaper } from 'lucide-react'

interface ContentCreatorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onContentCreated?: () => void
}

export function ContentCreatorDialog({
  open,
  onOpenChange,
  userId,
  onContentCreated
}: ContentCreatorDialogProps) {
  const [activeTab, setActiveTab] = useState<'podcast' | 'article'>('article')

  const handleContentCreated = () => {
    onContentCreated?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Content</DialogTitle>
        </DialogHeader>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'podcast' | 'article')}
          className="flex-1 flex flex-col"
        >
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="article" className="flex items-center space-x-2">
              <Newspaper className="h-4 w-4" />
              <span>Write Article</span>
            </TabsTrigger>
            <TabsTrigger value="podcast" className="flex items-center space-x-2">
              <Mic className="h-4 w-4" />
              <span>Record Podcast</span>
            </TabsTrigger>
          </TabsList>
          <div className="flex-1 overflow-hidden mt-4">
            <TabsContent value="article" className="h-full">
              <ArticleEditor 
                userId={userId} 
                onArticleCreated={handleContentCreated}
              />
            </TabsContent>
            <TabsContent value="podcast" className="h-full">
              <PodcastCreator 
                userId={userId} 
                onPodcastCreated={handleContentCreated}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// Add a button component for easy access
export function CreateContentButton({
  userId,
  onContentCreated
}: {
  userId: string
  onContentCreated?: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium 
                   transition-colors focus-visible:outline-none focus-visible:ring-1 
                   focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 
                   bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow hover:from-purple-700 
                   hover:to-pink-700 h-9 px-4 py-2"
      >
        Create Content
      </button>
      <ContentCreatorDialog
        open={open}
        onOpenChange={setOpen}
        userId={userId}
        onContentCreated={onContentCreated}
      />
    </>
  )
}