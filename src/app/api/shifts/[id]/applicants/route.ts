import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  // Verify shift belongs to this business
  const { data: shift } = await supabase
    .from('shifts')
    .select('id, workers_needed, job_title, date, start_time, end_time, status')
    .eq('id', id)
    .eq('business_id', user.id)
    .single();

  if (!shift) return NextResponse.json({ error: 'Shift not found' }, { status: 404 });

  const { data: applications, error } = await supabase
    .from('applications')
    .select(`
      id, status, applied_at,
      users!pro_id (
        id, full_name, city,
        pro_profiles ( skills, skills_by_role, photo_url, average_rating, completed_shifts, bio ),
        pro_experiences ( id, position, business_name, start_date, end_date, is_current )
      )
    `)
    .eq('shift_id', id)
    .order('applied_at', { ascending: true });

  if (error) return NextResponse.json({ error: 'Failed to fetch applicants' }, { status: 500 });

  return NextResponse.json({ shift, applications: applications ?? [] });
}
