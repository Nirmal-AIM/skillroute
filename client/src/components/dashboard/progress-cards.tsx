import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { GraduationCap, Medal, Clock, Target } from "lucide-react";

interface ProgressCardsProps {
  analytics?: {
    averageProgress: number;
    badgesEarned: number;
    studyTimeThisMonth: number;
    industryAlignment: number;
  };
}

export function ProgressCards({ analytics }: ProgressCardsProps) {
  const { t } = useTranslation();

  const cards = [
    {
      title: t('dashboard.learningProgress'),
      value: `${analytics?.averageProgress || 0}%`,
      icon: GraduationCap,
      progress: analytics?.averageProgress || 0,
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    },
    {
      title: t('dashboard.badgesEarned'),
      value: analytics?.badgesEarned || 0,
      icon: Medal,
      subtitle: "+3 this month",
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      title: t('dashboard.studyTime'),
      value: `${analytics?.studyTimeThisMonth || 0}h`,
      icon: Clock,
      subtitle: "This month",
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    },
    {
      title: t('dashboard.skillMatch'),
      value: `${analytics?.industryAlignment || 0}%`,
      icon: Target,
      subtitle: t('dashboard.industryAlignment'),
      color: "text-destructive",
      bgColor: "bg-destructive/10"
    }
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card 
          key={index} 
          className="border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          data-testid={`progress-card-${index}`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                <card.icon className={`${card.color} text-xl`} />
              </div>
              <span className={`text-2xl font-bold ${card.color}`} data-testid={`card-value-${index}`}>
                {card.value}
              </span>
            </div>
            <h3 className="font-semibold text-foreground mb-2">{card.title}</h3>
            {card.progress !== undefined ? (
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary" 
                  style={{ width: `${card.progress}%` }}
                  data-testid={`progress-bar-${index}`}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{card.subtitle}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
