import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, IndianRupee, AlertCircle, Plus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import Filters from '@/components/Filters';
import StudentCard from '@/components/StudentCard';
import StudentProfile from '@/components/StudentProfile';
import StudentForm from '@/components/StudentForm';
import FeeForm from '@/components/FeeForm';
import { Button } from '@/components/ui/button';
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
import { supabase } from '@/integrations/supabase/client';
import { Student, FeeRecord } from '@/lib/types';

interface DashboardProps {
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
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const currentMonth = new Date().toLocaleString('en', { month: 'long' }).toLowerCase();
  const currentYear = new Date().getFullYear();

  // Fetch data from database
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

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('student-profiles')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const currentMonthFees = feeRecords.filter(f => f.month === currentMonth && f.year === currentYear);
    const feesCollected = currentMonthFees
      .filter(f => f.status === 'paid')
      .reduce((sum, f) => sum + f.amount, 0);
    const pendingFees = currentMonthFees
      .filter(f => f.status === 'unpaid')
      .reduce((sum, f) => sum + f.amount, 0);

    return { totalStudents, feesCollected, pendingFees };
  }, [students, feeRecords, currentMonth, currentYear]);

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

  // Handlers
  const handleViewProfile = (student: Student) => {
    setSelectedStudent(student);
    setShowProfile(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setShowStudentForm(true);
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
      
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          profileImageUrl = uploadedUrl;
        }
      }

      if (editingStudent) {
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
    setShowFeeForm(true);
  };

  const handleSaveFee = async (feeData: Omit<FeeRecord, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
      setSelectedStudent(null);
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">{t('dashboard')}</h1>
          <p className="text-sm text-muted-foreground">{t('welcome')}!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            title={t('totalStudents')}
            value={stats.totalStudents}
            icon={Users}
            variant="primary"
          />
          <StatCard
            title={t('feesCollected')}
            value={`₹${stats.feesCollected.toLocaleString()}`}
            subtitle={t('thisMonth')}
            icon={IndianRupee}
            variant="success"
          />
          <StatCard
            title={t('pendingFees')}
            value={`₹${stats.pendingFees.toLocaleString()}`}
            subtitle={t('thisMonth')}
            icon={AlertCircle}
            variant="destructive"
          />
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

        {/* Students Header */}
        <div className="flex items-center justify-between my-6">
          <h2 className="text-lg font-semibold text-foreground">
            {t('students')} ({filteredStudents.length})
          </h2>
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

        {/* Students Grid */}
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{t('noStudentsFound')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student, index) => (
              <div
                key={student.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <StudentCard
                  student={student}
                  onView={handleViewProfile}
                  onEdit={handleEditStudent}
                  onDelete={handleDeleteStudent}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <StudentProfile
        open={showProfile}
        onClose={() => setShowProfile(false)}
        student={selectedStudent}
        feeRecords={feeRecords}
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
        }}
        onSave={handleSaveFee}
        student={selectedStudent}
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

export default Dashboard;