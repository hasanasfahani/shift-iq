import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BusinessFinanceClient from '@/components/business/BusinessFinanceClient';

export default async function BusinessFinancePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: shifts }, { data: businessProfile }] = await Promise.all([
    supabase
      .from('shifts')
      .select(`
        id, job_title, date, start_time, end_time, duration_hours,
        workers_needed, platform_fee_iqd, pro_hourly_rate_iqd, status, created_at,
        business_locations ( branch_name, city ),
        applications ( id, status )
      `)
      .eq('business_id', user.id)
      .order('date', { ascending: false }),
    supabase
      .from('business_profiles')
      .select('business_name')
      .eq('user_id', user.id)
      .single(),
  ]);

  return (
    <BusinessFinanceClient
      shifts={(shifts ?? []) as any}
      businessName={businessProfile?.business_name ?? ''}
    />
  );
}

export const metadata = { title: 'Finance' };
