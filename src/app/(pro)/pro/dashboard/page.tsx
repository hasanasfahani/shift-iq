import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatIQD } from '@/lib/constants';

export default async function ProDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const today = new Date().toISOString().split('T')[0];

  const [
    { count: appliedCount },
    { data: acceptedApplications },
    { data: profile },
    { data: existingRatings },
    { data: userData },
  ] = await Promise.all([
    supabase
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('pro_id', user.id),
    supabase
      .from('applications')
      .select(`
        shift_id,
        shifts ( id, date, status, duration_hours, pro_hourly_rate_iqd,
          job_title, start_time, end_time, business_id,
          business_locations ( branch_name, city, address, branch_phone ) )
      `)
      .eq('pro_id', user.id)
      .eq('status', 'accepted'),
    supabase
      .from('pro_profiles')
      .select('completed_shifts, onboarding_completed, photo_url, bio, skills, availability')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('ratings')
      .select('shift_id')
      .eq('rater_id', user.id),
    supabase
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single(),
  ]);

  const accepted = (acceptedApplications ?? []) as any[];
  const ratedShiftIds = new Set((existingRatings ?? []).map((r: any) => r.shift_id));
  const fullName = userData?.full_name ?? '';
  const firstName = fullName.split(' ')[0];
  const initials = fullName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();

  const completenessItems = [
    { label: 'Full name', done: !!userData?.full_name },
    { label: 'Profile photo', done: !!profile?.photo_url },
    { label: 'Bio', done: !!profile?.bio },
    { label: 'Skills', done: Array.isArray(profile?.skills) && (profile.skills as string[]).length > 0 },
    { label: 'Availability', done: !!profile?.availability },
  ];
  const completenessPct = Math.round(
    (completenessItems.filter((i) => i.done).length / completenessItems.length) * 100
  );
  const showCompletenessMeter = profile?.onboarding_completed && completenessPct < 100;

  const todayShifts = accepted
    .filter((a) => a.shifts?.date === today && a.shifts?.status !== 'cancelled')
    .sort((a: any, b: any) => a.shifts.start_time.localeCompare(b.shifts.start_time));

  const upcomingShifts = accepted
    .filter((a) => a.shifts?.date > today && a.shifts?.status !== 'cancelled')
    .sort((a: any, b: any) => a.shifts.date.localeCompare(b.shifts.date))
    .slice(0, 5);

  const totalEarnings = accepted
    .filter((a) => a.shifts?.status === 'completed')
    .reduce((sum: number, a: any) => {
      const s = a.shifts;
      return sum + Math.round(s.duration_hours * s.pro_hourly_rate_iqd);
    }, 0);

  const pendingRatings = accepted.filter(
    (a) => a.shifts?.status === 'completed' && !ratedShiftIds.has(a.shift_id)
  ).length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {/* Avatar */}
          <div className="relative shrink-0">
            {profile?.photo_url ? (
              <img
                src={profile.photo_url}
                alt={fullName}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#E7E2EF]"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7426E8] to-[#5C1FBA] flex items-center justify-center text-white font-black text-base">
                {initials || '?'}
              </div>
            )}
            {profile?.onboarding_completed && (
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#28D96D] border-2 border-white" />
            )}
          </div>
          <div>
            <p className="text-xs text-[#8B8299] font-medium">{greeting}</p>
            <h1 className="text-xl font-black text-[#12051F] leading-tight">
              {firstName || 'Welcome back'}
            </h1>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-semibold text-[#8B8299]">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long' })}
          </p>
          <p className="text-xs text-[#C9C4D2]">
            {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      {/* ── AD BANNER ── */}
      <div className="relative rounded-2xl overflow-hidden border border-[#E7E2EF] bg-gradient-to-r from-[#12051F] to-[#2D1060]">
        <div className="absolute top-2 left-3 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest text-white/40 uppercase">
          Ad
        </div>
        <div className="px-5 pt-8 pb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#7426E8] mb-1 uppercase tracking-wide">Sponsored</p>
            <p className="text-base font-black text-white leading-tight mb-1">
              Reach 500+ hospitality pros in Kurdistan
            </p>
            <p className="text-xs text-white/50 leading-relaxed">
              Advertise your venue or brand directly to verified workers on Shift.iq
            </p>
          </div>
          <div className="shrink-0 w-12 h-12 rounded-2xl bg-[#7426E8]/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-[#7426E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
        </div>
        <div className="px-5 pb-4">
          <a
            href="mailto:ads@shiftiq.app"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7426E8] text-white text-xs font-bold hover:bg-[#6315d0] transition-colors"
          >
            Get in touch →
          </a>
        </div>
      </div>

      {/* ── ONBOARDING / COMPLETENESS ── */}
      {profile?.onboarding_completed === false ? (
        <div className="rounded-2xl bg-gradient-to-r from-[#7426E8] to-[#9B51E0] p-px">
          <div className="rounded-[15px] bg-gradient-to-r from-[#7426E8] to-[#9B51E0] p-5 text-white flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-base">Finish setting up your profile</p>
              <p className="text-white/70 text-xs mt-0.5">Takes less than 5 minutes to unlock all shifts</p>
            </div>
            <Link
              href="/pro/onboarding"
              className="shrink-0 px-4 py-2 rounded-xl bg-white text-[#7426E8] text-xs font-black hover:bg-white/90 transition-colors"
            >
              Get started →
            </Link>
          </div>
        </div>
      ) : showCompletenessMeter ? (
        <div className="rounded-2xl border border-[#E7E2EF] bg-white p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="font-bold text-[#12051F] text-sm">Profile strength</p>
              <p className="text-xs text-[#8B8299] mt-0.5">
                Complete profile · <span className="text-[#7426E8] font-semibold">3× more invites</span> from top businesses
              </p>
            </div>
            <div className="shrink-0 relative w-12 h-12">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="#E7E2EF" strokeWidth="4" />
                <circle
                  cx="24" cy="24" r="20" fill="none"
                  stroke="#7426E8" strokeWidth="4"
                  strokeDasharray={`${(completenessPct / 100) * 125.6} 125.6`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-[#7426E8]">
                {completenessPct}%
              </span>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {completenessItems.map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1">
                <div className={`w-full h-1 rounded-full ${item.done ? 'bg-[#7426E8]' : 'bg-[#E7E2EF]'}`} />
                <span className={`text-[10px] text-center leading-tight ${item.done ? 'text-[#7426E8]' : 'text-[#C9C4D2]'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/pro/profile"
            className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#E9DEFF] bg-[#F7F4FC] text-[#7426E8] text-xs font-semibold hover:bg-[#E9DEFF] transition-colors"
          >
            Complete profile →
          </Link>
        </div>
      ) : null}

      {/* ── PENDING RATINGS ── */}
      {pendingRatings > 0 && (
        <Link
          href="/pro/applications"
          className="flex items-center justify-between gap-4 rounded-2xl border border-[#F59E0B]/30 bg-[#FFFBEB] px-5 py-4 hover:border-[#F59E0B]/60 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[#FEF3C7] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#D97706]" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-bold text-[#92400E]">
                {pendingRatings} shift{pendingRatings !== 1 ? 's' : ''} need your rating
              </p>
              <p className="text-xs text-[#B45309]/70 mt-0.5">Your feedback shapes the community</p>
            </div>
          </div>
          <svg className="w-4 h-4 text-[#B45309] group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}

      {/* ── TODAY'S SHIFT ── */}
      {todayShifts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#28D96D] animate-pulse" />
            <h2 className="text-xs font-black text-[#0F3D36] uppercase tracking-widest">On shift today</h2>
          </div>
          <div className="flex flex-col gap-3">
            {todayShifts.map((app: any) => {
              const shift = app.shifts;
              const totalPay = Math.round(shift.duration_hours * shift.pro_hourly_rate_iqd);
              return (
                <div
                  key={app.shift_id}
                  className="rounded-2xl bg-[#0F3D36] p-5 text-white overflow-hidden relative"
                >
                  {/* Decorative blobs */}
                  <div className="pointer-events-none absolute -top-8 -right-8 w-40 h-40 rounded-full bg-[#28D96D]/10" />
                  <div className="pointer-events-none absolute -bottom-10 -left-6 w-32 h-32 rounded-full bg-white/5" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="text-lg font-black leading-tight">{shift.job_title}</p>
                        <p className="text-white/60 text-sm mt-0.5">{shift.business_locations?.branch_name}</p>
                        <p className="text-white/40 text-xs mt-0.5">{shift.business_locations?.address}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-2xl font-black text-[#28D96D] tabular-nums">
                          {formatIQD(totalPay)}
                        </p>
                        <p className="text-white/40 text-xs mt-0.5">{formatIQD(shift.pro_hourly_rate_iqd)}/hr</p>
                      </div>
                    </div>

                    <div className="h-px bg-white/10 mb-4" />

                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-semibold">
                        <svg className="w-3.5 h-3.5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {shift.start_time?.slice(0, 5)} – {shift.end_time?.slice(0, 5)}
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-[#28D96D]/15 text-[#28D96D] text-xs font-semibold">
                        {shift.duration_hours}h shift
                      </div>
                      {shift.business_locations?.branch_phone && (
                        <a
                          href={`tel:${shift.business_locations.branch_phone}`}
                          className="ms-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Call venue
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Applied */}
        <Link href="/pro/applications" className="group rounded-2xl border border-[#E7E2EF] bg-white p-5 hover:border-[#7426E8]/30 hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-3">
            <span className="w-9 h-9 rounded-xl bg-[#F3F0FB] flex items-center justify-center group-hover:bg-[#E9DEFF] transition-colors">
              <svg className="w-4.5 h-4.5 text-[#7426E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width:'18px',height:'18px'}}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </span>
            <svg className="w-4 h-4 text-[#C9C4D2] group-hover:text-[#7426E8] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <p className="text-3xl font-black text-[#12051F] tabular-nums">{appliedCount ?? 0}</p>
          <p className="text-xs text-[#8B8299] mt-1 font-medium">Applications sent</p>
        </Link>

        {/* Upcoming */}
        <Link href="/pro/applications" className="group rounded-2xl border border-[#E7E2EF] bg-white p-5 hover:border-[#7426E8]/30 hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-3">
            <span className="w-9 h-9 rounded-xl bg-[#F3F0FB] flex items-center justify-center group-hover:bg-[#E9DEFF] transition-colors">
              <svg className="w-4.5 h-4.5 text-[#7426E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width:'18px',height:'18px'}}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
            <svg className="w-4 h-4 text-[#C9C4D2] group-hover:text-[#7426E8] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <p className="text-3xl font-black text-[#12051F] tabular-nums">{upcomingShifts.length}</p>
          <p className="text-xs text-[#8B8299] mt-1 font-medium">Upcoming shifts</p>
        </Link>

        {/* Completed */}
        <div className="rounded-2xl border border-[#E7E2EF] bg-white p-5">
          <div className="flex items-start justify-between mb-3">
            <span className="w-9 h-9 rounded-xl bg-[#DDF4EA] flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-[#0F3D36]" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width:'18px',height:'18px'}}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <p className="text-3xl font-black text-[#12051F] tabular-nums">{profile?.completed_shifts ?? 0}</p>
          <p className="text-xs text-[#8B8299] mt-1 font-medium">Shifts completed</p>
        </div>

        {/* Earnings — links to Finance page */}
        <Link href="/pro/finance" className="group rounded-2xl bg-[#0F3D36] p-5 hover:bg-[#1a5c4a] transition-colors">
          <div className="flex items-start justify-between mb-3">
            <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <svg className="w-4.5 h-4.5 text-[#28D96D]" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width:'18px',height:'18px'}}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <svg className="w-4 h-4 text-white/20 group-hover:text-[#28D96D] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <p className="text-2xl font-black text-[#28D96D] tabular-nums leading-tight">{formatIQD(totalEarnings)}</p>
          <p className="text-xs text-white/40 mt-1 font-medium">Total earned</p>
        </Link>
      </div>

      {/* ── UPCOMING SHIFTS ── */}
      {upcomingShifts.length > 0 ? (
        <div className="rounded-2xl border border-[#E7E2EF] bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E7E2EF]">
            <h2 className="text-sm font-bold text-[#12051F]">Upcoming</h2>
            <Link href="/pro/applications" className="text-xs text-[#7426E8] font-semibold hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-[#F7F4FC]">
            {upcomingShifts.map((app: any) => {
              const shift = app.shifts;
              const daysUntil = Math.round(
                (new Date(shift.date).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24)
              );
              const totalPay = Math.round(shift.duration_hours * shift.pro_hourly_rate_iqd);
              return (
                <div key={app.shift_id} className="flex items-center gap-4 px-5 py-3.5">
                  {/* Date marker */}
                  <div className="shrink-0 w-10 text-center">
                    <p className="text-xs font-black text-[#7426E8] uppercase leading-none">
                      {new Date(shift.date).toLocaleDateString('en-GB', { month: 'short' })}
                    </p>
                    <p className="text-xl font-black text-[#12051F] leading-tight tabular-nums">
                      {new Date(shift.date).getDate()}
                    </p>
                  </div>

                  <div className="w-px h-8 bg-[#E7E2EF] shrink-0" />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#12051F] truncate">{shift.job_title}</p>
                    <p className="text-xs text-[#8B8299] truncate">
                      {shift.business_locations?.branch_name} · {shift.start_time?.slice(0, 5)}–{shift.end_time?.slice(0, 5)}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-[#28D96D] tabular-nums">{formatIQD(totalPay)}</p>
                    <p className="text-xs text-[#C9C4D2] tabular-nums">
                      {daysUntil === 1 ? 'Tomorrow' : `in ${daysUntil}d`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#E7E2EF] bg-white p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#F3F0FB] flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-[#C9C4D2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-bold text-[#12051F] mb-1">No upcoming shifts</p>
          <p className="text-xs text-[#C9C4D2] mb-4">Browse open shifts and apply in seconds</p>
          <Link
            href="/pro/browse"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#7426E8] text-white text-sm font-bold hover:bg-[#6315d0] transition-colors"
          >
            Browse shifts
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
