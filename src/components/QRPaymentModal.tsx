import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QrCode, ExternalLink, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Student, FeeRecord, getMonthName } from '@/lib/types';

interface QRPaymentModalProps {
  open: boolean;
  onClose: () => void;
  fee: FeeRecord | null;
  student: Student | null;
  onPaymentComplete: (transactionId: string) => void;
}

// UPI configuration - can be customized
const UPI_ID = "9060633237@fam"; // Replace with actual UPI ID
const PAYEE_NAME = "Priyanshee Shiksha Kendra";

const QRPaymentModal = ({ open, onClose, fee, student, onPaymentComplete }: QRPaymentModalProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [transactionId, setTransactionId] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  if (!fee || !student) return null;

  const monthName = t(getMonthName(fee.month));
  const description = `${student.name} - ${monthName} ${fee.year} Fee`;
  
  // Generate UPI deep link
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${fee.amount}&cu=INR&tn=${encodeURIComponent(description)}`;
  
  // Generate QR code URL using a free QR code API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;

  const handleOpenUPI = () => {
    window.open(upiLink, '_blank');
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    toast({
      title: t('success'),
      description: t('upiCopied'),
    });
  };

  const handleConfirmPayment = () => {
    if (!transactionId.trim()) {
      toast({
        title: t('error'),
        description: t('enterTransactionId'),
        variant: 'destructive',
      });
      return;
    }
    onPaymentComplete(transactionId.trim());
    setTransactionId('');
    setShowConfirm(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            {t('qrPayment')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Payment Details */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('studentName')}:</span>
              <span className="font-medium text-foreground">{student.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('month')}:</span>
              <span className="font-medium text-foreground">{monthName} {fee.year}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('feeAmount')}:</span>
              <span className="font-bold text-lg text-primary">₹{fee.amount}</span>
            </div>
          </div>

          {!showConfirm ? (
            <>
              {/* QR Code */}
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <img
                    src={qrCodeUrl}
                    alt="UPI QR Code"
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {t('scanQRToPay')}
                </p>
              </div>

              {/* UPI ID */}
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">{t('upiId')}:</span>
                <code className="flex-1 text-sm font-mono text-foreground">{UPI_ID}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyUPI}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleOpenUPI}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t('openPaymentApp')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowConfirm(true)}
                  className="w-full border-success text-success hover:bg-success/10"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {t('confirmPayment')}
                </Button>
              </div>
            </>
          ) : (
            /* Transaction ID Confirmation */
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transactionId" className="text-foreground">
                  {t('transactionId')}
                </Label>
                <Input
                  id="transactionId"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder={t('enterTransactionId')}
                  className="bg-background border-input"
                />
                <p className="text-xs text-muted-foreground">
                  {t('transactionIdHint')}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 border-border text-foreground hover:bg-muted"
                >
                  {t('back')}
                </Button>
                <Button
                  onClick={handleConfirmPayment}
                  className="flex-1 bg-success text-white hover:bg-success/90"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {t('confirmPaid')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRPaymentModal;
