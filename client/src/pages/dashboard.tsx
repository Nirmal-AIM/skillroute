import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ProgressCards } from "@/components/dashboard/progress-cards";
import { SkillAnalysis } from "@/components/dashboard/skill-analysis";
import { Recommendations } from "@/components/dashboard/recommendations";
import { CourseList } from "@/components/dashboard/course-list";
import { IndustryInsights } from "@/components/dashboard/industry-insights";
import { AchievementsGrid } from "@/components/dashboard/achievements-grid";
import { useState, useEffect } from "react";
import { Bell, Menu, Plus } from "lucide-react";
import i18n from "@/lib/i18n";

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/dashboard/analytics'],
  });

  const { data: enrollments } = useQuery({
    queryKey: ['/api/enrollments'],
  });

  const { data: achievements } = useQuery({
    queryKey: ['/api/user/achievements'],
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    // TODO: Update user preference in backend
  };

  if (analyticsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentRole = user?.careerAspirations || "Data Analyst";
  const userName = user?.firstName || "User";

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          data-testid="mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        data-testid="sidebar"
      />

      {/* Main Content */}
      <main className="ml-0 md:ml-72 min-h-screen">
        {/* Top Navigation */}
        <header className="bg-card border-b border-border px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
                data-testid="button-mobile-menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {t('dashboard.welcome', { name: userName })}
                </h2>
                <p className="text-muted-foreground">
                  {t('dashboard.subtitle', { role: currentRole })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <select 
                className="px-3 py-2 bg-card border border-border rounded-md text-foreground text-sm"
                onChange={(e) => handleLanguageChange(e.target.value)}
                value={i18n.language}
                data-testid="select-language"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="ta">தமிழ்</option>
                <option value="te">తెలుగు</option>
              </select>
              
              <Button variant="ghost" size="sm" className="relative" data-testid="button-notifications">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-8">
          {/* Progress Overview */}
          <ProgressCards analytics={analytics} />

          {/* AI Recommendations & Current Pathway */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <SkillAnalysis user={user} />
            </div>
            <Recommendations user={user} />
          </section>

          {/* Current Courses & Industry Trends */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CourseList enrollments={enrollments} />
            <IndustryInsights />
          </section>

          {/* Achievement & Gamification */}
          <AchievementsGrid achievements={achievements} />
        </div>
      </main>

      {/* Quick Action FAB */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-40"
        data-testid="button-fab-add"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
