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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Menu, Users, BookOpen, TrendingUp, BarChart3, 
  Target, Globe, Award, Settings, Download, FileText 
} from "lucide-react";

export default function Admin() {
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

  // Mock admin analytics data
  const adminMetrics = {
    totalUsers: 12847,
    activeUsers: 8934,
    totalCourses: 487,
    completionRate: 73,
    averageSkillScore: 82,
    industryAlignment: 89,
    pathwaysGenerated: 1456,
    certificatesIssued: 892
  };

  const recentActivity = [
    { action: "New user registered", user: "Priya Sharma", time: "2 minutes ago" },
    { action: "Course completed", user: "Rahul Kumar", course: "Python Basics", time: "5 minutes ago" },
    { action: "Pathway generated", user: "Anita Singh", pathway: "Data Analyst Track", time: "8 minutes ago" },
    { action: "Achievement earned", user: "Vikram Patel", achievement: "Python Pro", time: "12 minutes ago" },
    { action: "Course enrolled", user: "Sunita Gupta", course: "Machine Learning", time: "15 minutes ago" }
  ];

  const topSkills = [
    { name: "Python Programming", demand: 89, users: 3421 },
    { name: "Data Analysis", demand: 87, users: 2987 },
    { name: "Machine Learning", demand: 84, users: 2654 },
    { name: "SQL", demand: 82, users: 4123 },
    { name: "Data Visualization", demand: 79, users: 2341 }
  ];

  const handleExportReport = () => {
    toast({
      title: "Report Generated",
      description: "Learning analytics report has been generated and will be downloaded shortly.",
    });
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
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Platform analytics and learner management
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleExportReport} data-testid="button-export-report">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button data-testid="button-admin-settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Key Metrics */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="text-primary text-xl" />
                  </div>
                  <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                    +12% this month
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Total Users</h3>
                <div className="text-2xl font-bold text-foreground" data-testid="total-users">
                  {adminMetrics.totalUsers.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">
                  {adminMetrics.activeUsers.toLocaleString()} active this month
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="text-accent text-xl" />
                  </div>
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                    +8% this month
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Total Courses</h3>
                <div className="text-2xl font-bold text-foreground" data-testid="total-courses">
                  {adminMetrics.totalCourses}
                </div>
                <p className="text-sm text-muted-foreground">
                  Across all categories
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-secondary text-xl" />
                  </div>
                  <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                    +5% this month
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Completion Rate</h3>
                <div className="text-2xl font-bold text-foreground" data-testid="completion-rate">
                  {adminMetrics.completionRate}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Average across all courses
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                    <Award className="text-destructive text-xl" />
                  </div>
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                    +15% this month
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Certificates</h3>
                <div className="text-2xl font-bold text-foreground" data-testid="certificates-issued">
                  {adminMetrics.certificatesIssued}
                </div>
                <p className="text-sm text-muted-foreground">
                  Issued this month
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Detailed Analytics */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4" data-testid="admin-tabs">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0" data-testid={`activity-${index}`}>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-foreground">
                              {activity.action}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {activity.user}
                              {activity.course && ` • ${activity.course}`}
                              {activity.pathway && ` • ${activity.pathway}`}
                              {activity.achievement && ` • ${activity.achievement}`}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {activity.time}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Skills */}
                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-secondary" />
                      Most Popular Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topSkills.map((skill, index) => (
                        <div key={index} className="space-y-2" data-testid={`skill-${index}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">{skill.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">{skill.users} learners</span>
                              <Badge variant="outline" className={skill.demand >= 85 ? "bg-secondary/10 text-secondary" : "bg-accent/10 text-accent"}>
                                {skill.demand}% demand
                              </Badge>
                            </div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary" 
                              style={{ width: `${skill.demand}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Platform Performance */}
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-accent" />
                    Platform Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground mb-1">
                        {adminMetrics.averageSkillScore}%
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Skill Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground mb-1">
                        {adminMetrics.industryAlignment}%
                      </div>
                      <div className="text-sm text-muted-foreground">Industry Alignment</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground mb-1">
                        {adminMetrics.pathwaysGenerated.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">AI Pathways</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground mb-1">
                        4.8/5
                      </div>
                      <div className="text-sm text-muted-foreground">User Satisfaction</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="mt-6">
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-16">
                    <Users className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-foreground mb-4">
                      User Management Interface
                    </h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                      Advanced user management features will be available here including user profiles, 
                      progress tracking, and individual learner analytics.
                    </p>
                    <Button data-testid="button-user-management">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Users
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses" className="mt-6">
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle>Course Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-16">
                    <BookOpen className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-foreground mb-4">
                      Course Management Interface
                    </h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                      Comprehensive course management including creation, editing, 
                      NSQF alignment, and performance analytics.
                    </p>
                    <Button data-testid="button-course-management">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Manage Courses
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="mt-6">
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Advanced Analytics
                    <Button variant="outline" size="sm" data-testid="button-download-analytics">
                      <FileText className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-16">
                    <BarChart3 className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-foreground mb-4">
                      Advanced Analytics Dashboard
                    </h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                      Deep dive into learning analytics, skill gap analysis, 
                      industry trend correlations, and AI recommendation performance.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg mx-auto">
                      <Button variant="outline" data-testid="button-learning-analytics">
                        Learning Analytics
                      </Button>
                      <Button variant="outline" data-testid="button-skill-trends">
                        Skill Trends
                      </Button>
                      <Button variant="outline" data-testid="button-ai-performance">
                        AI Performance
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
