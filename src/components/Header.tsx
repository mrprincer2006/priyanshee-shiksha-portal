import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut } from 'lucide-react';
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
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3">
          <img src={logo} alt="Priyanshee Shiksha Kendra" className="h-10 w-auto" />
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-primary leading-tight">
              {t('appName')}
            </h1>
            <p className="text-xs text-muted-foreground">{t('nurseryToClass6')}</p>
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
                  className={`gap-2 ${isActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}
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
            className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
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
