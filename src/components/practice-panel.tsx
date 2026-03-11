import * as React from "react"

import type { Lesson } from "@/data/lessons"
import type { SyllableFeedback } from "@/lib/typing"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type KeyboardKey = {
  key: string
  hangul?: string
  shiftHangul?: string
  widthClass?: string
  muted?: boolean
}

const KEYBOARD_ROWS: KeyboardKey[][] = [
  [
    { key: "q", hangul: "ㅂ", shiftHangul: "ㅃ" },
    { key: "w", hangul: "ㅈ", shiftHangul: "ㅉ" },
    { key: "e", hangul: "ㄷ", shiftHangul: "ㄸ" },
    { key: "r", hangul: "ㄱ", shiftHangul: "ㄲ" },
    { key: "t", hangul: "ㅅ", shiftHangul: "ㅆ" },
    { key: "y", hangul: "ㅛ" },
    { key: "u", hangul: "ㅕ" },
    { key: "i", hangul: "ㅑ" },
    { key: "o", hangul: "ㅐ", shiftHangul: "ㅒ" },
    { key: "p", hangul: "ㅔ", shiftHangul: "ㅖ" },
  ],
  [
    { key: "a", hangul: "ㅁ" },
    { key: "s", hangul: "ㄴ" },
    { key: "d", hangul: "ㅇ" },
    { key: "f", hangul: "ㄹ" },
    { key: "g", hangul: "ㅎ" },
    { key: "h", hangul: "ㅗ" },
    { key: "j", hangul: "ㅓ" },
    { key: "k", hangul: "ㅏ" },
    { key: "l", hangul: "ㅣ" },
  ],
  [
    { key: "z", hangul: "ㅋ" },
    { key: "x", hangul: "ㅌ" },
    { key: "c", hangul: "ㅊ" },
    { key: "v", hangul: "ㅍ" },
    { key: "b", hangul: "ㅠ" },
    { key: "n", hangul: "ㅜ" },
    { key: "m", hangul: "ㅡ" },
  ],
]

function getNextExpectedKey(targetKeyGuide: string, inputValue: string) {
  const targetChars = Array.from(targetKeyGuide)
  const typedChars = Array.from(inputValue)

  for (let index = 0; index < targetChars.length; index += 1) {
    if (typedChars[index] !== targetChars[index]) {
      return /\s/.test(targetChars[index]) ? null : targetChars[index]
    }
  }

  return null
}

function KeyboardReference({ activeKey, dimmed }: { activeKey: string | null; dimmed: boolean }) {
  return (
    <div
      className={cn(
        "w-full max-w-2xl px-2 py-4 transition-opacity sm:px-4 sm:py-6",
        dimmed && "opacity-40"
      )}
    >
      <div className="flex flex-col gap-2 sm:gap-2.5">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div
            key={`kb-row-${rowIndex}`}
            className={cn(
              "flex justify-center gap-2 sm:gap-2.5",
              rowIndex === 1 && "pl-4 sm:pl-6",
              rowIndex === 2 && "pl-10 sm:pl-12"
            )}
          >
            {row.map((item) => {
              const isActive = Boolean(activeKey) && activeKey?.toLowerCase() === item.key.toLowerCase()
              const isShiftRequired = isActive && activeKey !== activeKey?.toLowerCase()

              return (
                <div
                  key={`kb-key-${item.key}`}
                  className={cn(
                    "relative flex h-12 min-w-[2.75rem] items-center justify-center rounded-lg transition-colors duration-200 sm:h-14 sm:min-w-[3.25rem] sm:rounded-xl",
                    "bg-muted/50",
                    item.widthClass,
                    item.muted && "opacity-30",
                    isActive && !isShiftRequired && "bg-primary",
                    isShiftRequired && "bg-foreground text-background"
                  )}
                >
                  <span className={cn("text-xl font-medium sm:text-[1.6rem]", isActive ? (isShiftRequired ? "text-background" : "text-primary-foreground") : "text-foreground/80")}>
                    {isShiftRequired && item.shiftHangul ? item.shiftHangul : (item.hangul ?? item.key)}
                  </span>
                  <span className={cn(
                    "absolute bottom-1.25 right-1.5 flex items-center gap-0.5 text-[0.65rem] font-medium uppercase leading-none sm:bottom-2 sm:right-2 sm:text-[0.7rem]",
                    isActive ? (isShiftRequired ? "text-background/80" : "text-primary-foreground/70") : "text-muted-foreground/70"
                  )}>
                    {isShiftRequired && <span className="font-bold">⇧</span>}
                    {item.key}
                  </span>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

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
    ? "Keep typing to see the current syllable guidance."
    : showWrongInputIndicator
      ? "wrong key."
      : hasInputMismatch
        ? "wrong input is ignored. Keep pressing the highlighted key."
        : nextPendingStroke
          ? `next stroke: ${nextPendingStroke.jamo}`
          : activeSyllable.jamo.some((item) => item.state === "incorrect")
            ? "current syllable has an incorrect stroke. Fix it before moving on."
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
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 px-4 py-6 sm:px-8">
        <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
          {lesson.translation}
        </p>

        {/* Phrase display — active character highlight only */}
        <div className="flex max-w-4xl flex-wrap items-end justify-center gap-x-1.5 gap-y-3">
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
                  "inline-flex items-center justify-center rounded-lg border px-2.5 py-2 transition-colors",
                  isActiveSyllable && "border-primary/45 bg-primary/10 shadow-[0_0_0_1px_color-mix(in_oklch,var(--color-primary)_18%,transparent)]",
                  !isActiveSyllable && allCorrect && "border-primary/15 bg-primary/5",
                  !isActiveSyllable && anyIncorrect && "border-destructive/20 bg-destructive/5",
                  !isActiveSyllable && allPending && "border-transparent",
                )}
              >
                <span
                  className={cn(
                    "text-2xl leading-none transition-colors sm:text-3xl",
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

        <div
          className={cn(
            "flex min-h-34 w-full max-w-xl flex-col gap-2 rounded-2xl border border-border/60 bg-background/70 px-4 py-3 transition-opacity",
            !showActiveGuide && "opacity-60"
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">current syllable</p>
            <div className="flex items-center gap-2">
              {showWrongInputIndicator ? <span className="text-[11px] text-destructive">Wrong key</span> : null}
              <p className="text-[11px] text-muted-foreground">
                {completedStrokeCount}/{totalStrokeCount} strokes correct
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-card text-2xl sm:h-14 sm:w-14 sm:text-3xl">
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
                      "inline-flex h-8 min-w-8 items-center justify-center rounded-full border px-2 text-sm leading-none transition-colors",
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

        <div className="flex w-full flex-col items-center gap-2">
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
