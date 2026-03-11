import { type AppProfile } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"

export function AnalyticsPanel({ profile }: { profile: AppProfile }) {
  const recent = profile.sessionHistory.slice(-20)
  const avgWpm = recent.length ? Math.round(recent.reduce((a, b) => a + b.wpm, 0) / recent.length) : 0
  const avgAcc = recent.length ? Math.round(recent.reduce((a, b) => a + b.accuracy, 0) / recent.length) : 0

  // Group history by date
  const dailyStatsMap = new Map<string, { wpmSum: number, accSum: number, attempts: number }>()
  
  profile.sessionHistory.forEach(s => {
    const dateStr = new Date(s.timestamp).toLocaleDateString()
    const current = dailyStatsMap.get(dateStr) || { wpmSum: 0, accSum: 0, attempts: 0 }
    
    current.wpmSum += s.wpm
    current.accSum += s.accuracy
    current.attempts += 1
    
    dailyStatsMap.set(dateStr, current)
  })

  // Build chart data
  const chartData = Array.from(dailyStatsMap.entries())
    .map(([dateStr, stats]) => {
      // Find the corresponding datekey for profile.daily (YYYY-MM-DD or similar)
      // Since dateStr is localized, we just do a best-effort match, or better yet, since formatLocalDateKey was used for profile.daily:
    // const dateParts = dateStr.split(/[/.-]/) // very dirty but works for fallback
      
      // Let's iterate profile.daily and find the matching day to get exact XP.
      // Easiest is to just re-create dateKey format exactly like `formatLocalDateKey`
      const dateObj = new Date(dateStr)
      const year = dateObj.getFullYear()
      const month = String(dateObj.getMonth() + 1).padStart(2, "0")
      const day = String(dateObj.getDate()).padStart(2, "0")
      const dateKey = `${year}-${month}-${day}`
      
      const dailyRecord = profile.daily[dateKey]

      return {
        date: dateStr,
        timestamp: dateObj.getTime(), // For sorting
        wpm: Math.round(stats.wpmSum / stats.attempts),
        accuracy: Math.round(stats.accSum / stats.attempts),
        attempts: stats.attempts,
        xp: dailyRecord?.xp || 0
      }
    })
    .sort((a, b) => a.timestamp - b.timestamp)

  const chartConfig = {
    wpm: {
      label: "WPM",
      color: "var(--color-primary)",
    },
    accuracy: {
      label: "Accuracy %",
      color: "var(--color-chart-2)",
    },
    attempts: {
      label: "Attempts",
      color: "var(--color-chart-3)",
    },
    xp: {
      label: "XP Gained",
      color: "var(--color-chart-4)",
    }
  } satisfies ChartConfig

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-4 sm:p-6 sm:gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Card className="bg-background/50">
          <CardHeader className="p-3 pb-1 sm:p-4 sm:pb-2">
            <CardTitle className="text-xs text-muted-foreground tracking-wider">avg wpm</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0 text-2xl font-semibold sm:text-3xl">
            {avgWpm}
          </CardContent>
        </Card>
        <Card className="bg-background/50">
          <CardHeader className="p-3 pb-1 sm:p-4 sm:pb-2">
            <CardTitle className="text-xs text-muted-foreground tracking-wider">avg accuracy</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0 text-2xl font-semibold sm:text-3xl">
            {avgAcc}%
          </CardContent>
        </Card>
        <Card className="bg-background/50">
          <CardHeader className="p-3 pb-1 sm:p-4 sm:pb-2">
            <CardTitle className="text-xs text-muted-foreground tracking-wider">current streak</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0 text-2xl font-semibold sm:text-3xl text-primary">
            {profile.streak}
            <span className="text-base font-normal text-muted-foreground ml-1">days</span>
          </CardContent>
        </Card>
        <Card className="bg-background/50">
          <CardHeader className="p-3 pb-1 sm:p-4 sm:pb-2">
            <CardTitle className="text-xs text-muted-foreground tracking-wider">max streak</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0 text-2xl font-semibold sm:text-3xl">
            {profile.maxStreak}
            <span className="text-base font-normal text-muted-foreground ml-1">days</span>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 min-h-[250px] w-full bg-background/50 rounded-xl border p-4 sm:p-6 flex flex-col">
        <h3 className="text-sm font-medium mb-4">performance</h3>
        <div className="flex-1 min-h-0 w-full relative">
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="absolute inset-0 h-full w-full">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8}
                />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  yAxisId="left"
                  name="WPM"
                  type="monotone"
                  dataKey="wpm"
                  stroke="var(--color-wpm)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  name="Accuracy %"
                  type="monotone"
                  dataKey="accuracy"
                  stroke="var(--color-accuracy)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="left"
                  name="Attempts"
                  type="monotone"
                  dataKey="attempts"
                  stroke="var(--color-attempts)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  name="XP Gained"
                  type="monotone"
                  dataKey="xp"
                  stroke="var(--color-xp)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              complete more practice sessions to see your progress chart.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
