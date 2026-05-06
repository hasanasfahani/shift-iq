import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import FinanceClient from '@/components/pro/FinanceClient';

export default async function ProFinancePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: applications }, { data: userData }] = await Promise.all([
    supabase
      .from('applications')
      .select(`
        shift_id,
        shifts (
          id, job_title, date, start_time, end_time, duration_hours,
          pro_hourly_rate_iqd, status,
          business_locations ( branch_name, city ),
          users ( business_profiles ( business_name, business_type ) )
        )
      `)
      .eq('pro_id', user.id)
      .eq('status', 'accepted'),
    supabase
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single(),
  ]);

  const completed = (applications ?? [])
    .filter((a: any) => a.shifts?.status === 'completed')
    .sort((a: any, b: any) => b.shifts.date.localeCompare(a.shifts.date));

  return (
    <FinanceClient
      transactions={completed as any}
      userName={userData?.full_name ?? ''}
    />
  );
}

export const metadata = { title: 'Finance' };
