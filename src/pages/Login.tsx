import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Search, UserPlus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LanguageToggle from '@/components/LanguageToggle';
import { supabase } from '@/integrations/supabase/client';
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
  const [activeTab, setActiveTab] = useState('login');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      } else if (data.user) {
        localStorage.setItem('isAuthenticated', 'true');
        toast({
          title: t('success'),
          description: t('loginSuccess'),
        });
        onLogin();
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: t('error'),
        description: t('invalidCredentials'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password.length < 6) {
      toast({
        title: t('error'),
        description: t('passwordTooShort'),
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: t('error'),
            description: t('emailAlreadyExists'),
            variant: 'destructive',
          });
        } else {
          toast({
            title: t('error'),
            description: error.message,
            variant: 'destructive',
          });
        }
      } else if (data.user) {
        localStorage.setItem('isAuthenticated', 'true');
        toast({
          title: t('success'),
          description: t('signupSuccess'),
        });
        onLogin();
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: t('error'),
        description: t('signupError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="floating-blob w-80 h-80 bg-primary/20 -top-32 -left-32" />
      <div className="floating-blob w-96 h-96 bg-accent/20 top-1/2 -right-48" style={{ animationDelay: '3s' }} />
      <div className="floating-blob w-72 h-72 bg-success/20 -bottom-20 left-1/3" style={{ animationDelay: '5s' }} />
      
      <div className="absolute top-4 right-4 z-20">
        <LanguageToggle />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md animate-slide-up">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <img
                src={logo}
                alt="Priyanshee Shiksha Kendra"
                className="h-28 w-auto mx-auto mb-4 drop-shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-4 border-card animate-pulse-soft shadow-lg" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">{t('appName')}</h1>
            <p className="text-sm text-muted-foreground mt-2 font-medium">{t('nurseryToClass6')}</p>
          </div>

          {/* Login Card */}
          <div className="card-cute p-8 shadow-card">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-muted/50 rounded-xl h-12">
                <TabsTrigger value="login" className="rounded-lg font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all">
                  {t('login')}
                </TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all">
                  {t('signup')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="animate-fade-in">
                <div className="text-center mb-6">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-lg">
                    <Lock className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{t('adminLogin')}</h2>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">{t('loginToContinue')}</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-foreground font-semibold">{t('email')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                      <Input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="pl-12 h-12 rounded-xl bg-muted/50 border-border/50 input-focus font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-foreground font-semibold">{t('password')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-12 pr-12 h-12 rounded-xl bg-muted/50 border-border/50 input-focus font-medium"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 text-lg rounded-xl btn-gradient-primary font-bold"
                  >
                    {isLoading ? (
                      <>
                        <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                        {t('loggingIn')}
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        {t('loginButton')}
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="animate-fade-in">
                <div className="text-center mb-6">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-success to-secondary flex items-center justify-center mb-4 shadow-lg">
                    <UserPlus className="h-7 w-7 text-secondary-foreground" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{t('createAccount')}</h2>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">{t('signupToContinue')}</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-foreground font-semibold">{t('email')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-success" />
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="pl-12 h-12 rounded-xl bg-muted/50 border-border/50 input-focus font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-foreground font-semibold">{t('password')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-success" />
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-12 pr-12 h-12 rounded-xl bg-muted/50 border-border/50 input-focus font-medium"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-success transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">{t('passwordHint')}</p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 text-lg rounded-xl btn-gradient-secondary font-bold"
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    {isLoading ? t('signingUp') : t('signupButton')}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-8 pt-6 border-t border-border/50">
              <Link to="/fee-check" className="block">
                <Button variant="outline" className="w-full h-12 gap-2 rounded-xl border-primary/30 text-primary hover:bg-primary/10 font-semibold transition-all duration-300 hover:scale-[1.02]">
                  <Search className="h-5 w-5" />
                  {t('checkFeeStatus')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;