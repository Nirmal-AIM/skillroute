import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Star, BarChart3, Clock, GraduationCap, Users, Lock } from "lucide-react";
import type { Achievement } from "@shared/schema";

interface AchievementsGridProps {
  achievements?: Achievement[];
}

export function AchievementsGrid({ achievements }: AchievementsGridProps) {
  const { t } = useTranslation();

  // Mock achievements data
  const mockAchievements = [
    {
      id: "1",
      title: "Python Pro",
      description: "Completed 10 Python exercises",
      icon: "star",
      category: "technical",
      earned: true
    },
    {
      id: "2", 
      title: "Data Viz Expert",
      description: "Created 5 dashboard visualizations",
      icon: "chart",
      category: "visualization",
      earned: true
    },
    {
      id: "3",
      title: "Consistent Learner",
      description: "7 day learning streak",
      icon: "clock",
      category: "consistency", 
      earned: true
    },
    {
      id: "4",
      title: "Course Master",
      description: "Completed 3 full courses",
      icon: "graduation",
      category: "completion",
      earned: true
    },
    {
      id: "5",
      title: "Team Player",
      description: "Join a study group",
      icon: "users",
      category: "social",
      earned: false
    },
    {
      id: "6",
      title: "Certificate Holder",
      description: "Earn first certification", 
      icon: "trophy",
      category: "certification",
      earned: false
    }
  ];

  const displayAchievements = achievements?.length > 0 ? 
    achievements.map(achievement => ({
      id: achievement.id,
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      category: achievement.category,
      earned: true
    })) : mockAchievements;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'star': return Star;
      case 'chart': return BarChart3;
      case 'clock': return Clock;
      case 'graduation': return GraduationCap;
      case 'users': return Users;
      case 'trophy': return Trophy;
      default: return Star;
    }
  };

  const getIconColor = (category: string, earned: boolean) => {
    if (!earned) return 'text-muted-foreground';
    
    switch (category) {
      case 'technical': return 'text-accent';
      case 'visualization': return 'text-secondary';
      case 'consistency': return 'text-primary';
      case 'completion': return 'text-destructive';
      case 'social': return 'text-secondary';
      case 'certification': return 'text-accent';
      default: return 'text-primary';
    }
  };

  const getBgColor = (category: string, earned: boolean) => {
    if (!earned) return 'bg-muted';
    
    switch (category) {
      case 'technical': return 'bg-accent/10';
      case 'visualization': return 'bg-secondary/10';
      case 'consistency': return 'bg-primary/10';
      case 'completion': return 'bg-destructive/10';
      case 'social': return 'bg-secondary/10';
      case 'certification': return 'bg-accent/10';
      default: return 'bg-primary/10';
    }
  };

  if (!displayAchievements) {
    return (
      <Card className="border border-border" data-testid="achievements-loading">
        <CardContent className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border" data-testid="achievements-grid-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-foreground">
            {t('dashboard.recentAchievements')}
          </h3>
          <Button variant="ghost" className="text-primary hover:text-primary/80 font-medium" data-testid="button-view-all-badges">
            View All Badges
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {displayAchievements.map((achievement) => {
            const IconComponent = achievement.earned ? getIcon(achievement.icon) : Lock;
            const iconColor = getIconColor(achievement.category, achievement.earned);
            const bgColor = getBgColor(achievement.category, achievement.earned);
            
            return (
              <div
                key={achievement.id}
                className={`text-center p-4 rounded-lg hover:bg-muted transition-colors cursor-pointer ${achievement.earned ? '' : 'opacity-50'}`}
                data-testid={`achievement-${achievement.id}`}
              >
                <div className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <IconComponent className={`${iconColor} text-2xl`} />
                </div>
                <h4 className={`font-semibold text-sm mb-1 ${achievement.earned ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {achievement.title}
                </h4>
                <p className={`text-xs ${achievement.earned ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                  {achievement.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            You've earned {displayAchievements.filter(a => a.earned).length} out of {displayAchievements.length} badges
          </p>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary"
              style={{ 
                width: `${(displayAchievements.filter(a => a.earned).length / displayAchievements.length) * 100}%` 
              }}
              data-testid="achievements-progress-bar"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
