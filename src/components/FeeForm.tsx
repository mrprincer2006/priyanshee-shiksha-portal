import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FeeRecord, MONTH_OPTIONS, Student } from '@/lib/types';

interface FeeFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (fee: Omit<FeeRecord, 'id'>) => void;
  fee?: FeeRecord | null;
  student: Student | null;
}

const FeeForm = ({ open, onClose, onSave, fee, student }: FeeFormProps) => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  
  const [formData, setFormData] = useState<Omit<FeeRecord, 'id'>>({
    studentId: student?.id || '',
    month: fee?.month || 'january',
    year: fee?.year || currentYear,
    amount: fee?.amount || 500,
    status: fee?.status || 'unpaid',
    paymentDate: fee?.paymentDate || null,
  });

  useEffect(() => {
    if (student) {
      setFormData(prev => ({ ...prev, studentId: student.id }));
    }
  }, [student]);

  useEffect(() => {
    if (fee) {
      setFormData({
        studentId: fee.studentId,
        month: fee.month,
        year: fee.year,
        amount: fee.amount,
        status: fee.status,
        paymentDate: fee.paymentDate,
      });
    }
  }, [fee]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFormData = {
      ...formData,
      paymentDate: formData.status === 'paid' && !formData.paymentDate 
        ? new Date().toISOString().split('T')[0] 
        : formData.paymentDate,
    };
    onSave(updatedFormData);
    onClose();
  };

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {fee ? t('editFee') : t('addFee')}
          </DialogTitle>
        </DialogHeader>

        {student && (
          <p className="text-sm text-muted-foreground -mt-2">
            {student.name} ({t(student.class)})
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month" className="text-foreground">{t('month')}</Label>
              <Select
                value={formData.month}
                onValueChange={(value) => setFormData({ ...formData, month: value })}
              >
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder={t('month')} />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {MONTH_OPTIONS.map((month) => (
                    <SelectItem key={month} value={month}>
                      {t(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year" className="text-foreground">{t('year')}</Label>
              <Select
                value={formData.year.toString()}
                onValueChange={(value) => setFormData({ ...formData, year: parseInt(value) })}
              >
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder={t('year')} />
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-foreground">{t('feeAmount')} (₹)</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
              placeholder="500"
              className="input-focus bg-background border-input"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-foreground">{t('feeStatus')}</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'paid' | 'unpaid') => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className="bg-background border-input">
                <SelectValue placeholder={t('feeStatus')} />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="paid">{t('paid')}</SelectItem>
                <SelectItem value="unpaid">{t('unpaid')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.status === 'paid' && (
            <div className="space-y-2">
              <Label htmlFor="paymentDate" className="text-foreground">{t('paymentDate')}</Label>
              <Input
                id="paymentDate"
                type="date"
                value={formData.paymentDate || ''}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                className="input-focus bg-background border-input"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-border text-foreground hover:bg-muted"
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FeeForm;
