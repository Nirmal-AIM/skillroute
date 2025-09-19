import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  Award, 
  BookOpen,
  Zap,
  Globe,
  ChevronRight
} from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced skill gap analysis using machine learning to identify your learning needs"
    },
    {
      icon: Target,
      title: "NSQF Aligned Pathways", 
      description: "Learning paths aligned with National Skills Qualifications Framework standards"
    },
    {
      icon: TrendingUp,
      title: "Industry Insights",
      description: "Real-time job market trends and skill demand forecasting"
    },
    {
      icon: Users,
      title: "Personalized Journey",
      description: "Customized learning experience based on your background and aspirations"
    },
    {
      icon: Award,
      title: "Gamified Learning",
      description: "Earn badges, track progress, and celebrate achievements"
    },
    {
      icon: Globe,
      title: "Multilingual Support",
      description: "Available in English, Hindi, Tamil, and Telugu"
    }
  ];

  const stats = [
    { value: "10,000+", label: "Learners Empowered" },
    { value: "500+", label: "Industry-Aligned Courses" },
    { value: "95%", label: "Job Placement Rate" },
    { value: "50+", label: "Skill Categories" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">SkillPath AI</h1>
                <p className="text-sm text-muted-foreground">Personalized Learning</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select className="px-3 py-2 bg-card border border-border rounded-md text-foreground text-sm">
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="ta">தமிழ்</option>
                <option value="te">తెలుగు</option>
              </select>
              <Button onClick={handleLogin} data-testid="button-login">
                Get Started <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-6" data-testid="badge-sih2025">
            🏆 SIH 2025 Innovation
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            AI-Powered Learning Path
            <br />
            <span className="text-primary">Generator</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Unlock your potential with personalized vocational training pathways. 
            Our AI analyzes your profile and generates NSQF-aligned learning journeys 
            tailored to industry demands and your career aspirations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" onClick={handleLogin} className="text-lg px-8" data-testid="button-start-journey">
              Start Your Journey <Zap className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" data-testid="button-explore-demo">
              <BookOpen className="w-5 h-5 mr-2" /> Explore Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card/50 border-y border-border/40">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} data-testid={`stat-${index}`}>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose SkillPath AI?
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of vocational training with our comprehensive AI-driven platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1" data-testid={`feature-${index}`}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Career?
          </h3>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of learners who have already discovered their personalized learning paths. 
            Start your journey towards a future-ready career today.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={handleLogin}
            className="text-lg px-8"
            data-testid="button-join-now"
          >
            Join Now - It's Free <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border/40 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <div className="font-bold text-foreground">SkillPath AI</div>
                <div className="text-sm text-muted-foreground">Empowering India's Workforce</div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 SkillPath AI. Built for SIH 2025 Competition.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
