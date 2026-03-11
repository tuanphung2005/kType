import * as React from "react"
import { Flame, Shuffle, Download, ChartArea, ArrowLeft, Settings } from "lucide-react"

import { cn } from "@/lib/utils"

import { AnalyticsPanel } from "@/components/analytics-panel"
import { PracticePanel } from "@/components/practice-panel"
import { SettingsPanel } from "@/components/settings-panel"
import { Button } from "@/components/ui/button"
import { generateDictionarySentenceLesson } from "@/lib/dictionary"
import {
  createInitialProfile,
  formatLocalDateKey,
  loadProfile,
  recordPractice,
  saveProfile,
  isTauri,
} from "@/lib/storage"
import {
  buildJamoFeedback,
  calculateEarnedXp,
  convertDubeolsikKeysToHangul,
  getDubeolsikKeySequence,
  getLevelDetails,
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
      return draftChars.slice(0, index).join("")
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
  const initialLessonIdRef = React.useRef<string | null>(null)
  const wrongInputTimeoutRef = React.useRef<number | null>(null)
  const typingStartTimeRef = React.useRef<number | null>(null)
  const typingErrorsRef = React.useRef(0)
  const [isProfileLoaded, setIsProfileLoaded] = React.useState(false)
  const [profile, setProfile] = React.useState(createInitialProfile)
  const [currentView, setCurrentView] = React.useState<"practice" | "analytics" | "settings">("practice")
  const [currentLesson, setCurrentLesson] = React.useState(() => generateDictionarySentenceLesson())
  const [rawDraft, setRawDraft] = React.useState("")
  const [isCaptureActive, setIsCaptureActive] = React.useState(false)
  const [isLoadingLesson, setIsLoadingLesson] = React.useState(false)
  const [showWrongInputIndicator, setShowWrongInputIndicator] = React.useState(false)

  const inputMode = containsHangul(rawDraft) ? "hangul" as const : "keys" as const
  const typedDraft =
    inputMode === "keys" ? convertDubeolsikKeysToHangul(rawDraft) : rawDraft
  const todayKey = formatLocalDateKey()
  const progress = getTypingProgress(currentLesson.text, typedDraft)
  const isComplete = isExactLessonMatch(currentLesson.text, typedDraft)
  
  // Real accuracy = Max(0, 100 - (errors / totalChars * 100))
  const targetCharsLength = Array.from(currentLesson.text).length
  const rawAccuracy = targetCharsLength > 0 ? 100 - (typingErrorsRef.current / targetCharsLength) * 100 : 100
  const accuracy = Math.max(0, Math.round(rawAccuracy))
  
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
    loadProfile().then((loadedProfile) => {
      setProfile(loadedProfile)
      setIsProfileLoaded(true)
    })
  }, [])

  React.useEffect(() => {
    if (isProfileLoaded) {
      void saveProfile(profile)
    }
  }, [profile, isProfileLoaded])

  React.useEffect(() => {
    return () => {
      if (wrongInputTimeoutRef.current !== null) {
        window.clearTimeout(wrongInputTimeoutRef.current)
      }
    }
  }, [])

  const loadNextLesson = React.useCallback(async (previousId?: string) => {
    setIsLoadingLesson(true)
    try {
      const nextLesson = generateDictionarySentenceLesson(previousId)
      setCurrentLesson(nextLesson)
    } finally {
      setIsLoadingLesson(false)
    }
  }, [])

  const focusCapture = React.useEffectEvent(() => {
    captureInputRef.current?.focus()
  })

  const triggerWrongInputIndicator = React.useEffectEvent(() => {
    setShowWrongInputIndicator(true)

    if (wrongInputTimeoutRef.current !== null) {
      window.clearTimeout(wrongInputTimeoutRef.current)
    }

    wrongInputTimeoutRef.current = window.setTimeout(() => {
      setShowWrongInputIndicator(false)
      wrongInputTimeoutRef.current = null
    }, 900)
  })

  const handleDraftChange = React.useEffectEvent((nextRawDraft: string) => {
    if (typingStartTimeRef.current === null && nextRawDraft.length > 0) {
      typingStartTimeRef.current = Date.now()
    }

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

    const wasRejected =
      getCharacterLength(nextRawDraft) >= getCharacterLength(rawDraft) &&
      constrainedDraft !== nextRawDraft

    if (wasRejected) {
      typingErrorsRef.current += 1
      triggerWrongInputIndicator()
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

    const elapsedMinutes = typingStartTimeRef.current 
      ? (Date.now() - typingStartTimeRef.current) / 60000 
      : 0
    const wpm = elapsedMinutes > 0 ? Math.round((Array.from(trimmedDraft).length / 5) / elapsedMinutes) : 0

    const nextProfile = recordPractice(profile, {
      dateKey: todayKey,
      lessonId: currentLesson.id,
      accuracy,
      characterCount: Array.from(trimmedDraft).length,
      earnedXp,
      completed: isComplete,
      wpm,
    })

    setProfile(nextProfile)
    setRawDraft("")
    setShowWrongInputIndicator(false)
    typingStartTimeRef.current = null
    typingErrorsRef.current = 0

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
        typingStartTimeRef.current = null
        typingErrorsRef.current = 0
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
    setShowWrongInputIndicator(false)
    typingStartTimeRef.current = null
    typingErrorsRef.current = 0
    void loadNextLesson(currentLesson.id)

    requestAnimationFrame(() => {
      focusCapture()
    })
  }



  return (
    <main className={cn("h-svh overflow-hidden transition-colors duration-300", 
      profile.preferences?.theme === "rose" && "theme-rose",
      profile.preferences?.theme === "blue" && "theme-blue"
    )}>
      <div className="mx-auto flex h-svh w-full max-w-5xl flex-col gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold tracking-wide">kType</span>
            <span className="text-xs text-muted-foreground">lvl {level.level}</span>
            <span className="text-xs text-muted-foreground">{profile.xp} xp</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Flame className="size-3 text-primary" />
              {profile.streak}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {isTauri() ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 rounded-full px-3 text-xs"
                onClick={() => setCurrentView(v => v === "analytics" ? "practice" : "analytics")}
              >
                {currentView === "analytics" ?
                  (<><ArrowLeft />back to practice</>) :
                  (<><ChartArea />analytics</>)
                }
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="h-7 rounded-full px-3 text-xs bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                asChild
              >
                <a href="https://github.com/tuanphung2005/kType/releases/latest" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                  <Download className="size-3" />
                  download app
                </a>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 rounded-full px-2 text-xs"
              onClick={() => setCurrentView((v) => (v === "settings" ? "practice" : "settings"))}
            >
              {currentView === "settings" ? (
                <><ArrowLeft className="size-3 lg:mr-1" />back</>
              ) : (
                <><Settings className="size-3 lg:mr-1" />settings</>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 rounded-full px-2 text-xs"
              onClick={handleNextLesson}
              disabled={isLoadingLesson}
            >
              <Shuffle className="size-3" />
              {isLoadingLesson ? "loading" : "new"}
            </Button>
          </div>
        </header>

        <section className="flex min-h-0 flex-1 flex-col">
          {currentView === "analytics" ? (
            <AnalyticsPanel profile={profile} />
          ) : currentView === "settings" ? (
            <SettingsPanel 
              profile={profile} 
              onUpdatePreferences={(prefs) => setProfile(p => ({ ...p, preferences: prefs }))}
            />
          ) : (
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
              showWrongInputIndicator={showWrongInputIndicator}
              targetKeyGuide={targetKeyGuide}
              onActivateCapture={focusCapture}
              onCaptureBlur={() => setIsCaptureActive(false)}
              onCaptureFocus={() => setIsCaptureActive(true)}
              onChange={handleDraftChange}
              onClear={() => {
                setRawDraft("")
                setShowWrongInputIndicator(false)
                typingStartTimeRef.current = null
                typingErrorsRef.current = 0
                requestAnimationFrame(() => {
                  focusCapture()
                })
              }}
              onSubmit={handleSubmit}
            />
          )}
        </section>
      </div>
    </main>
  )
}

export default App
