import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/layout/TopBar';

export default async function SettingsLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: userData } = await supabase
    .from('users')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  if (!userData) redirect('/login');

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar userName={userData.full_name} role={userData.role as 'business' | 'pro'} />
      <main className="flex-1 bg-white px-4 py-6 lg:px-8">
        <div className="max-w-lg mx-auto">{children}</div>
      </main>
    </div>
  );
}
