export interface Student {
  id: string;
  name: string;
  class: string;
  fatherName: string;
  mobile: string;
  admissionDate: string;
  profileImage: string;
  monthlyFeeAmount: number;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  month: number;
  year: number;
  amount: number;
  status: 'paid' | 'unpaid';
  paymentMethod: 'qr' | 'cash' | 'manual' | null;
  transactionId: string | null;
  paidAt: string | null;
}

export interface Admin {
  email: string;
  password: string;
}

export type ClassType = 
  | 'nursery' 
  | 'lkg' 
  | 'ukg' 
  | 'class1' 
  | 'class2' 
  | 'class3' 
  | 'class4' 
  | 'class5' 
  | 'class6'
  | 'class7'
  | 'class8'
  | 'class9'
  | 'class10';

export const CLASS_OPTIONS: ClassType[] = [
  'nursery',
  'lkg',
  'ukg',
  'class1',
  'class2',
  'class3',
  'class4',
  'class5',
  'class6',
  'class7',
  'class8',
  'class9',
  'class10',
];

export const MONTH_OPTIONS = [
  { value: 1, key: 'january' },
  { value: 2, key: 'february' },
  { value: 3, key: 'march' },
  { value: 4, key: 'april' },
  { value: 5, key: 'may' },
  { value: 6, key: 'june' },
  { value: 7, key: 'july' },
  { value: 8, key: 'august' },
  { value: 9, key: 'september' },
  { value: 10, key: 'october' },
  { value: 11, key: 'november' },
  { value: 12, key: 'december' },
] as const;

export const getMonthName = (month: number): string => {
  const monthData = MONTH_OPTIONS.find(m => m.value === month);
  return monthData?.key || 'january';
};