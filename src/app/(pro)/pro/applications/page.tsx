import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ApplicationsClient from '@/components/pro/ApplicationsClient';

export default async function ProApplicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: applications }, { data: existingRatings }] = await Promise.all([
    supabase
      .from('applications')
      .select(`
        id, status, applied_at,
        shifts (
          id, job_title, date, start_time, end_time, duration_hours,
          pro_hourly_rate_iqd, status, business_id,
          business_locations ( branch_name, city, address, branch_phone ),
          users ( business_profiles ( business_name, business_type ) )
        )
      `)
      .eq('pro_id', user.id)
      .order('applied_at', { ascending: false }),
    // Shifts this pro has already rated a business for
    supabase
      .from('ratings')
      .select('shift_id')
      .eq('rater_id', user.id),
  ]);

  const ratedShiftIds = new Set((existingRatings ?? []).map((r) => r.shift_id));

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Applications</h1>
      <ApplicationsClient
        applications={(applications ?? []) as any}
        ratedShiftIds={ratedShiftIds}
      />
    </div>
  );
}

export const metadata = { title: 'My Applications' };
