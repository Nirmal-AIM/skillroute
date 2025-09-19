import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { User, Save, BookOpen, Target, Clock } from "lucide-react";
import type { User as UserType } from "@shared/schema";

interface ProfileFormProps {
  user?: UserType;
}

const profileFormSchema = insertUserSchema.extend({
  academicBackground: z.string().min(1, "Academic background is required"),
  careerAspirations: z.string().min(1, "Career aspirations are required"),
  learningPace: z.enum(["slow", "moderate", "fast"]),
  preferredLanguage: z.enum(["en", "hi", "ta", "te"])
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export function ProfileForm({ user }: ProfileFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      academicBackground: user?.academicBackground || "",
      currentRole: user?.currentRole || "",
      careerAspirations: user?.careerAspirations || "",
      socioEconomicContext: user?.socioEconomicContext || "",
      learningPace: user?.learningPace as "slow" | "moderate" | "fast" || "moderate",
      preferredLanguage: user?.preferredLanguage as "en" | "hi" | "ta" | "te" || "en"
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await apiRequest("PUT", "/api/profile", data);
      return response.json();
    },
    onSuccess: (updatedUser) => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
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
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const academicBackgrounds = [
    "High School", "Diploma", "Bachelor's Degree", "Master's Degree", 
    "PhD", "Professional Certification", "Self-taught", "Other"
  ];

  const currentRoles = [
    "Student", "Fresh Graduate", "Working Professional", "Career Changer",
    "Freelancer", "Entrepreneur", "Unemployed", "Other"
  ];

  const careerOptions = [
    "Data Analyst", "Software Developer", "Digital Marketer", "Web Designer",
    "Cybersecurity Analyst", "Cloud Engineer", "AI/ML Engineer", "Product Manager",
    "Business Analyst", "DevOps Engineer", "Mobile App Developer", "UI/UX Designer"
  ];

  const socioEconomicContexts = [
    "Urban - Metro City", "Urban - Tier 2 City", "Semi-Urban", "Rural",
    "Low Income", "Middle Income", "High Income", "Student", "Other"
  ];

  const learningPaces = [
    { value: "slow", label: "Slow & Steady", description: "3-4 hours per week" },
    { value: "moderate", label: "Moderate", description: "5-8 hours per week" },
    { value: "fast", label: "Fast Track", description: "10+ hours per week" }
  ];

  if (!user) {
    return (
      <Card className="border border-border" data-testid="profile-form-loading">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border" data-testid="profile-form-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          {t('profile.basicInfo')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Help us personalize your learning experience by providing your background and goals.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Academic Background */}
            <FormField
              control={form.control}
              name="academicBackground"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    {t('profile.academicBackground')}
                  </FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger data-testid="select-academic-background">
                        <SelectValue placeholder="Select your academic background" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicBackgrounds.map((background) => (
                          <SelectItem key={background} value={background}>
                            {background}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Current Role */}
            <FormField
              control={form.control}
              name="currentRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('profile.currentRole')}</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger data-testid="select-current-role">
                        <SelectValue placeholder="Select your current role" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Career Aspirations */}
            <FormField
              control={form.control}
              name="careerAspirations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    {t('profile.careerAspirations')}
                  </FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger data-testid="select-career-aspirations">
                        <SelectValue placeholder="Select your career goal" />
                      </SelectTrigger>
                      <SelectContent>
                        {careerOptions.map((career) => (
                          <SelectItem key={career} value={career}>
                            {career}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Socio-Economic Context */}
            <FormField
              control={form.control}
              name="socioEconomicContext"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location & Context</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger data-testid="select-socio-context">
                        <SelectValue placeholder="Select your context" />
                      </SelectTrigger>
                      <SelectContent>
                        {socioEconomicContexts.map((context) => (
                          <SelectItem key={context} value={context}>
                            {context}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Learning Pace */}
            <FormField
              control={form.control}
              name="learningPace"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {t('profile.learningPace')}
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {learningPaces.map((pace) => (
                        <div 
                          key={pace.value}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            field.value === pace.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => field.onChange(pace.value)}
                          data-testid={`pace-${pace.value}`}
                        >
                          <div className="font-medium text-foreground">{pace.label}</div>
                          <div className="text-sm text-muted-foreground">{pace.description}</div>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preferred Language */}
            <FormField
              control={form.control}
              name="preferredLanguage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Language</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger data-testid="select-preferred-language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                        <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                        <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                {form.formState.isDirty ? "You have unsaved changes" : "Profile is up to date"}
              </div>
              <Button 
                type="submit" 
                disabled={updateProfileMutation.isPending || !form.formState.isDirty}
                data-testid="button-save-profile"
              >
                {updateProfileMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t('profile.save')}
                  </>
                )}
              </Button>
            </div>

            {/* Form Validation Errors Summary */}
            {Object.keys(form.formState.errors).length > 0 && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg" data-testid="form-errors">
                <h4 className="font-medium text-destructive mb-2">Please fix the following errors:</h4>
                <ul className="text-sm text-destructive space-y-1">
                  {Object.entries(form.formState.errors).map(([field, error]) => (
                    <li key={field}>• {error?.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
