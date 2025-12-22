import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, IndianRupee, Edit, Eye, Loader2 } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { Student, FeeRecord } from '@/lib/types';

interface StudentsProps {
  onLogout: () => void;
}

interface DbStudent {
  id: string;
  user_id: string;
  name: string;
  class: string;
  father_name: string;
  mobile: string;
  profile_image: string | null;
  admission_date: string;
  created_at: string;
  updated_at: string;
}

interface DbFeeRecord {
  id: string;
  student_id: string;
  user_id: string;
  month: string;
  year: number;
  amount: number;
  status: string;
  payment_date: string | null;
  created_at: string;
  updated_at: string;
}

const Students = ({ onLogout }: StudentsProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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

  // Fetch students and fee records from database
  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [studentsResult, feesResult] = await Promise.all([
        supabase.from('students').select('*').eq('user_id', user.id),
        supabase.from('fee_records').select('*').eq('user_id', user.id)
      ]);

      if (studentsResult.data) {
        const mappedStudents: Student[] = (studentsResult.data as DbStudent[]).map(s => ({
          id: s.id,
          name: s.name,
          class: s.class,
          fatherName: s.father_name,
          mobile: s.mobile,
          profileImage: s.profile_image || '',
          admissionDate: s.admission_date
        }));
        setStudents(mappedStudents);
      }

      if (feesResult.data) {
        const mappedFees: FeeRecord[] = (feesResult.data as DbFeeRecord[]).map(f => ({
          id: f.id,
          studentId: f.student_id,
          month: f.month,
          year: f.year,
          amount: f.amount,
          status: f.status as 'paid' | 'unpaid',
          paymentDate: f.payment_date
        }));
        setFeeRecords(mappedFees);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: t('error'),
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Upload image to storage
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('student-profiles')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('student-profiles')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: t('error'),
        description: t('imageUploadError'),
        variant: 'destructive',
      });
      return null;
    }
  };

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

  const confirmDelete = async () => {
    if (studentToDelete) {
      try {
        const { error } = await supabase
          .from('students')
          .delete()
          .eq('id', studentToDelete.id);

        if (error) throw error;

        setStudents(students.filter(s => s.id !== studentToDelete.id));
        setFeeRecords(feeRecords.filter(f => f.studentId !== studentToDelete.id));
        toast({
          title: t('success'),
          description: t('studentDeleted'),
        });
      } catch (error) {
        console.error('Error deleting student:', error);
        toast({
          title: t('error'),
          description: 'Failed to delete student',
          variant: 'destructive',
        });
      }
      setStudentToDelete(null);
    }
  };

  const handleSaveStudent = async (studentData: Omit<Student, 'id'>, imageFile?: File) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t('error'),
          description: 'Not authenticated',
          variant: 'destructive',
        });
        return;
      }

      let profileImageUrl = studentData.profileImage;
      
      // Upload image if provided
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          profileImageUrl = uploadedUrl;
        }
      }

      if (editingStudent) {
        // Update existing student
        const { error } = await supabase
          .from('students')
          .update({
            name: studentData.name,
            class: studentData.class,
            father_name: studentData.fatherName,
            mobile: studentData.mobile,
            admission_date: studentData.admissionDate,
            profile_image: profileImageUrl || null,
          })
          .eq('id', editingStudent.id);

        if (error) throw error;

        setStudents(students.map(s => 
          s.id === editingStudent.id 
            ? { ...studentData, id: editingStudent.id, profileImage: profileImageUrl } 
            : s
        ));
        toast({
          title: t('success'),
          description: t('studentUpdated'),
        });
      } else {
        // Create new student
        const { data, error } = await supabase
          .from('students')
          .insert({
            user_id: user.id,
            name: studentData.name,
            class: studentData.class,
            father_name: studentData.fatherName,
            mobile: studentData.mobile,
            admission_date: studentData.admissionDate,
            profile_image: profileImageUrl || null,
          })
          .select()
          .single();

        if (error) throw error;

        const newStudent: Student = {
          id: data.id,
          name: data.name,
          class: data.class,
          fatherName: data.father_name,
          mobile: data.mobile,
          profileImage: data.profile_image || '',
          admissionDate: data.admission_date,
        };
        setStudents([...students, newStudent]);
        toast({
          title: t('success'),
          description: t('studentAdded'),
        });
      }
      setEditingStudent(null);
    } catch (error) {
      console.error('Error saving student:', error);
      toast({
        title: t('error'),
        description: 'Failed to save student',
        variant: 'destructive',
      });
    }
  };

  const handleAddFee = (student: Student) => {
    setSelectedStudent(student);
    setEditingFee(null);
    setShowFeeForm(true);
  };

  const handleSaveFee = async (feeData: Omit<FeeRecord, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t('error'),
          description: 'Not authenticated',
          variant: 'destructive',
        });
        return;
      }

      if (editingFee) {
        // Update existing fee
        const { error } = await supabase
          .from('fee_records')
          .update({
            month: feeData.month,
            year: feeData.year,
            amount: feeData.amount,
            status: feeData.status,
            payment_date: feeData.paymentDate || null,
          })
          .eq('id', editingFee.id);

        if (error) throw error;

        setFeeRecords(feeRecords.map(f => 
          f.id === editingFee.id ? { ...feeData, id: editingFee.id } : f
        ));
        toast({
          title: t('success'),
          description: t('feeUpdated'),
        });
      } else {
        // Create new fee
        const { data, error } = await supabase
          .from('fee_records')
          .insert({
            user_id: user.id,
            student_id: feeData.studentId,
            month: feeData.month,
            year: feeData.year,
            amount: feeData.amount,
            status: feeData.status,
            payment_date: feeData.paymentDate || null,
          })
          .select()
          .single();

        if (error) throw error;

        const newFee: FeeRecord = {
          id: data.id,
          studentId: data.student_id,
          month: data.month,
          year: data.year,
          amount: data.amount,
          status: data.status as 'paid' | 'unpaid',
          paymentDate: data.payment_date,
        };
        setFeeRecords([newFee, ...feeRecords]);
        toast({
          title: t('success'),
          description: t('feeAdded'),
        });
      }
      setSelectedStudent(null);
      setEditingFee(null);
    } catch (error) {
      console.error('Error saving fee:', error);
      toast({
        title: t('error'),
        description: 'Failed to save fee record',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onLogout={onLogout} />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

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