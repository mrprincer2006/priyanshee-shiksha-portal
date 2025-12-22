import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { X } from 'lucide-react';
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
import { Student, CLASS_OPTIONS } from '@/lib/types';

interface StudentFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (student: Omit<Student, 'id'>) => void;
  student?: Student | null;
}

const StudentForm = ({ open, onClose, onSave, student }: StudentFormProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    name: student?.name || '',
    class: student?.class || 'nursery',
    fatherName: student?.fatherName || '',
    mobile: student?.mobile || '',
    admissionDate: student?.admissionDate || new Date().toISOString().split('T')[0],
    profileImage: student?.profileImage || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {student ? t('editStudent') : t('addStudent')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">{t('studentName')}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('studentName')}
              className="input-focus bg-background border-input"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="class" className="text-foreground">{t('class')}</Label>
            <Select
              value={formData.class}
              onValueChange={(value) => setFormData({ ...formData, class: value })}
            >
              <SelectTrigger className="bg-background border-input">
                <SelectValue placeholder={t('class')} />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {CLASS_OPTIONS.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {t(cls)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fatherName" className="text-foreground">{t('fatherName')}</Label>
            <Input
              id="fatherName"
              value={formData.fatherName}
              onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
              placeholder={t('fatherName')}
              className="input-focus bg-background border-input"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-foreground">{t('mobileNumber')}</Label>
            <Input
              id="mobile"
              type="tel"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              placeholder="9876543210"
              className="input-focus bg-background border-input"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admissionDate" className="text-foreground">{t('admissionDate')}</Label>
            <Input
              id="admissionDate"
              type="date"
              value={formData.admissionDate}
              onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
              className="input-focus bg-background border-input"
              required
            />
          </div>

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

export default StudentForm;
