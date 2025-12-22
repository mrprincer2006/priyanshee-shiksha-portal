import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';

const LanguageSelection = () => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState<string | null>(null);

  const handleLanguageSelect = (lang: string) => {
    setSelectedLang(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const handleContinue = () => {
    if (selectedLang) {
      localStorage.setItem('languageSelected', 'true');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <img
            src={logo}
            alt="Priyanshee Shiksha Kendra"
            className="h-32 w-auto mx-auto mb-6"
          />
          <h1 className="text-2xl font-bold text-primary mb-2">
            {selectedLang === 'hi' ? 'प्रियंशी शिक्षा केंद्र' : 'Priyanshee Shiksha Kendra'}
          </h1>
          <p className="text-muted-foreground">
            {selectedLang === 'hi' ? 'उज्ज्वल भविष्य के लिए मजबूत नींव' : 'Strong Foundation for a Bright Future'}
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-card p-8">
          <h2 className="text-xl font-semibold text-foreground text-center mb-6">
            {selectedLang === 'hi' ? 'भाषा चुनें' : 'Select Language'}
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => handleLanguageSelect('hi')}
              className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                selectedLang === 'hi'
                  ? 'border-primary bg-primary/10 shadow-md'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <span className="text-3xl block mb-2">🇮🇳</span>
              <span className={`text-lg font-medium ${selectedLang === 'hi' ? 'text-primary' : 'text-foreground'}`}>
                हिंदी
              </span>
            </button>

            <button
              onClick={() => handleLanguageSelect('en')}
              className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                selectedLang === 'en'
                  ? 'border-primary bg-primary/10 shadow-md'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <span className="text-3xl block mb-2">🌐</span>
              <span className={`text-lg font-medium ${selectedLang === 'en' ? 'text-primary' : 'text-foreground'}`}>
                English
              </span>
            </button>
          </div>

          <Button
            onClick={handleContinue}
            disabled={!selectedLang}
            className="w-full h-12 text-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {selectedLang === 'hi' ? 'आगे बढ़ें' : 'Continue'} →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelection;
