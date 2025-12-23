import { useTranslation } from 'react-i18next';
import { User, Phone, Calendar, IndianRupee } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Student, FeeRecord, getMonthName } from '@/lib/types';

interface StudentProfileProps {
  open: boolean;
  onClose: () => void;
  student: Student | null;
  feeRecords: FeeRecord[];
}

const StudentProfile = ({ open, onClose, student, feeRecords }: StudentProfileProps) => {
  const { t } = useTranslation();

  if (!student) return null;

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const studentFees = feeRecords.filter((f) => f.studentId === student.id);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">{t('viewProfile')}</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="flex items-center gap-4 pb-4 border-b border-border">
            <Avatar className="h-20 w-20 border-2 border-primary/20">
              <AvatarImage src={student.profileImage} alt={student.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-2xl">{getInitials(student.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{student.name}</h2>
              <Badge variant="secondary" className="mt-1 bg-primary/10 text-primary border-0">{t(student.class)}</Badge>
            </div>
          </div>

          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted"><User className="h-4 w-4 text-muted-foreground" /></div>
              <div>
                <p className="text-sm text-muted-foreground">{t('fatherName')}</p>
                <p className="font-medium text-foreground">{student.fatherName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted"><Phone className="h-4 w-4 text-muted-foreground" /></div>
              <div>
                <p className="text-sm text-muted-foreground">{t('mobileNumber')}</p>
                <p className="font-medium text-foreground">{student.mobile}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted"><Calendar className="h-4 w-4 text-muted-foreground" /></div>
              <div>
                <p className="text-sm text-muted-foreground">{t('admissionDate')}</p>
                <p className="font-medium text-foreground">{new Date(student.admissionDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted"><IndianRupee className="h-4 w-4 text-muted-foreground" /></div>
              <div>
                <p className="text-sm text-muted-foreground">{t('monthlyFeeAmount')}</p>
                <p className="font-medium text-foreground">₹{student.monthlyFeeAmount}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="font-semibold text-foreground mb-3">{t('feeRecords')}</h3>
            {studentFees.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('noFeeRecords')}</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {studentFees.map((fee) => (
                  <div key={fee.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground">{t(getMonthName(fee.month))} {fee.year}</p>
                      <p className="text-sm text-muted-foreground">₹{fee.amount}</p>
                    </div>
                    <Badge className={`${fee.status === 'paid' ? 'status-paid' : 'status-unpaid'} border`}>{t(fee.status)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentProfile;