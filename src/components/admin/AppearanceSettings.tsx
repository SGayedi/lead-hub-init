
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/ModeToggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Check, Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const themeColors = [
  { label: "Default", value: "default", light: "bg-white", dark: "dark:bg-gray-900" },
  { label: "Blue", value: "blue", light: "bg-blue-50", dark: "dark:bg-blue-950" },
  { label: "Green", value: "green", light: "bg-green-50", dark: "dark:bg-green-950" },
  { label: "Purple", value: "purple", light: "bg-purple-50", dark: "dark:bg-purple-950" },
  { label: "Rose", value: "rose", light: "bg-rose-50", dark: "dark:bg-rose-950" },
  { label: "Amber", value: "amber", light: "bg-amber-50", dark: "dark:bg-amber-950" }
];

interface AppearanceSettingsProps {
  selectedTheme: string;
  onThemeChange: (value: string) => void;
  interfaceDensity: string;
  onDensityChange: (value: string) => void;
}

export function AppearanceSettings({
  selectedTheme,
  onThemeChange,
  interfaceDensity,
  onDensityChange
}: AppearanceSettingsProps) {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="space-y-6">
      {/* Theme Mode Selection */}
      <div className="space-y-2">
        <Label>Theme Mode</Label>
        <div className="flex items-center space-x-2">
          <ToggleGroup type="single" value={theme} onValueChange={(value) => value && setTheme(value as "light" | "dark" | "system")}>
            <ToggleGroupItem value="light" aria-label="Light Mode">
              <Sun className="h-4 w-4 mr-2" />
              Light
            </ToggleGroupItem>
            <ToggleGroupItem value="dark" aria-label="Dark Mode">
              <Moon className="h-4 w-4 mr-2" />
              Dark
            </ToggleGroupItem>
            <ToggleGroupItem value="system" aria-label="System Mode">
              <Monitor className="h-4 w-4 mr-2" />
              System
            </ToggleGroupItem>
          </ToggleGroup>
          
          <div className="ml-auto">
            <ModeToggle />
          </div>
        </div>
      </div>
      
      {/* Color Theme Selection */}
      <div className="space-y-2">
        <Label>Color Theme</Label>
        <div className="grid grid-cols-3 gap-2">
          {themeColors.map((colorOption) => (
            <Card 
              key={colorOption.value}
              className={`${selectedTheme === colorOption.value ? 'ring-2 ring-primary' : ''} cursor-pointer transition-all`}
              onClick={() => onThemeChange(colorOption.value)}
            >
              <CardContent className="p-2 flex flex-col items-center">
                <div className={`w-full h-8 rounded-md ${colorOption.light} ${colorOption.dark} mb-2 relative`}>
                  {selectedTheme === colorOption.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </div>
                <span className="text-xs">{colorOption.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Interface Density */}
      <div className="space-y-2">
        <Label>Interface Density</Label>
        <ToggleGroup 
          type="single" 
          value={interfaceDensity} 
          onValueChange={(value) => value && onDensityChange(value)}
          className="justify-start"
        >
          <ToggleGroupItem value="comfortable" aria-label="Comfortable">
            Comfortable
          </ToggleGroupItem>
          <ToggleGroupItem value="compact" aria-label="Compact">
            Compact
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
