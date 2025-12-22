import { useTranslation } from 'react-i18next';
import { User, Phone, GraduationCap, Eye, Edit, Trash2 } from 'lucide-react';
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
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm hover:shadow-card transition-all duration-300 p-5 group">
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14 border-2 border-primary/20">
          <AvatarImage src={student.profileImage} alt={student.name} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
            {getInitials(student.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground truncate">{student.name}</h3>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
              {t(student.class)}
            </Badge>
          </div>

          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span className="truncate">{student.fatherName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              <span>{student.mobile}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(student)}
          className="flex-1 gap-1.5 text-primary border-primary/30 hover:bg-primary/10"
        >
          <Eye className="h-3.5 w-3.5" />
          {t('view')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(student)}
          className="flex-1 gap-1.5 text-foreground border-border hover:bg-muted"
        >
          <Edit className="h-3.5 w-3.5" />
          {t('edit')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(student)}
          className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default StudentCard;
