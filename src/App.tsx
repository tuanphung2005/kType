import * as React from "react"
import { Flame, RotateCcw, Shuffle } from "lucide-react"

import { PracticePanel } from "@/components/practice-panel"
import { Button } from "@/components/ui/button"
import { createGeneratedLesson } from "@/data/lessons"
import { fetchDictionaryLesson } from "@/lib/dictionary"
import {
  clearProfile,
  createInitialProfile,
  formatLocalDateKey,
  loadProfile,
  recordPractice,
  saveProfile,
} from "@/lib/storage"
import {
  buildJamoFeedback,
  calculateEarnedXp,
  convertDubeolsikKeysToHangul,
  getDubeolsikKeySequence,
  getLevelDetails,
  getTypingAccuracy,
  getTypingProgress,
  isExactLessonMatch,
  containsHangul,
} from "@/lib/typing"

function getCharacterLength(value: string) {
  return Array.from(value).length
}

function sliceCharacters(value: string, length: number) {
  return Array.from(value).slice(0, length).join("")
}

function clampDraftToFirstMismatch(target: string, draft: string) {
  const targetChars = Array.from(target)
  const draftChars = Array.from(draft)

  for (let index = 0; index < draftChars.length; index += 1) {
    if (draftChars[index] !== targetChars[index]) {
      return draftChars.slice(0, index + 1).join("")
    }
  }

  return draft
}

function getCorrectPrefixLength(target: string, draft: string) {
  const targetChars = Array.from(target)
  const draftChars = Array.from(draft)
  const maxLength = Math.min(targetChars.length, draftChars.length)

  let index = 0
  while (index < maxLength && targetChars[index] === draftChars[index]) {
    index += 1
  }

  return index
}

function App() {
  const captureInputRef = React.useRef<HTMLInputElement>(null)
  const lessonRequestIdRef = React.useRef(0)
  const initialLessonIdRef = React.useRef<string | null>(null)
  const [profile, setProfile] = React.useState(loadProfile)
  const [currentLesson, setCurrentLesson] = React.useState(() => createGeneratedLesson())
  const [rawDraft, setRawDraft] = React.useState("")
  const [isCaptureActive, setIsCaptureActive] = React.useState(false)
  const [isLoadingLesson, setIsLoadingLesson] = React.useState(false)

  const inputMode = containsHangul(rawDraft) ? "hangul" as const : "keys" as const
  const typedDraft =
    inputMode === "keys" ? convertDubeolsikKeysToHangul(rawDraft) : rawDraft
  const todayKey = formatLocalDateKey()
  const accuracy = getTypingAccuracy(currentLesson.text, typedDraft)
  const progress = getTypingProgress(currentLesson.text, typedDraft)
  const isComplete = isExactLessonMatch(currentLesson.text, typedDraft)
  const jamoFeedback = buildJamoFeedback(currentLesson.text, typedDraft)
  const potentialXp = calculateEarnedXp({
    baseXp: currentLesson.xp,
    accuracy,
    isPerfect: isComplete,
    isFirstCompletionToday: false,
  })
  const level = getLevelDetails(profile.xp)
  const targetKeyGuide = getDubeolsikKeySequence(currentLesson.text)
  const comparisonTarget = inputMode === "keys" ? targetKeyGuide : currentLesson.text
  const committedPrefixLength = getCorrectPrefixLength(comparisonTarget, rawDraft)
  const hasInputMismatch = getCharacterLength(rawDraft) > committedPrefixLength

  if (initialLessonIdRef.current === null) {
    initialLessonIdRef.current = currentLesson.id
  }

  React.useEffect(() => {
    saveProfile(profile)
  }, [profile])

  const loadNextLesson = React.useEffectEvent(async (previousId?: string) => {
    const requestId = lessonRequestIdRef.current + 1
    lessonRequestIdRef.current = requestId
    setIsLoadingLesson(true)

    try {
      const nextLesson = await fetchDictionaryLesson(previousId)
      if (lessonRequestIdRef.current !== requestId) {
        return
      }

      setCurrentLesson(nextLesson ?? createGeneratedLesson(previousId))
    } finally {
      if (lessonRequestIdRef.current === requestId) {
        setIsLoadingLesson(false)
      }
    }
  })

  const focusCapture = React.useEffectEvent(() => {
    captureInputRef.current?.focus()
  })

  const handleDraftChange = React.useEffectEvent((nextRawDraft: string) => {
    const nextInputMode = containsHangul(nextRawDraft) ? "hangul" : "keys"
    const comparisonTarget = nextInputMode === "keys" ? targetKeyGuide : currentLesson.text
    const previousCommittedPrefixLength = getCorrectPrefixLength(comparisonTarget, rawDraft)

    let constrainedDraft = nextRawDraft

    if (getCharacterLength(constrainedDraft) < previousCommittedPrefixLength) {
      constrainedDraft = sliceCharacters(rawDraft, previousCommittedPrefixLength)
    }

    constrainedDraft = clampDraftToFirstMismatch(comparisonTarget, constrainedDraft)

    const nextCommittedPrefixLength = getCorrectPrefixLength(comparisonTarget, constrainedDraft)
    const maxAllowedLength = nextCommittedPrefixLength + 1
    if (getCharacterLength(constrainedDraft) > maxAllowedLength) {
      constrainedDraft = sliceCharacters(constrainedDraft, maxAllowedLength)
    }

    setRawDraft(constrainedDraft)
  })

  const handleSubmit = React.useEffectEvent(() => {
    const trimmedDraft = typedDraft.trim()
    if (!trimmedDraft) {
      return
    }

    const earnedXp = calculateEarnedXp({
      baseXp: currentLesson.xp,
      accuracy,
      isPerfect: isComplete,
      isFirstCompletionToday: false,
    })

    const nextProfile = recordPractice(profile, {
      dateKey: todayKey,
      lessonId: currentLesson.id,
      accuracy,
      characterCount: Array.from(trimmedDraft).length,
      earnedXp,
      completed: isComplete,
    })

    setProfile(nextProfile)
    setRawDraft("")

    if (isComplete) {
      void loadNextLesson(currentLesson.id)
    }

    requestAnimationFrame(() => {
      focusCapture()
    })
  })

  React.useEffect(() => {
    void loadNextLesson(initialLessonIdRef.current ?? undefined)
  }, [])

  React.useEffect(() => {
    focusCapture()
  }, [currentLesson.id])

  // Aggressive auto-focus: any keypress when not on a button refocuses the capture input
  React.useEffect(() => {
    const handleWindowKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      if (target === captureInputRef.current) return
      if (target instanceof HTMLElement && target.closest("button")) return

      // Let Tab work naturally
      if (event.key === "Tab") return

      focusCapture()
    }

    const handleWindowClick = (event: MouseEvent) => {
      const target = event.target
      if (target instanceof HTMLElement && target.closest("button")) return
      focusCapture()
    }

    window.addEventListener("keydown", handleWindowKeyDown)
    window.addEventListener("click", handleWindowClick)

    return () => {
      window.removeEventListener("keydown", handleWindowKeyDown)
      window.removeEventListener("click", handleWindowClick)
    }
  }, [])

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      const isCaptureElement = target === captureInputRef.current

      if (!isCaptureElement) {
        return
      }

      if (event.key === "Escape") {
        event.preventDefault()
        setRawDraft("")
        return
      }

      if (event.key === "Enter") {
        event.preventDefault()
        handleSubmit()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  function handleNextLesson() {
    setRawDraft("")
    void loadNextLesson(currentLesson.id)

    requestAnimationFrame(() => {
      focusCapture()
    })
  }

  function handleResetProgress() {
    const confirmed = window.confirm(
      "Reset all saved typing progress on this device? This cannot be undone."
    )

    if (!confirmed) {
      return
    }

    clearProfile()
    setProfile(createInitialProfile())
    setRawDraft("")

    requestAnimationFrame(() => {
      focusCapture()
    })
  }

  return (
    <main className="h-svh overflow-hidden">
      <div className="mx-auto flex h-svh w-full max-w-5xl flex-col gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold tracking-wide">kType</span>
            <span className="text-xs text-muted-foreground">Lv {level.level}</span>
            <span className="text-xs text-muted-foreground">{profile.xp} XP</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Flame className="size-3 text-primary" />
              {profile.streak}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 rounded-full px-2 text-xs"
              onClick={handleNextLesson}
              disabled={isLoadingLesson}
            >
              <Shuffle className="size-3" />
              {isLoadingLesson ? "Loading" : "New"}
            </Button>
            <Button variant="ghost" size="sm" className="h-7 rounded-full px-2 text-xs" onClick={handleResetProgress}>
              <RotateCcw className="size-3" />
              Reset
            </Button>
          </div>
        </header>

        <section className="flex min-h-0 flex-1 flex-col">
          <PracticePanel
            captureRef={captureInputRef}
            isCaptureActive={isCaptureActive}
            lesson={currentLesson}
            inputValue={rawDraft}
            typedValue={typedDraft}
            inputMode={inputMode}
            accuracy={accuracy}
            progress={progress}
            feedback={jamoFeedback}
            potentialXp={potentialXp}
            isComplete={isComplete}
            hasInputMismatch={hasInputMismatch}
            targetKeyGuide={targetKeyGuide}
            onActivateCapture={focusCapture}
            onCaptureBlur={() => setIsCaptureActive(false)}
            onCaptureFocus={() => setIsCaptureActive(true)}
            onChange={handleDraftChange}
            onClear={() => {
              setRawDraft("")
              requestAnimationFrame(() => {
                focusCapture()
              })
            }}
            onSubmit={handleSubmit}
          />
        </section>
      </div>
    </main>
  )
}

export default App
