import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, IndianRupee, Edit, Eye, Calendar } from 'lucide-react';
import Header from '@/components/Header';
import Filters from '@/components/Filters';
import StudentForm from '@/components/StudentForm';
import StudentProfile from '@/components/StudentProfile';
import FeeForm from '@/components/FeeForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockStudents, mockFeeRecords } from '@/lib/mockData';
import { Student, FeeRecord } from '@/lib/types';

interface StudentsProps {
  onLogout: () => void;
}

const Students = ({ onLogout }: StudentsProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>(mockFeeRecords);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showFeeForm, setShowFeeForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingFee, setEditingFee] = useState<FeeRecord | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = classFilter === 'all' || student.class === classFilter;
      
      let matchesStatus = true;
      if (statusFilter !== 'all') {
        const studentFees = feeRecords.filter(f => f.studentId === student.id);
        const latestFee = studentFees[0];
        matchesStatus = latestFee?.status === statusFilter;
      }

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [students, searchQuery, classFilter, statusFilter, feeRecords]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getLatestFee = (studentId: string): FeeRecord | undefined => {
    return feeRecords.find(f => f.studentId === studentId);
  };

  // Handlers
  const handleViewProfile = (student: Student) => {
    setSelectedStudent(student);
    setShowProfile(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setShowStudentForm(true);
  };

  const handleEditFee = (fee: FeeRecord) => {
    setEditingFee(fee);
    const student = students.find(s => s.id === fee.studentId);
    setSelectedStudent(student || null);
    setShowProfile(false);
    setShowFeeForm(true);
  };

  const handleDeleteStudent = (student: Student) => {
    setStudentToDelete(student);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      setStudents(students.filter(s => s.id !== studentToDelete.id));
      setFeeRecords(feeRecords.filter(f => f.studentId !== studentToDelete.id));
      toast({
        title: t('success'),
        description: t('studentDeleted'),
      });
      setStudentToDelete(null);
    }
  };

  const handleSaveStudent = (studentData: Omit<Student, 'id'>) => {
    if (editingStudent) {
      setStudents(students.map(s => 
        s.id === editingStudent.id ? { ...studentData, id: editingStudent.id } : s
      ));
      toast({
        title: t('success'),
        description: t('studentUpdated'),
      });
    } else {
      const newStudent = { ...studentData, id: Date.now().toString() };
      setStudents([...students, newStudent]);
      toast({
        title: t('success'),
        description: t('studentAdded'),
      });
    }
    setEditingStudent(null);
  };

  const handleAddFee = (student: Student) => {
    setSelectedStudent(student);
    setEditingFee(null);
    setShowFeeForm(true);
  };

  const handleSaveFee = (feeData: Omit<FeeRecord, 'id'>) => {
    if (editingFee) {
      setFeeRecords(feeRecords.map(f => 
        f.id === editingFee.id ? { ...feeData, id: editingFee.id } : f
      ));
      toast({
        title: t('success'),
        description: t('feeUpdated'),
      });
    } else {
      const newFee = { ...feeData, id: Date.now().toString() };
      setFeeRecords([newFee, ...feeRecords]);
      toast({
        title: t('success'),
        description: t('feeAdded'),
      });
    }
    setSelectedStudent(null);
    setEditingFee(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onLogout={onLogout} />

      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('students')}</h1>
            <p className="text-sm text-muted-foreground">
              {filteredStudents.length} {t('totalStudents').toLowerCase()}
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingStudent(null);
              setShowStudentForm(true);
            }}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            {t('addStudent')}
          </Button>
        </div>

        {/* Filters */}
        <Filters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          classFilter={classFilter}
          setClassFilter={setClassFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          monthFilter={monthFilter}
          setMonthFilter={setMonthFilter}
          showMonthFilter={false}
        />

        {/* Students Table */}
        <div className="mt-6 bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold text-foreground">{t('studentName')}</TableHead>
                <TableHead className="font-semibold text-foreground">{t('class')}</TableHead>
                <TableHead className="font-semibold text-foreground">{t('fatherName')}</TableHead>
                <TableHead className="font-semibold text-foreground">{t('mobileNumber')}</TableHead>
                <TableHead className="font-semibold text-foreground">{t('feeStatus')}</TableHead>
                <TableHead className="font-semibold text-foreground text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    {t('noStudentsFound')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => {
                  const latestFee = getLatestFee(student.id);
                  return (
                    <TableRow key={student.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-border">
                            <AvatarImage src={student.profileImage} alt={student.name} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                          {t(student.class)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{student.fatherName}</TableCell>
                      <TableCell className="text-muted-foreground">{student.mobile}</TableCell>
                      <TableCell>
                        {latestFee ? (
                          <Badge
                            className={`${
                              latestFee.status === 'paid' ? 'status-paid' : 'status-unpaid'
                            } border`}
                          >
                            {t(latestFee.status)}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewProfile(student)}
                            className="text-primary hover:bg-primary/10"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddFee(student)}
                            className="text-success hover:bg-success/10"
                          >
                            <IndianRupee className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStudent(student)}
                            className="text-muted-foreground hover:bg-muted"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      {/* Modals */}
      <StudentProfile
        open={showProfile}
        onClose={() => setShowProfile(false)}
        student={selectedStudent}
        feeRecords={feeRecords}
        onEditFee={handleEditFee}
      />

      <StudentForm
        open={showStudentForm}
        onClose={() => {
          setShowStudentForm(false);
          setEditingStudent(null);
        }}
        onSave={handleSaveStudent}
        student={editingStudent}
      />

      <FeeForm
        open={showFeeForm}
        onClose={() => {
          setShowFeeForm(false);
          setSelectedStudent(null);
          setEditingFee(null);
        }}
        onSave={handleSaveFee}
        student={selectedStudent}
        fee={editingFee}
      />

      <AlertDialog open={!!studentToDelete} onOpenChange={() => setStudentToDelete(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">{t('deleteStudent')}</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {t('confirmDelete')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-muted">
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Students;
