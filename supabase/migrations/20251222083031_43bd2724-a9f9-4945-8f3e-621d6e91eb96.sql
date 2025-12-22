-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  father_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  profile_image TEXT,
  admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fee_records table
CREATE TABLE public.fee_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  amount INTEGER NOT NULL DEFAULT 500,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid')),
  payment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for students (admin can manage their own students)
CREATE POLICY "Users can view their own students" 
ON public.students FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own students" 
ON public.students FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own students" 
ON public.students FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own students" 
ON public.students FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for fee_records
CREATE POLICY "Users can view their own fee records" 
ON public.fee_records FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own fee records" 
ON public.fee_records FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fee records" 
ON public.fee_records FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fee records" 
ON public.fee_records FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_students_updated_at
BEFORE UPDATE ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fee_records_updated_at
BEFORE UPDATE ON public.fee_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Public read policy for fee checking by mobile (parents can check fee status)
CREATE POLICY "Anyone can view students by mobile for fee check"
ON public.students FOR SELECT
USING (true);

CREATE POLICY "Anyone can view fee records for public fee check"
ON public.fee_records FOR SELECT
USING (true);