import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProProfileEditClient from '@/components/pro/ProProfileEditClient';

export default async function ProProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: userData }, { data: profile }, { data: experiences }] = await Promise.all([
    supabase
      .from('users')
      .select('full_name, first_name, last_name, phone, city')
      .eq('id', user.id)
      .single(),
    supabase
      .from('pro_profiles')
      .select('bio, skills, photo_url, average_rating, completed_shifts, days_availability, weekly_hours, work_type, shift_preference, skills_by_role, years_per_role')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('pro_experiences')
      .select('*')
      .eq('pro_id', user.id)
      .order('start_date', { ascending: false }),
  ]);

  return (
    <ProProfileEditClient
      initialData={{
        firstName: userData?.first_name ?? '',
        lastName: userData?.last_name ?? '',
        phone: userData?.phone ?? '',
        city: userData?.city ?? '',
        fullName: userData?.full_name ?? '',
        photoUrl: profile?.photo_url ?? null,
        bio: profile?.bio ?? '',
        roles: profile?.skills ?? [],
        skillsByRole: (profile?.skills_by_role ?? {}) as Record<string, string[]>,
        yearsPerRole: (profile?.years_per_role ?? {}) as Record<string, number>,
        daysAvailability: profile?.days_availability ?? [],
        weeklyHours: profile?.weekly_hours ?? null,
        workType: profile?.work_type ?? [],
        shiftPreference: profile?.shift_preference ?? [],
        averageRating: profile?.average_rating ?? 0,
        completedShifts: profile?.completed_shifts ?? 0,
        experiences: experiences ?? [],
      }}
    />
  );
}

export const metadata = { title: 'Profile' };
