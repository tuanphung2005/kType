import type { Lesson } from "@/data/lessons"

const LESSON_CACHE_KEY = "ktype.dictionary.lesson-cache"
const MAX_CACHE_SIZE = 96

type LocalWordEntry = {
  ko: string
  en: string
}

let lessonCache: Lesson[] | null = null

const WORD_BANK: LocalWordEntry[] = [
  { ko: "가게", en: "shop" },
  { ko: "가격", en: "price" },
  { ko: "가방", en: "bag" },
  { ko: "가수", en: "singer" },
  { ko: "가을", en: "autumn" },
  { ko: "가족", en: "family" },
  { ko: "감기", en: "cold" },
  { ko: "감사", en: "thanks" },
  { ko: "강", en: "river" },
  { ko: "강아지", en: "puppy" },
  { ko: "거리", en: "street" },
  { ko: "거울", en: "mirror" },
  { ko: "건물", en: "building" },
  { ko: "게임", en: "game" },
  { ko: "겨울", en: "winter" },
  { ko: "계절", en: "season" },
  { ko: "계획", en: "plan" },
  { ko: "고기", en: "meat" },
  { ko: "고양이", en: "cat" },
  { ko: "공기", en: "air" },
  { ko: "공부", en: "study" },
  { ko: "공원", en: "park" },
  { ko: "공책", en: "notebook" },
  { ko: "과일", en: "fruit" },
  { ko: "관광", en: "sightseeing" },
  { ko: "광고", en: "advertisement" },
  { ko: "교실", en: "classroom" },
  { ko: "구름", en: "cloud" },
  { ko: "국수", en: "noodles" },
  { ko: "그림", en: "drawing" },
  { ko: "글씨", en: "handwriting" },
  { ko: "기분", en: "mood" },
  { ko: "기억", en: "memory" },
  { ko: "기차", en: "train" },
  { ko: "길", en: "road" },
  { ko: "김밥", en: "gimbap" },
  { ko: "꽃", en: "flower" },
  { ko: "꿈", en: "dream" },
  { ko: "날씨", en: "weather" },
  { ko: "내일", en: "tomorrow" },
  { ko: "냄새", en: "smell" },
  { ko: "노래", en: "song" },
  { ko: "눈", en: "snow" },
  { ko: "뉴스", en: "news" },
  { ko: "다리", en: "bridge" },
  { ko: "단어", en: "word" },
  { ko: "달", en: "moon" },
  { ko: "대답", en: "answer" },
  { ko: "도시", en: "city" },
  { ko: "도서관", en: "library" },
  { ko: "동네", en: "neighborhood" },
  { ko: "동물", en: "animal" },
  { ko: "드라마", en: "drama" },
  { ko: "등산", en: "hiking" },
  { ko: "리듬", en: "rhythm" },
  { ko: "마음", en: "heart" },
  { ko: "마을", en: "village" },
  { ko: "만화", en: "comic" },
  { ko: "말", en: "speech" },
  { ko: "매일", en: "every day" },
  { ko: "맥주", en: "beer" },
  { ko: "머리", en: "head" },
  { ko: "메뉴", en: "menu" },
  { ko: "메모", en: "memo" },
  { ko: "미소", en: "smile" },
  { ko: "바다", en: "sea" },
  { ko: "바람", en: "wind" },
  { ko: "바지", en: "pants" },
  { ko: "박수", en: "applause" },
  { ko: "반지", en: "ring" },
  { ko: "발음", en: "pronunciation" },
  { ko: "밤", en: "night" },
  { ko: "밥", en: "meal" },
  { ko: "방", en: "room" },
  { ko: "버스", en: "bus" },
  { ko: "베개", en: "pillow" },
  { ko: "별", en: "star" },
  { ko: "병원", en: "hospital" },
  { ko: "봄", en: "spring" },
  { ko: "비", en: "rain" },
  { ko: "비밀", en: "secret" },
  { ko: "사진", en: "photo" },
  { ko: "사람", en: "person" },
  { ko: "사랑", en: "love" },
  { ko: "사전", en: "dictionary" },
  { ko: "산", en: "mountain" },
  { ko: "상자", en: "box" },
  { ko: "생각", en: "thought" },
  { ko: "생일", en: "birthday" },
  { ko: "서점", en: "bookstore" },
  { ko: "선물", en: "gift" },
  { ko: "설명", en: "explanation" },
  { ko: "성공", en: "success" },
  { ko: "소리", en: "sound" },
  { ko: "소식", en: "news" },
  { ko: "소파", en: "sofa" },
  { ko: "손", en: "hand" },
  { ko: "손가락", en: "finger" },
  { ko: "속도", en: "speed" },
  { ko: "수업", en: "class" },
  { ko: "수영", en: "swimming" },
  { ko: "숟가락", en: "spoon" },
  { ko: "시간", en: "time" },
  { ko: "시계", en: "clock" },
  { ko: "시장", en: "market" },
  { ko: "시험", en: "exam" },
  { ko: "식당", en: "restaurant" },
  { ko: "신발", en: "shoes" },
  { ko: "실수", en: "mistake" },
  { ko: "아기", en: "baby" },
  { ko: "아침", en: "morning" },
  { ko: "약속", en: "promise" },
  { ko: "양말", en: "socks" },
  { ko: "어제", en: "yesterday" },
  { ko: "언어", en: "language" },
  { ko: "얼굴", en: "face" },
  { ko: "여름", en: "summer" },
  { ko: "여행", en: "travel" },
  { ko: "연습", en: "practice" },
  { ko: "열쇠", en: "key" },
  { ko: "영화", en: "movie" },
  { ko: "오늘", en: "today" },
  { ko: "오후", en: "afternoon" },
  { ko: "요리", en: "cooking" },
  { ko: "우산", en: "umbrella" },
  { ko: "운동", en: "exercise" },
  { ko: "웃음", en: "laughter" },
  { ko: "음악", en: "music" },
  { ko: "의미", en: "meaning" },
  { ko: "의자", en: "chair" },
  { ko: "이름", en: "name" },
  { ko: "이야기", en: "story" },
  { ko: "인사", en: "greeting" },
  { ko: "인터넷", en: "internet" },
  { ko: "자전거", en: "bicycle" },
  { ko: "자동차", en: "car" },
  { ko: "자유", en: "freedom" },
  { ko: "작가", en: "writer" },
  { ko: "장갑", en: "gloves" },
  { ko: "장면", en: "scene" },
  { ko: "저녁", en: "evening" },
  { ko: "전화", en: "phone" },
  { ko: "정답", en: "correct answer" },
  { ko: "정리", en: "arrangement" },
  { ko: "정원", en: "garden" },
  { ko: "정확", en: "accuracy" },
  { ko: "제목", en: "title" },
  { ko: "조용", en: "quietness" },
  { ko: "종이", en: "paper" },
  { ko: "주말", en: "weekend" },
  { ko: "지도", en: "map" },
  { ko: "지하철", en: "subway" },
  { ko: "집", en: "house" },
  { ko: "집중", en: "focus" },
  { ko: "창문", en: "window" },
  { ko: "책", en: "book" },
  { ko: "책상", en: "desk" },
  { ko: "천장", en: "ceiling" },
  { ko: "친구", en: "friend" },
  { ko: "카드", en: "card" },
  { ko: "카메라", en: "camera" },
  { ko: "카페", en: "cafe" },
  { ko: "커피", en: "coffee" },
  { ko: "컴퓨터", en: "computer" },
  { ko: "코트", en: "coat" },
  { ko: "쿠키", en: "cookie" },
  { ko: "퀴즈", en: "quiz" },
  { ko: "타자", en: "typing" },
  { ko: "태양", en: "sun" },
  { ko: "테이블", en: "table" },
  { ko: "토요일", en: "Saturday" },
  { ko: "파도", en: "wave" },
  { ko: "편지", en: "letter" },
  { ko: "평화", en: "peace" },
  { ko: "포도", en: "grape" },
  { ko: "표정", en: "expression" },
  { ko: "학교", en: "school" },
  { ko: "하늘", en: "sky" },
  { ko: "하루", en: "day" },
  { ko: "한글", en: "Hangul" },
  { ko: "햇빛", en: "sunshine" },
  { ko: "행복", en: "happiness" },
  { ko: "향기", en: "fragrance" },
  { ko: "호수", en: "lake" },
  { ko: "호텔", en: "hotel" },
  { ko: "희망", en: "hope" },
]

function pickOne<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

function shuffle<T>(items: T[]) {
  const clone = [...items]

  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = clone[index]
    clone[index] = clone[swapIndex]
    clone[swapIndex] = current
  }

  return clone
}

function hashText(text: string) {
  let hash = 0

  for (const character of text) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  }

  return hash.toString(36)
}

function normalizeLessonText(text: string) {
  return text.replace(/\s+/g, " ").trim()
}

function buildLesson({
  text,
  translation,
}: {
  text: string
  translation: string
}): Lesson | null {
  const normalized = normalizeLessonText(text)
  if (!normalized) {
    return null
  }

  return {
    id: `local-${hashText(`${normalized}-${translation}`)}`,
    title: "Word",
    category: "Random Words",
    focus: "broad vocabulary pool",
    text: normalized,
    translation,
    romanization: "",
    xp: Math.max(12, Math.min(54, Array.from(normalized).length * 3)),
  }
}

function buildWordLessons() {
  return WORD_BANK.map((entry) =>
    buildLesson({
      text: entry.ko,
      translation: entry.en,
    })
  ).filter((lesson): lesson is Lesson => lesson !== null)
}

const LOCAL_LESSON_POOL = buildWordLessons()

function getStoredLessonCache() {
  if (lessonCache) {
    return lessonCache
  }

  if (typeof window === "undefined") {
    lessonCache = []
    return lessonCache
  }

  try {
    const raw = window.sessionStorage.getItem(LESSON_CACHE_KEY)
    lessonCache = raw ? (JSON.parse(raw) as Lesson[]) : []
  } catch {
    lessonCache = []
  }

  return lessonCache
}

function saveLessonCache() {
  if (typeof window === "undefined" || !lessonCache) {
    return
  }

  window.sessionStorage.setItem(LESSON_CACHE_KEY, JSON.stringify(lessonCache.slice(0, MAX_CACHE_SIZE)))
}

function refillLessonCache(previousId?: string) {
  const cache = getStoredLessonCache()
  if (cache.length >= 24) {
    return cache
  }

  const existingIds = new Set(cache.map((lesson) => lesson.id))
  const candidates = shuffle(LOCAL_LESSON_POOL).filter(
    (lesson) => lesson.id !== previousId && !existingIds.has(lesson.id)
  )

  lessonCache = [...cache, ...candidates.slice(0, MAX_CACHE_SIZE - cache.length)]
  saveLessonCache()
  return lessonCache
}

export function isDictionaryConfigured() {
  return true
}

export async function fetchDictionaryLesson(previousId?: string): Promise<Lesson | null> {
  const cache = refillLessonCache(previousId)
  const availableLessons = cache.filter((lesson) => lesson.id !== previousId)

  if (availableLessons.length === 0) {
    return pickOne(LOCAL_LESSON_POOL)
  }

  const nextLesson = pickOne(availableLessons)
  lessonCache = cache.filter((lesson) => lesson.id !== nextLesson.id)
  saveLessonCache()

  return nextLesson
}
