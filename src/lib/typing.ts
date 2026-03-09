export type CharacterFeedback = {
  character: string
  state: "correct" | "incorrect" | "pending"
}

export type JamoFeedbackItem = {
  jamo: string
  state: "correct" | "incorrect" | "pending"
}

export type SyllableFeedback = {
  /** Original character (syllable, space, or non-Hangul) */
  character: string
  /** Individual jamo within this syllable */
  jamo: JamoFeedbackItem[]
}

const HANGUL_RE = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF]/

export function containsHangul(text: string): boolean {
  return HANGUL_RE.test(text)
}

const CHOSEONG = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
] as const

const JUNGSEONG = [
  "ㅏ",
  "ㅐ",
  "ㅑ",
  "ㅒ",
  "ㅓ",
  "ㅔ",
  "ㅕ",
  "ㅖ",
  "ㅗ",
  "ㅘ",
  "ㅙ",
  "ㅚ",
  "ㅛ",
  "ㅜ",
  "ㅝ",
  "ㅞ",
  "ㅟ",
  "ㅠ",
  "ㅡ",
  "ㅢ",
  "ㅣ",
] as const

const JONGSEONG = [
  "",
  "ㄱ",
  "ㄲ",
  "ㄳ",
  "ㄴ",
  "ㄵ",
  "ㄶ",
  "ㄷ",
  "ㄹ",
  "ㄺ",
  "ㄻ",
  "ㄼ",
  "ㄽ",
  "ㄾ",
  "ㄿ",
  "ㅀ",
  "ㅁ",
  "ㅂ",
  "ㅄ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
] as const

const KEY_TO_JAMO: Record<string, string> = {
  r: "ㄱ",
  R: "ㄲ",
  s: "ㄴ",
  e: "ㄷ",
  E: "ㄸ",
  f: "ㄹ",
  a: "ㅁ",
  q: "ㅂ",
  Q: "ㅃ",
  t: "ㅅ",
  T: "ㅆ",
  d: "ㅇ",
  w: "ㅈ",
  W: "ㅉ",
  c: "ㅊ",
  z: "ㅋ",
  x: "ㅌ",
  v: "ㅍ",
  g: "ㅎ",
  k: "ㅏ",
  o: "ㅐ",
  i: "ㅑ",
  O: "ㅒ",
  j: "ㅓ",
  p: "ㅔ",
  u: "ㅕ",
  P: "ㅖ",
  h: "ㅗ",
  y: "ㅛ",
  n: "ㅜ",
  b: "ㅠ",
  m: "ㅡ",
  l: "ㅣ",
}

const JAMO_TO_KEYS: Record<string, string> = {
  ㄱ: "r",
  ㄲ: "R",
  ㄴ: "s",
  ㄷ: "e",
  ㄸ: "E",
  ㄹ: "f",
  ㅁ: "a",
  ㅂ: "q",
  ㅃ: "Q",
  ㅅ: "t",
  ㅆ: "T",
  ㅇ: "d",
  ㅈ: "w",
  ㅉ: "W",
  ㅊ: "c",
  ㅋ: "z",
  ㅌ: "x",
  ㅍ: "v",
  ㅎ: "g",
  ㅏ: "k",
  ㅐ: "o",
  ㅑ: "i",
  ㅒ: "O",
  ㅓ: "j",
  ㅔ: "p",
  ㅕ: "u",
  ㅖ: "P",
  ㅗ: "h",
  ㅘ: "hk",
  ㅙ: "ho",
  ㅚ: "hl",
  ㅛ: "y",
  ㅜ: "n",
  ㅝ: "nj",
  ㅞ: "np",
  ㅟ: "nl",
  ㅠ: "b",
  ㅡ: "m",
  ㅢ: "ml",
  ㅣ: "l",
  ㄳ: "rt",
  ㄵ: "sw",
  ㄶ: "sg",
  ㄺ: "fr",
  ㄻ: "fa",
  ㄼ: "fq",
  ㄽ: "ft",
  ㄾ: "fx",
  ㄿ: "fv",
  ㅀ: "fg",
  ㅄ: "qt",
}

const COMBINED_VOWELS = new Map<string, string>([
  ["ㅗ|ㅏ", "ㅘ"],
  ["ㅗ|ㅐ", "ㅙ"],
  ["ㅗ|ㅣ", "ㅚ"],
  ["ㅜ|ㅓ", "ㅝ"],
  ["ㅜ|ㅔ", "ㅞ"],
  ["ㅜ|ㅣ", "ㅟ"],
  ["ㅡ|ㅣ", "ㅢ"],
])

const COMBINED_FINALS = new Map<string, string>([
  ["ㄱ|ㅅ", "ㄳ"],
  ["ㄴ|ㅈ", "ㄵ"],
  ["ㄴ|ㅎ", "ㄶ"],
  ["ㄹ|ㄱ", "ㄺ"],
  ["ㄹ|ㅁ", "ㄻ"],
  ["ㄹ|ㅂ", "ㄼ"],
  ["ㄹ|ㅅ", "ㄽ"],
  ["ㄹ|ㅌ", "ㄾ"],
  ["ㄹ|ㅍ", "ㄿ"],
  ["ㄹ|ㅎ", "ㅀ"],
  ["ㅂ|ㅅ", "ㅄ"],
])

const SPLIT_FINALS = new Map<string, [string, string]>([
  ["ㄳ", ["ㄱ", "ㅅ"]],
  ["ㄵ", ["ㄴ", "ㅈ"]],
  ["ㄶ", ["ㄴ", "ㅎ"]],
  ["ㄺ", ["ㄹ", "ㄱ"]],
  ["ㄻ", ["ㄹ", "ㅁ"]],
  ["ㄼ", ["ㄹ", "ㅂ"]],
  ["ㄽ", ["ㄹ", "ㅅ"]],
  ["ㄾ", ["ㄹ", "ㅌ"]],
  ["ㄿ", ["ㄹ", "ㅍ"]],
  ["ㅀ", ["ㄹ", "ㅎ"]],
  ["ㅄ", ["ㅂ", "ㅅ"]],
])

const CHOSEONG_INDEX = Object.fromEntries(
  CHOSEONG.map((value, index) => [value, index])
) as Record<string, number>
const JUNGSEONG_INDEX = Object.fromEntries(
  JUNGSEONG.map((value, index) => [value, index])
) as Record<string, number>
const JONGSEONG_INDEX = Object.fromEntries(
  JONGSEONG.map((value, index) => [value, index])
) as Record<string, number>

function isConsonantJamo(value: string) {
  return value in CHOSEONG_INDEX || value in JONGSEONG_INDEX
}

function isVowelJamo(value: string) {
  return value in JUNGSEONG_INDEX
}

function composeSyllable(initial: string | null, medial: string | null, final: string | null) {
  if (!initial) {
    return `${medial ?? ""}${final ?? ""}`
  }

  if (!medial) {
    return `${initial}${final ?? ""}`
  }

  const initialIndex = CHOSEONG_INDEX[initial]
  const medialIndex = JUNGSEONG_INDEX[medial]
  const finalIndex = final ? JONGSEONG_INDEX[final] : 0

  if (
    initialIndex === undefined ||
    medialIndex === undefined ||
    finalIndex === undefined
  ) {
    return `${initial}${medial}${final ?? ""}`
  }

  return String.fromCharCode(0xac00 + (initialIndex * 21 + medialIndex) * 28 + finalIndex)
}

function combineVowel(first: string, second: string) {
  return COMBINED_VOWELS.get(`${first}|${second}`) ?? null
}

function combineFinal(first: string, second: string) {
  return COMBINED_FINALS.get(`${first}|${second}`) ?? null
}

function splitFinal(final: string) {
  return SPLIT_FINALS.get(final) ?? null
}

export function convertDubeolsikKeysToHangul(rawInput: string) {
  let result = ""
  let initial: string | null = null
  let medial: string | null = null
  let final: string | null = null

  const flush = () => {
    if (!initial && !medial && !final) {
      return
    }

    result += composeSyllable(initial, medial, final)
    initial = null
    medial = null
    final = null
  }

  for (let index = 0; index < rawInput.length; index += 1) {
    const character = rawInput[index]

    if (/\s/.test(character)) {
      flush()
      result += character
      continue
    }

    const jamo = KEY_TO_JAMO[character]
    if (!jamo) {
      flush()
      result += character
      continue
    }

    const nextJamo = KEY_TO_JAMO[rawInput[index + 1] ?? ""]
    const nextIsVowel = nextJamo ? isVowelJamo(nextJamo) : false

    if (isConsonantJamo(jamo)) {
      if (!initial) {
        initial = jamo
        continue
      }

      if (initial && !medial) {
        result += initial
        initial = jamo
        continue
      }

      if (initial && medial && !final) {
        if (nextIsVowel) {
          flush()
          initial = jamo
          continue
        }

        final = jamo
        continue
      }

      if (initial && medial && final) {
        const combinedFinal = combineFinal(final, jamo)
        if (combinedFinal && !nextIsVowel) {
          final = combinedFinal
          continue
        }

        flush()
        initial = jamo
      }

      continue
    }

    if (!initial) {
      initial = "ㅇ"
      medial = jamo
      continue
    }

    if (!medial) {
      medial = jamo
      continue
    }

    if (!final) {
      const combinedMedial = combineVowel(medial, jamo)
      if (combinedMedial) {
        medial = combinedMedial
        continue
      }

      flush()
      initial = "ㅇ"
      medial = jamo
      continue
    }

    const split = splitFinal(final)
    if (split) {
      result += composeSyllable(initial, medial, split[0])
      initial = split[1]
      medial = jamo
      final = null
      continue
    }

    const carryInitial = final
    result += composeSyllable(initial, medial, null)
    initial = carryInitial
    medial = jamo
    final = null
  }

  flush()
  return result
}

export function getDubeolsikKeySequence(text: string) {
  let result = ""

  for (const character of text) {
    if (/\s/.test(character)) {
      result += character
      continue
    }

    const codePoint = character.charCodeAt(0)
    if (codePoint >= 0xac00 && codePoint <= 0xd7a3) {
      const syllableIndex = codePoint - 0xac00
      const initial = CHOSEONG[Math.floor(syllableIndex / 588)]
      const medial = JUNGSEONG[Math.floor((syllableIndex % 588) / 28)]
      const final = JONGSEONG[syllableIndex % 28]

      result += JAMO_TO_KEYS[initial] ?? initial
      result += JAMO_TO_KEYS[medial] ?? medial

      if (final) {
        result += JAMO_TO_KEYS[final] ?? final
      }

      continue
    }

    result += JAMO_TO_KEYS[character] ?? character
  }

  return result
}

export function getTypingAccuracy(target: string, input: string) {
  if (!input.length) {
    return 0
  }

  const targetCharacters = Array.from(target)
  const inputCharacters = Array.from(input)
  const longestLength = Math.max(targetCharacters.length, inputCharacters.length)

  if (!longestLength) {
    return 100
  }

  let matches = 0
  for (let index = 0; index < longestLength; index += 1) {
    if (targetCharacters[index] === inputCharacters[index]) {
      matches += 1
    }
  }

  return Math.round((matches / longestLength) * 100)
}

export function getTypingProgress(target: string, input: string) {
  const targetCharacters = Array.from(target)
  if (!targetCharacters.length) {
    return 100
  }

  const inputCharacters = Array.from(input)
  let matches = 0

  for (let index = 0; index < targetCharacters.length; index += 1) {
    if (targetCharacters[index] === inputCharacters[index]) {
      matches += 1
    }
  }

  return Math.round((matches / targetCharacters.length) * 100)
}

export function isExactLessonMatch(target: string, input: string) {
  return target === input.trim()
}

export function buildCharacterFeedback(target: string, input: string) {
  const targetCharacters = Array.from(target)
  const inputCharacters = Array.from(input)

  return targetCharacters.map<CharacterFeedback>((character, index) => {
    const typedCharacter = inputCharacters[index]

    if (typedCharacter === undefined) {
      return {
        character,
        state: "pending",
      }
    }

    return {
      character,
      state: typedCharacter === character ? "correct" : "incorrect",
    }
  })
}

function decomposeCharToJamo(character: string): string[] {
  const codePoint = character.charCodeAt(0)

  if (codePoint >= 0xac00 && codePoint <= 0xd7a3) {
    const syllableIndex = codePoint - 0xac00
    const initial = CHOSEONG[Math.floor(syllableIndex / 588)]
    const medial = JUNGSEONG[Math.floor((syllableIndex % 588) / 28)]
    const final = JONGSEONG[syllableIndex % 28]

    return final ? [initial, medial, final] : [initial, medial]
  }

  // Compatibility jamo (ㄱ-ㅎ, ㅏ-ㅣ) stay as-is
  return [character]
}

export function buildJamoFeedback(target: string, input: string): SyllableFeedback[] {
  const targetChars = Array.from(target)
  const inputChars = Array.from(input)
  const result: SyllableFeedback[] = []
  let isLockedOnMistake = false

  for (let charIndex = 0; charIndex < targetChars.length; charIndex += 1) {
    const targetChar = targetChars[charIndex]
    const typedChar = inputChars[charIndex]
    const targetJamo = decomposeCharToJamo(targetChar)

    if (isLockedOnMistake) {
      result.push({
        character: targetChar,
        jamo: targetJamo.map((j) => ({ jamo: j, state: "pending" })),
      })
      continue
    }

    // Not yet reached this character
    if (charIndex >= inputChars.length) {
      result.push({
        character: targetChar,
        jamo: targetJamo.map((j) => ({ jamo: j, state: "pending" })),
      })
      continue
    }

    // Exact syllable match → all jamo correct
    if (typedChar === targetChar) {
      result.push({
        character: targetChar,
        jamo: targetJamo.map((j) => ({ jamo: j, state: "correct" })),
      })
      continue
    }

    // Mismatch — compare jamo-by-jamo to show partial progress
    const typedJamo = decomposeCharToJamo(typedChar)
    const jamoItems: JamoFeedbackItem[] = []

    for (let j = 0; j < targetJamo.length; j += 1) {
      if (j < typedJamo.length) {
        jamoItems.push({
          jamo: targetJamo[j],
          state: typedJamo[j] === targetJamo[j] ? "correct" : "incorrect",
        })
      } else {
        // Partially composed — remaining target jamo are pending
        jamoItems.push({ jamo: targetJamo[j], state: "pending" })
      }
    }

    result.push({ character: targetChar, jamo: jamoItems })

    if (jamoItems.some((item) => item.state === "incorrect")) {
      isLockedOnMistake = true
    }
  }

  return result
}

export function calculateEarnedXp({
  baseXp,
  accuracy,
  isPerfect,
  isFirstCompletionToday,
}: {
  baseXp: number
  accuracy: number
  isPerfect: boolean
  isFirstCompletionToday: boolean
}) {
  if (isPerfect) {
    return baseXp + 18 + (isFirstCompletionToday ? 12 : 0)
  }

  const scaledAccuracy = Math.max(accuracy, 25)
  return Math.max(5, Math.round(baseXp * (scaledAccuracy / 100) * 0.22))
}

export function getLevelDetails(xp: number) {
  const xpPerLevel = 140
  const level = Math.floor(xp / xpPerLevel) + 1
  const levelFloor = (level - 1) * xpPerLevel
  const nextLevelAt = level * xpPerLevel
  const progress = Math.round(((xp - levelFloor) / xpPerLevel) * 100)

  return {
    level,
    currentLevelXp: xp - levelFloor,
    nextLevelXp: nextLevelAt - levelFloor,
    progress,
  }
}