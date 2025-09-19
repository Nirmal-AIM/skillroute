import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { RefreshCw, Bot, BarChart3, Database, Code } from "lucide-react";
import type { User } from "@shared/schema";

interface SkillAnalysisProps {
  user?: User;
}

interface SkillGap {
  skillName: string;
  currentLevel: string;
  requiredLevel: string;
  priority: 'high' | 'medium' | 'low';
  recommendations: string[];
}

interface SkillGapAnalysis {
  skillGaps: SkillGap[];
  overallScore: number;
  strengths: string[];
  improvementAreas: string[];
  careerReadiness: number;
}

export function SkillAnalysis({ user }: SkillAnalysisProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [analysisData, setAnalysisData] = useState<SkillGapAnalysis | null>(null);

  const { data: skillAnalysis, isLoading } = useQuery({
    queryKey: ['/api/ai/analysis', user?.id],
    enabled: false, // Don't auto-fetch, only when requested
  });

  const analyzeSkillsMutation = useMutation({
    mutationFn: async () => {
      const targetRole = user?.careerAspirations || "Data Analyst";
      const response = await apiRequest("POST", "/api/ai/skill-analysis", { targetRole });
      return response.json();
    },
    onSuccess: (data: SkillGapAnalysis) => {
      setAnalysisData(data);
      toast({
        title: "Analysis Complete",
        description: "Your skill gap analysis has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze skills. Please try again.",
        variant: "destructive",
      });
      console.error("Skill analysis error:", error);
    },
  });

  const handleAnalyze = () => {
    analyzeSkillsMutation.mutate();
  };

  const getSkillIcon = (skillName: string) => {
    const name = skillName.toLowerCase();
    if (name.includes('visualization') || name.includes('chart') || name.includes('tableau')) {
      return BarChart3;
    } else if (name.includes('machine learning') || name.includes('database') || name.includes('sql')) {
      return Database;
    } else if (name.includes('programming') || name.includes('python') || name.includes('code')) {
      return Code;
    }
    return BarChart3;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-accent';
      case 'low': return 'text-secondary';
      default: return 'text-muted-foreground';
    }
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'from-secondary to-accent';
    if (score >= 60) return 'from-accent to-primary';
    return 'from-destructive to-accent';
  };

  return (
    <Card className="border border-border" data-testid="skill-analysis-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Bot className="text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">
                {t('dashboard.aiAnalysis')}
              </h3>
              <p className="text-muted-foreground">
                Personalized recommendations based on your profile
              </p>
            </div>
          </div>
          <Button 
            onClick={handleAnalyze}
            disabled={analyzeSkillsMutation.isPending}
            data-testid="button-update-analysis"
          >
            {analyzeSkillsMutation.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {t('dashboard.updateAnalysis')}
          </Button>
        </div>

        {analyzeSkillsMutation.isPending && (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {!analyzeSkillsMutation.isPending && !analysisData && (
          <div className="text-center py-12">
            <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-foreground mb-2">
              No Analysis Available
            </h4>
            <p className="text-muted-foreground mb-4">
              Click "Update Analysis" to generate your personalized skill gap analysis using AI.
            </p>
          </div>
        )}

        {analysisData && (
          <div className="space-y-4">
            {/* Overall Scores */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground mb-1">
                  {analysisData.overallScore}%
                </div>
                <div className="text-sm text-muted-foreground">Overall Score</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground mb-1">
                  {analysisData.careerReadiness}%
                </div>
                <div className="text-sm text-muted-foreground">Career Readiness</div>
              </div>
            </div>

            {/* Skill Gaps */}
            {analysisData.skillGaps.slice(0, 3).map((gap, index) => {
              const SkillIcon = getSkillIcon(gap.skillName);
              const progressPercentage = gap.currentLevel === 'advanced' ? 90 : 
                                       gap.currentLevel === 'intermediate' ? 65 : 35;
              
              return (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 bg-muted rounded-lg"
                  data-testid={`skill-gap-${index}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <SkillIcon className="text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{gap.skillName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {gap.currentLevel} → {gap.requiredLevel}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground capitalize">
                        {gap.currentLevel}
                      </span>
                      <span className={`text-sm ${getPriorityColor(gap.priority)}`}>
                        {progressPercentage}%
                      </span>
                    </div>
                    <div className="w-24 bg-border rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(progressPercentage)}`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Strengths and Improvement Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <h5 className="font-semibold text-foreground mb-2">Strengths</h5>
                <ul className="space-y-1">
                  {analysisData.strengths.slice(0, 3).map((strength, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center">
                      <div className="w-2 h-2 bg-secondary rounded-full mr-2" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-foreground mb-2">Focus Areas</h5>
                <ul className="space-y-1">
                  {analysisData.improvementAreas.slice(0, 3).map((area, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center">
                      <div className="w-2 h-2 bg-accent rounded-full mr-2" />
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
