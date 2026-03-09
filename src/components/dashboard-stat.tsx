import type { LucideIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type DashboardStatProps = {
  title: string
  value: string
  hint: string
  icon: LucideIcon
  progress?: number
}

export function DashboardStat({
  title,
  value,
  hint,
  icon: Icon,
  progress,
}: DashboardStatProps) {
  return (
    <Card className="gap-4 rounded-[2rem] border-border/60 bg-card/90 backdrop-blur-sm">
      <CardHeader className="flex-row items-start justify-between gap-4 pb-0">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <CardTitle className="mt-2 text-2xl sm:text-3xl">{value}</CardTitle>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/80 p-2 text-muted-foreground">
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-6 text-sm text-muted-foreground">
        <p>{hint}</p>
        {typeof progress === "number" ? <Progress value={progress} /> : null}
      </CardContent>
    </Card>
  )
}