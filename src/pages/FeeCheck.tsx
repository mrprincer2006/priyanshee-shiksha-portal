import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Phone, User, GraduationCap, IndianRupee, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LanguageToggle from '@/components/LanguageToggle';
import { mockStudents, mockFeeRecords } from '@/lib/mockData';
import { Student, FeeRecord } from '@/lib/types';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

const FeeCheck = () => {
  const { t } = useTranslation();
  const [mobileNumber, setMobileNumber] = useState('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMobile = mobileNumber.trim();
    if (trimmedMobile.length >= 10) {
      const results = mockStudents.filter(
        (student) => student.mobile.includes(trimmedMobile)
      );
      setSearchResults(results);
      setHasSearched(true);
    }
  };

  const getStudentFees = (studentId: string): FeeRecord[] => {
    return mockFeeRecords.filter((f) => f.studentId === studentId);
  };

  const getTotalPending = (studentId: string): number => {
    return mockFeeRecords
      .filter((f) => f.studentId === studentId && f.status === 'unpaid')
      .reduce((sum, f) => sum + f.amount, 0);
  };

  const getTotalPaid = (studentId: string): number => {
    return mockFeeRecords
      .filter((f) => f.studentId === studentId && f.status === 'paid')
      .reduce((sum, f) => sum + f.amount, 0);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
            <div>
              <h1 className="text-lg font-bold text-foreground">{t('appName')}</h1>
              <p className="text-xs text-muted-foreground">{t('tagline')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Link to="/login">
              <Button variant="outline" size="sm" className="border-border">
                {t('adminLogin')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="max-w-md mx-auto mb-8">
          <Card className="bg-card border-border shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl text-foreground flex items-center justify-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                {t('checkFeeStatus')}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                {t('enterMobileToCheck')}
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder={t('mobileNumber')}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="pl-10 bg-background border-input text-foreground"
                    maxLength={10}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={mobileNumber.length < 10}
                >
                  <Search className="h-4 w-4 mr-2" />
                  {t('search')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        {hasSearched && (
          <div className="max-w-2xl mx-auto">
            {searchResults.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">{t('noStudentsFound')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {searchResults.map((student) => {
                  const fees = getStudentFees(student.id);
                  const totalPending = getTotalPending(student.id);
                  const totalPaid = getTotalPaid(student.id);

                  return (
                    <Card key={student.id} className="bg-card border-border shadow-md overflow-hidden">
                      {/* Student Info Header */}
                      <div className="bg-primary/5 p-4 border-b border-border">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16 border-2 border-primary/20">
                            <AvatarImage src={student.profileImage} alt={student.name} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xl">
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground">{student.name}</h3>
                            <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <GraduationCap className="h-4 w-4" />
                                {t(student.class)}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {student.fatherName}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Fee Summary */}
                      <div className="grid grid-cols-2 gap-4 p-4 border-b border-border">
                        <div className="bg-success/10 rounded-lg p-3 text-center">
                          <p className="text-sm text-muted-foreground">{t('totalPaid')}</p>
                          <p className="text-xl font-bold text-success">
                            {t('currency')}{totalPaid}
                          </p>
                        </div>
                        <div className="bg-destructive/10 rounded-lg p-3 text-center">
                          <p className="text-sm text-muted-foreground">{t('totalPending')}</p>
                          <p className="text-xl font-bold text-destructive">
                            {t('currency')}{totalPending}
                          </p>
                        </div>
                      </div>

                      {/* Fee Records */}
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          {t('feeRecords')}
                        </h4>
                        {fees.length === 0 ? (
                          <p className="text-sm text-muted-foreground">{t('noFeeRecords')}</p>
                        ) : (
                          <div className="space-y-2">
                            {fees.map((fee) => (
                              <div
                                key={fee.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                              >
                                <div className="flex items-center gap-3">
                                  <IndianRupee className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium text-foreground">
                                      {t(fee.month)} {fee.year}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {t('currency')}{fee.amount}
                                    </p>
                                  </div>
                                </div>
                                <Badge
                                  className={`${
                                    fee.status === 'paid' ? 'status-paid' : 'status-unpaid'
                                  } border`}
                                >
                                  {t(fee.status)}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-sm text-muted-foreground border-t border-border">
        <p>© {new Date().getFullYear()} {t('appName')}</p>
      </footer>
    </div>
  );
};

export default FeeCheck;