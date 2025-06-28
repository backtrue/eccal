import { useState, useEffect } from 'react';
import { 
  type Locale, 
  DEFAULT_LOCALE, 
  getBrowserLocale, 
  getTranslations,
  LOCALE_STORAGE_KEY 
} from '@/lib/i18n';

export const useLocale = () => {
  const [locale, setLocale] = useState<Locale>(() => {
    // Only use stored locale if it exists, otherwise default to zh-TW
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale;
      if (stored && ['zh-TW', 'en', 'ja'].includes(stored)) {
        return stored;
      }
    }
    // Always default to Traditional Chinese
    return DEFAULT_LOCALE;
  });

  const translations = getTranslations(locale);

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    }
    // Force re-render by updating state
    setTimeout(() => {
      setLocale(newLocale);
    }, 0);
  };

  // Update document title and meta tags when locale changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = translations.metaTitle;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', translations.metaDescription);
      }
      
      // Update HTML lang attribute
      document.documentElement.lang = locale === 'zh-TW' ? 'zh-TW' : locale;
      
      console.log('Locale changed to:', locale); // Debug log
    }
  }, [locale, translations]);

  return {
    locale,
    translations,
    changeLocale,
    t: translations, // Shorthand alias
  };
};