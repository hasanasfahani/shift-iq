'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { Toast, useToast } from '@/components/ui/Toast';
import { formatIQD } from '@/lib/constants';
import type { ApplicationStatus } from '@/types';

interface ShiftLocation {
  branch_name: string;
  city: string;
  address: string;
  branch_phone: string;
}

interface ApplicationShift {
  id: string;
  job_title: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  pro_hourly_rate_iqd: number;
  status: string;
  business_id: string;
  business_locations: ShiftLocation | null;
  users: { business_profiles: { business_name: string; business_type?: string | null } | null } | null;
}

interface Application {
  id: string;
  status: ApplicationStatus;
  applied_at: string;
  shifts: ApplicationShift;
}

interface Props {
  applications: Application[];
  ratedShiftIds: Set<string>;
}

type Tab = 'active' | 'history';

const ACTIVE_STATUSES: ApplicationStatus[] = ['pending', 'accepted'];
const HISTORY_STATUSES: ApplicationStatus[] = ['declined', 'withdrawn', 'no_show', 'cancelled_by_worker'];

const STAR_LABELS = ['', 'Needs improvement', 'Below expectations', 'Met expectations', 'Great work!', 'Outstanding!'];

// ─── Star icon ────────────────────────────────────────────────
function StarIcon({ filled, size = 40 }: { filled: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={filled ? '#F59E0B' : 'none'}
        stroke={filled ? '#F59E0B' : '#CBD5E1'}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Business avatar ──────────────────────────────────────────
function BusinessAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-11 h-11 text-sm';
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-[#059669] to-[#34D399] flex items-center justify-center text-white font-bold shrink-0`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ─── Inline rating section ────────────────────────────────────
function InlineRating({
  businessName,
  businessType,
  onSubmit,
}: {
  businessName: string;
  businessType?: string | null;
  onSubmit: (stars: number, comment: string) => Promise<boolean>;
}) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const activeStar = hoveredStar || selectedStar;

  async function handleSubmit() {
    if (selectedStar === 0 || loading) return;
    setLoading(true);
    const ok = await onSubmit(selectedStar, reviewText.trim());
    setLoading(false);
    if (ok) setDone(true);
  }

  // Success state
  if (done) {
    return (
      <div className="flex items-center gap-3 py-1">
        <div className="w-9 h-9 rounded-full bg-[#ECFDF5] flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#12051F]">Review submitted!</p>
          <p className="text-xs text-[#8B8299]">Thank you — your feedback helps the community.</p>
        </div>
        <div className="flex gap-0.5 ms-auto">
          {[1, 2, 3, 4, 5].map((s) => (
            <StarIcon key={s} filled={s <= selectedStar} size={16} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-full bg-[#FEF3C7] flex items-center justify-center shrink-0">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B" aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-[#12051F]">Rate this experience</p>
      </div>

      {/* Business identity */}
      <div className="flex items-center gap-3 mb-5">
        <BusinessAvatar name={businessName} />
        <div>
          <p className="text-sm font-bold text-[#12051F]">{businessName}</p>
          {businessType && (
            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#059669] text-xs font-medium">
              {businessType}
            </span>
          )}
        </div>
      </div>

      {/* Stars */}
      <div className="flex justify-center gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            onClick={() => setSelectedStar(star)}
            className={`transition-transform duration-150 active:scale-95 ${
              star <= selectedStar ? 'scale-110' : 'scale-100 hover:scale-110'
            }`}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          >
            <StarIcon filled={star <= activeStar} size={42} />
          </button>
        ))}
      </div>

      {/* Star label */}
      <div className="text-center mb-4 h-5">
        {activeStar > 0 ? (
          <span className={`text-sm font-semibold transition-all ${activeStar === 5 ? 'text-[#F59E0B]' : 'text-[#8B8299]'}`}>
            {STAR_LABELS[activeStar]}{activeStar === 5 ? ' ✨' : ''}
          </span>
        ) : (
          <span className="text-xs text-[#C9C4D2]">Tap a star to rate</span>
        )}
      </div>

      {/* Review textarea — slides in after star selected */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: selectedStar > 0 ? '180px' : '0px', opacity: selectedStar > 0 ? 1 : 0 }}
      >
        <div className="mb-4">
          <label className="block text-sm font-semibold text-[#12051F] mb-2">
            Share what stood out{' '}
            <span className="font-normal text-[#8B8299]">(optional)</span>
          </label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value.slice(0, 500))}
            placeholder="Punctual, welcoming environment, great team..."
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl border border-[#E7E2EF] bg-white text-sm text-[#12051F] placeholder:text-[#C9C4D2] focus:outline-none focus:ring-2 focus:ring-[#7426E8]/20 focus:border-[#7426E8] resize-none transition-colors"
          />
          <p className="text-xs text-[#C9C4D2] text-right mt-1">{reviewText.length}/500</p>
        </div>
      </div>

      {/* Submit */}
      <Button
        fullWidth
        disabled={selectedStar === 0}
        loading={loading}
        onClick={handleSubmit}
      >
        Submit Review
      </Button>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────
export default function ApplicationsClient({ applications, ratedShiftIds }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast, show, dismiss } = useToast();
  const [apps, setApps] = useState<Application[]>(applications);
  const [rated, setRated] = useState<Set<string>>(ratedShiftIds);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('active');

  const activeApps = apps.filter(
    (a) =>
      ACTIVE_STATUSES.includes(a.status) &&
      a.shifts?.status !== 'completed' &&
      a.shifts?.status !== 'cancelled'
  );
  const historyApps = apps.filter((a) =>
    HISTORY_STATUSES.includes(a.status) || a.shifts?.status === 'completed' || a.shifts?.status === 'cancelled'
  );

  const displayed = tab === 'active' ? activeApps : historyApps;

  async function handleCancelShift(appId: string) {
    if (!confirm('Cancel this accepted shift? The business will be notified.')) return;
    setCancellingId(appId);
    const res = await fetch(`/api/applications/${appId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled_by_worker' }),
    });
    setCancellingId(null);

    if (!res.ok) {
      const json = await res.json();
      show(json.error ?? t('common.error.generic'), 'error');
      return;
    }

    setApps((prev) => prev.map((a) => (a.id === appId ? { ...a, status: 'cancelled_by_worker' } : a)));
    show('Shift cancelled', 'success');
    router.refresh();
  }

  async function handleWithdraw(appId: string) {
    if (!confirm('Withdraw this application?')) return;
    setWithdrawingId(appId);
    const res = await fetch(`/api/applications/${appId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'withdrawn' }),
    });
    setWithdrawingId(null);

    if (!res.ok) {
      const json = await res.json();
      show(json.error ?? t('common.error.generic'), 'error');
      return;
    }

    setApps((prev) => prev.map((a) => (a.id === appId ? { ...a, status: 'withdrawn' } : a)));
    show('Application withdrawn', 'success');
    router.refresh();
  }

  async function handleRatingSubmit(
    shiftId: string,
    businessId: string,
    stars: number,
    comment: string
  ): Promise<boolean> {
    const res = await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shiftId, ratedId: businessId, stars, comment }),
    });

    if (!res.ok) {
      if (res.status === 409) {
        setRated((prev) => new Set([...prev, shiftId]));
        return true;
      }
      const json = await res.json().catch(() => ({}));
      show(json.error ?? t('common.error.generic'), 'error');
      return false;
    }

    setRated((prev) => new Set([...prev, shiftId]));
    return true;
  }

  const pendingRatingApps = apps.filter((a) => {
    const shift = a.shifts;
    return a.status === 'accepted' && shift?.status === 'completed' && !rated.has(shift.id);
  });

  return (
    <>
      {/* Pending ratings callout */}
      {pendingRatingApps.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-[#7426E8] to-[#9B51E0] rounded-2xl p-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-black text-lg leading-tight">
                {pendingRatingApps.length === 1
                  ? 'How was your last shift?'
                  : `${pendingRatingApps.length} shifts waiting for your review`}
              </p>
              <p className="text-white/70 text-sm mt-1">
                Your feedback helps other pros and builds trust on the platform.
              </p>
            </div>
            <div className="shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {pendingRatingApps.map((app) => (
              <div key={app.id} className="bg-white/10 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{app.shifts.job_title}</p>
                  <p className="text-xs text-white/60">
                    {app.shifts.business_locations?.branch_name ?? '—'} ·{' '}
                    {new Date(app.shifts.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <button
                  onClick={() => setTab('history')}
                  className="px-3 py-1.5 rounded-full bg-white text-[#7426E8] text-xs font-black hover:bg-white/90 transition-colors shrink-0"
                >
                  Rate now →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F3F0FB] p-1 rounded-full mb-6 w-fit">
        {(['active', 'history'] as Tab[]).map((tabKey) => (
          <button
            key={tabKey}
            type="button"
            onClick={() => setTab(tabKey)}
            className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              tab === tabKey ? 'bg-white text-[#12051F] shadow-sm' : 'text-[#8B8299] hover:text-[#12051F]'
            }`}
          >
            {tabKey === 'active' ? `Active (${activeApps.length})` : `History (${historyApps.length})`}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <EmptyState
          illustration="no-applications"
          heading={tab === 'active' ? 'No active applications' : 'No application history yet'}
          body={tab === 'active' ? 'Apply to open shifts and they\'ll appear here.' : 'Your past applications will show up here once complete.'}
          action={tab === 'active' ? { label: 'Browse shifts', href: '/pro/browse' } : undefined}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {displayed.map((app) => {
            const shift = app.shifts;
            if (!shift) return null;

            const totalPay = Math.round(shift.duration_hours * shift.pro_hourly_rate_iqd);
            const isAccepted = app.status === 'accepted';
            const isPending = app.status === 'pending';
            const isCompleted = shift.status === 'completed';
            const isRated = rated.has(shift.id);
            const showRating = isAccepted && isCompleted;

            const bizProfile = shift.users?.business_profiles;
            const businessName = bizProfile?.business_name ?? 'This Business';
            const businessType = bizProfile?.business_type;

            return (
              <div key={app.id} className="tap-card bg-[#F7F4FC] rounded-2xl border border-[#E7E2EF] overflow-hidden">
                <div className="p-4">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-[#12051F]">{shift.job_title}</span>
                        <Badge
                          variant={
                            app.status === 'no_show' || app.status === 'cancelled_by_worker'
                              ? 'declined'
                              : (app.status as any)
                          }
                          label={
                            app.status === 'no_show' ? 'No-show' :
                            app.status === 'withdrawn' ? 'Withdrawn' :
                            app.status === 'cancelled_by_worker' ? 'Cancelled' :
                            t(`pro.applications.status.${app.status}`)
                          }
                        />
                      </div>
                      {bizProfile?.business_name && (
                        <p className="text-xs font-semibold text-[#7426E8] mb-0.5">
                          {bizProfile.business_name}
                        </p>
                      )}
                      <p className="text-sm text-[#8B8299]">
                        {shift.business_locations?.branch_name ?? '—'} · {shift.business_locations?.city ?? '—'}
                      </p>
                      <p className="text-sm text-[#8B8299] mt-0.5">
                        {new Date(shift.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                        {' · '}
                        {shift.start_time.slice(0, 5)} – {shift.end_time.slice(0, 5)}
                        {' · '}
                        {shift.duration_hours}h
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-[#28D96D]">{formatIQD(totalPay)}</p>
                      <p className="text-xs text-[#8B8299] mt-0.5">{formatIQD(shift.pro_hourly_rate_iqd)}/hr</p>
                    </div>
                  </div>

                  {/* Venue details for accepted + not yet completed */}
                  {isAccepted && !isCompleted && (
                    <div className="mt-4 pt-3 border-t border-[#E7E2EF]">
                      <p className="text-xs font-semibold text-[#8B8299] uppercase tracking-wide mb-2">
                        {t('pro.applications.venueDetails')}
                      </p>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm text-[#12051F]">
                          <span className="text-[#8B8299]">{t('pro.applications.address')}: </span>
                          {shift.business_locations?.address ?? '—'}
                        </p>
                        <p className="text-sm text-[#12051F]">
                          <span className="text-[#8B8299]">{t('pro.applications.phone')}: </span>
                          {shift.business_locations?.branch_phone ? (
                            <a
                              href={`tel:${shift.business_locations.branch_phone}`}
                              className="text-[#7426E8] hover:underline"
                            >
                              {shift.business_locations.branch_phone}
                            </a>
                          ) : '—'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions row — withdraw / cancel only */}
                  {(isPending || (isAccepted && !isCompleted)) && (
                    <div className="mt-3 pt-3 border-t border-[#E7E2EF]">
                      {isPending ? (
                        <button
                          type="button"
                          disabled={withdrawingId === app.id}
                          onClick={() => handleWithdraw(app.id)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                        >
                          {withdrawingId === app.id ? 'Withdrawing…' : 'Withdraw application'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={cancellingId === app.id}
                          onClick={() => handleCancelShift(app.id)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                        >
                          {cancellingId === app.id ? 'Cancelling…' : 'Cancel shift'}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Inline rating section for completed accepted shifts */}
                {showRating && (
                  <div className="bg-white border-t border-[#E7E2EF] px-4 pt-5 pb-5">
                    {isRated ? (
                      /* Already rated — compact success state */
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#ECFDF5] flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#12051F]">Review submitted</p>
                          <p className="text-xs text-[#8B8299]">Thank you for your feedback!</p>
                        </div>
                      </div>
                    ) : (
                      <InlineRating
                        businessName={businessName}
                        businessType={businessType}
                        onSubmit={(stars, comment) =>
                          handleRatingSubmit(shift.id, shift.business_id, stars, comment)
                        }
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismiss} />}
    </>
  );
}
