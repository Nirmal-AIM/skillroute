import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Menu, Route, Plus, Clock, Target, BookOpen, TrendingUp, Brain } from "lucide-react";
import type { LearningPathway } from "@shared/schema";

export default function Pathways() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
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

  const { data: pathways, isLoading: pathwaysLoading } = useQuery({
    queryKey: ['/api/pathways'],
    enabled: isAuthenticated,
  });

  const generatePathwayMutation = useMutation({
    mutationFn: async (targetRole: string) => {
      const skillAnalysisResponse = await apiRequest("POST", "/api/ai/skill-analysis", { targetRole });
      const skillAnalysis = await skillAnalysisResponse.json();
      
      const pathwayResponse = await apiRequest("POST", "/api/ai/generate-pathway", {
        skillGapAnalysis: skillAnalysis,
        targetRole
      });
      return pathwayResponse.json();
    },
    onSuccess: () => {
      toast({
        title: "Pathway Generated",
        description: "Your personalized learning pathway has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pathways'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Generation Failed",
        description: "Unable to generate pathway. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGeneratePathway = () => {
    const targetRole = user?.careerAspirations || "Data Analyst";
    generatePathwayMutation.mutate(targetRole);
  };

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'intermediate': return 'bg-accent/10 text-accent border-accent/20';
      case 'advanced': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-border';
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
                <h1 className="text-2xl font-bold text-foreground">
                  {t('nav.pathways')}
                </h1>
                <p className="text-muted-foreground">
                  AI-generated personalized learning journeys
                </p>
              </div>
            </div>
            <Button 
              onClick={handleGeneratePathway}
              disabled={generatePathwayMutation.isPending}
              data-testid="button-generate-pathway"
            >
              {generatePathwayMutation.isPending ? (
                <Brain className="h-4 w-4 mr-2 animate-pulse" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Generate New Pathway
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {pathwaysLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="border border-border">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pathways && pathways.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pathways.map((pathway: LearningPathway) => (
                <Card 
                  key={pathway.id} 
                  className="border border-border card-hover cursor-pointer"
                  data-testid={`pathway-${pathway.id}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 line-clamp-2">
                          {pathway.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {pathway.description}
                        </p>
                      </div>
                      {pathway.aiGenerated && (
                        <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                          <Brain className="h-3 w-3 mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress */}
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{pathway.progress || 0}%</span>
                        </div>
                        <Progress value={pathway.progress || 0} className="h-2" />
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{pathway.estimatedDuration || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          <span>{pathway.targetRole || 'General'}</span>
                        </div>
                      </div>

                      {/* Difficulty Badge */}
                      {pathway.difficulty && (
                        <Badge 
                          variant="outline" 
                          className={getDifficultyColor(pathway.difficulty)}
                        >
                          {pathway.difficulty}
                        </Badge>
                      )}

                      {/* Action Button */}
                      <Button 
                        className="w-full mt-4"
                        variant={pathway.progress && pathway.progress > 0 ? "default" : "outline"}
                        data-testid={`button-pathway-${pathway.id}`}
                      >
                        {pathway.progress && pathway.progress > 0 ? (
                          <>
                            <BookOpen className="h-4 w-4 mr-2" />
                            Continue Learning
                          </>
                        ) : (
                          <>
                            <Route className="h-4 w-4 mr-2" />
                            Start Pathway
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Route className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-foreground mb-4">
                No Learning Pathways Yet
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Generate your first AI-powered learning pathway tailored to your career aspirations and skill level.
              </p>
              <Button 
                size="lg"
                onClick={handleGeneratePathway}
                disabled={generatePathwayMutation.isPending}
                data-testid="button-create-first-pathway"
              >
                {generatePathwayMutation.isPending ? (
                  <Brain className="h-5 w-5 mr-2 animate-pulse" />
                ) : (
                  <TrendingUp className="h-5 w-5 mr-2" />
                )}
                Create Your First Pathway
              </Button>
            </div>
          )}

          {generatePathwayMutation.isPending && (
            <Card className="border border-border mt-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Brain className="h-8 w-8 text-primary animate-pulse" />
                  <div>
                    <h4 className="font-semibold text-foreground">Generating Pathway</h4>
                    <p className="text-sm text-muted-foreground">
                      AI is analyzing your profile and creating a personalized learning journey...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
