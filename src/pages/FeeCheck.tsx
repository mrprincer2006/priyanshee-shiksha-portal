import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Phone, GraduationCap, IndianRupee, Calendar, Loader2, QrCode, Smartphone, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import LanguageToggle from '@/components/LanguageToggle';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getMonthName } from '@/lib/types';
import logo from '@/assets/logo.png';

interface FeeRecord {
  id: string;
  month: number;
  year: number;
  amount: number;
  status: string;
}

interface StudentResult {
  id: string;
  name: string;
  class: string;
  fees: FeeRecord[];
}

const UPI_ID = 'priyanshee@upi';
const MERCHANT_NAME = 'Priyanshee Shiksha Kendra';

const FeeCheck = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [mobileNumber, setMobileNumber] = useState('');
  const [searchResults, setSearchResults] = useState<StudentResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMobile = mobileNumber.trim();
    
    if (trimmedMobile.length < 10) {
      toast({
        title: t('error'),
        description: t('invalidMobile'),
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(false);

    try {
      const { data, error } = await supabase.functions.invoke('check-fee-status', {
        body: { mobile: trimmedMobile }
      });

      if (error) {
        console.error('Error checking fee status:', error);
        toast({
          title: t('error'),
          description: t('searchError'),
          variant: 'destructive',
        });
        setSearchResults([]);
      } else {
        setSearchResults(data.students || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: t('error'),
        description: t('searchError'),
        variant: 'destructive',
      });
      setSearchResults([]);
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  };

  const getTotalPending = (fees: FeeRecord[]): number => {
    return fees
      .filter((f) => f.status === 'unpaid')
      .reduce((sum, f) => sum + f.amount, 0);
  };

  const getTotalPaid = (fees: FeeRecord[]): number => {
    return fees
      .filter((f) => f.status === 'paid')
      .reduce((sum, f) => sum + f.amount, 0);
  };

  const handlePayNow = (student: StudentResult, fee: FeeRecord) => {
    setSelectedStudent(student);
    setSelectedFee(fee);
    setTransactionId('');
    setShowQRModal(true);
  };

  const generateUPILink = (amount: number, studentName: string, month: number, year: number) => {
    const monthName = t(getMonthName(month));
    const note = `Fee for ${studentName} - ${monthName} ${year}`;
    return `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&tn=${encodeURIComponent(note)}&cu=INR`;
  };

  const getQRCodeUrl = (upiLink: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;
  };

  const handlePaymentConfirm = async () => {
    if (!selectedFee || !transactionId.trim()) {
      toast({
        title: t('error'),
        description: t('enterTransactionId'),
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await supabase
        .from('fee_records')
        .update({
          status: 'paid',
          payment_method: 'qr',
          transaction_id: transactionId.trim(),
          paid_at: new Date().toISOString(),
        })
        .eq('id', selectedFee.id);

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('paymentRecorded'),
      });

      setSearchResults(prev => prev.map(student => ({
        ...student,
        fees: student.fees.map(fee => 
          fee.id === selectedFee.id 
            ? { ...fee, status: 'paid' }
            : fee
        )
      })));

      setShowQRModal(false);
      setSelectedFee(null);
      setSelectedStudent(null);
      setTransactionId('');
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: t('error'),
        description: t('paymentError'),
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="floating-blob w-72 h-72 bg-primary/20 -top-20 -left-20" />
      <div className="floating-blob w-96 h-96 bg-accent/20 top-1/3 -right-32" style={{ animationDelay: '2s' }} />
      <div className="floating-blob w-64 h-64 bg-success/20 bottom-20 left-1/4" style={{ animationDelay: '4s' }} />
      
      {/* Header */}
      <header className="relative z-10 header-gradient border-b border-border/50 shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={logo} alt="Logo" className="h-12 w-12 object-contain drop-shadow-md" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-card animate-pulse-soft" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">{t('appName')}</h1>
              <p className="text-xs text-muted-foreground font-medium">{t('tagline')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Link to="/login">
              <Button variant="outline" size="sm" className="rounded-xl border-primary/30 text-primary hover:bg-primary/10 font-semibold transition-all duration-300 hover:scale-105">
                {t('adminLogin')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Hero Search Section */}
        <div className="max-w-md mx-auto mb-10 animate-slide-up">
          <Card className="card-cute border-0 shadow-card overflow-visible">
            <CardHeader className="text-center pb-2 pt-8">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-lg animate-bounce-soft">
                <Search className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                {t('checkFeeStatus')}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2 font-medium">
                {t('enterMobileToCheck')}
              </p>
            </CardHeader>
            <CardContent className="pb-8">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                  <Input
                    type="tel"
                    placeholder={t('mobileNumber')}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="pl-12 h-14 text-lg rounded-xl bg-muted/50 border-border/50 focus:bg-card input-focus font-medium"
                    maxLength={10}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-14 text-lg rounded-xl btn-gradient-primary font-bold"
                  disabled={mobileNumber.length < 10 || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      {t('searching')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      {t('search')}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        {hasSearched && !isLoading && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            {searchResults.length === 0 ? (
              <Card className="card-cute border-0">
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                    <GraduationCap className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="text-lg text-muted-foreground font-medium">{t('noStudentsFound')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {searchResults.map((student, index) => {
                  const totalPending = getTotalPending(student.fees);
                  const totalPaid = getTotalPaid(student.fees);

                  return (
                    <Card 
                      key={student.id} 
                      className="card-cute border-0 animate-slide-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Student Info Header */}
                      <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-transparent p-6 border-b border-border/30">
                        <div className="flex items-center gap-5">
                          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                            <GraduationCap className="h-10 w-10 text-primary-foreground" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-foreground">{student.name}</h3>
                            <Badge className="mt-2 bg-primary/15 text-primary border-0 font-semibold px-3 py-1 rounded-lg">
                              {t(student.class)}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Fee Summary */}
                      <div className="grid grid-cols-2 gap-4 p-5">
                        <div className="rounded-2xl bg-gradient-to-br from-success/15 to-success/5 p-4 text-center border border-success/20">
                          <div className="icon-bubble icon-bubble-success w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                          <p className="text-sm text-muted-foreground font-medium">{t('totalPaid')}</p>
                          <p className="text-2xl font-bold text-success">
                            {t('currency')}{totalPaid.toLocaleString()}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-gradient-to-br from-destructive/15 to-destructive/5 p-4 text-center border border-destructive/20">
                          <div className="icon-bubble icon-bubble-destructive w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                            <IndianRupee className="h-5 w-5" />
                          </div>
                          <p className="text-sm text-muted-foreground font-medium">{t('totalPending')}</p>
                          <p className="text-2xl font-bold text-destructive">
                            {t('currency')}{totalPending.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Fee Records */}
                      <CardContent className="p-5 pt-0">
                        <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-primary" />
                          {t('feeRecords')}
                        </h4>
                        {student.fees.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">{t('noFeeRecords')}</p>
                        ) : (
                          <div className="space-y-3">
                            {student.fees.map((fee) => (
                              <div
                                key={fee.id}
                                className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                                  fee.status === 'paid' 
                                    ? 'bg-success/5 border border-success/20' 
                                    : 'bg-destructive/5 border border-destructive/20 hover:shadow-md'
                                }`}
                              >
                                <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                    fee.status === 'paid' ? 'bg-success/15' : 'bg-destructive/15'
                                  }`}>
                                    <IndianRupee className={`h-5 w-5 ${
                                      fee.status === 'paid' ? 'text-success' : 'text-destructive'
                                    }`} />
                                  </div>
                                  <div>
                                    <p className="font-bold text-foreground">
                                      {t(getMonthName(fee.month))} {fee.year}
                                    </p>
                                    <p className="text-sm font-semibold text-muted-foreground">
                                      {t('currency')}{fee.amount.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {fee.status === 'paid' ? (
                                    <Badge className="status-paid border rounded-lg px-3 py-1.5 text-sm">
                                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                                      {t('paid')}
                                    </Badge>
                                  ) : (
                                    <>
                                      <Badge className="status-unpaid border rounded-lg px-3 py-1.5 text-sm">
                                        {t('unpaid')}
                                      </Badge>
                                      <Button
                                        size="sm"
                                        onClick={() => handlePayNow(student, fee)}
                                        className="rounded-xl btn-gradient-primary gap-1.5 font-semibold px-4"
                                      >
                                        <QrCode className="h-4 w-4" />
                                        {t('payNow')}
                                      </Button>
                                    </>
                                  )}
                                </div>
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
      <footer className="relative z-10 mt-auto py-8 text-center">
        <p className="text-sm text-muted-foreground font-medium">
          © {new Date().getFullYear()} <span className="gradient-text font-semibold">{t('appName')}</span>
        </p>
      </footer>

      {/* QR Payment Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="bg-card border-0 shadow-card max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2 text-xl font-bold">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <QrCode className="h-5 w-5 text-primary-foreground" />
              </div>
              {t('qrPayment')}
            </DialogTitle>
          </DialogHeader>
          
          {selectedFee && selectedStudent && (
            <div className="space-y-5">
              {/* Payment Details */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-2 border border-border/50">
                <p className="text-sm text-muted-foreground">{t('studentName')}: <span className="font-bold text-foreground">{selectedStudent.name}</span></p>
                <p className="text-sm text-muted-foreground">{t('month')}: <span className="font-bold text-foreground">{t(getMonthName(selectedFee.month))} {selectedFee.year}</span></p>
                <p className="text-sm text-muted-foreground">{t('amount')}: <span className="font-bold text-2xl gradient-text">{t('currency')}{selectedFee.amount}</span></p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="p-3 bg-card rounded-2xl shadow-card border border-border/50">
                  <img
                    src={getQRCodeUrl(generateUPILink(selectedFee.amount, selectedStudent.name, selectedFee.month, selectedFee.year))}
                    alt="UPI QR Code"
                    className="w-48 h-48 rounded-xl"
                  />
                </div>
              </div>

              {/* UPI Apps Button */}
              <a
                href={generateUPILink(selectedFee.amount, selectedStudent.name, selectedFee.month, selectedFee.year)}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-xl btn-gradient-primary text-primary-foreground font-bold transition-all duration-300 hover:scale-[1.02]"
              >
                <Smartphone className="h-5 w-5" />
                {t('openPaymentApp')}
              </a>

              <div className="text-center text-sm text-muted-foreground font-medium">
                {t('scanOrClick')}
              </div>

              {/* Transaction ID Input */}
              <div className="space-y-2">
                <Label htmlFor="transactionId" className="text-foreground font-semibold">{t('transactionId')}</Label>
                <Input
                  id="transactionId"
                  placeholder={t('enterTransactionId')}
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="rounded-xl bg-muted/50 border-border/50 input-focus h-12"
                />
              </div>

              {/* Confirm Button */}
              <Button
                onClick={handlePaymentConfirm}
                disabled={!transactionId.trim() || isProcessing}
                className="w-full h-12 rounded-xl btn-gradient-secondary font-bold"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {t('processing')}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    {t('confirmPayment')}
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeeCheck;