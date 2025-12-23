-- Add monthly_fee_amount column to students table
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS monthly_fee_amount integer NOT NULL DEFAULT 500;

-- Drop existing fee_records table to recreate with proper constraints
DROP TABLE IF EXISTS public.fee_records;

-- Create new fee_records table with unique constraint and payment tracking
CREATE TABLE public.fee_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  amount INTEGER NOT NULL DEFAULT 500,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid')),
  payment_method TEXT CHECK (payment_method IN ('qr', 'cash', 'manual', NULL)),
  transaction_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- CRITICAL: Unique constraint to prevent duplicate month/year for same student
  CONSTRAINT unique_student_month_year UNIQUE (student_id, month, year)
);

-- Enable Row Level Security
ALTER TABLE public.fee_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for fee_records
CREATE POLICY "Users can view their own fee records" 
ON public.fee_records 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own fee records" 
ON public.fee_records 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fee records" 
ON public.fee_records 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fee records" 
ON public.fee_records 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_fee_records_updated_at
BEFORE UPDATE ON public.fee_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_fee_records_student_year ON public.fee_records(student_id, year);
CREATE INDEX idx_fee_records_status ON public.fee_records(status);