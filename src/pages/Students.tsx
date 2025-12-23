import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, IndianRupee, Edit, Eye, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Filters from '@/components/Filters';
import StudentForm from '@/components/StudentForm';
import StudentProfile from '@/components/StudentProfile';
import FeeManagement from '@/components/FeeManagement';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Student, FeeRecord } from '@/lib/types';

interface StudentsProps { onLogout: () => void; }

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
  const [showFeeManagement, setShowFeeManagement] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [studentsResult, feesResult] = await Promise.all([
        supabase.from('students').select('*').eq('user_id', user.id),
        supabase.from('fee_records').select('*').eq('user_id', user.id)
      ]);

      if (studentsResult.data) {
        setStudents(studentsResult.data.map(s => ({
          id: s.id, name: s.name, class: s.class, fatherName: s.father_name,
          mobile: s.mobile, profileImage: s.profile_image || '', admissionDate: s.admission_date,
          monthlyFeeAmount: s.monthly_fee_amount || 500
        })));
      }

      if (feesResult.data) {
        setFeeRecords(feesResult.data.map(f => ({
          id: f.id, studentId: f.student_id, month: f.month, year: f.year, amount: f.amount,
          status: f.status as 'paid' | 'unpaid', paymentMethod: f.payment_method as 'qr' | 'cash' | 'manual' | null,
          transactionId: f.transaction_id, paidAt: f.paid_at
        })));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: t('error'), description: 'Failed to load data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileName = `${Date.now()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('student-profiles').upload(fileName, file);
      if (error) throw error;
      return supabase.storage.from('student-profiles').getPublicUrl(fileName).data.publicUrl;
    } catch (error) {
      toast({ title: t('error'), description: t('imageUploadError'), variant: 'destructive' });
      return null;
    }
  };

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

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const getLatestFee = (studentId: string) => feeRecords.find(f => f.studentId === studentId);

  const handleViewProfile = (student: Student) => { setSelectedStudent(student); setShowProfile(true); };
  const handleEditStudent = (student: Student) => { setEditingStudent(student); setShowStudentForm(true); };
  const handleDeleteStudent = (student: Student) => { setStudentToDelete(student); };
  const handleManageFees = (student: Student) => { setSelectedStudent(student); setShowFeeManagement(true); };

  const confirmDelete = async () => {
    if (studentToDelete) {
      try {
        const { error } = await supabase.from('students').delete().eq('id', studentToDelete.id);
        if (error) throw error;
        setStudents(students.filter(s => s.id !== studentToDelete.id));
        setFeeRecords(feeRecords.filter(f => f.studentId !== studentToDelete.id));
        toast({ title: t('success'), description: t('studentDeleted') });
      } catch (error) {
        toast({ title: t('error'), description: 'Failed to delete student', variant: 'destructive' });
      }
      setStudentToDelete(null);
    }
  };

  const handleSaveStudent = async (studentData: Omit<Student, 'id'>, imageFile?: File) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let profileImageUrl = studentData.profileImage;
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) profileImageUrl = uploadedUrl;
      }

      if (editingStudent) {
        const { error } = await supabase.from('students').update({
          name: studentData.name, class: studentData.class, father_name: studentData.fatherName,
          mobile: studentData.mobile, admission_date: studentData.admissionDate,
          profile_image: profileImageUrl || null, monthly_fee_amount: studentData.monthlyFeeAmount,
        }).eq('id', editingStudent.id);
        if (error) throw error;
        setStudents(students.map(s => s.id === editingStudent.id ? { ...studentData, id: editingStudent.id, profileImage: profileImageUrl } : s));
        toast({ title: t('success'), description: t('studentUpdated') });
      } else {
        const { data, error } = await supabase.from('students').insert({
          user_id: user.id, name: studentData.name, class: studentData.class,
          father_name: studentData.fatherName, mobile: studentData.mobile,
          admission_date: studentData.admissionDate, profile_image: profileImageUrl || null,
          monthly_fee_amount: studentData.monthlyFeeAmount,
        }).select().single();
        if (error) throw error;
        setStudents([...students, {
          id: data.id, name: data.name, class: data.class, fatherName: data.father_name,
          mobile: data.mobile, profileImage: data.profile_image || '', admissionDate: data.admission_date,
          monthlyFeeAmount: data.monthly_fee_amount || 500,
        }]);
        toast({ title: t('success'), description: t('studentAdded') });
      }
      setEditingStudent(null);
    } catch (error) {
      toast({ title: t('error'), description: 'Failed to save student', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onLogout={onLogout} />
        <div className="flex items-center justify-center h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
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
            <p className="text-sm text-muted-foreground">{filteredStudents.length} {t('totalStudents').toLowerCase()}</p>
          </div>
          <Button onClick={() => { setEditingStudent(null); setShowStudentForm(true); }} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" />{t('addStudent')}
          </Button>
        </div>

        <Filters searchQuery={searchQuery} setSearchQuery={setSearchQuery} classFilter={classFilter} setClassFilter={setClassFilter} statusFilter={statusFilter} setStatusFilter={setStatusFilter} monthFilter={monthFilter} setMonthFilter={setMonthFilter} showMonthFilter={false} />

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
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">{t('noStudentsFound')}</TableCell></TableRow>
              ) : (
                filteredStudents.map((student) => {
                  const latestFee = getLatestFee(student.id);
                  return (
                    <TableRow key={student.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-border">
                            <AvatarImage src={student.profileImage} alt={student.name} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">{getInitials(student.name)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary" className="bg-primary/10 text-primary border-0">{t(student.class)}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{student.fatherName}</TableCell>
                      <TableCell className="text-muted-foreground">{student.mobile}</TableCell>
                      <TableCell>
                        {latestFee ? (
                          <Badge className={`${latestFee.status === 'paid' ? 'status-paid' : 'status-unpaid'} border`}>{t(latestFee.status)}</Badge>
                        ) : (<span className="text-sm text-muted-foreground">-</span>)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewProfile(student)} className="text-primary hover:bg-primary/10"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleManageFees(student)} className="text-success hover:bg-success/10"><IndianRupee className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditStudent(student)} className="text-muted-foreground hover:bg-muted"><Edit className="h-4 w-4" /></Button>
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

      <StudentProfile open={showProfile} onClose={() => setShowProfile(false)} student={selectedStudent} feeRecords={feeRecords} />
      <StudentForm open={showStudentForm} onClose={() => { setShowStudentForm(false); setEditingStudent(null); }} onSave={handleSaveStudent} student={editingStudent} />
      <FeeManagement open={showFeeManagement} onClose={() => { setShowFeeManagement(false); setSelectedStudent(null); }} student={selectedStudent} onFeesUpdated={fetchData} />

      <AlertDialog open={!!studentToDelete} onOpenChange={() => setStudentToDelete(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">{t('deleteStudent')}</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">{t('confirmDelete')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-muted">{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t('delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Students;