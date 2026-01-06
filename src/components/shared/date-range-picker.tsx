import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
  className?: string
}

export function DateRangePicker({ date, setDate, className }: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            // 1. Added 'w-full' to ensure it takes the available width of the parent wrapper
            className={cn(
              "w-full justify-start text-left font-normal h-full", 
              !date && "text-muted-foreground",
              className
            )}
          >
            {/* 2. Added 'shrink-0' to prevent the icon from being squashed */}
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            
            {/* 3. Wrapped text in a span with 'truncate' to handle the ellipsis */}
            <span className="truncate">
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "MM/dd/yyyy")} - {format(date.to, "MM/dd/yyyy")}
                  </>
                ) : (
                  format(date.from, "MM/dd/yyyy")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}