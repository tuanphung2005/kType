export type DailyProgress = {
  xp: number
  sessions: number
  lessonIds: string[]
}

export type AppProfile = {
  version: 1
  xp: number
  streak: number
  totalSessions: number
  totalCharacters: number
  bestAccuracy: number
  lastPracticeDate: string | null
  daily: Record<string, DailyProgress>
  lessonCompletions: Record<string, number>
}

export type PracticeRecord = {
  dateKey: string
  lessonId: string
  accuracy: number
  characterCount: number
  earnedXp: number
  completed: boolean
}

export const STORAGE_KEY = "ktype.profile"

export function createInitialProfile(): AppProfile {
  return {
    version: 1,
    xp: 0,
    streak: 0,
    totalSessions: 0,
    totalCharacters: 0,
    bestAccuracy: 0,
    lastPracticeDate: null,
    daily: {},
    lessonCompletions: {},
  }
}

function isAppProfile(value: unknown): value is AppProfile {
  if (!value || typeof value !== "object") {
    return false
  }

  const profile = value as Partial<AppProfile>
  return profile.version === 1 && typeof profile.xp === "number"
}

export function loadProfile(): AppProfile {
  if (typeof window === "undefined") {
    return createInitialProfile()
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY)
    if (!rawValue) {
      return createInitialProfile()
    }

    const parsedValue: unknown = JSON.parse(rawValue)
    if (!isAppProfile(parsedValue)) {
      return createInitialProfile()
    }

    return {
      ...createInitialProfile(),
      ...parsedValue,
      daily: parsedValue.daily ?? {},
      lessonCompletions: parsedValue.lessonCompletions ?? {},
    }
  } catch {
    return createInitialProfile()
  }
}

export function saveProfile(profile: AppProfile) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}

export function clearProfile() {
  if (typeof window === "undefined") {
    return
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

export function recordPractice(profile: AppProfile, record: PracticeRecord) {
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

  return {
    ...profile,
    xp: profile.xp + record.earnedXp,
    streak: nextStreak,
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
  }
}