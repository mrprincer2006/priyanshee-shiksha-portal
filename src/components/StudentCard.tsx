import { useTranslation } from 'react-i18next';
import { Phone, Eye, Edit, Trash2, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Student } from '@/lib/types';

interface StudentCardProps {
  student: Student;
  onView: (student: Student) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

const StudentCard = ({ student, onView, onEdit, onDelete }: StudentCardProps) => {
  const { t } = useTranslation();
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="card-cute p-5 group relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary rounded-t-2xl" />
      
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16 ring-4 ring-primary/10 shadow-md">
          <AvatarImage src={student.profileImage} alt={student.name} />
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-lg">
            {getInitials(student.name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-foreground truncate">{student.name}</h3>
          <Badge className="mt-1.5 bg-primary/15 text-primary border-0 font-semibold px-2.5 py-0.5 rounded-lg">
            <GraduationCap className="h-3 w-3 mr-1" />
            {t(student.class)}
          </Badge>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium truncate">👨 {student.fatherName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-3.5 w-3.5" />
          <span className="font-medium">{student.mobile}</span>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 pt-4 border-t border-border/50">
        <Button variant="ghost" size="sm" onClick={() => onView(student)} className="flex-1 gap-1.5 rounded-xl text-primary hover:bg-primary/10 font-semibold">
          <Eye className="h-4 w-4" />{t('view')}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onEdit(student)} className="flex-1 gap-1.5 rounded-xl text-accent hover:bg-accent/10 font-semibold">
          <Edit className="h-4 w-4" />{t('edit')}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(student)} className="rounded-xl text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default StudentCard;
