-- Drop the insecure public access policies
DROP POLICY IF EXISTS "Anyone can view students by mobile for fee check" ON public.students;
DROP POLICY IF EXISTS "Anyone can view fee records for public fee check" ON public.fee_records;