import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";
import type { User } from "@shared/schema";

interface RecommendationsProps {
  user?: User;
}

export function Recommendations({ user }: RecommendationsProps) {
  const { t } = useTranslation();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['/api/ai/course-recommendations'],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <Card className="border border-border" data-testid="recommendations-loading">
        <CardContent className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mock recommendations if API doesn't return data
  const mockRecommendations = [
    {
      title: "Advanced R Programming",
      description: "Focus on statistical modeling and data manipulation",
      nsqfLevel: 6,
      duration: "4 weeks",
      priority: 1,
      type: "NSQF Level 6"
    },
    {
      title: "Industry Project",
      description: "Real-world data analysis case study", 
      duration: "6 weeks",
      priority: 2,
      type: "Certification"
    },
    {
      title: "Job Readiness Program",
      description: "Interview prep and portfolio building",
      duration: "3 weeks", 
      priority: 3,
      type: "Career Support"
    }
  ];

  const displayRecommendations = recommendations?.length > 0 ? 
    recommendations.slice(0, 3).map((course: any, index: number) => ({
      title: course.title,
      description: course.description || "Comprehensive course content",
      duration: course.duration || "4 weeks",
      priority: index + 1,
      type: course.nsqfLevel ? `NSQF Level ${course.nsqfLevel}` : "Professional Course"
    })) : mockRecommendations;

  const getBadgeColor = (priority: number) => {
    switch (priority) {
      case 1: return "bg-primary/10 text-primary";
      case 2: return "bg-accent/10 text-accent";
      case 3: return "bg-secondary/10 text-secondary";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="border border-border" data-testid="recommendations-card">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-foreground mb-4">
          {t('dashboard.nextSteps')}
        </h3>
        
        <div className="space-y-4">
          {displayRecommendations.map((recommendation, index) => (
            <div 
              key={index}
              className="p-4 border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer"
              data-testid={`recommendation-${index}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 ${getBadgeColor(recommendation.priority)} rounded-full flex items-center justify-center text-sm font-bold`}>
                  {recommendation.priority}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">
                    {recommendation.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {recommendation.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {recommendation.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {recommendation.duration}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" data-testid={`button-recommendation-${index}`}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button 
          variant="outline" 
          className="w-full mt-4"
          data-testid="button-view-all-recommendations"
        >
          View All Recommendations
        </Button>
      </CardContent>
    </Card>
  );
}
