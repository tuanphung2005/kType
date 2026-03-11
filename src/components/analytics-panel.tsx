import { type AppProfile } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"

export function AnalyticsPanel({ profile }: { profile: AppProfile }) {
  const recent = profile.sessionHistory.slice(-20)
  const avgWpm = recent.length ? Math.round(recent.reduce((a, b) => a + b.wpm, 0) / recent.length) : 0
  const avgAcc = recent.length ? Math.round(recent.reduce((a, b) => a + b.accuracy, 0) / recent.length) : 0

  const chartData = profile.sessionHistory.map((s, i) => ({
    session: i + 1,
    wpm: s.wpm,
    accuracy: s.accuracy,
    date: new Date(s.timestamp).toLocaleDateString()
  }))

  const chartConfig = {
    wpm: {
      label: "WPM",
      color: "var(--color-primary)",
    },
    accuracy: {
      label: "Accuracy %",
      color: "var(--color-chart-2)",
    },
  } satisfies ChartConfig

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-4 sm:p-6 sm:gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Card className="bg-background/50">
          <CardHeader className="p-3 pb-1 sm:p-4 sm:pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Avg WPM</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0 text-2xl font-semibold sm:text-3xl">
            {avgWpm}
          </CardContent>
        </Card>
        <Card className="bg-background/50">
          <CardHeader className="p-3 pb-1 sm:p-4 sm:pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Avg Accuracy</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0 text-2xl font-semibold sm:text-3xl">
            {avgAcc}%
          </CardContent>
        </Card>
        <Card className="bg-background/50">
          <CardHeader className="p-3 pb-1 sm:p-4 sm:pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Current Streak</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0 text-2xl font-semibold sm:text-3xl text-primary">
            {profile.streak}
            <span className="text-base font-normal text-muted-foreground ml-1">days</span>
          </CardContent>
        </Card>
        <Card className="bg-background/50">
          <CardHeader className="p-3 pb-1 sm:p-4 sm:pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Max Streak</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0 text-2xl font-semibold sm:text-3xl">
            {profile.maxStreak}
            <span className="text-base font-normal text-muted-foreground ml-1">days</span>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 min-h-[250px] w-full bg-background/50 rounded-xl border p-4 sm:p-6 flex flex-col">
        <h3 className="text-sm font-medium mb-4">Performance Trends</h3>
        <div className="flex-1 min-h-0 w-full relative">
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="absolute inset-0 h-full w-full">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="session" 
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
                  domain={[0, 100]}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="wpm"
                  stroke="var(--color-wpm)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="accuracy"
                  stroke="var(--color-accuracy)"
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
