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



export function KeyboardReference({ activeKey, dimmed }: { activeKey: string | null; dimmed: boolean }) {
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
