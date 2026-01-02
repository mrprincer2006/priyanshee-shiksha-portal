import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'primary' | 'success' | 'destructive' | 'warning';
}

const StatCard = ({ title, value, subtitle, icon: Icon, variant = 'primary' }: StatCardProps) => {
  const variantClasses = {
    primary: 'icon-bubble-primary',
    success: 'icon-bubble-success',
    destructive: 'icon-bubble-destructive',
    warning: 'icon-bubble-warning',
  };

  const borderClasses = {
    primary: 'border-t-primary',
    success: 'border-t-success',
    destructive: 'border-t-destructive',
    warning: 'border-t-warning',
  };

  return (
    <div className={`stat-card border-t-4 ${borderClasses[variant]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1 font-medium">{subtitle}</p>
          )}
        </div>
        <div className={`${variantClasses[variant]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
