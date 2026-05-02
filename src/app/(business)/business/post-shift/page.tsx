import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PostShiftForm from '@/components/shifts/PostShiftForm';
import type { BusinessLocation, BusinessType, ShiftTemplate } from '@/types';

export default async function PostShiftPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: locations }, { data: profile }, { data: templates }] = await Promise.all([
    supabase.from('business_locations').select('*').eq('business_id', user.id).order('created_at', { ascending: true }),
    supabase.from('business_profiles').select('business_type').eq('user_id', user.id).single(),
    supabase.from('shift_templates').select('*').eq('business_id', user.id).order('created_at', { ascending: false }),
  ]);

  return (
    <PostShiftForm
      locations={(locations ?? []) as BusinessLocation[]}
      businessType={(profile?.business_type ?? 'Other') as BusinessType}
      initialTemplates={(templates ?? []) as ShiftTemplate[]}
    />
  );
}

export const metadata = { title: 'Post a Shift' };
