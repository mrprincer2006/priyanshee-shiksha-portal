import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LanguageToggle from './LanguageToggle';
import logo from '@/assets/logo.png';

interface HeaderProps {
  onLogout: () => void;
}

const Header = ({ onLogout }: HeaderProps) => {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'dashboard', icon: LayoutDashboard },
    { path: '/students', label: 'students', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 header-gradient border-b border-border/50 shadow-soft">
      <div className="container mx-auto px-4 h-18 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-4 group">
          <div className="relative">
            <img 
              src={logo} 
              alt="Priyanshee Shiksha Kendra" 
              className="h-12 w-auto drop-shadow-md transition-transform duration-300 group-hover:scale-105" 
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-success rounded-full border-2 border-card animate-pulse-soft" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold gradient-text leading-tight transition-all duration-300 group-hover:scale-[1.02]">
              {t('appName')}
            </h1>
            <p className="text-xs text-muted-foreground font-medium">{t('nurseryToClass6')}</p>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className={`gap-2 rounded-xl font-semibold transition-all duration-300 ${
                    isActive 
                      ? 'btn-gradient-primary shadow-md' 
                      : 'text-foreground hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{t(item.label)}</span>
                </Button>
              </Link>
            );
          })}
          
          <LanguageToggle />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="gap-2 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive font-semibold transition-all duration-300"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t('logout')}</span>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;