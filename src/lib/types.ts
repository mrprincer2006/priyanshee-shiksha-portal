export interface Student {
  id: string;
  name: string;
  class: string;
  fatherName: string;
  mobile: string;
  admissionDate: string;
  profileImage: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  month: string;
  year: number;
  amount: number;
  status: 'paid' | 'unpaid';
  paymentDate: string | null;
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
  | 'class6';

export type MonthType = 
  | 'january' 
  | 'february' 
  | 'march' 
  | 'april' 
  | 'may' 
  | 'june' 
  | 'july' 
  | 'august' 
  | 'september' 
  | 'october' 
  | 'november' 
  | 'december';

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
];

export const MONTH_OPTIONS: MonthType[] = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
];
