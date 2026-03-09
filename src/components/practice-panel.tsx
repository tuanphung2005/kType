import * as React from "react"

import type { Lesson } from "@/data/lessons"
import type { SyllableFeedback } from "@/lib/typing"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PracticePanelProps = {
  captureRef: React.RefObject<HTMLInputElement | null>
  isCaptureActive: boolean
  lesson: Lesson
  inputValue: string
  typedValue: string
  inputMode: "hangul" | "keys"
  accuracy: number
  progress: number
  feedback: SyllableFeedback[]
  potentialXp: number
  isComplete: boolean
  targetKeyGuide: string
  onActivateCapture: () => void
  onCaptureBlur: () => void
  onCaptureFocus: () => void
  onChange: (value: string) => void
  onClear: () => void
  onSubmit: () => void
}

export function PracticePanel({
  captureRef,
  isCaptureActive,
  lesson,
  inputValue,
  typedValue,
  inputMode,
  accuracy,
  progress,
  feedback,
  potentialXp,
  isComplete,
  targetKeyGuide,
  onActivateCapture,
  onCaptureBlur,
  onCaptureFocus,
  onChange,
  onClear,
  onSubmit,
}: PracticePanelProps) {
  const typedLength = Array.from(typedValue).length

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const target = event.target

    if (target instanceof HTMLElement && target.closest("button")) {
      return
    }

    onActivateCapture()
  }

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col rounded-2xl border border-border/60 bg-card/80"
      onPointerDown={handlePointerDown}
    >
      <input
        ref={captureRef}
        value={inputValue}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onCaptureBlur}
        onFocus={onCaptureFocus}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        aria-label="Hidden typing capture"
        className="absolute h-px w-px opacity-0 pointer-events-none"
      />

      {/* Main typing area */}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 px-4 py-6 sm:px-8">
        <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
          {isCaptureActive ? "typing" : "click or press any key to start"} · {lesson.translation}
        </p>

        {/* Phrase display — composed syllables with jamo progress dots */}
        <div className="flex max-w-4xl flex-wrap items-end justify-center gap-x-1.5 gap-y-3">
          {feedback.map((syllable, syllableIndex) => {
            const isActiveSyllable = syllableIndex === typedLength
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
                    "flex h-12 w-3 items-center justify-center text-sm sm:h-14",
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
                  "inline-flex flex-col items-center gap-1 rounded-lg border px-2 py-1.5 transition-colors",
                  isActiveSyllable && "border-primary/40 bg-primary/8",
                  !isActiveSyllable && allCorrect && "border-primary/15 bg-primary/5",
                  !isActiveSyllable && anyIncorrect && "border-destructive/20 bg-destructive/5",
                  !isActiveSyllable && allPending && "border-transparent",
                )}
              >
                {/* Composed syllable character */}
                <span
                  className={cn(
                    "text-2xl leading-none transition-colors sm:text-3xl",
                    allCorrect && "text-foreground",
                    anyIncorrect && "text-destructive",
                    !allCorrect && !anyIncorrect && !allPending && "text-foreground/70",
                    allPending && "text-muted-foreground/35",
                  )}
                >
                  {syllable.character}
                </span>
                {/* Jamo progress dots */}
                <span className="flex gap-1">
                  {syllable.jamo.map((item, jamoIndex) => (
                    <span
                      key={`dot-${jamoIndex}`}
                      className={cn(
                        "h-1 w-1 rounded-full transition-colors",
                        item.state === "correct" && "bg-primary",
                        item.state === "incorrect" && "bg-destructive",
                        item.state === "pending" && "bg-muted-foreground/25",
                      )}
                    />
                  ))}
                </span>
              </span>
            )
          })}
        </div>

        {/* Key guide when using English keys */}
        {inputMode === "keys" ? (
          <p className="max-w-xl text-center font-mono text-xs tracking-[0.2em] text-muted-foreground sm:text-sm">
            {targetKeyGuide}
          </p>
        ) : null}

        {/* Stats line */}
        {typedValue ? (
          <p className="text-xs text-muted-foreground">
            {accuracy}% · {progress}%{isComplete ? " · ✓" : ""} · +{potentialXp} xp
          </p>
        ) : null}
      </div>

      {/* Compact footer */}
      <div className="flex items-center justify-between gap-2 border-t border-border/50 px-4 py-2">
        <p className="text-[11px] text-muted-foreground/60">
          {inputMode === "keys" ? "english keys → hangul" : "korean keyboard detected"}
        </p>
        <div className="flex items-center gap-2">
          {typedValue ? (
            <Button variant="ghost" size="sm" className="h-7 rounded-full px-2 text-xs" onClick={onClear}>
              esc
            </Button>
          ) : null}
          <Button
            size="sm"
            className="h-7 rounded-full px-3 text-xs"
            onClick={onSubmit}
            disabled={!typedValue.trim()}
          >
            {isComplete ? "complete ↵" : "save ↵"}
          </Button>
        </div>
      </div>
    </div>
  )
}
