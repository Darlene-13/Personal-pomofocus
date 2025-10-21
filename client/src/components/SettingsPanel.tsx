import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Theme } from "@shared/schema";
import { themeConfigs } from "@/lib/themes";
import { Check } from "lucide-react";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  workDuration: number;
  breakDuration: number;
  onWorkDurationChange: (duration: number) => void;
  onBreakDurationChange: (duration: number) => void;
}

export function SettingsPanel({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  workDuration,
  breakDuration,
  onWorkDurationChange,
  onBreakDurationChange,
}: SettingsPanelProps) {
  const themes: Theme[] = ["purple", "blue", "green", "pink", "orange"];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
          data-testid="overlay-settings"
        />
      )}
      
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-background border-l border-border z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        data-testid="panel-settings"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-2xl font-semibold" data-testid="text-settings-title">Settings</h2>
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              data-testid="button-close-settings"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Theme</h3>
              <div className="flex gap-3 flex-wrap">
                {themes.map((t) => (
                  <button
                    key={t}
                    onClick={() => onThemeChange(t)}
                    className={`relative w-12 h-12 rounded-full transition-all duration-200 hover:scale-110 ${
                      theme === t ? "ring-4 ring-offset-2 ring-primary ring-offset-background" : ""
                    }`}
                    style={{
                      background: `linear-gradient(135deg, hsl(${themeConfigs[t].primary}) 0%, hsl(${themeConfigs[t].accent}) 100%)`,
                    }}
                    title={themeConfigs[t].name}
                    data-testid={`button-theme-${t}`}
                  >
                    {theme === t && (
                      <Check className="absolute inset-0 m-auto w-6 h-6 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <Card className="p-6 space-y-4">
                <div>
                  <Label htmlFor="work-duration" className="text-base font-medium">
                    Work Duration (minutes)
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Set your focus session length (1-60 minutes)
                  </p>
                  <Input
                    id="work-duration"
                    type="number"
                    min="1"
                    max="60"
                    value={workDuration}
                    onChange={(e) => onWorkDurationChange(Number(e.target.value))}
                    data-testid="input-work-duration"
                  />
                </div>

                <div>
                  <Label htmlFor="break-duration" className="text-base font-medium">
                    Break Duration (minutes)
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Set your break length (1-30 minutes)
                  </p>
                  <Input
                    id="break-duration"
                    type="number"
                    min="1"
                    max="30"
                    value={breakDuration}
                    onChange={(e) => onBreakDurationChange(Number(e.target.value))}
                    data-testid="input-break-duration"
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
