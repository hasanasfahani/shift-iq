import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatIQD } from '@/lib/constants';

export default async function BusinessDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [
    { count: activeCount },
    { count: completedCount },
    { data: shiftIds },
    { data: feeData },
    { data: businessProfile },
  ] = await Promise.all([
    supabase
      .from('shifts')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', user.id)
      .in('status', ['open', 'filled']),
    supabase
      .from('shifts')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', user.id)
      .eq('status', 'completed'),
    supabase
      .from('shifts')
      .select('id')
      .eq('business_id', user.id)
      .in('status', ['open', 'filled']),
    supabase
      .from('shifts')
      .select('platform_fee_iqd')
      .eq('business_id', user.id)
      .in('status', ['open', 'filled']),
    supabase
      .from('business_profiles')
      .select('business_name, is_verified, average_rating, total_ratings')
      .eq('user_id', user.id)
      .single(),
  ]);

  const activeShiftIds = (shiftIds ?? []).map((s: { id: string }) => s.id);
  let pendingCount = 0;
  let pendingByShift: { shiftId: string; count: number; jobTitle: string }[] = [];

  if (activeShiftIds.length > 0) {
    const [{ count }, { data: pendingApps }] = await Promise.all([
      supabase
        .from('applications')
        .select('id', { count: 'exact', head: true })
        .in('shift_id', activeShiftIds)
        .eq('status', 'pending'),
      supabase
        .from('applications')
        .select('shift_id, shifts ( job_title )')
        .in('shift_id', activeShiftIds)
        .eq('status', 'pending'),
    ]);
    pendingCount = count ?? 0;

    const map: Record<string, { count: number; jobTitle: string }> = {};
    (pendingApps ?? []).forEach((a: any) => {
      if (!map[a.shift_id]) map[a.shift_id] = { count: 0, jobTitle: a.shifts?.job_title ?? '' };
      map[a.shift_id].count++;
    });
    pendingByShift = Object.entries(map)
      .map(([shiftId, v]) => ({ shiftId, ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }

  const totalFeesOwed = (feeData ?? []).reduce(
    (sum: number, s: { platform_fee_iqd: number }) => sum + s.platform_fee_iqd,
    0
  );

  const { data: recentShifts } = await supabase
    .from('shifts')
    .select('id, job_title, date, status, platform_fee_iqd, workers_needed, business_locations ( branch_name, city, photos ), applications ( id, status )')
    .eq('business_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const isVerified = businessProfile?.is_verified ?? false;
  const rating = businessProfile?.average_rating ?? 0;
  const totalRatings = businessProfile?.total_ratings ?? 0;
  const businessName = businessProfile?.business_name ?? 'Dashboard';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── HEADER ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#8B8299] mb-1">{greeting}</p>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-black text-[#12051F] leading-tight">{businessName}</h1>
            {isVerified ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#DDF4EA] text-[#0F3D36] text-xs font-bold">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#FEF3C7] text-[#92400E] text-xs font-semibold">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Pending verification
              </span>
            )}
          </div>
          {rating > 0 && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'text-[#F59E0B]' : 'text-[#E7E2EF]'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs font-semibold text-[#12051F]">{Number(rating).toFixed(1)}</span>
              <span className="text-xs text-[#C9C4D2]">·</span>
              <span className="text-xs text-[#8B8299]">{totalRatings} review{totalRatings !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        <Link
          href="/business/post-shift"
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7426E8] text-white text-sm font-bold hover:bg-[#6315d0] transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Post shift
        </Link>
      </div>

      {/* ── PENDING APPLICANTS ALERT ── */}
      {pendingCount > 0 && (
        <div className="rounded-2xl border border-[#7426E8]/20 bg-gradient-to-r from-[#F7F4FC] to-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-[#7426E8] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-[#12051F]">
                  {pendingCount} applicant{pendingCount !== 1 ? 's' : ''} awaiting review
                </p>
                <div className="mt-2 flex flex-col gap-1">
                  {pendingByShift.map((s) => (
                    <Link
                      key={s.shiftId}
                      href={`/business/shifts/${s.shiftId}/applicants`}
                      className="flex items-center gap-1.5 text-xs text-[#7426E8] hover:underline font-medium"
                    >
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#7426E8] text-white text-[10px] font-black shrink-0">
                        {s.count}
                      </span>
                      {s.jobTitle}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link
              href="/business/shifts"
              className="shrink-0 px-4 py-2 rounded-xl bg-[#7426E8] text-white text-xs font-bold hover:bg-[#6315d0] transition-colors"
            >
              Review →
            </Link>
          </div>
        </div>
      )}

      {/* ── STATS GRID ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Active Shifts */}
        <Link
          href="/business/shifts"
          className="group rounded-2xl border border-[#E7E2EF] bg-white p-5 hover:border-[#7426E8]/30 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <span className="w-9 h-9 rounded-xl bg-[#F3F0FB] flex items-center justify-center group-hover:bg-[#E9DEFF] transition-colors">
              <svg className="w-5 h-5 text-[#7426E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
            <svg className="w-4 h-4 text-[#C9C4D2] group-hover:text-[#7426E8] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <p className="text-3xl font-black text-[#12051F] tabular-nums">{activeCount ?? 0}</p>
          <p className="text-xs text-[#8B8299] mt-1 font-medium">Active shifts</p>
        </Link>

        {/* Pending */}
        <Link
          href="/business/shifts"
          className="group rounded-2xl border border-[#E7E2EF] bg-white p-5 hover:border-[#7426E8]/30 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <span className="w-9 h-9 rounded-xl bg-[#F3F0FB] flex items-center justify-center group-hover:bg-[#E9DEFF] transition-colors">
              <svg className="w-5 h-5 text-[#7426E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <svg className="w-4 h-4 text-[#C9C4D2] group-hover:text-[#7426E8] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <p className="text-3xl font-black text-[#12051F] tabular-nums">{pendingCount}</p>
          <p className="text-xs text-[#8B8299] mt-1 font-medium">Pending review</p>
        </Link>

        {/* Completed */}
        <div className="rounded-2xl border border-[#E7E2EF] bg-white p-5">
          <div className="flex items-start justify-between mb-4">
            <span className="w-9 h-9 rounded-xl bg-[#DDF4EA] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#0F3D36]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <p className="text-3xl font-black text-[#12051F] tabular-nums">{completedCount ?? 0}</p>
          <p className="text-xs text-[#8B8299] mt-1 font-medium">Completed shifts</p>
        </div>

        {/* Fees */}
        <div className="rounded-2xl bg-[#0F3D36] p-5">
          <div className="flex items-start justify-between mb-4">
            <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#28D96D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <p className="text-2xl font-black text-[#28D96D] tabular-nums leading-tight">{formatIQD(totalFeesOwed)}</p>
          <p className="text-xs text-white/40 mt-1 font-medium">Platform fees</p>
        </div>
      </div>

      {/* ── RECENT SHIFTS ── */}
      {recentShifts && recentShifts.length > 0 ? (
        <div className="rounded-2xl border border-[#E7E2EF] bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E7E2EF]">
            <h2 className="text-sm font-bold text-[#12051F]">Recent shifts</h2>
            <Link href="/business/shifts" className="text-xs text-[#7426E8] font-semibold hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-[#F7F4FC]">
            {recentShifts.map((shift: any) => {
              const acceptedCount = (shift.applications ?? []).filter((a: any) => a.status === 'accepted').length;
              const totalApps = (shift.applications ?? []).length;
              const fillPct = shift.workers_needed > 0 ? Math.round((acceptedCount / shift.workers_needed) * 100) : 0;
              const venuePhoto = shift.business_locations?.photos?.[0];

              const statusStyle: Record<string, string> = {
                open:      'bg-[#DDF4EA] text-[#0F3D36]',
                filled:    'bg-[#FEF3C7] text-[#92400E]',
                completed: 'bg-[#E9DEFF] text-[#7426E8]',
                cancelled: 'bg-[#F3F0FB] text-[#8B8299]',
              };

              return (
                <Link
                  key={shift.id}
                  href={`/business/shifts/${shift.id}/applicants`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#F7F4FC] transition-colors group"
                >
                  {/* Venue thumbnail */}
                  <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-[#F3F0FB]">
                    {venuePhoto ? (
                      <img src={venuePhoto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#C9C4D2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#12051F] truncate">{shift.job_title}</p>
                    <p className="text-xs text-[#8B8299]">
                      {shift.business_locations?.branch_name} · {new Date(shift.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                    {totalApps > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1 w-16 bg-[#E7E2EF] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${fillPct >= 100 ? 'bg-[#28D96D]' : fillPct >= 80 ? 'bg-[#F59E0B]' : 'bg-[#7426E8]'}`}
                            style={{ width: `${Math.min(fillPct, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-[#C9C4D2]">{acceptedCount}/{shift.workers_needed}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize ${statusStyle[shift.status] ?? 'bg-[#F3F0FB] text-[#8B8299]'}`}>
                      {shift.status}
                    </span>
                    {totalApps > 0 && (
                      <span className="text-xs text-[#8B8299]">{totalApps} applicant{totalApps !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#E7E2EF] bg-white p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#F3F0FB] flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-[#C9C4D2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-bold text-[#12051F] mb-1">No shifts yet</p>
          <p className="text-xs text-[#C9C4D2] mb-4">Post your first shift to start finding pros</p>
          <Link
            href="/business/post-shift"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#7426E8] text-white text-sm font-bold hover:bg-[#6315d0] transition-colors"
          >
            Post a shift
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}

export const metadata = { title: 'Dashboard' };
