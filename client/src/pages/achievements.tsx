import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Menu, Trophy, Star, BarChart3, Clock, GraduationCap, 
  Users, Lock, Award, Target, Zap, BookOpen, TrendingUp 
} from "lucide-react";
import type { Achievement } from "@shared/schema";

export default function Achievements() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: userAchievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ['/api/user/achievements'],
    enabled: isAuthenticated,
  });

  const { data: allAchievements } = useQuery({
    queryKey: ['/api/achievements'],
    enabled: isAuthenticated,
  });

  const { data: analytics } = useQuery({
    queryKey: ['/api/dashboard/analytics'],
    enabled: isAuthenticated,
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Mock achievements data
  const mockEarnedAchievements = [
    {
      id: "1",
      title: "Python Pro",
      description: "Completed 10 Python exercises",
      icon: "star",
      category: "technical",
      points: 50,
      earnedDate: "2024-01-15"
    },
    {
      id: "2", 
      title: "Data Viz Expert",
      description: "Created 5 dashboard visualizations",
      icon: "chart",
      category: "visualization",
      points: 75,
      earnedDate: "2024-01-10"
    },
    {
      id: "3",
      title: "Consistent Learner",
      description: "7 day learning streak",
      icon: "clock",
      category: "consistency",
      points: 30,
      earnedDate: "2024-01-08"
    },
    {
      id: "4",
      title: "Course Master",
      description: "Completed 3 full courses",
      icon: "graduation",
      category: "completion",
      points: 100,
      earnedDate: "2024-01-05"
    }
  ];

  const mockAvailableAchievements = [
    {
      id: "5",
      title: "Team Player",
      description: "Join a study group",
      icon: "users",
      category: "social",
      points: 40,
      requirements: "Join at least 1 study group"
    },
    {
      id: "6",
      title: "Certificate Holder",
      description: "Earn first certification", 
      icon: "trophy",
      category: "certification",
      points: 150,
      requirements: "Complete a certified course"
    },
    {
      id: "7",
      title: "Speed Learner",
      description: "Complete course in record time",
      icon: "zap",
      category: "speed",
      points: 80,
      requirements: "Complete course 50% faster than average"
    },
    {
      id: "8",
      title: "Knowledge Sharer",
      description: "Help other learners",
      icon: "users",
      category: "community",
      points: 60,
      requirements: "Answer 10 questions in forums"
    }
  ];

  const earnedAchievements = userAchievements?.length > 0 ? userAchievements : mockEarnedAchievements;
  const availableAchievements = allAchievements?.length > 0 ? allAchievements : mockAvailableAchievements;

  const totalPoints = earnedAchievements.reduce((sum: number, achievement: any) => sum + (achievement.points || 0), 0);
  const totalPossiblePoints = [...earnedAchievements, ...availableAchievements].reduce((sum: number, achievement: any) => sum + (achievement.points || 0), 0);
  const completionPercentage = totalPossiblePoints > 0 ? (totalPoints / totalPossiblePoints) * 100 : 0;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'star': return Star;
      case 'chart': return BarChart3;
      case 'clock': return Clock;
      case 'graduation': return GraduationCap;
      case 'users': return Users;
      case 'trophy': return Trophy;
      case 'target': return Target;
      case 'zap': return Zap;
      case 'book': return BookOpen;
      case 'trending': return TrendingUp;
      default: return Star;
    }
  };

  const getIconColor = (category: string) => {
    switch (category) {
      case 'technical': return 'text-accent';
      case 'visualization': return 'text-secondary';
      case 'consistency': return 'text-primary';
      case 'completion': return 'text-destructive';
      case 'social': return 'text-secondary';
      case 'certification': return 'text-accent';
      case 'speed': return 'text-primary';
      case 'community': return 'text-secondary';
      default: return 'text-primary';
    }
  };

  const getBgColor = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-accent/10';
      case 'visualization': return 'bg-secondary/10';
      case 'consistency': return 'bg-primary/10';
      case 'completion': return 'bg-destructive/10';
      case 'social': return 'bg-secondary/10';
      case 'certification': return 'bg-accent/10';
      case 'speed': return 'bg-primary/10';
      case 'community': return 'bg-secondary/10';
      default: return 'bg-primary/10';
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-accent/20 text-accent';
      case 'visualization': return 'bg-secondary/20 text-secondary';
      case 'consistency': return 'bg-primary/20 text-primary';
      case 'completion': return 'bg-destructive/20 text-destructive';
      case 'social': return 'bg-secondary/20 text-secondary';
      case 'certification': return 'bg-accent/20 text-accent';
      case 'speed': return 'bg-primary/20 text-primary';
      case 'community': return 'bg-secondary/20 text-secondary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

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
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4 sticky top-0 z-30">
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
              <h1 className="text-2xl font-bold text-foreground">
                {t('nav.achievements')}
              </h1>
              <p className="text-muted-foreground">
                Track your learning milestones and celebrate progress
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Stats Overview */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Trophy className="text-accent text-xl" />
                  </div>
                  <span className="text-2xl font-bold text-foreground" data-testid="earned-count">
                    {earnedAchievements.length}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Badges Earned</h3>
                <p className="text-sm text-muted-foreground">Out of {earnedAchievements.length + availableAchievements.length} total</p>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Star className="text-primary text-xl" />
                  </div>
                  <span className="text-2xl font-bold text-foreground" data-testid="total-points">
                    {totalPoints}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Total Points</h3>
                <p className="text-sm text-muted-foreground">From completed achievements</p>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Target className="text-secondary text-xl" />
                  </div>
                  <span className="text-2xl font-bold text-foreground" data-testid="completion-percentage">
                    {Math.round(completionPercentage)}%
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Completion</h3>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="progress-bar h-2 rounded-full" 
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                    <Award className="text-destructive text-xl" />
                  </div>
                  <span className="text-2xl font-bold text-foreground" data-testid="rank">
                    #{Math.floor(Math.random() * 100) + 1}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Rank</h3>
                <p className="text-sm text-muted-foreground">Among all learners</p>
              </CardContent>
            </Card>
          </section>

          {/* Achievement Tabs */}
          <Tabs defaultValue="earned" className="w-full">
            <TabsList className="grid w-full grid-cols-2" data-testid="achievement-tabs">
              <TabsTrigger value="earned" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Earned ({earnedAchievements.length})
              </TabsTrigger>
              <TabsTrigger value="available" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Available ({availableAchievements.length})
              </TabsTrigger>
            </TabsList>
            
            {/* Earned Achievements */}
            <TabsContent value="earned" className="mt-6">
              {achievementsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-48 w-full" />
                  ))}
                </div>
              ) : earnedAchievements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {earnedAchievements.map((achievement: any) => {
                    const IconComponent = getIcon(achievement.icon);
                    return (
                      <Card 
                        key={achievement.id} 
                        className="border border-border card-hover"
                        data-testid={`earned-achievement-${achievement.id}`}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className={`w-16 h-16 ${getBgColor(achievement.category)} rounded-full flex items-center justify-center`}>
                              <IconComponent className={`${getIconColor(achievement.category)} text-2xl`} />
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                                +{achievement.points} pts
                              </Badge>
                            </div>
                          </div>
                          <CardTitle className="text-lg">
                            {achievement.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            {achievement.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant="outline" 
                              className={getCategoryBadgeColor(achievement.category)}
                            >
                              {achievement.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Earned {achievement.earnedDate || 'recently'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Trophy className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    No Achievements Yet
                  </h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Start learning and completing courses to earn your first achievements and badges.
                  </p>
                  <Button data-testid="button-start-learning">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Start Learning
                  </Button>
                </div>
              )}
            </TabsContent>
            
            {/* Available Achievements */}
            <TabsContent value="available" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableAchievements.map((achievement: any) => {
                  const IconComponent = getIcon(achievement.icon);
                  return (
                    <Card 
                      key={achievement.id} 
                      className="border border-border opacity-75 hover:opacity-100 transition-opacity"
                      data-testid={`available-achievement-${achievement.id}`}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                            <Lock className="text-muted-foreground text-xl" />
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="bg-muted text-muted-foreground">
                              +{achievement.points} pts
                            </Badge>
                          </div>
                        </div>
                        <CardTitle className="text-lg text-muted-foreground">
                          {achievement.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {achievement.description}
                        </p>
                        <div className="space-y-3">
                          <div>
                            <span className="text-xs font-medium text-foreground">Requirements:</span>
                            <p className="text-xs text-muted-foreground mt-1">
                              {achievement.requirements || achievement.description}
                            </p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className="bg-muted text-muted-foreground"
                          >
                            {achievement.category}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>

          {/* Progress Section */}
          <section>
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Achievement Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Completion</span>
                    <span className="text-sm text-muted-foreground">
                      {earnedAchievements.length} / {earnedAchievements.length + availableAchievements.length}
                    </span>
                  </div>
                  <Progress 
                    value={completionPercentage} 
                    className="h-3"
                    data-testid="overall-progress"
                  />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">{earnedAchievements.filter((a: any) => a.category === 'technical').length}</div>
                      <div className="text-xs text-muted-foreground">Technical</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">{earnedAchievements.filter((a: any) => a.category === 'completion').length}</div>
                      <div className="text-xs text-muted-foreground">Completion</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">{earnedAchievements.filter((a: any) => a.category === 'consistency').length}</div>
                      <div className="text-xs text-muted-foreground">Consistency</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">{earnedAchievements.filter((a: any) => a.category === 'social').length}</div>
                      <div className="text-xs text-muted-foreground">Social</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
