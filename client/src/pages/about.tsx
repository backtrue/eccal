import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Calculator, TrendingUp, BarChart3, Users, Star, Heart } from "lucide-react";
import NavigationBar from "@/components/NavigationBar";
import Footer from "@/components/Footer";
import { getTranslations, type Locale } from "@/lib/i18n";

interface AboutProps {
  locale: Locale;
}

export default function About({ locale }: AboutProps) {
  const t = getTranslations(locale);

  useEffect(() => {
    document.title = t.about.title;
  }, [t.about.title]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <NavigationBar locale={locale} />
      
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {t.about.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t.about.subtitle}
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-2">
                <Heart className="text-red-500" size={24} />
                {t.about.mission.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t.about.mission.problem}
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t.about.mission.solution}
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t.about.mission.platform}
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                {t.about.mission.outcome}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Founder Section */}
        <div className="mb-16">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="text-blue-500" size={24} />
                {t.about.founder.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t.about.founder.intro}
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t.about.founder.experience}
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t.about.founder.philosophy}
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                {t.about.founder.vision}
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t.about.founder.conclusion}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Company Section */}
        <div className="mb-16">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-2">
                <Star className="text-yellow-500" size={24} />
                {t.about.company.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t.about.company.description}
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t.about.company.mission}
              </p>
              
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                  {t.about.company.courses_intro}
                </p>
                
                <div className="grid md:grid-cols-1 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {t.about.company.course1.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {t.about.company.course1.description}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {t.about.company.course2.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {t.about.company.course2.description}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {t.about.company.course3.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {t.about.company.course3.description}
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t.about.company.japan_office}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Message Section */}
        <div className="mb-16">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="text-green-500" size={24} />
                {t.about.message.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t.about.message.growth}
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                {t.about.message.conclusion}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">
                {t.about.cta.title}
              </CardTitle>
              <CardDescription className="text-blue-100">
                {t.about.cta.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href={locale === 'zh-TW' ? '/calculator' : `/${locale}/calculator`}
                  className="no-underline"
                >
                  <Button 
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-gray-100 w-full sm:w-auto"
                  >
                    <Calculator className="mr-2" size={20} />
                    {t.about.cta.calculator}
                  </Button>
                </Link>
                <Link 
                  href={locale === 'zh-TW' ? '/fbaudit' : `/${locale}/fbaudit`}
                  className="no-underline"
                >
                  <Button 
                    size="lg" 
                    className="bg-red-500 text-white hover:bg-red-600 w-full sm:w-auto"
                  >
                    <BarChart3 className="mr-2" size={20} />
                    {t.about.cta.fbaudit}
                  </Button>
                </Link>
                <Link 
                  href={locale === 'zh-TW' ? '/campaign-planner' : `/${locale}/campaign-planner`}
                  className="no-underline"
                >
                  <Button 
                    size="lg" 
                    className="bg-purple-500 text-white hover:bg-purple-600 w-full sm:w-auto"
                  >
                    <TrendingUp className="mr-2" size={20} />
                    {t.about.cta.campaign_planner}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}