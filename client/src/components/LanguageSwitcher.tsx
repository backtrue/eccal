import { useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocale } from '@/hooks/useLocale';
import { getAvailableLocales, getLocaleDisplayName, type Locale } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const { locale, changeLocale } = useLocale();
  const [open, setOpen] = useState(false);
  
  const availableLocales = getAvailableLocales();

  const handleLocaleChange = (newLocale: Locale) => {
    console.log('Switching to locale:', newLocale); // Debug log
    changeLocale(newLocale);
    setOpen(false);
  };

  // Simple button version for testing
  if (true) {
    return (
      <div className="flex gap-1">
        {availableLocales.map((loc) => (
          <button
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={`px-2 py-1 text-sm rounded border ${
              locale === loc 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {getLocaleDisplayName(loc)}
          </button>
        ))}
      </div>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2 min-w-0"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {getLocaleDisplayName(locale)}
          </span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        {availableLocales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span>{getLocaleDisplayName(loc)}</span>
            {locale === loc && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}