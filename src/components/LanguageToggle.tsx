import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="border-border/50 bg-card/50 backdrop-blur-sm">
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card border-border">
        <DropdownMenuItem
          onClick={() => changeLanguage('en')}
          className={`cursor-pointer ${i18n.language === 'en' ? 'bg-primary/10 text-primary' : ''}`}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLanguage('hi')}
          className={`cursor-pointer ${i18n.language === 'hi' ? 'bg-primary/10 text-primary' : ''}`}
        >
          हिंदी
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageToggle;
