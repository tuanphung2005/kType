import * as React from "react"

import type { Lesson } from "@/data/lessons"
import { type SyllableFeedback, getNextExpectedKey } from "@/lib/typing"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { KeyboardReference } from "@/components/practice-keyboard"
import { PhraseDisplay } from "@/components/phrase-display"

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
  hasInputMismatch: boolean
  showWrongInputIndicator: boolean
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
  lesson,
  inputValue,
  typedValue,
  inputMode,
  accuracy,
  progress,
  feedback,
  potentialXp,
  isComplete,
  hasInputMismatch,
  showWrongInputIndicator,
  targetKeyGuide,
  onActivateCapture,
  onCaptureBlur,
  onCaptureFocus,
  onChange,
  onClear,
  onSubmit,
}: PracticePanelProps) {
  const activeSyllableIndex = feedback.findIndex((syllable) =>
    syllable.jamo.some((item) => item.state !== "correct")
  )
  const resolvedActiveSyllableIndex = activeSyllableIndex === -1 ? Math.max(feedback.length - 1, 0) : activeSyllableIndex
  const activeSyllable = feedback[resolvedActiveSyllableIndex]
  const nextPendingStroke = activeSyllable?.jamo.find((item) => item.state === "pending") ?? null
  const totalStrokeCount = feedback.reduce((count, syllable) => count + syllable.jamo.length, 0)
  const completedStrokeCount = feedback.reduce(
    (count, syllable) => count + syllable.jamo.filter((item) => item.state === "correct").length,
    0
  )
  const showActiveGuide = Boolean(activeSyllable && activeSyllable.character !== " ")
  const activeGuideMessage = !showActiveGuide
    ? "keep typing to see the current syllable guidance."
    : showWrongInputIndicator
      ? "wrong key."
      : hasInputMismatch
        ? "wrong input is ignored. keep pressing the highlighted key."
        : nextPendingStroke
          ? `next stroke: ${nextPendingStroke.jamo}`
          : activeSyllable.jamo.some((item) => item.state === "incorrect")
            ? "current syllable has an incorrect stroke. fix it before moving on."
            : "complete."
  const nextExpectedKey = inputMode === "keys" ? getNextExpectedKey(targetKeyGuide, inputValue) : null

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
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-2 py-2 sm:gap-4 sm:px-4 sm:py-4 overflow-y-auto">
        <p className="w-full max-w-3xl shrink-0 truncate text-center text-[10px] tracking-[0.2em] text-muted-foreground uppercase sm:text-[11px]">
          {lesson.translation}
        </p>

        {/* Phrase display — active character highlight only */}
        <PhraseDisplay feedback={feedback} resolvedActiveSyllableIndex={resolvedActiveSyllableIndex} />

        <div
          className={cn(
            "flex min-h-0 w-full max-w-xl shrink-0 flex-col gap-1.5 rounded-2xl border border-border/60 bg-background/70 px-3 py-2 transition-opacity sm:gap-2 sm:px-4 sm:py-3",
            !showActiveGuide && "opacity-60"
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {showWrongInputIndicator ? <span className="text-[11px] text-destructive">wrong key</span> : null}
              <p className="text-[11px] text-muted-foreground">
                {completedStrokeCount}/{totalStrokeCount} strokes correct
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-card text-xl sm:h-12 sm:w-12 sm:text-2xl">
              {showActiveGuide ? activeSyllable.character : "·"}
            </span>
            <div className="flex min-w-0 flex-1 flex-wrap gap-2">
              {(showActiveGuide ? activeSyllable.jamo : [{ jamo: "-", state: "pending" as const }]).map((item, index) => {
                const isNext =
                  showActiveGuide && item.state === "pending" && nextPendingStroke?.jamo === item.jamo

                return (
                  <span
                    key={`active-jamo-${index}`}
                    className={cn(
                      "inline-flex h-7 min-w-7 items-center justify-center rounded-full border px-1.5 text-xs font-semibold leading-none transition-colors sm:h-8 sm:min-w-8 sm:px-2 sm:text-sm",
                      item.state === "correct" && "border-primary/25 bg-primary/10 text-primary",
                      item.state === "incorrect" && "border-destructive/30 bg-destructive/10 text-destructive",
                      item.state === "pending" && "border-border/60 bg-card text-muted-foreground",
                      isNext && "border-primary/35 bg-primary/8 text-foreground"
                    )}
                  >
                    {item.jamo}
                  </span>
                )
              })}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {activeGuideMessage}
          </p>
        </div>

        <div className="flex w-full min-h-0 shrink-0 flex-col items-center gap-1 sm:gap-2">
          <div className="flex w-full max-w-2xl items-center justify-between gap-3 px-1">
            <p className="text-[11px] text-muted-foreground">
              {hasInputMismatch
                ? "wrong keys are ignored"
                : inputMode === "keys"
                  ? nextExpectedKey
                    ? ``
                    : ""
                  : "keyboard hint disabled while Hangul IME input is active"}
            </p>
          </div>
          <KeyboardReference activeKey={nextExpectedKey} dimmed={inputMode !== "keys"} />
        </div>

        {/* Stats line */}
        <p className={cn("min-h-4 text-xs text-muted-foreground transition-opacity", !typedValue && "opacity-0")}>
          {accuracy}% · {progress}%{isComplete ? " · ✓" : ""} · +{potentialXp} xp
        </p>
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
