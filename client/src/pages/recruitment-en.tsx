import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Target, 
  TrendingUp, 
  BarChart3, 
  Zap, 
  Gift, 
  Star,
  Clock,
  Users,
  Award,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface RecruitmentProps {
  locale?: string;
}

export default function RecruitmentEn({ locale = 'en' }: RecruitmentProps) {
  const painPoints = [
    "Clear revenue goals but no idea how much 'ad budget' is reasonable?",
    "Been running ads for a while but don't know if the performance is good or bad?", 
    "Heard about data analysis, but with so many numbers in GA4 and FB backend, which ones are key?",
    "Want to learn AI, but market courses only teach 'general skills', can't solve specific 'ad placement' issues.",
    "Bought online courses but too lazy to watch, no one to ask when problems arise, eventually give up..."
  ];

  const targetAudience = [
    {
      title: "E-commerce Brand Owners/Marketers",
      description: "Want to precisely control ad budgets and maximize every dollar's efficiency."
    },
    {
      title: "Ad Specialists/Agencies", 
      description: "Want to use data to convince clients and provide more professional optimization advice."
    },
    {
      title: "Content Creators/KOLs",
      description: "Want to understand their traffic and ad performance to make smarter business decisions."
    },
    {
      title: "Data-Driven Marketing Enthusiasts",
      description: "Want to eliminate guesswork and use scientific methods for decision-making."
    }
  ];

  const notSuitableFor = [
    "Those who haven't started any advertising and know nothing about basic concepts.",
    "Those looking for 'one-click wealth' magic buttons, unwilling to learn hands-on data analysis.",
    "Those hesitant about investing in their professional skills and business."
  ];

  const faqs = [
    {
      question: "I'm not tech-savvy, will this be too difficult?",
      answer: "No worries at all! The main purpose of this live session is for me to personally guide you through all the setup. As long as you can use a mouse and keyboard, you can follow along."
    },
    {
      question: "Can I watch the replay if I miss the live session?",
      answer: "Yes! All founding members can watch the live recording unlimited times."
    },
    {
      question: "Is the 'lifetime access' real?",
      answer: "Yes, this is my commitment to the 300 founding members. Future platform access will be annual subscription-based, only founding members enjoy this privilege."
    },
    {
      question: "How do I attend classes and use the software after purchase?",
      answer: "After successful purchase, you'll receive a confirmation email with live course link, software registration method, and online course redemption information."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* 頂部導覽 */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/en">
              <div className="text-2xl font-bold text-blue-600">Report Data</div>
            </Link>
            <Link href="/en/pricing">
              <Button variant="ghost" size="sm">
                Back to Platform
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* 第一部分：鉤子 - The Hook */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="mb-8">
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-4 py-2 text-lg font-medium mb-6">
              🔥 Limited Time Enrollment
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Stop Running Ads by Gut Feeling!
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-600 font-semibold mb-8">
            This isn't another theory course - I'm giving you a proven system to boost your ROAS.
          </p>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
              <div className="flex-shrink-0">
                <img 
                  src="/attached_assets/image_1753281122819.png" 
                  alt="Yu-Ting Chiu Teacher Black" 
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-lg"
                />
              </div>
              <div className="flex-1 text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  I'm Yu-Ting Chiu, known as "Teacher Black"
                </h2>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Over a decade of experience, starting from MIS and web planning, serving as Marketing Director at uitox Global E-commerce Group and Marketing Manager at Buynow China HQ. Currently Chief Consultant at Siumai Institute. I specialize in "Inbound Marketing," author of "Web Attraction Power," recognized as Taiwan's e-commerce "battle strategy" expert.
                </p>
                <p className="text-lg text-blue-600 font-semibold">
                  I don't teach theory - I give you actionable systems you can implement immediately.
                </p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Have you ever stared at Facebook Ads Manager numbers wondering: "Is my ad spend really being used effectively?" "Why do others' ads make money while mine just burn cash?" You bought courses, read articles, but when it comes to setting budgets, you still rely on "feelings".
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4 font-medium">
                If this resonates with you, this isn't just another live class - this is the answer you've been searching for.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 第二部分：痛點 - The Pain */}
      <section className="py-16 px-4 bg-red-50 dark:bg-red-900/10">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Are You Also Struggling with These Issues?
          </h2>
          
          <div className="grid gap-6">
            {painPoints.map((pain, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md flex items-start gap-4">
                <div className="w-6 h-6 border-2 border-red-500 rounded flex-shrink-0 mt-1"></div>
                <p className="text-lg text-gray-700 dark:text-gray-300">{pain}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-xl text-red-600 dark:text-red-400 font-semibold">
              If these issues make you nod repeatedly, keep reading...
            </p>
          </div>
        </div>
      </section>

      {/* 第三部分：解方 - The Solution */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Instead of Another Theory Set, I Give You a Complete "Battle System"
          </h2>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8 mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                <Zap className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              I understand advertisers' pain points. So this time, I'm not doing empty theoretical teaching. Through a <strong>2.5-hour live workshop</strong>, I'll directly guide you through my battle-tested product - forged through over ten years of expertise, my SaaS platform "Report Data" specifically for e-commerce advertisers.
            </p>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 inline-block">
              <p className="text-2xl font-bold text-blue-600 mb-2">
                This System Will Become Your AI Ad Strategist
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 第四部分：價值展示 - The Value */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            This Isn't Just a Course - It's a Limited "Founding Membership Package"
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* 價值一：軟體 */}
            <Card className="relative overflow-hidden border-2 border-blue-200 hover:border-blue-400 transition-all">
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 text-sm font-medium">
                Core Value
              </div>
              <CardHeader className="text-center pt-8">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">
                  【Enterprise Software】"Report Data" Platform Lifetime Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  You'll get a login-required private software integrating GA4 and Facebook API, powered by GPT-4. It includes three core engines: GA Budget Calculator, Pro Campaign Planner, and AI Ad Health Check System.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  Future standalone annual price: $190
                </p>
              </CardContent>
            </Card>

            {/* 價值二：直播 */}
            <Card className="relative overflow-hidden border-2 border-green-200 hover:border-green-400 transition-all">
              <div className="absolute top-0 right-0 bg-green-600 text-white px-3 py-1 text-sm font-medium">
                Expert-Led
              </div>
              <CardHeader className="text-center pt-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">
                  【Expert Guidance】2.5-Hour Live Workshop
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  I'll personally guide you through all setup online, from Google/Facebook account integration to platform core functions. Any questions? Ask live, get answers immediately.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  Value: $69
                </p>
              </CardContent>
            </Card>

            {/* 價值三：課程 */}
            <Card className="relative overflow-hidden border-2 border-orange-200 hover:border-orange-400 transition-all">
              <div className="absolute top-0 right-0 bg-orange-600 text-white px-3 py-1 text-sm font-medium">
                Complete System
              </div>
              <CardHeader className="text-center pt-8">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">
                  【Complete Knowledge】FB Ad Performance Course
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Besides live workshop, you'll get Teacher Black's complete pre-recorded online course. As your permanent learning backup, allowing you to review and dive deeper into every advertising detail.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  Price: $59
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 第五部分：定價與行動呼籲 - CTA & Pricing */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-12">
            Become My Founding Member with One-Time Investment
          </h2>
          
          {/* 價值錨定 */}
          <div className="bg-white/10 rounded-xl p-8 mb-12 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-6">Total Value Calculation</h3>
            <div className="space-y-3 text-lg">
              <div className="flex justify-between">
                <span>SaaS Platform Lifetime Access:</span>
                <span className="line-through">$190+</span>
              </div>
              <div className="flex justify-between">
                <span>Live Workshop:</span>
                <span className="line-through">$69</span>
              </div>
              <div className="flex justify-between">
                <span>Complete Online Course:</span>
                <span className="line-through">$59</span>
              </div>
              <hr className="border-white/30" />
              <div className="flex justify-between text-xl font-bold">
                <span>Total Value:</span>
                <span>Over $318</span>
              </div>
            </div>
          </div>
          
          {/* 震撼定價 */}
          <div className="bg-white text-gray-900 rounded-2xl p-12 mb-8 max-w-lg mx-auto shadow-2xl">
            <div className="mb-6">
              <p className="text-lg text-gray-600 mb-2">Founding Member Access, Only:</p>
              <div className="text-6xl font-bold text-red-600 mb-2">
                $ 169
              </div>
              <p className="text-sm text-gray-500">(Global limit 300 seats, closes when full)</p>
            </div>
            
            <Link href="/en/subscription-checkout?plan=founders&priceId=price_0Rnx9uYDQY3sAQESYItswBEA">
              <Button 
                size="lg" 
                className="w-full h-16 text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg transform hover:scale-105 transition-all"
              >
                <Gift className="w-6 h-6 mr-2" />
                Secure My Founding Member Seat Now
              </Button>
            </Link>
            
            <p className="text-sm text-gray-500 mt-4">
              Seats running out, will permanently close when full
            </p>
          </div>
          
          <div className="flex justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>30-Day Satisfaction Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Lifetime Free Updates</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Dedicated Customer Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* 第六部分：受眾輪廓 - Target Audience */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            If You Match Any of These, This Course is Designed for You
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* 適合的人 */}
            <div>
              <h3 className="text-2xl font-bold text-green-600 mb-6 flex items-center gap-2">
                <CheckCircle className="w-8 h-8" />
                Perfect for This Course
              </h3>
              <div className="space-y-4">
                {targetAudience.map((audience, index) => (
                  <Card key={index} className="border-green-200 hover:border-green-400 transition-all">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {audience.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {audience.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* 不適合的人 */}
            <div>
              <h3 className="text-2xl font-bold text-red-600 mb-6 flex items-center gap-2">
                <XCircle className="w-8 h-8" />
                Not Suitable for This Course
              </h3>
              <div className="space-y-4">
                {notSuitableFor.map((item, index) => (
                  <Card key={index} className="border-red-200 hover:border-red-400 transition-all">
                    <CardContent className="p-4">
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {item}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 第七部分：FAQ */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Q: {faq.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    A: {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 最終行動呼籲 */}
      <section className="py-16 px-4 bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            Don't Let This Opportunity Slip Away
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            300 founding member seats - once full, this price will never appear again
          </p>
          
          <Link href="/en/subscription-checkout?plan=founders&priceId=price_0Rnx9uYDQY3sAQESYItswBEA">
            <Button 
              size="lg" 
              className="h-16 px-12 text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg transform hover:scale-105 transition-all"
            >
              Last Chance - Join Founding Members Now
              <ChevronRight className="w-6 h-6 ml-2" />
            </Button>
          </Link>
          
          <p className="text-sm text-gray-400 mt-6">
            Click button to go to secure payment page
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="mb-4">
            <div className="text-2xl font-bold text-blue-400 mb-2">Report Data</div>
            <p className="text-gray-400">Professional E-commerce Ad Analytics Platform</p>
          </div>
          <div className="text-sm text-gray-500">
            <p>&copy; 2025 Yu Yan Consulting Co., Ltd.(TW) | Toldyou Consulting Co., Ltd.(JP). All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}