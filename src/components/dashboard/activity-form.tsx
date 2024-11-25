"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon, Loader2, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface ActivityFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ActivityFormData) => Promise<void>
  isLoading?: boolean
}

export interface ActivityFormData {
  type: string
  title: string
  description: string
  date: Date
  location?: string
  metadata?: Record<string, any>
}

const activityTypes = [
  { value: "health", label: "Health Check", points: 50 },
  { value: "milestone", label: "Milestone", points: 100 },
  { value: "feeding", label: "Feeding", points: 20 },
  { value: "sleep", label: "Sleep", points: 30 },
  { value: "activity", label: "Activity", points: 25 },
  { value: "other", label: "Other", points: 15 }
]

export function ActivityForm({ open, onOpenChange, onSubmit, isLoading = false }: ActivityFormProps) {
  const [formData, setFormData] = useState<ActivityFormData>({
    type: "",
    title: "",
    description: "",
    date: new Date(),
  })
  const [showCalendar, setShowCalendar] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof ActivityFormData, string>>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ActivityFormData, string>> = {}

    if (!formData.type) newErrors.type = "Activity type is required"
    if (!formData.title) newErrors.title = "Title is required"
    if (!formData.description) newErrors.description = "Description is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      await onSubmit(formData)
      setFormData({
        type: "",
        title: "",
        description: "",
        date: new Date(),
      })
      setErrors({})
    } catch (error) {
      console.error(error)
    }
  }

  const selectedType = activityTypes.find(type => type.value === formData.type)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Log New Activity
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Record a new activity or milestone in your journey.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">
                Activity Type
                {errors.type && (
                  <span className="text-red-500 ml-2 text-sm">{errors.type}</span>
                )}
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => {
                  setFormData({ ...formData, type: value })
                  setErrors({ ...errors, type: undefined })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select activity type" />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{type.label}</span>
                        <Badge variant="purple">{type.points} pts</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">
                Title
                {errors.title && (
                  <span className="text-red-500 ml-2 text-sm">{errors.title}</span>
                )}
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value })
                  setErrors({ ...errors, title: undefined })
                }}
                placeholder="Enter activity title"
                className="dark:bg-gray-800"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="description">
                Description
                {errors.description && (
                  <span className="text-red-500 ml-2 text-sm">{errors.description}</span>
                )}
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value })
                  setErrors({ ...errors, description: undefined })
                }}
                placeholder="Enter activity description"
                className="dark:bg-gray-800"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label>Date</Label>
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  onClick={() => setShowCalendar(!showCalendar)}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(formData.date, "PPP")}
                </Button>
                <AnimatePresence>
                  {showCalendar && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="absolute z-50 mt-2 bg-white dark:bg-gray-800 rounded-md shadow-lg"
                    >
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => {
                          if (date) {
                            setFormData({ ...formData, date })
                            setShowCalendar(false)
                          }
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter location"
                className="dark:bg-gray-800"
                disabled={isLoading}
              />
            </div>

            {selectedType && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-700 dark:text-purple-300">
                    Points for this activity
                  </span>
                  <Badge variant="gradient">
                    {selectedType.points} points
                  </Badge>
                </div>
              </motion.div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700
                     dark:from-purple-500 dark:to-pink-500 dark:hover:from-purple-600 dark:hover:to-pink-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Activity'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
