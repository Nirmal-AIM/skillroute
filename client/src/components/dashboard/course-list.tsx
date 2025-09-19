import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { PlayCircle } from "lucide-react";
import type { Enrollment } from "@shared/schema";

interface CourseListProps {
  enrollments?: Enrollment[];
}

export function CourseList({ enrollments }: CourseListProps) {
  const { t } = useTranslation();

  // Mock course data if no enrollments
  const mockCourses = [
    {
      id: "1",
      title: "Python for Data Analysis",
      provider: "DataCamp",
      progress: 78,
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=80&h=60"
    },
    {
      id: "2", 
      title: "Tableau Fundamentals",
      provider: "Tableau Learning",
      progress: 45,
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=80&h=60"
    }
  ];

  const displayCourses = enrollments?.length > 0 ? 
    enrollments.slice(0, 2).map(enrollment => ({
      id: enrollment.courseId,
      title: `Course ${enrollment.courseId}`,
      provider: "Learning Platform",
      progress: enrollment.progress || 0,
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=80&h=60"
    })) : mockCourses;

  return (
    <Card className="border border-border" data-testid="course-list-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-foreground">
            {t('dashboard.currentCourses')}
          </h3>
          <Button variant="ghost" className="text-primary hover:text-primary/80 font-medium" data-testid="button-view-all-courses">
            {t('common.viewAll')}
          </Button>
        </div>
        
        <div className="space-y-4">
          {displayCourses.map((course) => (
            <div key={course.id} className="flex items-center gap-4 p-4 border border-border rounded-lg" data-testid={`course-${course.id}`}>
              <img 
                src={course.thumbnail}
                alt={`${course.title} thumbnail`}
                className="w-20 h-15 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{course.title}</h4>
                <p className="text-sm text-muted-foreground">
                  By {course.provider} • {course.progress}% Complete
                </p>
                <div className="mt-2 w-full bg-muted rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary" 
                    style={{ width: `${course.progress}%` }}
                    data-testid={`course-progress-${course.id}`}
                  />
                </div>
              </div>
              <Button 
                size="sm"
                className="hover:bg-primary/90 transition-colors"
                data-testid={`button-continue-${course.id}`}
              >
                <PlayCircle className="w-4 h-4 mr-1" />
                {t('common.continue')}
              </Button>
            </div>
          ))}
        </div>
        
        {displayCourses.length === 0 && (
          <div className="text-center py-8">
            <PlayCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-foreground mb-2">
              No Courses Enrolled
            </h4>
            <p className="text-muted-foreground">
              Browse our course catalog to start your learning journey.
            </p>
            <Button className="mt-4" data-testid="button-browse-courses">
              Browse Courses
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
