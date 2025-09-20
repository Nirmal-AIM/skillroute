import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  ChartLine,
  User as UserIcon,
  Route,
  BookOpen,
  Trophy,
  BarChart3,
  Settings,
  Brain,
  LogOut
} from "lucide-react";
import type { User } from "@shared/schema";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
  className?: string;
}

export function Sidebar({ isOpen, onClose, user, className }: SidebarProps) {
  const [location] = useLocation();
  const { t } = useTranslation();
  const { logout } = useAuth();

  const navigation = [
    { name: t('nav.dashboard'), href: '/', icon: ChartLine },
    { name: t('nav.profile'), href: '/profile', icon: UserIcon },
    { name: t('nav.pathways'), href: '/pathways', icon: Route },
    { name: t('nav.catalog'), href: '/catalog', icon: BookOpen },
    { name: t('nav.achievements'), href: '/achievements', icon: Trophy },
    { name: t('nav.industry'), href: '/industry', icon: BarChart3 },
    { name: t('nav.settings'), href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
  };

  const userInitials = user?.firstName && user?.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : 'U';

  const userRole = user?.careerAspirations || "Learner";

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full w-72 bg-card border-r border-border z-50 transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        className
      )}
      data-testid="sidebar-container"
    >
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Brain className="text-primary-foreground text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Vidya Varadhi</h1>
            <p className="text-sm text-muted-foreground">Career Guidance Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 flex-1">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-12",
                  isActive && "bg-primary text-primary-foreground"
                )}
                onClick={onClose}
                data-testid={`nav-${item.href.slice(1) || 'dashboard'}`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.profileImageUrl} alt="Profile picture" />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {userRole}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="w-full"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('nav.logout')}
          </Button>
        </div>
      </div>
    </aside>
  );
}