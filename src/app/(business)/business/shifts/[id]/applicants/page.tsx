import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ApplicantsClient from '@/components/shifts/ApplicantsClient';

export default async function ApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: shift } = await supabase
    .from('shifts')
    .select('id, workers_needed, job_title, date, start_time, end_time, status')
    .eq('id', id)
    .eq('business_id', user.id)
    .single();

  if (!shift) notFound();

  const [{ data: applications }, { data: existingRatings }] = await Promise.all([
    supabase
      .from('applications')
      .select(`
        id, status, applied_at,
        users!pro_id (
          id, full_name, city, phone,
          pro_profiles ( skills, skills_by_role, photo_url, average_rating, completed_shifts, bio ),
          pro_experiences ( id, position, business_name, start_date, end_date, is_current )
        )
      `)
      .eq('shift_id', id)
      .order('applied_at', { ascending: true }),
    // Which pros has this business already rated for this shift?
    supabase
      .from('ratings')
      .select('rated_id')
      .eq('shift_id', id)
      .eq('rater_id', user.id),
  ]);

  const ratedProIds = new Set((existingRatings ?? []).map((r) => r.rated_id));

  return (
    <ApplicantsClient
      shift={shift as any}
      initialApplicants={(applications ?? []) as any}
      ratedProIds={ratedProIds}
    />
  );
}
