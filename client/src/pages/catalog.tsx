import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Menu, Search, Filter, BookOpen, Clock, Award, Users, Star } from "lucide-react";
import type { Course } from "@shared/schema";

export default function Catalog() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [nsqfLevel, setNsqfLevel] = useState("");

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

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['/api/courses', { 
      category: category === "all" ? "" : category, 
      skillLevel: skillLevel === "all" ? "" : skillLevel, 
      nsqfLevel: nsqfLevel === "all" ? "" : nsqfLevel, 
      search: searchQuery 
    }],
    enabled: isAuthenticated,
  });

  const { data: recommendations } = useQuery({
    queryKey: ['/api/ai/course-recommendations'],
    enabled: isAuthenticated,
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const response = await apiRequest("POST", "/api/enrollments", { courseId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Enrolled Successfully",
        description: "You have been enrolled in the course.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/enrollments'] });
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
        title: "Enrollment Failed",
        description: "Unable to enroll in course. Please try again.",
        variant: "destructive",
      });
    },
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

  const categories = [
    "Data Analytics", "Software Development", "Digital Marketing", 
    "Cybersecurity", "Cloud Computing", "AI & Machine Learning"
  ];

  const skillLevels = ["beginner", "intermediate", "advanced"];
  const nsqfLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const getSkillLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'intermediate': return 'bg-accent/10 text-accent border-accent/20';  
      case 'advanced': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getNsqfColor = (level: number) => {
    if (level <= 3) return 'bg-secondary/10 text-secondary';
    if (level <= 6) return 'bg-accent/10 text-accent';
    return 'bg-primary/10 text-primary';
  };

  // Mock courses if no data
  const mockCourses = [
    {
      id: "1",
      title: "Python for Data Analysis",
      description: "Comprehensive introduction to data analysis using Python and pandas",
      provider: "TechEd Institute",
      duration: "8 weeks",
      skillLevel: "beginner",
      nsqfLevel: 4,
      category: "Data Analytics",
      isCertified: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200"
    },
    {
      id: "2",
      title: "Advanced Machine Learning",
      description: "Deep dive into ML algorithms, neural networks, and practical implementation",
      provider: "AI Academy",
      duration: "12 weeks",
      skillLevel: "advanced",
      nsqfLevel: 7,
      category: "AI & Machine Learning",
      isCertified: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200"
    },
    {
      id: "3",
      title: "Web Development Fundamentals",
      description: "Learn HTML, CSS, JavaScript, and modern web development practices",
      provider: "CodeCraft",
      duration: "10 weeks",
      skillLevel: "intermediate",
      nsqfLevel: 5,
      category: "Software Development",
      isCertified: false,
      thumbnailUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200"
    }
  ];

  const displayCourses = courses?.length > 0 ? courses : mockCourses;

  const handleEnroll = (courseId: string) => {
    enrollMutation.mutate(courseId);
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
                {t('nav.catalog')}
              </h1>
              <p className="text-muted-foreground">
                Discover courses aligned with your learning goals
              </p>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="border-b border-border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger data-testid="select-category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={skillLevel} onValueChange={setSkillLevel}>
              <SelectTrigger data-testid="select-skill-level">
                <SelectValue placeholder="Skill Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {skillLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={nsqfLevel} onValueChange={setNsqfLevel}>
              <SelectTrigger data-testid="select-nsqf-level">
                <SelectValue placeholder="NSQF Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All NSQF Levels</SelectItem>
                {nsqfLevels.map((level) => (
                  <SelectItem key={level} value={level.toString()}>
                    Level {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              className="flex items-center gap-2" 
              data-testid="button-clear-filters"
              onClick={() => {
                setSearchQuery("");
                setCategory("");
                setSkillLevel("");
                setNsqfLevel("");
              }}
            >
              <Filter className="h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Recommended Courses */}
          {recommendations && recommendations.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-accent" />
                Recommended for You
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.slice(0, 3).map((course: Course) => (
                  <Card key={course.id} className="border border-accent/20 bg-accent/5">
                    <CardHeader>
                      <Badge variant="outline" className="w-fit bg-accent/10 text-accent border-accent/20">
                        Recommended
                      </Badge>
                      <CardTitle className="text-lg line-clamp-2">
                        {course.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {course.description}
                      </p>
                      <Button 
                        className="w-full"
                        onClick={() => handleEnroll(course.id)}
                        disabled={enrollMutation.isPending}
                        data-testid={`button-enroll-recommended-${course.id}`}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Enroll Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* All Courses */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-6">All Courses</h2>
            {coursesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, index) => (
                  <Card key={index} className="border border-border">
                    <CardHeader>
                      <Skeleton className="h-40 w-full rounded-lg" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayCourses.map((course: Course) => (
                  <Card 
                    key={course.id} 
                    className="border border-border card-hover"
                    data-testid={`course-${course.id}`}
                  >
                    <CardHeader className="p-0">
                      <img 
                        src={course.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200"}
                        alt={course.title}
                        className="w-full h-40 object-cover rounded-t-lg"
                      />
                      <div className="p-4 pb-0">
                        <CardTitle className="text-lg mb-2 line-clamp-2">
                          {course.title}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {course.description}
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Provider</span>
                          <span className="font-medium">{course.provider}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge 
                            variant="outline" 
                            className={getSkillLevelColor(course.skillLevel || '')}
                          >
                            {course.skillLevel}
                          </Badge>
                          {course.nsqfLevel && (
                            <Badge 
                              variant="outline"
                              className={getNsqfColor(course.nsqfLevel)}
                            >
                              NSQF {course.nsqfLevel}
                            </Badge>
                          )}
                          {course.isCertified && (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                              <Award className="h-3 w-3 mr-1" />
                              Certified
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{course.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{Math.floor(Math.random() * 1000) + 100}+ enrolled</span>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full mt-4"
                          onClick={() => handleEnroll(course.id)}
                          disabled={enrollMutation.isPending}
                          data-testid={`button-enroll-${course.id}`}
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          Enroll in Course
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!coursesLoading && displayCourses.length === 0 && (
              <div className="text-center py-16">
                <BookOpen className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  No Courses Found
                </h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Try adjusting your filters or search query to find relevant courses.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setCategory("");
                    setSkillLevel("");
                    setNsqfLevel("");
                  }}
                  data-testid="button-reset-search"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
