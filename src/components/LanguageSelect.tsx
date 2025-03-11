
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export type Language = "en" | "ru" | "tr" | "az";

type LanguageOption = {
  value: Language;
  label: string;
  nativeName: string;
};

const languages: LanguageOption[] = [
  { value: "en", label: "English", nativeName: "English" },
  { value: "ru", label: "Russian", nativeName: "Русский" },
  { value: "tr", label: "Turkish", nativeName: "Türkçe" },
  { value: "az", label: "Azerbaijani", nativeName: "Azərbaycan" },
];

export function LanguageSelect() {
  const [language, setLanguage] = useState<Language>("en");
  const { toast } = useToast();

  const handleLanguageChange = (value: Language) => {
    setLanguage(value);
    toast({
      title: "Language Changed",
      description: `Interface language set to ${languages.find(l => l.value === value)?.label}`,
    });
  };

  return (
    <Select value={language} onValueChange={handleLanguageChange as (value: string) => void}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            {lang.label} ({lang.nativeName})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
