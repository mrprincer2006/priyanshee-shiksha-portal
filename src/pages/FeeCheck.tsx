import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Phone, GraduationCap, IndianRupee, Calendar, Loader2, QrCode, Smartphone } from 'lucide-react';
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
  
  // QR Payment Modal state
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

      // Update local state
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
                  disabled={mobileNumber.length < 10 || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('searching')}
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
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
                  const totalPending = getTotalPending(student.fees);
                  const totalPaid = getTotalPaid(student.fees);

                  return (
                    <Card key={student.id} className="bg-card border-border shadow-md overflow-hidden">
                      {/* Student Info Header */}
                      <div className="bg-primary/5 p-4 border-b border-border">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <GraduationCap className="h-8 w-8 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground">{student.name}</h3>
                            <Badge variant="secondary" className="mt-1 bg-primary/10 text-primary border-0">
                              {t(student.class)}
                            </Badge>
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
                        {student.fees.length === 0 ? (
                          <p className="text-sm text-muted-foreground">{t('noFeeRecords')}</p>
                        ) : (
                          <div className="space-y-2">
                            {student.fees.map((fee) => (
                              <div
                                key={fee.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                              >
                                <div className="flex items-center gap-3">
                                  <IndianRupee className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium text-foreground">
                                      {t(getMonthName(fee.month))} {fee.year}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {t('currency')}{fee.amount}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {fee.status === 'paid' ? (
                                    <Badge className="status-paid border">
                                      {t('paid')} ✓
                                    </Badge>
                                  ) : (
                                    <>
                                      <Badge className="status-unpaid border">
                                        {t('unpaid')}
                                      </Badge>
                                      <Button
                                        size="sm"
                                        onClick={() => handlePayNow(student, fee)}
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
                                      >
                                        <QrCode className="h-3.5 w-3.5" />
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
      <footer className="mt-auto py-6 text-center text-sm text-muted-foreground border-t border-border">
        <p>© {new Date().getFullYear()} {t('appName')}</p>
      </footer>

      {/* QR Payment Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              {t('qrPayment')}
            </DialogTitle>
          </DialogHeader>
          
          {selectedFee && selectedStudent && (
            <div className="space-y-4">
              {/* Payment Details */}
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                <p className="text-sm text-muted-foreground">{t('studentName')}: <span className="font-medium text-foreground">{selectedStudent.name}</span></p>
                <p className="text-sm text-muted-foreground">{t('month')}: <span className="font-medium text-foreground">{t(getMonthName(selectedFee.month))} {selectedFee.year}</span></p>
                <p className="text-sm text-muted-foreground">{t('amount')}: <span className="font-bold text-primary">{t('currency')}{selectedFee.amount}</span></p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <img
                  src={getQRCodeUrl(generateUPILink(selectedFee.amount, selectedStudent.name, selectedFee.month, selectedFee.year))}
                  alt="UPI QR Code"
                  className="w-48 h-48 rounded-lg border border-border"
                />
              </div>

              {/* UPI Apps Button */}
              <a
                href={generateUPILink(selectedFee.amount, selectedStudent.name, selectedFee.month, selectedFee.year)}
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Smartphone className="h-5 w-5" />
                {t('openPaymentApp')}
              </a>

              <div className="text-center text-xs text-muted-foreground">
                {t('scanOrClick')}
              </div>

              {/* Transaction ID Input */}
              <div className="space-y-2">
                <Label htmlFor="transactionId" className="text-foreground">{t('transactionId')}</Label>
                <Input
                  id="transactionId"
                  placeholder={t('enterTransactionId')}
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="bg-background border-input text-foreground"
                />
              </div>

              {/* Confirm Button */}
              <Button
                onClick={handlePaymentConfirm}
                disabled={!transactionId.trim() || isProcessing}
                className="w-full bg-success text-success-foreground hover:bg-success/90"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('processing')}
                  </>
                ) : (
                  t('confirmPayment')
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