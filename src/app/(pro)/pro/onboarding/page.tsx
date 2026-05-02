import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import OnboardingWizard from '@/components/pro/onboarding/OnboardingWizard';

export default async function ProOnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [{ data: userData }, { data: profile }, { data: experiences }] = await Promise.all([
    supabase
      .from('users')
      .select('full_name, first_name, last_name, phone, city, role')
      .eq('id', user.id)
      .single(),
    supabase
      .from('pro_profiles')
      .select('bio, skills, photo_url, days_availability, weekly_hours, work_type, shift_preference, skills_by_role, years_per_role, onboarding_completed, onboarding_step')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('pro_experiences')
      .select('*')
      .eq('pro_id', user.id)
      .order('start_date', { ascending: false }),
  ]);

  if (userData?.role !== 'pro') redirect('/business/dashboard');

  const initialData = {
    firstName: userData?.first_name ?? '',
    lastName: userData?.last_name ?? '',
    phone: userData?.phone ?? '',
    city: userData?.city ?? '',
    photoUrl: profile?.photo_url ?? null,
    daysAvailability: profile?.days_availability ?? [],
    weeklyHours: profile?.weekly_hours ?? null,
    workType: profile?.work_type ?? [],
    shiftPreference: profile?.shift_preference ?? [],
    roles: profile?.skills ?? [],
    skillsByRole: (profile?.skills_by_role ?? {}) as Record<string, string[]>,
    yearsPerRole: (profile?.years_per_role ?? {}) as Record<string, number>,
    about: profile?.bio ?? '',
    onboardingStep: profile?.onboarding_step ?? 0,
    onboardingCompleted: profile?.onboarding_completed ?? false,
    experiences: experiences ?? [],
  };

  return <OnboardingWizard initialData={initialData} />;
}
