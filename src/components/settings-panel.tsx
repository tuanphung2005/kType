import { type AppProfile } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Palette } from "lucide-react"

type SettingsPanelProps = {
  profile: AppProfile
  onUpdatePreferences: (preferences: AppProfile["preferences"]) => void
}

export function SettingsPanel({ profile, onUpdatePreferences }: SettingsPanelProps) {
  const { preferences } = profile

  function handleThemeChange(theme: "zinc" | "rose" | "blue") {
    onUpdatePreferences({ ...preferences, theme })
  }

  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-y-auto pb-8 sm:gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold sm:text-2xl tracking-tight">settings</h2>
        <p className="text-sm text-muted-foreground">customize your typing experience</p>
      </div>

      <div className="grid gap-4 sm:max-w-md">
        <Card className="bg-background/50">
          <CardHeader className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-1">
              <Palette className="size-4 text-muted-foreground" />
              <CardTitle className="text-bas tracking-wider">theme</CardTitle>
            </div>
            <CardDescription className="text-xs">choose an accent color</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={preferences.theme === "zinc" ? "default" : "outline"}
                size="sm"
                onClick={() => handleThemeChange("zinc")}
                className="h-8 rounded-full text-xs"
              >
                zinc
              </Button>
              <Button
                variant={preferences.theme === "rose" ? "default" : "outline"}
                size="sm"
                onClick={() => handleThemeChange("rose")}
                className="h-8 rounded-full text-xs"
              >
                rose
              </Button>
              <Button
                variant={preferences.theme === "blue" ? "default" : "outline"}
                size="sm"
                onClick={() => handleThemeChange("blue")}
                className="h-8 rounded-full text-xs"
              >
                blue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
