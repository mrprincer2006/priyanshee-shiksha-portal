import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, IndianRupee, Check, QrCode, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Student, FeeRecord, MONTH_OPTIONS, getMonthName } from '@/lib/types';
import QRPaymentModal from './QRPaymentModal';

interface FeeManagementProps {
  open: boolean;
  onClose: () => void;
  student: Student | null;
  onFeesUpdated: () => void;
}

interface DbFeeRecord {
  id: string;
  student_id: string;
  user_id: string;
  month: number;
  year: number;
  amount: number;
  status: string;
  payment_method: string | null;
  transaction_id: string | null;
  paid_at: string | null;
}

const FeeManagement = ({ open, onClose, student, onFeesUpdated }: FeeManagementProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Fetch fee records for student
  const fetchFeeRecords = async () => {
    if (!student) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('fee_records')
        .select('*')
        .eq('student_id', student.id)
        .eq('year', selectedYear)
        .order('month', { ascending: true });

      if (error) throw error;

      const mappedFees: FeeRecord[] = (data as DbFeeRecord[]).map(f => ({
        id: f.id,
        studentId: f.student_id,
        month: f.month,
        year: f.year,
        amount: f.amount,
        status: f.status as 'paid' | 'unpaid',
        paymentMethod: f.payment_method as 'qr' | 'cash' | 'manual' | null,
        transactionId: f.transaction_id,
        paidAt: f.paid_at,
      }));
      setFeeRecords(mappedFees);
    } catch (error) {
      console.error('Error fetching fee records:', error);
      toast({
        title: t('error'),
        description: t('fetchError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && student) {
      fetchFeeRecords();
    }
  }, [open, student, selectedYear]);

  // Generate fees for the year (only creates missing months)
  const handleGenerateFees = async () => {
    if (!student) return;
    setIsGenerating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const existingMonths = feeRecords.map(f => f.month);
      const missingMonths = MONTH_OPTIONS
        .filter(m => !existingMonths.includes(m.value))
        .map(m => m.value);

      if (missingMonths.length === 0) {
        toast({
          title: t('info'),
          description: t('allFeesExist'),
        });
        setIsGenerating(false);
        return;
      }

      const newFees = missingMonths.map(month => ({
        student_id: student.id,
        user_id: user.id,
        month,
        year: selectedYear,
        amount: student.monthlyFeeAmount,
        status: 'unpaid',
      }));

      const { error } = await supabase
        .from('fee_records')
        .insert(newFees);

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('feesGenerated', { count: missingMonths.length }),
      });
      fetchFeeRecords();
      onFeesUpdated();
    } catch (error) {
      console.error('Error generating fees:', error);
      toast({
        title: t('error'),
        description: t('generateError'),
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Mark fee as paid
  const handleMarkPaid = async (fee: FeeRecord, method: 'cash' | 'manual') => {
    try {
      const { error } = await supabase
        .from('fee_records')
        .update({
          status: 'paid',
          payment_method: method,
          paid_at: new Date().toISOString(),
        })
        .eq('id', fee.id);

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('feeMarkedPaid'),
      });
      fetchFeeRecords();
      onFeesUpdated();
    } catch (error) {
      console.error('Error marking fee as paid:', error);
      toast({
        title: t('error'),
        description: t('updateError'),
        variant: 'destructive',
      });
    }
  };

  // Handle QR payment
  const handleQRPayment = (fee: FeeRecord) => {
    setSelectedFee(fee);
    setShowQRModal(true);
  };

  const handlePaymentComplete = async (transactionId: string) => {
    if (!selectedFee) return;

    try {
      const { error } = await supabase
        .from('fee_records')
        .update({
          status: 'paid',
          payment_method: 'qr',
          transaction_id: transactionId,
          paid_at: new Date().toISOString(),
        })
        .eq('id', selectedFee.id);

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('paymentSuccess'),
      });
      setShowQRModal(false);
      setSelectedFee(null);
      fetchFeeRecords();
      onFeesUpdated();
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        title: t('error'),
        description: t('updateError'),
        variant: 'destructive',
      });
    }
  };

  if (!student) return null;

  const paidCount = feeRecords.filter(f => f.status === 'paid').length;
  const unpaidCount = feeRecords.filter(f => f.status === 'unpaid').length;
  const totalPaid = feeRecords.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
  const totalPending = feeRecords.filter(f => f.status === 'unpaid').reduce((sum, f) => sum + f.amount, 0);

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-primary" />
              {t('feeManagement')} - {student.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Year Selection & Generate */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger className="w-32 bg-background border-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerateFees}
                disabled={isGenerating}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('generating')}
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    {t('generateFees')}
                  </>
                )}
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-success/10 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-success">{paidCount}</p>
                <p className="text-xs text-muted-foreground">{t('monthsPaid')}</p>
              </div>
              <div className="bg-destructive/10 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-destructive">{unpaidCount}</p>
                <p className="text-xs text-muted-foreground">{t('monthsUnpaid')}</p>
              </div>
              <div className="bg-success/10 p-3 rounded-lg text-center">
                <p className="text-lg font-bold text-success">₹{totalPaid.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{t('totalPaid')}</p>
              </div>
              <div className="bg-destructive/10 p-3 rounded-lg text-center">
                <p className="text-lg font-bold text-destructive">₹{totalPending.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{t('totalPending')}</p>
              </div>
            </div>

            {/* Fee Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : feeRecords.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">{t('noFeesGenerated')}</p>
                <p className="text-sm text-muted-foreground mt-1">{t('clickGenerateFees')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {MONTH_OPTIONS.map((monthData) => {
                  const fee = feeRecords.find(f => f.month === monthData.value);
                  const isPaid = fee?.status === 'paid';

                  return (
                    <div
                      key={monthData.value}
                      className={`p-3 rounded-lg border transition-all ${
                        fee
                          ? isPaid
                            ? 'bg-success/10 border-success/30'
                            : 'bg-destructive/10 border-destructive/30'
                          : 'bg-muted/30 border-border opacity-50'
                      }`}
                    >
                      <div className="text-center">
                        <p className="font-medium text-foreground">{t(monthData.key)}</p>
                        {fee && (
                          <>
                            <p className="text-sm text-muted-foreground">₹{fee.amount}</p>
                            <Badge
                              className={`mt-2 ${
                                isPaid ? 'status-paid' : 'status-unpaid'
                              } border`}
                            >
                              {isPaid && <Check className="h-3 w-3 mr-1" />}
                              {t(fee.status)}
                            </Badge>

                            {!isPaid && (
                              <div className="mt-3 flex flex-col gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleQRPayment(fee)}
                                  className="w-full text-xs border-primary text-primary hover:bg-primary/10"
                                >
                                  <QrCode className="h-3 w-3 mr-1" />
                                  {t('payByQR')}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleMarkPaid(fee, 'cash')}
                                  className="w-full text-xs text-success hover:bg-success/10"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  {t('markPaidCash')}
                                </Button>
                              </div>
                            )}

                            {isPaid && fee.paidAt && (
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(fee.paidAt).toLocaleDateString()}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <QRPaymentModal
        open={showQRModal}
        onClose={() => {
          setShowQRModal(false);
          setSelectedFee(null);
        }}
        fee={selectedFee}
        student={student}
        onPaymentComplete={handlePaymentComplete}
      />
    </>
  );
};

export default FeeManagement;