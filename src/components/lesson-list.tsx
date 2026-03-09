import { CheckCircle2 } from "lucide-react"

import type { Lesson } from "@/data/lessons"

import { cn } from "@/lib/utils"

type LessonListProps = {
  lessons: Lesson[]
  selectedLessonId: string
  completedTodayIds: Set<string>
  lessonCompletions: Record<string, number>
  onSelect: (lessonId: string) => void
}

export function LessonList({
  lessons,
  selectedLessonId,
  completedTodayIds,
  lessonCompletions,
  onSelect,
}: LessonListProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {lessons.map((lesson) => {
        const isSelected = lesson.id === selectedLessonId
        const completionCount = lessonCompletions[lesson.id] ?? 0
        const completedToday = completedTodayIds.has(lesson.id)

        return (
          <button
            key={lesson.id}
            type="button"
            onClick={() => onSelect(lesson.id)}
            className={cn(
              "shrink-0 rounded-xl border px-3 py-2 text-left transition-colors",
              isSelected
                ? "border-primary/25 bg-card text-foreground shadow-sm"
                : "border-transparent bg-secondary/60 text-muted-foreground hover:bg-secondary"
            )}
          >
            <div className="flex items-center gap-2">
              <p className={cn("text-sm font-medium", !isSelected && "text-foreground/80")}>{lesson.text}</p>
              {completedToday ? <CheckCircle2 className="size-3.5 text-primary" /> : null}
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {lesson.title} · {completionCount > 0 ? `${completionCount}x` : `${lesson.xp} xp`}
            </p>
          </button>
        )
      })}
    </div>
  )
}