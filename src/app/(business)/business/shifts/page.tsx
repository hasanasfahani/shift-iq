import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ShiftsClient from '@/components/shifts/ShiftsClient';

export default async function BusinessShiftsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: shifts } = await supabase
    .from('shifts')
    .select('*, business_locations ( branch_name, city, photos ), applications ( id, status )')
    .eq('business_id', user.id)
    .order('date', { ascending: false });

  return <ShiftsClient shifts={(shifts ?? []) as any} />;
}

export const metadata = { title: 'My Shifts' };
