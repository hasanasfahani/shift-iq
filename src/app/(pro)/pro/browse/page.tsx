import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import BrowseClient from '@/components/pro/BrowseClient';

const adminClient = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function BrowseShiftsPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; role?: string; dateFrom?: string; dateTo?: string; shiftType?: string; minRate?: string; maxRate?: string; sort?: string }>;
}) {
  const filters = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  let query = supabase
    .from('shifts')
    .select(`
      id, business_id, job_title, date, start_time, end_time, duration_hours,
      workers_needed, pro_hourly_rate_iqd, shift_type, description, status,
      special_badge, created_at,
      business_locations ( branch_name, city, address, branch_phone, photos ),
      users ( business_profiles ( business_name, is_verified, business_type ) )
    `)
    .eq('status', 'open')
    .order('date', { ascending: true });

  if (filters.role) query = query.eq('job_title', filters.role);
  if (filters.dateFrom) query = query.gte('date', filters.dateFrom);
  if (filters.dateTo) query = query.lte('date', filters.dateTo);
  if (filters.shiftType) query = query.eq('shift_type', filters.shiftType);
  if (filters.minRate) query = query.gte('pro_hourly_rate_iqd', parseInt(filters.minRate));
  if (filters.maxRate) query = query.lte('pro_hourly_rate_iqd', parseInt(filters.maxRate));

  const [{ data: shifts }, { data: myApplications }] = await Promise.all([
    query,
    supabase
      .from('applications')
      .select('shift_id')
      .eq('pro_id', user.id),
  ]);

  let result = (shifts ?? []) as any[];
  if (filters.city) {
    result = result.filter((s) => s.business_locations?.city === filters.city);
  }

  // Fetch accepted application counts for spots-remaining
  const shiftIds = result.map((s) => s.id);
  let acceptedCountMap: Record<string, number> = {};
  if (shiftIds.length > 0) {
    const { data: accepted } = await supabase
      .from('applications')
      .select('shift_id')
      .in('shift_id', shiftIds)
      .eq('status', 'accepted');
    (accepted ?? []).forEach((a: any) => {
      acceptedCountMap[a.shift_id] = (acceptedCountMap[a.shift_id] ?? 0) + 1;
    });
  }

  // Fetch business profiles via admin client (bypasses RLS — service role, server only)
  const businessIds = [...new Set(result.map((s) => s.business_id).filter(Boolean))];
  let businessTypeMap: Record<string, string> = {};
  if (businessIds.length > 0) {
    const { data: profiles } = await adminClient
      .from('business_profiles')
      .select('user_id, business_type')
      .in('user_id', businessIds);
    (profiles ?? []).forEach((p: any) => {
      businessTypeMap[p.user_id] = p.business_type;
    });
  }

  // Attach accepted count and flatten business info to each shift
  result = result.map((s) => ({
    ...s,
    accepted_count: acceptedCountMap[s.id] ?? 0,
    _business_type: businessTypeMap[s.business_id] ?? null,
  }));

  // Sort
  if (filters.sort === 'pay_desc') {
    result.sort((a, b) => b.pro_hourly_rate_iqd - a.pro_hourly_rate_iqd);
  } else if (filters.sort === 'pay_asc') {
    result.sort((a, b) => a.pro_hourly_rate_iqd - b.pro_hourly_rate_iqd);
  } else if (filters.sort === 'duration_desc') {
    result.sort((a, b) => b.duration_hours - a.duration_hours);
  }
  // default: date asc (already ordered)

  const appliedShiftIds = (myApplications ?? []).map((a) => a.shift_id);

  return (
    <div>
      <BrowseClient
        initialShifts={result}
        appliedShiftIds={appliedShiftIds}
        totalCount={result.length}
        currentCity={filters.city ?? ''}
        currentRole={filters.role ?? ''}
        currentShiftType={filters.shiftType ?? ''}
        currentSort={filters.sort ?? ''}
        currentMinRate={filters.minRate ?? ''}
        currentMaxRate={filters.maxRate ?? ''}
      />
    </div>
  );
}

export const metadata = { title: 'Browse Shifts' };
