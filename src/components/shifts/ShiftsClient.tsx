'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import type { Shift, BusinessLocation, ShiftStatus } from '@/types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Toast, useToast } from '@/components/ui/Toast';
import EmptyState from '@/components/ui/EmptyState';
import { formatIQD } from '@/lib/constants';

type ShiftWithLocation = Shift & {
  business_locations: Pick<BusinessLocation, 'branch_name' | 'city' | 'photos'>;
  applications: { id: string; status: string }[];
};

const TABS: { key: ShiftStatus | 'all'; labelKey: string }[] = [
  { key: 'all',       labelKey: 'business.shifts.all' },
  { key: 'open',      labelKey: 'business.shifts.open' },
  { key: 'filled',    labelKey: 'business.shifts.filled' },
  { key: 'completed', labelKey: 'business.shifts.completed' },
  { key: 'cancelled', labelKey: 'business.shifts.cancelled' },
];

interface Props {
  shifts: ShiftWithLocation[];
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return 'Just posted';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default function ShiftsClient({ shifts }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast, show, dismiss } = useToast();

  const [activeTab, setActiveTab] = useState<ShiftStatus | 'all'>('all');
  const [confirmModal, setConfirmModal] = useState<{
    shiftId: string;
    action: 'cancel' | 'complete';
  } | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered =
    activeTab === 'all' ? shifts : shifts.filter((s) => s.status === activeTab);

  async function handleAction(shiftId: string, action: 'cancel' | 'complete') {
    setLoadingId(shiftId);
    setConfirmModal(null);

    const newStatus = action === 'cancel' ? 'cancelled' : 'completed';
    const res = await fetch(`/api/shifts/${shiftId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });

    setLoadingId(null);

    if (!res.ok) {
      show(t('common.error.generic'), 'error');
      return;
    }

    show(
      action === 'cancel'
        ? t('business.shifts.cancelConfirm')
        : t('business.shifts.completeConfirm'),
      'success'
    );
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black text-[#12051F]">{t('business.shifts.title')}</h1>
        <Link href="/business/post-shift">
          <Button size="md">+ {t('nav.postShift')}</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F3F0FB] p-1 rounded-full w-fit mb-6 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-[#7426E8] shadow-sm'
                : 'text-[#8B8299] hover:text-[#12051F]'
            }`}
          >
            {t(tab.labelKey)}
            {tab.key !== 'all' && (
              <span className="ms-1.5 text-xs text-[#8B8299]">
                ({shifts.filter((s) => s.status === tab.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Shift list */}
      {filtered.length === 0 ? (
        <EmptyState
          illustration="no-shifts"
          heading={activeTab === 'all' ? 'No shifts posted yet' : `No ${activeTab} shifts`}
          body={activeTab === 'all' ? 'Post your first shift to start finding pros.' : undefined}
          action={activeTab === 'all' ? { label: 'Post a shift', href: '/business/post-shift' } : undefined}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((shift) => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              loadingId={loadingId}
              onCancel={(id) => setConfirmModal({ shiftId: id, action: 'cancel' })}
              onComplete={(id) => setConfirmModal({ shiftId: id, action: 'complete' })}
              t={t}
            />
          ))}
        </div>
      )}

      {/* Cancel confirmation */}
      <Modal
        open={confirmModal?.action === 'cancel'}
        onClose={() => setConfirmModal(null)}
        title={t('business.shifts.cancelConfirm')}
        maxWidth="sm"
      >
        <p className="text-sm text-[#8B8299] mb-6">{t('business.shifts.cancelWarning')}</p>
        <div className="flex gap-3">
          <Button variant="ghost" fullWidth onClick={() => setConfirmModal(null)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="danger"
            fullWidth
            loading={loadingId === confirmModal?.shiftId}
            onClick={() => confirmModal && handleAction(confirmModal.shiftId, 'cancel')}
          >
            {t('business.shifts.cancelShift')}
          </Button>
        </div>
      </Modal>

      {/* Complete confirmation */}
      <Modal
        open={confirmModal?.action === 'complete'}
        onClose={() => setConfirmModal(null)}
        title={t('business.shifts.completeConfirm')}
        maxWidth="sm"
      >
        <p className="text-sm text-[#8B8299] mb-6">{t('business.shifts.completeConfirm')}</p>
        <div className="flex gap-3">
          <Button variant="ghost" fullWidth onClick={() => setConfirmModal(null)}>
            {t('common.cancel')}
          </Button>
          <Button
            fullWidth
            loading={loadingId === confirmModal?.shiftId}
            onClick={() => confirmModal && handleAction(confirmModal.shiftId, 'complete')}
          >
            {t('business.shifts.markCompleted')}
          </Button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismiss} />}
    </>
  );
}

function ShiftCard({
  shift,
  loadingId,
  onCancel,
  onComplete,
  t,
}: {
  shift: ShiftWithLocation;
  loadingId: string | null;
  onCancel: (id: string) => void;
  onComplete: (id: string) => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const isLoading = loadingId === shift.id;
  const venuePhoto = shift.business_locations?.photos?.[0];
  const acceptedCount = shift.applications.filter((a) => a.status === 'accepted').length;
  const totalApplicants = shift.applications.length;
  const fillPct = shift.workers_needed > 0 ? Math.round((acceptedCount / shift.workers_needed) * 100) : 0;
  const isAlmostFull = fillPct >= 80 && shift.status === 'open';

  return (
    <div className="tap-card bg-white rounded-2xl border border-[#E7E2EF] shadow-sm overflow-hidden">
      {/* Venue photo header */}
      {venuePhoto && (
        <div className="h-32 overflow-hidden relative">
          <img src={venuePhoto} alt={shift.business_locations.branch_name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <Badge variant={shift.status as ShiftStatus} label={t(`shiftStatus.${shift.status}`)} />
            {isAlmostFull && (
              <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] text-xs font-semibold">
                Almost full
              </span>
            )}
          </div>
          <div className="absolute bottom-3 right-4 text-xs text-white/80">
            {relativeTime(shift.created_at)}
          </div>
        </div>
      )}

      <div className="p-5">
        {/* Title row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="font-bold text-lg text-[#12051F]">{shift.job_title}</span>
              {!venuePhoto && <Badge variant={shift.status as ShiftStatus} label={t(`shiftStatus.${shift.status}`)} />}
            </div>
            <p className="text-sm text-[#8B8299]">
              {shift.business_locations.branch_name} · {shift.business_locations.city}
            </p>
            <p className="text-sm text-[#8B8299] mt-0.5">
              {new Date(shift.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
              {' · '}
              {shift.start_time.slice(0, 5)} – {shift.end_time.slice(0, 5)}
              {' · '}
              {shift.duration_hours}h
            </p>
            {!venuePhoto && (
              <p className="text-xs text-[#C9C4D2] mt-1">{relativeTime(shift.created_at)}</p>
            )}
          </div>

          <div className="text-right shrink-0">
            <p className="text-sm font-bold text-[#7426E8]">
              {formatIQD(shift.platform_fee_iqd)}
            </p>
            <p className="text-xs text-[#8B8299] mt-0.5">{t('business.shifts.paymentStatusPending')}</p>
          </div>
        </div>

        {/* Applicants + filled progress */}
        <div className="mt-4 bg-[#F7F4FC] rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#8B8299]">
              {totalApplicants} applicant{totalApplicants !== 1 ? 's' : ''}
            </span>
            <span className="text-xs font-semibold text-[#12051F]">
              {acceptedCount} / {shift.workers_needed} filled
            </span>
          </div>
          <div className="h-1.5 bg-[#E7E2EF] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                fillPct >= 100 ? 'bg-[#28D96D]' :
                fillPct >= 80  ? 'bg-[#F59E0B]' :
                                 'bg-[#7426E8]'
              }`}
              style={{ width: `${Math.min(fillPct, 100)}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E7E2EF] flex-wrap gap-2">
          <div className="flex gap-3 flex-wrap">
            {(shift.status === 'open' || shift.status === 'filled') && (
              <Link
                href={`/business/shifts/${shift.id}/applicants`}
                className="text-[#7426E8] font-semibold text-sm hover:underline"
              >
                {t('business.shifts.viewApplicants')}
                {totalApplicants > 0 && (
                  <span className="ms-1 px-1.5 py-0.5 bg-[#7426E8] text-white text-xs rounded-full">
                    {totalApplicants}
                  </span>
                )}
              </Link>
            )}
            {shift.status === 'open' && (
              <Link
                href={`/business/shifts/${shift.id}/edit`}
                className="text-[#8B8299] font-medium text-sm hover:text-[#12051F] hover:underline"
              >
                Edit
              </Link>
            )}
          </div>

          <div className="flex gap-2">
            {shift.status === 'open' && (
              <button
                className="text-red-500 font-medium text-sm hover:underline disabled:opacity-50"
                disabled={isLoading}
                onClick={() => onCancel(shift.id)}
              >
                {t('business.shifts.cancelShift')}
              </button>
            )}
            {shift.status === 'filled' && (
              <Button size="sm" loading={isLoading} onClick={() => onComplete(shift.id)}>
                {t('business.shifts.markCompleted')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
