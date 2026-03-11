export type Lesson = {
  id: string
  title: string
  category: string
  focus: string
  text: string
  translation: string
  romanization: string
  xp: number
}

type PhrasePart = {
  ko: string
  en: string
}

const OPENERS: PhrasePart[] = [
  { ko: "오늘", en: "today" },
  { ko: "지금", en: "right now" },
  { ko: "매일", en: "every day" },
  { ko: "조용한 밤에", en: "at night" },
  { ko: "천천히", en: "slowly" },
  { ko: "차분하게", en: "calmly" },
]

const MODIFIERS: PhrasePart[] = [
  { ko: "정확하게", en: "accurately" },
  { ko: "부드럽게", en: "smoothly" },
  { ko: "집중해서", en: "with focus" },
  { ko: "한 글자씩", en: "one character at a time" },
  { ko: "또렷하게", en: "clearly" },
  { ko: "꾸준하게", en: "steadily" },
]

const OBJECTS: PhrasePart[] = [
  { ko: "한국어를", en: "Korean" },
  { ko: "단어를", en: "words" },
  { ko: "문장을", en: "sentences" },
  { ko: "리듬을", en: "the rhythm" },
  { ko: "손가락을", en: "my fingers" },
  { ko: "타자를", en: "typing" },
]

const VERBS: PhrasePart[] = [
  { ko: "연습해요", en: "practice" },
  { ko: "입력해요", en: "type" },
  { ko: "반복해요", en: "repeat" },
  { ko: "움직여요", en: "move" },
  { ko: "익혀요", en: "learn" },
  { ko: "다듬어요", en: "refine" },
]

const FOCUS_LABELS = [
  "spacing and rhythm",
  "accuracy under flow",
  "steady key timing",
  "vowels and consonants",
]

function pickOne<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

function hashText(text: string) {
  let hash = 0

  for (const character of text) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  }

  return hash.toString(36)
}

function buildGeneratedPhrase() {
  const phraseCount = Math.floor(Math.random() * 3) + 2 // 2 to 4 sentences

  const koParts: string[] = []
  const enParts: string[] = []

  for (let i = 0; i < phraseCount; i++) {
    const opener = pickOne(OPENERS)
    const modifier = pickOne(MODIFIERS)
    const object = pickOne(OBJECTS)
    const verb = pickOne(VERBS)

    koParts.push([opener.ko, modifier.ko, object.ko, verb.ko].join(" "))
    enParts.push([opener.en, modifier.en, object.en, verb.en].join(" "))
  }

  return { 
    text: koParts.join(" "), 
    translation: enParts.join(" ") 
  }
}

export function createGeneratedLesson(previousId?: string): Lesson {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const { text, translation } = buildGeneratedPhrase()
    const id = `generated-${hashText(text)}`

    if (id === previousId) {
      continue
    }

    return {
      id,
      title: "Generated",
      category: "Flow",
      focus: pickOne(FOCUS_LABELS),
      text,
      translation,
      romanization: "",
      xp: Math.max(24, Math.min(72, Array.from(text).length * 2)),
    }
  }

  const fallbackText = "오늘 정확하게 한국어를 연습해요"

  return {
    id: `generated-${hashText(fallbackText)}`,
    title: "Generated",
    category: "Flow",
    focus: "spacing and rhythm",
    text: fallbackText,
    translation: "today accurately Korean practice",
    romanization: "",
    xp: 40,
  }
}