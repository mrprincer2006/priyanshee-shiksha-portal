import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mobile } = await req.json();

    // Validate mobile number
    if (!mobile || typeof mobile !== 'string' || mobile.length < 10) {
      console.log('Invalid mobile number provided:', mobile);
      return new Response(
        JSON.stringify({ error: 'Invalid mobile number', students: [] }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Clean mobile number - only digits
    const cleanMobile = mobile.replace(/\D/g, '');
    console.log('Searching for mobile:', cleanMobile);

    // Create Supabase client with service role for secure server-side access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch students by mobile number - only return limited info
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, name, class')
      .eq('mobile', cleanMobile);

    if (studentsError) {
      console.error('Error fetching students:', studentsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch data', students: [] }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!students || students.length === 0) {
      console.log('No students found for mobile:', cleanMobile);
      return new Response(
        JSON.stringify({ students: [] }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Fetch fee records for found students
    const studentIds = students.map(s => s.id);
    const { data: feeRecords, error: feeError } = await supabase
      .from('fee_records')
      .select('student_id, month, year, amount, status')
      .in('student_id', studentIds)
      .order('year', { ascending: false })
      .order('created_at', { ascending: false });

    if (feeError) {
      console.error('Error fetching fee records:', feeError);
    }

    // Combine data - only return necessary fields for fee checking
    const result = students.map(student => ({
      id: student.id,
      name: student.name,
      class: student.class,
      fees: (feeRecords || [])
        .filter(f => f.student_id === student.id)
        .map(f => ({
          month: f.month,
          year: f.year,
          amount: f.amount,
          status: f.status
        }))
    }));

    console.log('Returning', result.length, 'students with fee data');

    return new Response(
      JSON.stringify({ students: result }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', students: [] }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});