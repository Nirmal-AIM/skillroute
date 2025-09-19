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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Menu, TrendingUp, DollarSign, BarChart3, MapPin, 
  Briefcase, Target, Globe, Users, Clock 
} from "lucide-react";

export default function Industry() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState("Data Analytics");

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

  const { data: industryTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['/api/industry-trends', selectedSector],
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

  const sectors = [
    "Data Analytics", "IT & Software", "Digital Marketing", "Healthcare", 
    "Finance", "E-commerce", "Manufacturing", "Education"
  ];

  // Mock industry data
  const mockTrends = [
    {
      id: "1",
      sector: "Data Analytics",
      skillName: "Python Programming",
      demandGrowth: 45,
      salaryRange: "₹6-12L",
      jobCount: 2840,
      location: "Bangalore"
    },
    {
      id: "2",
      sector: "Data Analytics", 
      skillName: "Machine Learning",
      demandGrowth: 38,
      salaryRange: "₹8-15L",
      jobCount: 1920,
      location: "Mumbai"
    },
    {
      id: "3",
      sector: "Data Analytics",
      skillName: "Data Visualization",
      demandGrowth: 32,
      salaryRange: "₹5-10L", 
      jobCount: 1560,
      location: "Delhi"
    },
    {
      id: "4",
      sector: "Data Analytics",
      skillName: "SQL & Databases",
      demandGrowth: 28,
      salaryRange: "₹4-8L",
      jobCount: 3200,
      location: "Pune"
    }
  ];

  const mockMarketInsights = [
    {
      title: "Emerging Technologies",
      value: "AI/ML, Cloud Computing",
      trend: "↑ 52%",
      description: "High demand for AI and cloud skills across industries"
    },
    {
      title: "Top Hiring Cities",
      value: "Bangalore, Mumbai, Delhi",
      trend: "↑ 35%",
      description: "Major tech hubs continue to lead job creation"
    },
    {
      title: "Remote Work Trend", 
      value: "68% of jobs",
      trend: "↑ 24%",
      description: "Increase in remote and hybrid work opportunities"
    },
    {
      title: "Skill Premium",
      value: "40-60% higher",
      trend: "↑ 18%",
      description: "Certified professionals earn significantly more"
    }
  ];

  const displayTrends = industryTrends?.length > 0 ? industryTrends : mockTrends.filter(trend => trend.sector === selectedSector);

  const getGrowthColor = (growth: number) => {
    if (growth >= 40) return 'text-secondary';
    if (growth >= 25) return 'text-accent';
    if (growth >= 15) return 'text-primary';
    return 'text-muted-foreground';
  };

  const getGrowthBgColor = (growth: number) => {
    if (growth >= 40) return 'bg-secondary/10 border-secondary/20';
    if (growth >= 25) return 'bg-accent/10 border-accent/20';
    if (growth >= 15) return 'bg-primary/10 border-primary/20';
    return 'bg-muted border-border';
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
                  {t('nav.industry')}
                </h1>
                <p className="text-muted-foreground">
                  Real-time job market trends and skill demand forecasting
                </p>
              </div>
            </div>
            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger className="w-48" data-testid="select-sector">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sectors.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Market Overview */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Market Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mockMarketInsights.map((insight, index) => (
                <Card key={index} className="border border-border card-hover" data-testid={`market-insight-${index}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        {index === 0 && <Target className="h-5 w-5 text-primary" />}
                        {index === 1 && <MapPin className="h-5 w-5 text-primary" />}
                        {index === 2 && <Users className="h-5 w-5 text-primary" />}
                        {index === 3 && <TrendingUp className="h-5 w-5 text-primary" />}
                      </div>
                      <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                        {insight.trend}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{insight.title}</h3>
                    <div className="text-lg font-bold text-primary mb-2">{insight.value}</div>
                    <p className="text-xs text-muted-foreground">{insight.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Skill Demand Trends */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Skill Demand Trends - {selectedSector}
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Updated 2 hours ago
              </div>
            </div>

            {trendsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-32 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayTrends.map((trend: any, index: number) => (
                  <Card 
                    key={trend.id || index} 
                    className={`border ${getGrowthBgColor(trend.demandGrowth)} card-hover`}
                    data-testid={`trend-${index}`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TrendingUp className={`h-5 w-5 ${getGrowthColor(trend.demandGrowth)}`} />
                          {trend.skillName}
                        </CardTitle>
                        <Badge 
                          variant="outline" 
                          className={`${getGrowthColor(trend.demandGrowth)} font-bold`}
                        >
                          ↑ {trend.demandGrowth}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-semibold text-foreground">
                              {trend.salaryRange}
                            </div>
                            <div className="text-xs text-muted-foreground">Salary Range</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-semibold text-foreground">
                              {trend.jobCount?.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">Open Jobs</div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Top Location: {trend.location}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Detailed Analytics */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Salary Trends */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-accent" />
                  Salary Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-semibold text-foreground">Entry Level</div>
                      <div className="text-sm text-muted-foreground">0-2 years experience</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-foreground">₹3-6L</div>
                      <div className="text-sm text-secondary">↑ 12%</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-semibold text-foreground">Mid Level</div>
                      <div className="text-sm text-muted-foreground">3-5 years experience</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-foreground">₹6-12L</div>
                      <div className="text-sm text-secondary">↑ 18%</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-semibold text-foreground">Senior Level</div>
                      <div className="text-sm text-muted-foreground">5+ years experience</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-foreground">₹12-25L</div>
                      <div className="text-sm text-secondary">↑ 25%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Companies Hiring */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Top Companies Hiring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Google", jobs: 145, type: "Tech Giant" },
                    { name: "Microsoft", jobs: 132, type: "Tech Giant" },
                    { name: "Amazon", jobs: 128, type: "E-commerce" },
                    { name: "Flipkart", jobs: 98, type: "E-commerce" },
                    { name: "Zomato", jobs: 87, type: "Food Tech" },
                    { name: "Paytm", jobs: 76, type: "Fintech" }
                  ].map((company, index) => (
                    <div key={index} className="flex items-center justify-between" data-testid={`company-${index}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{company.name}</div>
                          <div className="text-sm text-muted-foreground">{company.type}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-foreground">{company.jobs}</div>
                        <div className="text-xs text-muted-foreground">open roles</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Learning Recommendations */}
          <section>
            <Card className="border border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Target className="h-5 w-5" />
                  Skills to Focus On
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Based on current market trends in {selectedSector}, here are the most valuable skills to develop:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-card rounded-lg border border-border">
                    <h4 className="font-semibold text-foreground mb-2">High Priority</h4>
                    <div className="space-y-2">
                      {["Python", "Machine Learning", "Cloud Computing"].map((skill, index) => (
                        <Badge key={index} variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-card rounded-lg border border-border">
                    <h4 className="font-semibold text-foreground mb-2">Medium Priority</h4>
                    <div className="space-y-2">
                      {["SQL", "Data Visualization", "Statistics"].map((skill, index) => (
                        <Badge key={index} variant="outline" className="bg-accent/10 text-accent border-accent/20">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-card rounded-lg border border-border">
                    <h4 className="font-semibold text-foreground mb-2">Emerging Skills</h4>
                    <div className="space-y-2">
                      {["AI Ethics", "MLOps", "Edge Computing"].map((skill, index) => (
                        <Badge key={index} variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                          {skill}
                        </Badge>
                      ))}
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
