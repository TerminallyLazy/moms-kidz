"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart, LineChart, Line, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts'
import { 
  TrendingUp, Calendar, Clock, Activity,
  BarChart2, PieChart, RefreshCw, Loader2 
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import CareLogUtils from '@/lib/care-log-utils'

interface CareLogInsightsProps {
  userId: string
  className?: string
}

export function CareLogInsights({ userId, className = '' }: CareLogInsightsProps) {
  const [insights, setInsights] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month'>('week')

  useEffect(() => {
    fetchInsights()
  }, [userId])

  const fetchInsights = async () => {
    try {
      setIsLoading(true)
      const summary = await CareLogUtils.getCareLogSummary(userId)
      setInsights(summary)
    } catch (error) {
      console.error('Error fetching insights:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderTypeDistribution = (data: any) => {
    if (!data?.typeBreakdown) return null

    const chartData = Object.entries(data.typeBreakdown).map(([type, count]) => ({
      type,
      count
    }))

    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="count"
              fill="#8b5cf6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const renderTimeDistribution = (data: any) => {
    if (!data?.trends?.timeDistribution) return null

    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.trends.timeDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#8b5cf6"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const renderInsights = (data: any) => {
    if (!data?.insights?.length) return null

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        {data.insights.map((insight: string, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
          >
            <p className="text-sm text-purple-900 dark:text-purple-100">
              {insight}
            </p>
          </motion.div>
        ))}
      </motion.div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            <span>Care Log Insights</span>
          </CardTitle>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchInsights}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="day" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Today</span>
            </TabsTrigger>
            <TabsTrigger value="week" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Week</span>
            </TabsTrigger>
            <TabsTrigger value="month" className="flex items-center space-x-2">
              <BarChart2 className="h-4 w-4" />
              <span>Month</span>
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px]">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {insights && (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <Activity className="h-5 w-5 mr-2" />
                          Activity Distribution
                        </h3>
                        {renderTypeDistribution(insights[activeTab])}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <Clock className="h-5 w-5 mr-2" />
                          Time Distribution
                        </h3>
                        {renderTimeDistribution(insights[activeTab])}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <TrendingUp className="h-5 w-5 mr-2" />
                          Key Insights
                        </h3>
                        {renderInsights(insights[activeTab])}
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  )
}