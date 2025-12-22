import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, IndianRupee, AlertCircle, TrendingUp, Plus } from 'lucide-react';
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
import { mockStudents, mockFeeRecords } from '@/lib/mockData';
import { Student, FeeRecord } from '@/lib/types';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const currentMonth = new Date().toLocaleString('en', { month: 'long' }).toLowerCase();

  // Calculate stats
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const currentMonthFees = feeRecords.filter(f => f.month === 'december' && f.year === 2024);
    const feesCollected = currentMonthFees
      .filter(f => f.status === 'paid')
      .reduce((sum, f) => sum + f.amount, 0);
    const pendingFees = currentMonthFees
      .filter(f => f.status === 'unpaid')
      .reduce((sum, f) => sum + f.amount, 0);

    return { totalStudents, feesCollected, pendingFees };
  }, [students, feeRecords]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = classFilter === 'all' || student.class === classFilter;
      
      // Status filter based on latest fee record
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
    setShowFeeForm(true);
  };

  const handleSaveFee = (feeData: Omit<FeeRecord, 'id'>) => {
    const newFee = { ...feeData, id: Date.now().toString() };
    setFeeRecords([newFee, ...feeRecords]);
    toast({
      title: t('success'),
      description: t('feeAdded'),
    });
    setSelectedStudent(null);
  };

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
