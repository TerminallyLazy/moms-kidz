"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { useGamification } from "@/contexts/gamification-context"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Baby, Heart, Moon, Utensils, Activity, 
  Plus, Clock, Calendar as CalendarIcon,
  Search, Filter, Loader2 
} from "lucide-react"
import { format } from 'date-fns'
import { toast } from "sonner"

interface CareLogEntry {
  id: string
  type: 'health' | 'sleep' | 'feeding' | 'milestone' | 'activity'
  title: string
  description: string
  timestamp: Date
  duration?: number
  metadata?: any
}

export function CareLog() {
  const { trackActivity } = useGamification()
  const [entries, setEntries] = useState<CareLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [activeTab, setActiveTab] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [newEntry, setNewEntry] = useState<Partial<CareLogEntry>>({
    type: 'activity',
    timestamp: new Date()
  })

  useEffect(() => {
    fetchEntries()
  }, [selectedDate, activeTab])

  const fetchEntries = async () => {
    try {
      setIsLoading(true)
      // Fetch entries from your API/database
      const response = await fetch(`/api/care-log?date=${selectedDate.toISOString()}&type=${activeTab}`)
      const data = await response.json()
      setEntries(data)
    } catch (error) {
      toast.error('Failed to fetch care log entries')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddEntry = async () => {
    try {
      if (!newEntry.title || !newEntry.type) {
        toast.error('Please fill in all required fields')
        return
      }

      setIsLoading(true)
      // Add entry to your API/database
      const response = await fetch('/api/care-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      })

      if (!response.ok) throw new Error('Failed to add entry')

      const addedEntry = await response.json()
      setEntries(prev => [addedEntry, ...prev])
      
      // Track activity for gamification
      await trackActivity(`care_log_${newEntry.type}`, {
        entryId: addedEntry.id,
        type: newEntry.type
      })

      toast.success('Care log entry added successfully')
      setIsAddingEntry(false)
      setNewEntry({ type: 'activity', timestamp: new Date() })
    } catch (error) {
      toast.error('Failed to add care log entry')
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'health':
        return <Heart className="h-4 w-4" />
      case 'sleep':
        return <Moon className="h-4 w-4" />
      case 'feeding':
        return <Utensils className="h-4 w-4" />
      case 'milestone':
        return <Baby className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const filteredEntries = entries.filter(entry => {
    if (!searchQuery) return true
    return (
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Care Log</CardTitle>
          <Button
            onClick={() => setIsAddingEntry(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setSelectedDate(new Date())}>
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="sleep">Sleep</TabsTrigger>
            <TabsTrigger value="feeding">Feeding</TabsTrigger>
            <TabsTrigger value="milestone">Milestones</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {filteredEntries.map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                            {getTypeIcon(entry.type)}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {entry.title}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {entry.description}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {format(new Date(entry.timestamp), 'h:mm a')}
                              </span>
                              {entry.duration && (
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {entry.duration} min
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </Tabs>
      </CardContent>

      {/* Add Entry Dialog */}
      <AnimatePresence>
        {isAddingEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold mb-4">Add Care Log Entry</h3>
              <div className="space-y-4">
                <div>
                  <Label>Type</Label>
                  <select
                    value={newEntry.type}
                    onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value as any })}
                    className="w-full mt-1 rounded-md border border-gray-300 dark:border-gray-700"
                  >
                    <option value="health">Health</option>
                    <option value="sleep">Sleep</option>
                    <option value="feeding">Feeding</option>
                    <option value="milestone">Milestone</option>
                    <option value="activity">Activity</option>
                  </select>
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newEntry.title || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                    placeholder="Enter title"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={newEntry.description || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                    placeholder="Enter description"
                  />
                </div>
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={newEntry.duration || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, duration: parseInt(e.target.value) })}
                    placeholder="Enter duration"
                  />
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingEntry(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddEntry}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Entry'
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}