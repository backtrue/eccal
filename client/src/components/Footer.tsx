import { Link, useLocation } from "wouter";
import { getTranslations, type Locale } from "@/lib/i18n";

export default function Footer() {
  const [location] = useLocation();
  
  const getCurrentLocale = (): Locale => {
    if (location.startsWith('/en')) return 'en';
    if (location.startsWith('/jp')) return 'ja';
    return 'zh-TW';
  };
  
  const t = getTranslations(getCurrentLocale());

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4">
              <a 
                href="https://thinkwithblack.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-300 transition-colors"
              >
                報數據
              </a>
            </h3>
            <p className="text-gray-300 mb-4">
              {t.calculatorDescription}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">快速連結</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  {t.home}
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-300 hover:text-white transition-colors">
                  {t.privacy}
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-gray-300 hover:text-white transition-colors">
                  {t.terms}
                </Link>
              </li>
            </ul>
          </div>

          {/* Course Link */}
          <div>
            <h4 className="text-lg font-semibold mb-4">相關課程</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.pressplay.cc/project/5F4DA34A5C0E4300081F3A58" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t.courseLink}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 {t.companyName}. {t.allRightsReserved}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}