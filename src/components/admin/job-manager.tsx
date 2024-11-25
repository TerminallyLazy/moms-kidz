"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Play, Pause, RefreshCw, Power, PowerOff, 
  Clock, AlertCircle, CheckCircle, Loader2 
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

interface JobStatus {
  name: string
  enabled: boolean
  status: 'idle' | 'running' | 'failed'
  lastRun?: string
  nextRun?: string
  error?: string
}

export function JobManager() {
  const [jobs, setJobs] = useState<Record<string, JobStatus>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [interval, setInterval] = useState<string>('')

  useEffect(() => {
    fetchJobStatus()
    const refreshInterval = setInterval(fetchJobStatus, 30000) // Refresh every 30s
    return () => clearInterval(refreshInterval)
  }, [])

  const fetchJobStatus = async () => {
    try {
      const response = await fetch('/api/jobs')
      if (!response.ok) throw new Error('Failed to fetch job status')
      const data = await response.json()
      setJobs(data)
    } catch (error) {
      toast.error('Failed to fetch job status')
      console.error('Error fetching job status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const controlJob = async (action: string, job: string) => {
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action, 
          job,
          ...(action === 'update-interval' ? { interval: parseInt(interval) } : {})
        })
      })

      if (!response.ok) throw new Error('Failed to control job')
      
      const data = await response.json()
      setJobs(prev => ({
        ...prev,
        ...(job === 'all' ? data : { [job]: data })
      }))

      toast.success(`Job ${action} successful`)
    } catch (error) {
      toast.error(`Failed to ${action} job`)
      console.error('Error controlling job:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-green-500'
      case 'failed':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'failed':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Background Jobs</CardTitle>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => controlJob('start', 'all')}
            >
              <Play className="h-4 w-4 mr-2" />
              Start All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => controlJob('stop', 'all')}
            >
              <Pause className="h-4 w-4 mr-2" />
              Stop All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchJobStatus}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(jobs).map(([name, job]) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={getStatusColor(job.status)}>
                          {getStatusIcon(job.status)}
                        </span>
                        <h3 className="font-medium">{name}</h3>
                      </div>
                      <div className="space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => controlJob(job.enabled ? 'disable' : 'enable', name)}
                        >
                          {job.enabled ? (
                            <Power className="h-4 w-4 text-green-500" />
                          ) : (
                            <PowerOff className="h-4 w-4 text-red-500" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => controlJob(job.status === 'running' ? 'stop' : 'start', name)}
                          disabled={!job.enabled}
                        >
                          {job.status === 'running' ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedJob(selectedJob === name ? null : name)}
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500 space-y-1">
                      {job.lastRun && (
                        <p>Last Run: {new Date(job.lastRun).toLocaleString()}</p>
                      )}
                      {job.nextRun && (
                        <p>Next Run: {new Date(job.nextRun).toLocaleString()}</p>
                      )}
                      {job.error && (
                        <p className="text-red-500">Error: {job.error}</p>
                      )}
                    </div>

                    <AnimatePresence>
                      {selectedJob === name && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 overflow-hidden"
                        >
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              placeholder="Interval (ms)"
                              value={interval}
                              onChange={(e) => setInterval(e.target.value)}
                              className="w-40"
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                controlJob('update-interval', name)
                                setSelectedJob(null)
                                setInterval('')
                              }}
                              disabled={!interval}
                            >
                              Update Interval
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}