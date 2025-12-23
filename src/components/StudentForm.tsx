import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { useToast } from '@/hooks/use-toast';

interface StudentFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (student: Omit<Student, 'id'>, imageFile?: File) => void;
  student?: Student | null;
}

const StudentForm = ({ open, onClose, onSave, student }: StudentFormProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    name: '',
    class: 'nursery',
    fatherName: '',
    mobile: '',
    admissionDate: new Date().toISOString().split('T')[0],
    profileImage: '',
    monthlyFeeAmount: 500,
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        class: student.class,
        fatherName: student.fatherName,
        mobile: student.mobile,
        admissionDate: student.admissionDate,
        profileImage: student.profileImage || '',
        monthlyFeeAmount: student.monthlyFeeAmount || 500,
      });
      setImagePreview(student.profileImage || '');
    } else {
      setFormData({
        name: '',
        class: 'nursery',
        fatherName: '',
        mobile: '',
        admissionDate: new Date().toISOString().split('T')[0],
        profileImage: '',
        monthlyFeeAmount: 500,
      });
      setImagePreview('');
    }
    setImageFile(null);
  }, [student, open]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: t('error'),
          description: t('invalidImageType'),
          variant: 'destructive',
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t('error'),
          description: t('imageTooLarge'),
          variant: 'destructive',
        });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData({ ...formData, profileImage: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, imageFile || undefined);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {student ? t('editStudent') : t('addStudent')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Profile Image Upload */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar className="h-24 w-24 border-2 border-primary/20">
                <AvatarImage src={imagePreview} alt="Preview" />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-medium">
                  {formData.name ? getInitials(formData.name) : <Camera className="h-8 w-8" />}
                </AvatarFallback>
              </Avatar>
              {imagePreview && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2 border-border text-foreground"
            >
              <Camera className="h-4 w-4" />
              {t('uploadImage')}
            </Button>
          </div>

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
              <SelectContent className="bg-card border-border max-h-60">
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
              maxLength={10}
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

          <div className="space-y-2">
            <Label htmlFor="monthlyFeeAmount" className="text-foreground">{t('monthlyFeeAmount')} (₹)</Label>
            <Input
              id="monthlyFeeAmount"
              type="number"
              value={formData.monthlyFeeAmount}
              onChange={(e) => setFormData({ ...formData, monthlyFeeAmount: parseInt(e.target.value) || 500 })}
              placeholder="500"
              className="input-focus bg-background border-input"
              min={0}
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
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('uploading')}
                </>
              ) : (
                t('save')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentForm;