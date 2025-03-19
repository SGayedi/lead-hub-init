
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/ModeToggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

interface AppearanceSettingsProps {
  interfaceDensity: string;
  onDensityChange: (value: string) => void;
}

export function AppearanceSettings({
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
          <ToggleGroup type="single" value={theme} onValueChange={(value) => value && setTheme(value as "light" | "dark")}>
            <ToggleGroupItem value="light" aria-label="Light Mode">
              <Sun className="h-4 w-4 mr-2" />
              Light
            </ToggleGroupItem>
            <ToggleGroupItem value="dark" aria-label="Dark Mode">
              <Moon className="h-4 w-4 mr-2" />
              Dark
            </ToggleGroupItem>
          </ToggleGroup>
          
          <div className="ml-auto">
            <ModeToggle />
          </div>
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
