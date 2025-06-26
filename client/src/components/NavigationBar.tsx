import { Link } from "wouter";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTranslations, type Locale } from "@/lib/i18n";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import LogoutButton from "@/components/LogoutButton";
import { useAuth } from "@/hooks/useAuth";

interface NavigationBarProps {
  locale: Locale;
}

export default function NavigationBar({ locale }: NavigationBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const t = getTranslations(locale);

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">報</span>
              </div>
              <span className="font-bold text-xl text-gray-900">報數據</span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/">
              <a className="text-gray-600 hover:text-gray-900 transition-colors">
                {t.calculator}
              </a>
            </Link>
            
            <Link href="/campaign-planner">
              <a className="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors">
                {t.campaignPlanner}
                <Badge variant="outline" className="text-xs">PRO</Badge>
              </a>
            </Link>

            {isAuthenticated && (
              <Link href="/dashboard">
                <a className="text-gray-600 hover:text-gray-900 transition-colors">
                  儀表板
                </a>
              </Link>
            )}

            {/* Auth buttons */}
            <div className="flex items-center space-x-2">
              {isAuthenticated ? (
                <LogoutButton />
              ) : (
                <GoogleLoginButton className="text-sm" />
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link href="/">
                <a className="text-gray-600 hover:text-gray-900 transition-colors">
                  {t.calculator}
                </a>
              </Link>
              
              <Link href="/campaign-planner">
                <a className="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors">
                  {t.campaignPlanner}
                  <Badge variant="outline" className="text-xs">PRO</Badge>
                </a>
              </Link>

              {isAuthenticated && (
                <Link href="/dashboard">
                  <a className="text-gray-600 hover:text-gray-900 transition-colors">
                    儀表板
                  </a>
                </Link>
              )}

              <div className="pt-2 border-t">
                {isAuthenticated ? (
                  <LogoutButton />
                ) : (
                  <GoogleLoginButton className="w-full" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}