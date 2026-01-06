import * as React from "react"
import { Area, AreaChart, ResponsiveContainer } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string
  /** Percentage change (e.g. 2.5) */
  trend: number
  /** Label for the trend (e.g. "vs last month") */
  trendLabel?: string
  /** Array of numbers for the chart sparkline */
  data: number[]
  className?: string
}

export function MetricCard({
  title,
  value,
  trend,
  trendLabel = "vs last month",
  data,
  className,
}: MetricCardProps) {
  // Format data for Recharts (it expects an array of objects)
  const chartData = data.map((val, i) => ({ i, value: val }))

  const isPositive = trend >= 0

  return (
    <Card className={cn("overflow-hidden border shadow-sm", className)}>
      <CardContent className="p-6 flex items-center justify-between h-full">
        
        {/* Left Side: Text Content */}
        <div className="flex flex-col gap-1 z-10 flex-1">
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
          <div className="text-2xl font-bold tracking-tight">
            {value}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <span 
              className={cn(
                "font-medium", 
                isPositive ? "text-emerald-600" : "text-rose-600"
              )}
            >
              {isPositive ? "+" : ""}{trend}%
            </span>
            <span>{trendLabel}</span>
          </div>
        </div>

        {/* Right Side: Sparkline Chart */}
        <div className="w-33.75 aspect-3/2 ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill={`url(#gradient-${title})`}
                fillOpacity={1}
                isAnimationActive={false} // Disable animation for instant loading
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

      </CardContent>
    </Card>
  )
}