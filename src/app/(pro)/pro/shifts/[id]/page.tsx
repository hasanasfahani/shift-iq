import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatIQD, SPECIAL_BADGES, CANCELLATION_POLICIES, PAYMENT_TERMS } from '@/lib/constants';
import ShiftDetailClient from '@/components/pro/ShiftDetailClient';
import ExpandableText from '@/components/ui/ExpandableText';
import MapEmbed from '@/components/ui/MapEmbed';

export default async function ShiftDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: shift }, { data: proProfile }, { data: existingApp }] = await Promise.all([
    supabase
      .from('shifts')
      .select(`
        id, job_title, date, start_time, end_time, duration_hours,
        workers_needed, pro_hourly_rate_iqd, shift_type, description,
        what_to_expect, clothing_rules, required_skills, preferred_skills,
        rules_and_regulations, special_badge,
        cancellation_policy, payment_terms, status, business_id,
        business_locations (
          id, branch_name, city, address, branch_phone,
          lat, lng, photos, arrival_instructions
        ),
        users (
          id, full_name,
          business_profiles (
            business_name, business_type, description, photos,
            average_rating, total_ratings, is_verified
          )
        )
      `)
      .eq('id', id)
      .single(),
    supabase
      .from('pro_profiles')
      .select('skills_by_role, onboarding_completed, worker_status')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('applications')
      .select('id, status')
      .eq('shift_id', id)
      .eq('pro_id', user.id)
      .maybeSingle(),
  ]);

  if (!shift || shift.status !== 'open') notFound();

  // Accepted count for spots remaining
  const { count: acceptedCount } = await supabase
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .eq('shift_id', id)
    .eq('status', 'accepted');

  const spotsLeft = shift.workers_needed - (acceptedCount ?? 0);

  const location = shift.business_locations as any;
  const business = (shift.users as any)?.business_profiles;
  const businessName = business?.business_name ?? 'Business';
  const totalPay = Math.round(shift.duration_hours * shift.pro_hourly_rate_iqd);
  const badgeInfo = SPECIAL_BADGES.find((b) => b.value === shift.special_badge);

  const proSkills: string[] = proProfile?.skills_by_role?.[shift.job_title] ?? [];
  const requiredSkills: string[] = (shift.required_skills as string[]) ?? [];
  const preferredSkills: string[] = (shift.preferred_skills as string[]) ?? [];
  const skillMatch = requiredSkills.map((skill) => ({
    skill,
    matched: proSkills.includes(skill),
  }));

  const missingRequired = skillMatch.filter((s) => !s.matched).map((s) => s.skill);

  const canApply =
    proProfile?.onboarding_completed === true &&
    proProfile?.worker_status !== 'suspended' &&
    !existingApp;

  const alreadyApplied = !!existingApp;
  const appStatus = existingApp?.status ?? null;

  const cancellationLabel =
    CANCELLATION_POLICIES.find((p) => p.value === shift.cancellation_policy)?.label ??
    shift.cancellation_policy;

  const paymentLabel =
    PAYMENT_TERMS.find((p) => p.value === shift.payment_terms)?.label ??
    shift.payment_terms;

  return (
    <div className="max-w-2xl mx-auto pb-32">
      {/* Back */}
      <Link
        href="/pro/browse"
        className="inline-flex items-center gap-1.5 text-sm text-[#8B8299] hover:text-[#12051F] font-medium mb-4 transition-colors group"
      >
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Browse shifts
      </Link>

      {/* Hero card */}
      <div className="bg-white rounded-3xl border border-[#E7E2EF] overflow-hidden mb-4 shadow-sm">
        {location?.photos?.[0] ? (
          <div className="h-40 overflow-hidden">
            <img
              src={location.photos[0]}
              alt={location.branch_name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-32 bg-gradient-to-br from-[#0F3D36] to-[#1a5a4e] flex items-center justify-center">
            <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        )}

        <div className="p-5">
          {/* Badge + status row */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {badgeInfo && (
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: badgeInfo.color }}
              >
                {badgeInfo.label}
              </span>
            )}
            <span className="px-2.5 py-0.5 bg-[#DDF4EA] text-[#0F3D36] text-xs font-semibold rounded-full">
              {shift.shift_type}
            </span>
            {spotsLeft > 0 && spotsLeft <= 3 && (
              <span className="px-2.5 py-0.5 bg-[#FEF2F2] text-red-600 text-xs font-semibold rounded-full">
                {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
              </span>
            )}
          </div>

          <h1 className="text-2xl font-black text-[#12051F] mb-1">{shift.job_title}</h1>

          {/* Business block */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#F3F0FB] flex items-center justify-center text-sm font-bold text-[#7426E8] shrink-0">
              {businessName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-[#12051F]">{businessName}</span>
                {business?.is_verified && (
                  <svg className="w-4 h-4 text-[#28D96D]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              {business?.average_rating > 0 && (
                <div className="flex items-center gap-1 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-[#FFB536]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs text-[#8B8299]">
                    {Number(business.average_rating).toFixed(1)} ({business.total_ratings} ratings)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Shift summary grid */}
          <div className="grid grid-cols-2 gap-3 bg-[#F7F4FC] rounded-2xl p-4 mb-4">
            <div>
              <p className="text-xs text-[#8B8299] mb-0.5">Date</p>
              <p className="text-sm font-semibold text-[#12051F]">
                {new Date(shift.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#8B8299] mb-0.5">Time</p>
              <p className="text-sm font-semibold text-[#12051F]">
                {shift.start_time.slice(0, 5)} – {shift.end_time.slice(0, 5)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#8B8299] mb-0.5">Duration</p>
              <p className="text-sm font-semibold text-[#12051F]">{shift.duration_hours}h</p>
            </div>
            <div>
              <p className="text-xs text-[#8B8299] mb-0.5">Hourly rate</p>
              <p className="text-sm font-semibold text-[#28D96D]">{formatIQD(shift.pro_hourly_rate_iqd)}/hr</p>
            </div>
            <div>
              <p className="text-xs text-[#8B8299] mb-0.5">Spots remaining</p>
              <p className={`text-sm font-semibold ${spotsLeft <= 2 ? 'text-red-500' : 'text-[#12051F]'}`}>
                {spotsLeft <= 0 ? 'Almost full' : `${spotsLeft} of ${shift.workers_needed}`}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-2.5">
            <svg className="w-4 h-4 text-[#7426E8] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-[#12051F]">{location?.branch_name}</p>
              <p className="text-xs text-[#8B8299]">{location?.address}, {location?.city}</p>
              {(location?.lat && location?.lng) && (
                <a
                  href={`https://maps.google.com/?q=${location.lat},${location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#7426E8] hover:underline mt-0.5 inline-block"
                >
                  Open in Maps →
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Map embed */}
      {location?.lat && location?.lng && (
        <MapEmbed lat={location.lat} lng={location.lng} label={location.branch_name} />
      )}

      {/* What to expect */}
      {shift.what_to_expect && (
        <div className="bg-white rounded-2xl border border-[#E7E2EF] p-5 mb-4 shadow-sm">
          <h2 className="text-sm font-black text-[#12051F] uppercase tracking-wide mb-3">What to expect</h2>
          <ExpandableText text={shift.what_to_expect} maxLength={200} />
        </div>
      )}

      {/* Required skills */}
      {requiredSkills.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E7E2EF] p-5 mb-4 shadow-sm">
          <h2 className="text-sm font-black text-[#12051F] uppercase tracking-wide mb-3">Required skills</h2>
          <div className="flex flex-wrap gap-2">
            {skillMatch.map(({ skill, matched }) => (
              <span
                key={skill}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                  matched
                    ? 'bg-[#DDF4EA] text-[#0F3D36]'
                    : 'bg-[#F7F4FC] text-[#8B8299] border border-[#E7E2EF]'
                }`}
              >
                {matched ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {skill}
              </span>
            ))}
          </div>
          {skillMatch.some((s) => !s.matched) && (
            <p className="text-xs text-[#8B8299] mt-3">
              Skills you don&apos;t have listed won&apos;t block your application — businesses decide based on the full picture.
            </p>
          )}
        </div>
      )}

      {/* Preferred skills */}
      {preferredSkills.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E7E2EF] p-5 mb-4 shadow-sm">
          <h2 className="text-sm font-black text-[#12051F] uppercase tracking-wide mb-3">Preferred skills</h2>
          <p className="text-xs text-[#8B8299] mb-2">Nice-to-have skills the business would like you to have.</p>
          <div className="flex flex-wrap gap-2">
            {preferredSkills.map((skill) => (
              <span
                key={skill}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  proSkills.includes(skill)
                    ? 'bg-[#DDF4EA] text-[#0F3D36]'
                    : 'bg-[#F7F4FC] text-[#8B8299] border border-[#E7E2EF]'
                }`}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Clothing rules */}
      {(shift.clothing_rules as string[]).length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E7E2EF] p-5 mb-4 shadow-sm">
          <h2 className="text-sm font-black text-[#12051F] uppercase tracking-wide mb-3">What to wear</h2>
          <div className="flex flex-wrap gap-2">
            {(shift.clothing_rules as string[]).map((rule) => (
              <span
                key={rule}
                className="px-3 py-1 bg-[#F3F0FB] text-[#7426E8] text-xs font-medium rounded-full"
              >
                {rule}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Rules & regulations */}
      {shift.rules_and_regulations && (
        <div className="bg-white rounded-2xl border border-[#E7E2EF] p-5 mb-4 shadow-sm">
          <h2 className="text-sm font-black text-[#12051F] uppercase tracking-wide mb-3">Rules & regulations</h2>
          <ExpandableText text={shift.rules_and_regulations} maxLength={200} />
        </div>
      )}

      {/* Description */}
      {shift.description && (
        <div className="bg-white rounded-2xl border border-[#E7E2EF] p-5 mb-4 shadow-sm">
          <h2 className="text-sm font-black text-[#12051F] uppercase tracking-wide mb-3">Description</h2>
          <ExpandableText text={shift.description} maxLength={200} />
        </div>
      )}

      {/* Policy cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {cancellationLabel && (
          <div className="bg-white rounded-2xl border border-[#E7E2EF] p-4 shadow-sm">
            <p className="text-xs font-black text-[#12051F] uppercase tracking-wide mb-1.5">Cancellation policy</p>
            <p className="text-sm text-[#8B8299]">{cancellationLabel}</p>
          </div>
        )}
        {paymentLabel && (
          <div className="bg-white rounded-2xl border border-[#E7E2EF] p-4 shadow-sm">
            <p className="text-xs font-black text-[#12051F] uppercase tracking-wide mb-1.5">Payment</p>
            <p className="text-sm text-[#8B8299]">{paymentLabel}</p>
          </div>
        )}
      </div>

      {/* Arrival instructions */}
      {location?.arrival_instructions && (
        <div className="bg-[#F7F4FC] rounded-2xl border border-[#E7E2EF] px-4 py-3 mb-4 flex items-start gap-2.5">
          <svg className="w-4 h-4 text-[#7426E8] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-[#8B8299]">{location.arrival_instructions}</p>
        </div>
      )}

      {/* Sticky bottom apply bar */}
      <ShiftDetailClient
        shiftId={id}
        totalPay={totalPay}
        hourlyRate={shift.pro_hourly_rate_iqd}
        durationHours={shift.duration_hours}
        hasClothingRules={(shift.clothing_rules as string[]).length > 0}
        hasCancellationPolicy={!!shift.cancellation_policy}
        canApply={canApply}
        alreadyApplied={alreadyApplied}
        appStatus={appStatus}
        onboardingComplete={proProfile?.onboarding_completed ?? false}
        missingSkills={missingRequired}
      />
    </div>
  );
}

export const metadata = { title: 'Shift Details' };
