import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Brain, ChevronRight } from "lucide-react";

interface SurveyData {
  academicBackground: string;
  priorSkillsFreeform: string;
  socioEconomicContext: string;
  learningPace: 'slow' | 'moderate' | 'fast';
  aspirations: string;
}

export default function Survey() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState<SurveyData>({
    academicBackground: "",
    priorSkillsFreeform: "",
    socioEconomicContext: "",
    learningPace: "moderate",
    aspirations: "",
  });

  // Check if survey already exists
  const { data: existingSurvey } = useQuery({
    queryKey: ["/api/survey/me"],
    retry: false,
  });

  const saveSurveyMutation = useMutation({
    mutationFn: async (data: SurveyData) => {
      const response = await fetch("/api/survey/me", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save survey");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Survey completed!",
        description: "Your profile has been updated. You can now access the career guidance chatbot.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save survey",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.academicBackground && formData.aspirations) {
      saveSurveyMutation.mutate(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLearningPaceChange = (pace: 'slow' | 'moderate' | 'fast') => {
    setFormData({
      ...formData,
      learningPace: pace,
    });
  };

  // Pre-fill form if survey exists
  if (existingSurvey && !formData.academicBackground) {
    setFormData({
      academicBackground: existingSurvey.academicBackground || "",
      priorSkillsFreeform: existingSurvey.priorSkillsFreeform || "",
      socioEconomicContext: existingSurvey.socioEconomicContext || "",
      learningPace: existingSurvey.learningPace || "moderate",
      aspirations: existingSurvey.aspirations || "",
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Vidya Varadhi</h1>
              <p className="text-sm text-muted-foreground">Career Guidance Platform</p>
            </div>
          </div>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Help us understand your background to provide personalized career guidance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="academicBackground">Academic Background *</Label>
              <Input
                id="academicBackground"
                name="academicBackground"
                placeholder="e.g., 12th Science, B.Tech, Diploma in Engineering"
                value={formData.academicBackground}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aspirations">Career Aspirations *</Label>
              <Textarea
                id="aspirations"
                name="aspirations"
                placeholder="What career goals do you want to achieve? What type of work interests you?"
                value={formData.aspirations}
                onChange={handleChange}
                required
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priorSkillsFreeform">Prior Skills & Experience</Label>
              <Textarea
                id="priorSkillsFreeform"
                name="priorSkillsFreeform"
                placeholder="Describe any skills, courses, or work experience you have"
                value={formData.priorSkillsFreeform}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="learningPace">Preferred Learning Pace</Label>
              <Select value={formData.learningPace} onValueChange={handleLearningPaceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your learning pace" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Slow - I prefer to take my time</SelectItem>
                  <SelectItem value="moderate">Moderate - Balanced approach</SelectItem>
                  <SelectItem value="fast">Fast - I learn quickly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="socioEconomicContext">Socio-Economic Context</Label>
              <Input
                id="socioEconomicContext"
                name="socioEconomicContext"
                placeholder="e.g., Rural, Urban, First generation learner (optional)"
                value={formData.socioEconomicContext}
                onChange={handleChange}
              />
            </div>

            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setLocation("/")}
                className="flex-1"
              >
                Skip for Now
              </Button>
              <Button 
                type="submit" 
                disabled={saveSurveyMutation.isPending}
                className="flex-1"
              >
                {saveSurveyMutation.isPending ? "Saving..." : "Complete Profile"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}