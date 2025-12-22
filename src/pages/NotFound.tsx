import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isHindi = i18n.language === 'hi';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center animate-fade-in">
        <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          {isHindi ? 'पेज नहीं मिला' : 'Page not found'}
        </p>
        <Button
          onClick={() => navigate('/')}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Home className="h-4 w-4" />
          {isHindi ? 'होम पेज पर जाएं' : 'Go Home'}
        </Button>
      </div>
    </div>
  );
};

export default NotFound;