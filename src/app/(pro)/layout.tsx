import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/layout/TopBar';
import ProSidebar from '@/components/layout/ProSidebar';
import ProBottomNav from '@/components/layout/ProBottomNav';
import ProOnboardingBannerClient from '@/components/layout/ProOnboardingBannerClient';

export default async function ProLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [{ data: userData }, { data: profileData }] = await Promise.all([
    supabase
      .from('users')
      .select('full_name, role')
      .eq('id', user.id)
      .single(),
    supabase
      .from('pro_profiles')
      .select('onboarding_completed')
      .eq('user_id', user.id)
      .single(),
  ]);

  if (!userData) redirect('/login');
  if (userData.role !== 'pro') redirect('/business/dashboard');

  const onboardingCompleted = profileData?.onboarding_completed ?? false;

  return (
    <div className="flex flex-col h-screen">
      <TopBar userName={userData.full_name} role="pro" />
      {!onboardingCompleted && <ProOnboardingBannerClient />}
      <div className="flex flex-1 overflow-hidden">
        <ProSidebar />
        <main className="flex-1 overflow-y-auto scroll-area bg-white p-4 pb-20 lg:p-6 lg:pb-6">
          {children}
        </main>
      </div>
      <ProBottomNav />
    </div>
  );
}
