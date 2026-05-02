'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import RatingModal from '@/components/ui/RatingModal';
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
  users: { business_profiles: { business_name: string } | null } | null;
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

export default function ApplicationsClient({ applications, ratedShiftIds }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast, show, dismiss } = useToast();
  const [apps, setApps] = useState<Application[]>(applications);
  const [rated, setRated] = useState<Set<string>>(ratedShiftIds);
  const [ratingTarget, setRatingTarget] = useState<{ shiftId: string; businessId: string } | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('active');

  const activeApps = apps.filter((a) => ACTIVE_STATUSES.includes(a.status));
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

  async function handleRatingSubmit(stars: number, comment: string) {
    if (!ratingTarget) return;

    const res = await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shiftId: ratingTarget.shiftId,
        ratedId: ratingTarget.businessId,
        stars,
        comment,
      }),
    });

    if (!res.ok) {
      const json = await res.json();
      show(json.error ?? t('common.error.generic'), 'error');
    } else {
      setRated((prev) => new Set([...prev, ratingTarget.shiftId]));
      show(t('ratings.success'), 'success');
    }

    setRatingTarget(null);
  }

  const pendingRatingApps = apps.filter((a) => {
    const shift = a.shifts;
    return a.status === 'accepted' && shift?.status === 'completed' && !rated.has(shift.id);
  });

  return (
    <>
      {/* Pending ratings callout — prominent, at the top */}
      {pendingRatingApps.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-[#7426E8] to-[#9B51E0] rounded-2xl p-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-black text-lg leading-tight">
                {pendingRatingApps.length === 1
                  ? 'How was your last shift?'
                  : `${pendingRatingApps.length} shifts waiting for your rating`}
              </p>
              <p className="text-white/70 text-sm mt-1">
                Your feedback helps other pros and builds your reputation on the platform.
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
              <div key={app.id} className="bg-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{app.shifts.job_title}</p>
                  <p className="text-xs text-white/60">
                    {app.shifts.business_locations?.branch_name ?? '—'} ·{' '}
                    {new Date(app.shifts.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <button
                  onClick={() => setRatingTarget({ shiftId: app.shifts.id, businessId: app.shifts.business_id })}
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
        {(['active', 'history'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              tab === t ? 'bg-white text-[#12051F] shadow-sm' : 'text-[#8B8299] hover:text-[#12051F]'
            }`}
          >
            {t === 'active' ? `Active (${activeApps.length})` : `History (${historyApps.length})`}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <EmptyState
          illustration="no-applications"
          heading={tab === 'active' ? "No active applications" : "No application history yet"}
          body={tab === 'active' ? "Apply to open shifts and they'll appear here." : "Your past applications will show up here once complete."}
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
            const canRate = isAccepted && isCompleted && !rated.has(shift.id);

            return (
              <div key={app.id} className="tap-card bg-[#F7F4FC] rounded-2xl border border-[#E7E2EF] p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-[#12051F]">{shift.job_title}</span>
                      <Badge variant={
                        app.status === 'no_show' || app.status === 'cancelled_by_worker' ? 'declined' : app.status as any
                      } label={
                        app.status === 'no_show' ? 'No-show' :
                        app.status === 'withdrawn' ? 'Withdrawn' :
                        app.status === 'cancelled_by_worker' ? 'Cancelled' :
                        t(`pro.applications.status.${app.status}`)
                      } />
                    </div>
                    {shift.users?.business_profiles?.business_name && (
                      <p className="text-xs font-semibold text-[#7426E8] mb-0.5">
                        {shift.users.business_profiles.business_name}
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

                {/* Venue details for accepted */}
                {isAccepted && (
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

                {/* Actions row */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E7E2EF]">
                  {/* Withdraw for pending / Cancel for accepted */}
                  {isPending ? (
                    <button
                      type="button"
                      disabled={withdrawingId === app.id}
                      onClick={() => handleWithdraw(app.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                    >
                      {withdrawingId === app.id ? 'Withdrawing…' : 'Withdraw application'}
                    </button>
                  ) : isAccepted && !isCompleted ? (
                    <button
                      type="button"
                      disabled={cancellingId === app.id}
                      onClick={() => handleCancelShift(app.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                    >
                      {cancellingId === app.id ? 'Cancelling…' : 'Cancel shift'}
                    </button>
                  ) : (
                    <div />
                  )}

                  {/* Rate for completed */}
                  {(canRate || (isAccepted && isCompleted && rated.has(shift.id))) && (
                    <>
                      {rated.has(shift.id) ? (
                        <span className="text-sm text-[#8B8299]">✓ Rated</span>
                      ) : (
                        <button
                          onClick={() => setRatingTarget({ shiftId: shift.id, businessId: shift.business_id })}
                          className="text-sm text-[#7426E8] hover:underline font-medium"
                        >
                          {t('ratings.rateBusiness')} →
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <RatingModal
        open={ratingTarget !== null}
        title={t('ratings.rateBusiness')}
        onClose={() => setRatingTarget(null)}
        onSubmit={handleRatingSubmit}
      />

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismiss} />}
    </>
  );
}
