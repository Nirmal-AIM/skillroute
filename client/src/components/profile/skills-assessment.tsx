import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Target, Brain, BarChart3, Database, Code, Palette, 
  TrendingUp, Plus, RefreshCw, CheckCircle, Clock 
} from "lucide-react";
import type { User, Skill, UserSkill } from "@shared/schema";

interface SkillsAssessmentProps {
  user?: User;
}

interface SkillAssessmentState {
  skillId: string;
  skillName: string;
  category: string;
  proficiencyLevel: string;
  proficiencyScore: number;
  isAssessed: boolean;
}

export function SkillsAssessment({ user }: SkillsAssessmentProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [assessmentState, setAssessmentState] = useState<SkillAssessmentState[]>([]);
  const [activeSkillId, setActiveSkillId] = useState<string>("");

  const { data: skills, isLoading: skillsLoading } = useQuery({
    queryKey: ['/api/skills', selectedCategory],
    enabled: !!user,
  });

  const { data: userSkills, isLoading: userSkillsLoading } = useQuery({
    queryKey: ['/api/user/skills'],
    enabled: !!user,
  });

  const updateSkillMutation = useMutation({
    mutationFn: async ({ skillId, proficiencyLevel, proficiencyScore }: {
      skillId: string;
      proficiencyLevel: string;
      proficiencyScore: number;
    }) => {
      const response = await apiRequest("POST", "/api/user/skills", {
        skillId,
        proficiencyLevel,
        proficiencyScore
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Skill Updated",
        description: "Your skill assessment has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/skills'] });
      
      // Update local state
      setAssessmentState(prev => prev.map(skill => 
        skill.skillId === variables.skillId 
          ? { ...skill, isAssessed: true, proficiencyLevel: variables.proficiencyLevel, proficiencyScore: variables.proficiencyScore }
          : skill
      ));
      setActiveSkillId("");
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
        title: "Update Failed",
        description: "Failed to save skill assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const categories = [
    "Programming", "Data Analysis", "Web Development", "Mobile Development",
    "Cloud Computing", "Cybersecurity", "AI & Machine Learning", "DevOps",
    "Design", "Digital Marketing", "Project Management", "Business Analysis"
  ];

  const getSkillIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('programming') || cat.includes('development')) return Code;
    if (cat.includes('data') || cat.includes('analysis')) return BarChart3;
    if (cat.includes('database') || cat.includes('cloud')) return Database;
    if (cat.includes('design') || cat.includes('ui')) return Palette;
    return Target;
  };

  const getProficiencyColor = (score: number) => {
    if (score >= 80) return 'text-secondary';
    if (score >= 60) return 'text-accent';
    if (score >= 40) return 'text-primary';
    return 'text-destructive';
  };

  const getProficiencyBgColor = (score: number) => {
    if (score >= 80) return 'bg-secondary/10 border-secondary/20';
    if (score >= 60) return 'bg-accent/10 border-accent/20';
    if (score >= 40) return 'bg-primary/10 border-primary/20';
    return 'bg-destructive/10 border-destructive/20';
  };

  const getProficiencyLevel = (score: number): string => {
    if (score >= 80) return 'advanced';
    if (score >= 60) return 'intermediate';
    return 'beginner';
  };

  const handleScoreChange = (skillId: string, score: number) => {
    setAssessmentState(prev => prev.map(skill =>
      skill.skillId === skillId 
        ? { ...skill, proficiencyScore: score, proficiencyLevel: getProficiencyLevel(score) }
        : skill
    ));
  };

  const handleSaveSkill = (skillId: string) => {
    const skill = assessmentState.find(s => s.skillId === skillId);
    if (skill) {
      updateSkillMutation.mutate({
        skillId: skill.skillId,
        proficiencyLevel: skill.proficiencyLevel,
        proficiencyScore: skill.proficiencyScore
      });
    }
  };

  const handleStartAssessment = (skill: Skill) => {
    const existingUserSkill = userSkills?.find((us: UserSkill) => us.skillId === skill.id);
    const currentScore = existingUserSkill?.proficiencyScore || 50;
    
    if (!assessmentState.find(s => s.skillId === skill.id)) {
      setAssessmentState(prev => [...prev, {
        skillId: skill.id,
        skillName: skill.name,
        category: skill.category,
        proficiencyLevel: getProficiencyLevel(currentScore),
        proficiencyScore: currentScore,
        isAssessed: !!existingUserSkill
      }]);
    }
    setActiveSkillId(skill.id);
  };

  if (!user) {
    return (
      <Card className="border border-border" data-testid="skills-assessment-loading">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const displaySkills = skills || [];
  const filteredSkills = selectedCategory 
    ? displaySkills.filter((skill: Skill) => skill.category === selectedCategory)
    : displaySkills.slice(0, 12); // Show first 12 skills if no category selected

  const assessedSkills = assessmentState.filter(skill => skill.isAssessed);
  const overallProgress = assessedSkills.length > 0 
    ? Math.round(assessedSkills.reduce((sum, skill) => sum + skill.proficiencyScore, 0) / assessedSkills.length)
    : 0;

  return (
    <div className="space-y-6" data-testid="skills-assessment-container">
      {/* Assessment Overview */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Skills Assessment Overview
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Self-assess your skills to get personalized learning recommendations
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground mb-1" data-testid="assessed-skills-count">
                {assessedSkills.length}
              </div>
              <div className="text-sm text-muted-foreground">Skills Assessed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground mb-1" data-testid="overall-progress">
                {overallProgress}%
              </div>
              <div className="text-sm text-muted-foreground">Average Proficiency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground mb-1">
                {assessedSkills.filter(s => s.proficiencyScore >= 70).length}
              </div>
              <div className="text-sm text-muted-foreground">Strong Skills</div>
            </div>
          </div>
          
          {assessedSkills.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" data-testid="overall-progress-bar" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills Assessment Interface */}
      <Tabs defaultValue="assess" className="w-full">
        <TabsList className="grid w-full grid-cols-2" data-testid="skills-tabs">
          <TabsTrigger value="assess" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Skill Assessment
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            My Skills ({assessedSkills.length})
          </TabsTrigger>
        </TabsList>

        {/* Assessment Tab */}
        <TabsContent value="assess" className="mt-6">
          <Card className="border border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Skill Assessment</CardTitle>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48" data-testid="select-skill-category">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {skillsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <Skeleton key={index} className="h-32 w-full" />
                  ))}
                </div>
              ) : filteredSkills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSkills.map((skill: Skill) => {
                    const SkillIcon = getSkillIcon(skill.category);
                    const userSkill = userSkills?.find((us: UserSkill) => us.skillId === skill.id);
                    const assessmentSkill = assessmentState.find(s => s.skillId === skill.id);
                    const isActive = activeSkillId === skill.id;
                    const isAssessed = userSkill || assessmentSkill?.isAssessed;

                    return (
                      <Card 
                        key={skill.id} 
                        className={`border transition-all ${isActive ? 'border-primary bg-primary/5' : 'border-border'}`}
                        data-testid={`skill-card-${skill.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <SkillIcon className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium text-foreground text-sm">{skill.name}</h4>
                                <p className="text-xs text-muted-foreground">{skill.category}</p>
                              </div>
                            </div>
                            {isAssessed && (
                              <CheckCircle className="h-4 w-4 text-secondary" />
                            )}
                          </div>

                          {userSkill && (
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Current Level</span>
                                <Badge 
                                  variant="outline" 
                                  className={getProficiencyBgColor(userSkill.proficiencyScore || 0)}
                                >
                                  {userSkill.proficiencyLevel}
                                </Badge>
                              </div>
                              <Progress 
                                value={userSkill.proficiencyScore || 0} 
                                className="h-2"
                                data-testid={`skill-progress-${skill.id}`}
                              />
                            </div>
                          )}

                          {isActive && (
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium">Rate Your Proficiency</Label>
                                <div className="mt-2">
                                  <Slider
                                    value={[assessmentSkill?.proficiencyScore || 50]}
                                    onValueChange={(value) => handleScoreChange(skill.id, value[0])}
                                    max={100}
                                    step={5}
                                    className="w-full"
                                    data-testid={`skill-slider-${skill.id}`}
                                  />
                                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                    <span>Beginner</span>
                                    <span>Intermediate</span>
                                    <span>Advanced</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-center">
                                <div className="text-lg font-bold text-foreground mb-1">
                                  {assessmentSkill?.proficiencyScore || 50}%
                                </div>
                                <Badge 
                                  variant="outline"
                                  className={getProficiencyBgColor(assessmentSkill?.proficiencyScore || 50)}
                                >
                                  {assessmentSkill?.proficiencyLevel || getProficiencyLevel(50)}
                                </Badge>
                              </div>

                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => handleSaveSkill(skill.id)}
                                  disabled={updateSkillMutation.isPending}
                                  data-testid={`button-save-skill-${skill.id}`}
                                >
                                  {updateSkillMutation.isPending ? (
                                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                  )}
                                  Save
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setActiveSkillId("")}
                                  data-testid={`button-cancel-skill-${skill.id}`}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}

                          {!isActive && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full"
                              onClick={() => handleStartAssessment(skill)}
                              data-testid={`button-assess-skill-${skill.id}`}
                            >
                              {isAssessed ? (
                                <>
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                  Update Assessment
                                </>
                              ) : (
                                <>
                                  <Plus className="h-3 w-3 mr-1" />
                                  Assess Skill
                                </>
                              )}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No Skills Found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {selectedCategory 
                      ? `No skills found in the ${selectedCategory} category.`
                      : "No skills available for assessment at the moment."
                    }
                  </p>
                  {selectedCategory && (
                    <Button variant="outline" onClick={() => setSelectedCategory("")}>
                      View All Skills
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="mt-6">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>My Skills Profile</CardTitle>
              <p className="text-sm text-muted-foreground">
                Overview of your assessed skills and proficiency levels
              </p>
            </CardHeader>
            <CardContent>
              {assessedSkills.length > 0 ? (
                <div className="space-y-4">
                  {assessedSkills.map((skill) => (
                    <div 
                      key={skill.skillId}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                      data-testid={`assessed-skill-${skill.skillId}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Target className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{skill.skillName}</h4>
                          <p className="text-sm text-muted-foreground">{skill.category}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right min-w-[80px]">
                          <Badge 
                            variant="outline"
                            className={getProficiencyBgColor(skill.proficiencyScore)}
                          >
                            {skill.proficiencyLevel}
                          </Badge>
                          <div className="text-sm text-muted-foreground mt-1">
                            {skill.proficiencyScore}%
                          </div>
                        </div>
                        
                        <div className="w-32">
                          <Progress 
                            value={skill.proficiencyScore} 
                            className="h-2"
                            data-testid={`skill-result-progress-${skill.skillId}`}
                          />
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartAssessment({ 
                            id: skill.skillId, 
                            name: skill.skillName, 
                            category: skill.category 
                          } as Skill)}
                          data-testid={`button-update-skill-${skill.skillId}`}
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No Skills Assessed Yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Start assessing your skills to build your profile and get personalized recommendations.
                  </p>
                  <Button onClick={() => document.querySelector('[data-testid="skills-tabs"] button')?.click()}>
                    <Target className="h-4 w-4 mr-2" />
                    Start Assessment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
