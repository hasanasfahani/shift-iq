import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import EditShiftClient from '@/components/shifts/EditShiftClient';
import type { BusinessLocation, BusinessType } from '@/types';

export default async function EditShiftPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: shift }, { count: appCount }] = await Promise.all([
    supabase
      .from('shifts')
      .select(`
        id, job_title, date, start_time, end_time, duration_hours,
        workers_needed, pro_hourly_rate_iqd, shift_type, description,
        what_to_expect, clothing_rules, required_skills, preferred_skills,
        rules_and_regulations, cancellation_policy, payment_terms, special_badge,
        status, business_id, location_id
      `)
      .eq('id', id)
      .eq('business_id', user.id)
      .single(),
    supabase
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('shift_id', id),
  ]);

  if (!shift) notFound();
  if (shift.status !== 'open') redirect(`/business/shifts`);
  if ((appCount ?? 0) > 0) redirect(`/business/shifts`);

  const { data: locations } = await supabase
    .from('business_locations')
    .select('*')
    .eq('business_id', user.id)
    .order('created_at', { ascending: true });

  const { data: profile } = await supabase
    .from('business_profiles')
    .select('business_type')
    .eq('user_id', user.id)
    .single();

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/business/shifts"
          className="text-sm text-[#8B8299] hover:text-[#12051F] font-medium transition-colors"
        >
          ← Back to shifts
        </Link>
      </div>
      <h1 className="text-2xl font-black text-[#12051F] mb-6">Edit Shift</h1>
      <EditShiftClient
        shiftId={id}
        initialData={{
          locationId: shift.location_id,
          jobTitle: shift.job_title as any,
          date: shift.date,
          startTime: shift.start_time,
          endTime: shift.end_time,
          workersNeeded: shift.workers_needed,
          proHourlyRateIQD: shift.pro_hourly_rate_iqd,
          shiftType: shift.shift_type as any,
          description: shift.description ?? '',
          whatToExpect: shift.what_to_expect ?? '',
          clothingRules: (shift.clothing_rules as string[]) ?? [],
          requiredSkills: (shift.required_skills as string[]) ?? [],
          preferredSkills: (shift.preferred_skills as string[]) ?? [],
          rulesAndRegulations: shift.rules_and_regulations ?? '',
          cancellationPolicy: shift.cancellation_policy ?? '',
          paymentTerms: shift.payment_terms ?? '',
          specialBadge: shift.special_badge ?? '',
        }}
        locations={(locations ?? []) as BusinessLocation[]}
        businessType={(profile?.business_type ?? 'Other') as BusinessType}
      />
    </div>
  );
}

export const metadata = { title: 'Edit Shift' };
