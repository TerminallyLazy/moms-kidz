"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, Search, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ActivityFilterProps {
  types: string[]
  onFilterChange: (filters: {
    search: string
    type: string | null
    dateRange: { from: Date | null; to: Date | null }
  }) => void
}

export function ActivityFilter({ types, onFilterChange }: ActivityFilterProps) {
  const [search, setSearch] = useState("")
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [date, setDate] = useState<{
    from: Date | null
    to: Date | null
  }>({
    from: null,
    to: null,
  })

  const handleSearchChange = (value: string) => {
    setSearch(value)
    onFilterChange({ search: value, type: selectedType, dateRange: date })
  }

  const handleTypeSelect = (type: string) => {
    const newType = selectedType === type ? null : type
    setSelectedType(newType)
    onFilterChange({ search, type: newType, dateRange: date })
  }

  const handleDateChange = (range: { from: Date | null; to: Date | null }) => {
    setDate(range)
    onFilterChange({ search, type: selectedType, dateRange: range })
  }

  const clearFilters = () => {
    setSearch("")
    setSelectedType(null)
    setDate({ from: null, to: null })
    onFilterChange({ search: "", type: null, dateRange: { from: null, to: null } })
  }

  return (
    <Card className="bg-white dark:bg-gray-900">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder="Search activities..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Type filters */}
          <div className="flex flex-wrap gap-2">
            {types.map((type) => (
              <Badge
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => handleTypeSelect(type)}
              >
                {type}
              </Badge>
            ))}
          </div>

          {/* Date Range Picker */}
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !date.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date.from}
                  selected={date}
                  onSelect={handleDateChange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            {/* Clear Filters */}
            {(search || selectedType || date.from) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFilters}
                className="h-9 w-9"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}