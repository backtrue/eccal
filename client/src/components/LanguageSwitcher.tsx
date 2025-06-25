import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function LanguageSwitcher() {
  const [location, setLocation] = useLocation();

  const getCurrentLocale = () => {
    if (location.startsWith('/en')) return 'en';
    if (location.startsWith('/jp')) return 'ja';
    return 'zh-TW';
  };

  const handleLocaleChange = (newLocale: 'zh-TW' | 'en' | 'ja') => {
    const currentPath = location.replace(/^\/(en|jp)/, '') || '/';
    
    if (newLocale === 'zh-TW') {
      setLocation(currentPath === '/' ? '/' : currentPath);
    } else if (newLocale === 'en') {
      setLocation(`/en${currentPath === '/' ? '' : currentPath}`);
    } else if (newLocale === 'ja') {
      setLocation(`/jp${currentPath === '/' ? '' : currentPath}`);
    }
  };

  const currentLocale = getCurrentLocale();

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={currentLocale === 'zh-TW' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleLocaleChange('zh-TW')}
        className="text-xs"
      >
        繁中
      </Button>
      <Button
        variant={currentLocale === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleLocaleChange('en')}
        className="text-xs"
      >
        EN
      </Button>
      <Button
        variant={currentLocale === 'ja' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleLocaleChange('ja')}
        className="text-xs"
      >
        JP
      </Button>
    </div>
  );
}