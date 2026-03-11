export type DailyProgress = {
  xp: number
  sessions: number
  lessonIds: string[]
}

export type SessionRecord = {
  timestamp: number
  wpm: number
  accuracy: number
  characterCount: number
}

export type AppProfile = {
  version: 2
  xp: number
  streak: number
  maxStreak: number
  totalSessions: number
  totalCharacters: number
  bestAccuracy: number
  lastPracticeDate: string | null
  daily: Record<string, DailyProgress>
  lessonCompletions: Record<string, number>
  sessionHistory: SessionRecord[]
}

export type PracticeRecord = {
  dateKey: string
  lessonId: string
  accuracy: number
  characterCount: number
  earnedXp: number
  completed: boolean
  wpm: number
}

export const STORAGE_KEY = "ktype.profile"
export const FILE_NAME = "profile.json"

export function isTauri() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window
}

export function createInitialProfile(): AppProfile {
  return {
    version: 2,
    xp: 0,
    streak: 0,
    maxStreak: 0,
    totalSessions: 0,
    totalCharacters: 0,
    bestAccuracy: 0,
    lastPracticeDate: null,
    daily: {},
    lessonCompletions: {},
    sessionHistory: [],
  }
}

function migrateProfile(parsedValue: unknown): AppProfile {
  const profile = parsedValue as Record<string, unknown>
  if (profile.version === 1) {
    return {
      ...createInitialProfile(),
      ...profile,
      version: 2,
      maxStreak: Number(profile.streak) || 0,
      sessionHistory: [],
    } as AppProfile
  }
  return { ...createInitialProfile(), ...profile } as AppProfile
}

export async function loadProfile(): Promise<AppProfile> {
  if (typeof window === "undefined") {
    return createInitialProfile()
  }

  let rawValue: string | null = null

  if (isTauri()) {
    try {
      const { BaseDirectory, readTextFile } = await import("@tauri-apps/plugin-fs")
      rawValue = await readTextFile(FILE_NAME, { baseDir: BaseDirectory.AppData })
    } catch {
      // file might not exist yet, fallback to localStorage schema
      rawValue = window.localStorage.getItem(STORAGE_KEY)
    }
  } else {
    rawValue = window.localStorage.getItem(STORAGE_KEY)
  }

  if (!rawValue) {
    return createInitialProfile()
  }

  try {
    const parsedValue = JSON.parse(rawValue)
    return migrateProfile(parsedValue)
  } catch {
    return createInitialProfile()
  }
}

export async function saveProfile(profile: AppProfile) {
  if (typeof window === "undefined") {
    return
  }

  const rawValue = JSON.stringify(profile)

  if (isTauri()) {
    try {
      const { BaseDirectory, writeTextFile, exists, mkdir } = await import("@tauri-apps/plugin-fs")
      const appDataExists = await exists("", { baseDir: BaseDirectory.AppData })
      if (!appDataExists) {
        await mkdir("", { baseDir: BaseDirectory.AppData, recursive: true })
      }
      await writeTextFile(FILE_NAME, rawValue, { baseDir: BaseDirectory.AppData })
    } catch (err) {
      console.error("Failed to write to Tauri FS", err)
      // fallback
      window.localStorage.setItem(STORAGE_KEY, rawValue)
    }
  }

  // Always keep localStorage updated as fallback
  window.localStorage.setItem(STORAGE_KEY, rawValue)
}

export async function clearProfile() {
  if (typeof window === "undefined") {
    return
  }
  
  if (isTauri()) {
    try {
      const { BaseDirectory, remove } = await import("@tauri-apps/plugin-fs")
      await remove(FILE_NAME, { baseDir: BaseDirectory.AppData })
    } catch {
      // ignore
    }
  }
  
  window.localStorage.removeItem(STORAGE_KEY)
}

export function formatLocalDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, "0")
  const day = `${date.getDate()}`.padStart(2, "0")

  return `${year}-${month}-${day}`
}

function getPreviousDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() - 1)
  return formatLocalDateKey(date)
}

export function recordPractice(profile: AppProfile, record: PracticeRecord): AppProfile {
  const dailyRecord = profile.daily[record.dateKey] ?? {
    xp: 0,
    sessions: 0,
    lessonIds: [],
  }

  const isNewDay = profile.lastPracticeDate !== record.dateKey
  let nextStreak = profile.streak

  if (isNewDay) {
    const previousDateKey = profile.lastPracticeDate
    if (previousDateKey && getPreviousDateKey(record.dateKey) === previousDateKey) {
      nextStreak += 1
    } else {
      nextStreak = 1
    }
  }

  const completedLessons = record.completed
    ? Array.from(new Set([...dailyRecord.lessonIds, record.lessonId]))
    : dailyRecord.lessonIds

  const newSessionHistory = [
    ...profile.sessionHistory,
    {
      timestamp: Date.now(),
      wpm: record.wpm,
      accuracy: record.accuracy,
      characterCount: record.characterCount,
    }
  ].slice(-100)

  return {
    ...profile,
    xp: profile.xp + record.earnedXp,
    streak: nextStreak,
    maxStreak: Math.max(profile.maxStreak || 0, nextStreak),
    totalSessions: profile.totalSessions + 1,
    totalCharacters: profile.totalCharacters + record.characterCount,
    bestAccuracy: Math.max(profile.bestAccuracy, record.accuracy),
    lastPracticeDate: record.dateKey,
    daily: {
      ...profile.daily,
      [record.dateKey]: {
        xp: dailyRecord.xp + record.earnedXp,
        sessions: dailyRecord.sessions + 1,
        lessonIds: completedLessons,
      },
    },
    lessonCompletions: record.completed
      ? {
        ...profile.lessonCompletions,
        [record.lessonId]: (profile.lessonCompletions[record.lessonId] ?? 0) + 1,
      }
      : profile.lessonCompletions,
    sessionHistory: newSessionHistory,
  }
}