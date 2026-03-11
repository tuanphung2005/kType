import { cn } from "@/lib/utils"
import type { SyllableFeedback } from "@/lib/typing"

type PhraseDisplayProps = {
  feedback: SyllableFeedback[]
  resolvedActiveSyllableIndex: number
}

export function PhraseDisplay({ feedback, resolvedActiveSyllableIndex }: PhraseDisplayProps) {
  return (
    <div className="flex min-h-0 w-full max-w-4xl shrink-0 flex-wrap items-end justify-center gap-x-0 gap-y-1 pb-1 sm:min-h-[4rem] sm:gap-y-1.5 sm:pb-2">
      {feedback.map((syllable, syllableIndex) => {
        const isActiveSyllable = syllableIndex === resolvedActiveSyllableIndex
        const isSpace = syllable.character === " "
        const allCorrect = syllable.jamo.every((j) => j.state === "correct")
        const anyIncorrect = syllable.jamo.some((j) => j.state === "incorrect")
        const allPending = syllable.jamo.every((j) => j.state === "pending")

        // Space between words
        if (isSpace) {
          return (
            <span
              key={`space-${syllableIndex}`}
              className={cn(
                "flex w-2 items-center justify-center text-sm sm:w-2.5",
                allCorrect && "text-primary/40",
                anyIncorrect && "text-destructive/40",
                allPending && "text-muted-foreground/20",
                isActiveSyllable && "text-foreground/50"
              )}
            >
              ·
            </span>
          )
        }

        return (
          <span
            key={`syl-${syllableIndex}`}
            className={cn(
              "inline-flex items-center justify-center rounded-lg px-0.5 py-0.5 transition-colors sm:px-1 sm:py-1",
              isActiveSyllable && "border border-primary/45 bg-primary/10 shadow-[0_0_0_1px_color-mix(in_oklch,var(--color-primary)_18%,transparent)]",
              !isActiveSyllable && allCorrect && "border border-primary/15 bg-primary/5",
              !isActiveSyllable && anyIncorrect && "border border-destructive/20 bg-destructive/5",
              !isActiveSyllable && allPending && "border border-transparent",
            )}
          >
            <span
              className={cn(
                "text-xl leading-none transition-colors sm:text-2xl",
                isActiveSyllable && "text-foreground",
                allCorrect && !isActiveSyllable && "text-foreground",
                anyIncorrect && "text-destructive",
                !allCorrect && !anyIncorrect && !allPending && "text-foreground/70",
                allPending && "text-muted-foreground/35",
              )}
            >
              {syllable.character}
            </span>
          </span>
        )
      })}
    </div>
  )
}
