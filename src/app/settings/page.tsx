import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SettingsForm from '@/components/settings/SettingsForm';
import type { IraqiCity, UserRole } from '@/types';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: userData } = await supabase
    .from('users')
    .select('full_name, city, phone, role')
    .eq('id', user.id)
    .single();

  if (!userData) redirect('/login');

  return (
    <SettingsForm
      initialFullName={userData.full_name}
      initialCity={userData.city as IraqiCity}
      phone={userData.phone}
      role={userData.role as UserRole}
    />
  );
}

export const metadata = { title: 'Settings' };
