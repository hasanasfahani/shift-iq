import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/layout/TopBar';
import BusinessSidebar from '@/components/layout/BusinessSidebar';
import BusinessBottomNav from '@/components/layout/BusinessBottomNav';

export default async function BusinessLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: userData } = await supabase
    .from('users')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  if (!userData) redirect('/login');
  if (userData.role !== 'business') redirect('/pro/dashboard');

  return (
    <div className="flex flex-col h-screen">
      <TopBar userName={userData.full_name} role="business" />
      <div className="flex flex-1 overflow-hidden">
        <BusinessSidebar />
        <main className="flex-1 overflow-y-auto scroll-area bg-white p-4 pb-20 lg:p-6 lg:pb-6">
          {children}
        </main>
      </div>
      <BusinessBottomNav />
    </div>
  );
}
