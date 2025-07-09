import { useLocation } from "wouter";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LOCALE_STORAGE_KEY } from "@/lib/i18n";

interface LanguageDropdownProps {
  className?: string;
}

export default function LanguageDropdown({ className = "" }: LanguageDropdownProps) {
  const [location, setLocation] = useLocation();

  const getCurrentLanguage = () => {
    if (location.startsWith('/en')) return 'en';
    if (location.startsWith('/jp')) return 'ja';
    return 'zh-TW';
  };

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case 'en': return 'English';
      case 'ja': return '日本語';
      case 'zh-TW': return '繁體中文';
      default: return '繁體中文';
    }
  };

  const handleLanguageChange = (newLang: string) => {
    const currentPath = location;
    let newPath = '';

    // Remove existing language prefix
    const pathWithoutLang = currentPath.replace(/^\/(en|jp)/, '') || '/';

    // Add new language prefix if not default (zh-TW)
    if (newLang === 'en') {
      newPath = `/en${pathWithoutLang}`;
    } else if (newLang === 'ja') {
      newPath = `/jp${pathWithoutLang}`;
    } else {
      newPath = pathWithoutLang;
    }

    // Ensure path starts with /
    if (!newPath.startsWith('/')) {
      newPath = '/' + newPath;
    }

    // Save language preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLang);
    }

    setLocation(newPath);
  };

  const currentLang = getCurrentLanguage();

  return (
    <Select value={currentLang} onValueChange={handleLanguageChange}>
      <SelectTrigger className={`w-auto min-w-[120px] ${className}`}>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <SelectValue>{getLanguageLabel(currentLang)}</SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="zh-TW">繁體中文</SelectItem>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="ja">日本語</SelectItem>
      </SelectContent>
    </Select>
  );
}