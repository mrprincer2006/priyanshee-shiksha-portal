import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import LanguageToggle from '@/components/LanguageToggle';
import logo from '@/assets/logo.png';

interface LoginProps {
  onLogin: () => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock authentication - replace with real auth later
    setTimeout(() => {
      if (email === 'admin@priyanshee.com' && password === 'admin123') {
        localStorage.setItem('isAuthenticated', 'true');
        toast({
          title: t('success'),
          description: t('loginSuccess'),
        });
        onLogin();
        navigate('/dashboard');
      } else {
        toast({
          title: t('error'),
          description: t('invalidCredentials'),
          variant: 'destructive',
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-slide-up">
          <div className="text-center mb-8">
            <img
              src={logo}
              alt="Priyanshee Shiksha Kendra"
              className="h-24 w-auto mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-primary">{t('appName')}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t('nurseryToClass6')}</p>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-card p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">{t('adminLogin')}</h2>
              <p className="text-sm text-muted-foreground mt-1">{t('loginToContinue')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">{t('email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@priyanshee.com"
                    className="pl-10 input-focus bg-background border-input"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">{t('password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10 input-focus bg-background border-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? t('loggingIn') : t('loginButton')}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border space-y-4">
              <Link to="/fee-check" className="block">
                <Button variant="outline" className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5">
                  <Search className="h-4 w-4" />
                  {t('checkFeeStatus')}
                </Button>
              </Link>
              <p className="text-xs text-center text-muted-foreground">
                Demo: admin@priyanshee.com / admin123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
