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

type AcceptedPro = {
  id: string;
  full_name: string;
  photo_url: string | null;
};

type ShiftWithLocation = Shift & {
  business_locations: Pick<BusinessLocation, 'branch_name' | 'city' | 'photos'>;
  applications: {
    id: string;
    status: string;
    users?: { id: string; full_name: string; pro_profiles?: { photo_url: string | null }[] | null } | null;
  }[];
};

const TABS: { key: ShiftStatus | 'all'; labelKey: string }[] = [
  { key: 'all',       labelKey: 'business.shifts.all' },
  { key: 'open',      labelKey: 'business.shifts.open' },
  { key: 'filled',    labelKey: 'business.shifts.filled' },
  { key: 'completed', labelKey: 'business.shifts.completed' },
  { key: 'cancelled', labelKey: 'business.shifts.cancelled' },
];

const STAR_LABELS = ['', 'Needs improvement', 'Below expectations', 'Met expectations', 'Great work!', 'Outstanding!'];

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

function ProAvatar({ name, photoUrl, size = 'md' }: { name: string; photoUrl: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'w-20 h-20 text-2xl' : size === 'sm' ? 'w-9 h-9 text-sm' : 'w-12 h-12 text-base';
  if (photoUrl) {
    return <img src={photoUrl} alt={name} className={`${sizeClass} rounded-full object-cover`} />;
  }
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-[#7426E8] to-[#C084FC] flex items-center justify-center text-white font-bold shrink-0`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function StarIcon({ filled, size = 44 }: { filled: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={filled ? '#F59E0B' : 'none'}
        stroke={filled ? '#F59E0B' : '#D1C4E9'}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ShiftsClient({ shifts }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast, show, dismiss } = useToast();

  const [activeTab, setActiveTab] = useState<ShiftStatus | 'all'>('all');
  const [confirmModal, setConfirmModal] = useState<{ shiftId: string; action: 'cancel' | 'complete' } | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [boostShiftId, setBoostShiftId] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<'1day' | '3days' | '1week'>('1day');

  // Rating state
  const [ratingTarget, setRatingTarget] = useState<{ shiftId: string; pro: AcceptedPro } | null>(null);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratedPairs, setRatedPairs] = useState<Set<string>>(new Set());

  const filtered = activeTab === 'all' ? shifts : shifts.filter((s) => s.status === activeTab);

  function openRatingModal(shiftId: string, pro: AcceptedPro) {
    setRatingTarget({ shiftId, pro });
    setHoveredStar(0);
    setSelectedStar(0);
    setReviewText('');
  }

  function closeRatingModal() {
    setRatingTarget(null);
    setHoveredStar(0);
    setSelectedStar(0);
    setReviewText('');
  }

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
      action === 'cancel' ? t('business.shifts.cancelConfirm') : t('business.shifts.completeConfirm'),
      'success'
    );
    router.refresh();
  }

  async function handleSubmitRating() {
    if (!ratingTarget || selectedStar === 0) return;
    setRatingLoading(true);

    const res = await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shiftId: ratingTarget.shiftId,
        ratedId: ratingTarget.pro.id,
        stars: selectedStar,
        comment: reviewText.trim() || undefined,
      }),
    });

    setRatingLoading(false);

    if (res.status === 409) {
      show('You have already reviewed this pro for this shift.', 'error');
      closeRatingModal();
      return;
    }

    if (!res.ok) {
      show('Failed to submit review. Please try again.', 'error');
      return;
    }

    setRatedPairs((prev) => new Set(prev).add(`${ratingTarget.shiftId}:${ratingTarget.pro.id}`));
    closeRatingModal();
    show('Review submitted — thank you!', 'success');
  }

  const activeStar = hoveredStar || selectedStar;

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
              ratedPairs={ratedPairs}
              onCancel={(id) => setConfirmModal({ shiftId: id, action: 'cancel' })}
              onComplete={(id) => setConfirmModal({ shiftId: id, action: 'complete' })}
              onBoost={(id) => { setBoostShiftId(id); setSelectedPackage('1day'); }}
              onRate={openRatingModal}
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

      {/* Boost modal */}
      <Modal
        open={!!boostShiftId}
        onClose={() => setBoostShiftId(null)}
        title="Boost this shift"
        maxWidth="sm"
      >
        <p className="text-sm text-[#8B8299] mb-4">
          Your shift post will appear at the top of published shifts, getting more visibility and applications faster.
        </p>

        <div className="flex flex-col gap-3 mb-6">
          {(
            [
              { key: '1day',  label: '1 Day',  price: '50,000 IQD' },
              { key: '3days', label: '3 Days', price: '125,000 IQD' },
              { key: '1week', label: '1 Week', price: '250,000 IQD' },
            ] as const
          ).map((pkg) => (
            <button
              key={pkg.key}
              onClick={() => setSelectedPackage(pkg.key)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-colors ${
                selectedPackage === pkg.key
                  ? 'border-[#7426E8] bg-[#F3F0FB]'
                  : 'border-[#E7E2EF] bg-white hover:border-[#C4B5FD]'
              }`}
            >
              <div>
                <p className={`font-semibold text-sm ${selectedPackage === pkg.key ? 'text-[#7426E8]' : 'text-[#12051F]'}`}>
                  {pkg.label}
                </p>
                <p className="text-xs text-[#8B8299] mt-0.5">Featured placement for {pkg.label.toLowerCase()}</p>
              </div>
              <div className="text-right">
                <p className={`font-bold text-base ${selectedPackage === pkg.key ? 'text-[#7426E8]' : 'text-[#12051F]'}`}>
                  {pkg.price}
                </p>
                {selectedPackage === pkg.key && (
                  <span className="text-xs text-[#7426E8] font-medium">Selected</span>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" fullWidth onClick={() => setBoostShiftId(null)}>
            {t('common.cancel')}
          </Button>
          <Button
            fullWidth
            onClick={() => {
              setBoostShiftId(null);
              show('Coming soon! Boost feature is launching soon.', 'success');
            }}
          >
            Complete Payment
          </Button>
        </div>
      </Modal>

      {/* Rating modal */}
      <Modal
        open={!!ratingTarget}
        onClose={closeRatingModal}
        title="Leave a review"
        maxWidth="sm"
      >
        {ratingTarget && (
          <>
            {/* Pro identity */}
            <div className="flex flex-col items-center text-center mb-7">
              <div className="ring-4 ring-[#F3F0FB] rounded-full mb-3">
                <ProAvatar name={ratingTarget.pro.full_name} photoUrl={ratingTarget.pro.photo_url} size="lg" />
              </div>
              <p className="text-xl font-bold text-[#12051F]">
                {ratingTarget.pro.full_name.split(' ')[0]}
              </p>
              <p className="text-sm text-[#8B8299] mt-1">
                How did they perform on this shift?
              </p>
            </div>

            {/* Stars */}
            <div className="flex justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setSelectedStar(star)}
                  className={`transition-transform duration-150 active:scale-95 ${
                    star <= selectedStar ? 'scale-110' : 'scale-100 hover:scale-110'
                  }`}
                  aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                >
                  <StarIcon filled={star <= activeStar} size={44} />
                </button>
              ))}
            </div>

            {/* Star label */}
            <div className="text-center mb-5 h-5">
              {activeStar > 0 && (
                <span className={`text-sm font-semibold transition-all ${activeStar === 5 ? 'text-[#F59E0B]' : 'text-[#8B8299]'}`}>
                  {STAR_LABELS[activeStar]}
                  {activeStar === 5 && ' ✨'}
                </span>
              )}
            </div>

            {/* Review textarea — slides in after star is picked */}
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: selectedStar > 0 ? '200px' : '0px', opacity: selectedStar > 0 ? 1 : 0 }}
            >
              <div className="mb-5">
                <label className="block text-sm font-semibold text-[#12051F] mb-2">
                  Share what stood out{' '}
                  <span className="font-normal text-[#8B8299]">(optional)</span>
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value.slice(0, 500))}
                  placeholder="Punctual, professional, great attitude..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E7E2EF] text-sm text-[#12051F] placeholder:text-[#C9C4D2] focus:outline-none focus:ring-2 focus:ring-[#7426E8]/20 focus:border-[#7426E8] resize-none transition-colors"
                />
                <p className="text-xs text-[#C9C4D2] text-right mt-1">{reviewText.length}/500</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button
                fullWidth
                disabled={selectedStar === 0}
                loading={ratingLoading}
                onClick={handleSubmitRating}
              >
                Submit Review
              </Button>
              <button
                onClick={closeRatingModal}
                className="text-sm text-[#8B8299] hover:text-[#12051F] py-2 transition-colors text-center"
              >
                Skip for now
              </button>
            </div>
          </>
        )}
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismiss} />}
    </>
  );
}

function ShiftCard({
  shift,
  loadingId,
  ratedPairs,
  onCancel,
  onComplete,
  onBoost,
  onRate,
  t,
}: {
  shift: ShiftWithLocation;
  loadingId: string | null;
  ratedPairs: Set<string>;
  onCancel: (id: string) => void;
  onComplete: (id: string) => void;
  onBoost: (id: string) => void;
  onRate: (shiftId: string, pro: AcceptedPro) => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const isLoading = loadingId === shift.id;
  const shiftEnded = new Date(`${shift.date}T${shift.end_time}`) < new Date();
  const venuePhoto = shift.business_locations?.photos?.[0];
  const acceptedCount = shift.applications.filter((a) => a.status === 'accepted').length;
  const totalApplicants = shift.applications.length;
  const fillPct = shift.workers_needed > 0 ? Math.round((acceptedCount / shift.workers_needed) * 100) : 0;
  const isAlmostFull = fillPct >= 80 && shift.status === 'open';

  const acceptedPros: AcceptedPro[] = shift.applications
    .filter((a) => a.status === 'accepted' && a.users)
    .map((a) => ({
      id: a.users!.id,
      full_name: a.users!.full_name,
      photo_url: a.users!.pro_profiles?.[0]?.photo_url ?? null,
    }));

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

        {/* Rate your team — completed shifts only */}
        {shift.status === 'completed' && acceptedPros.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#E7E2EF]">
            <p className="text-xs font-semibold text-[#8B8299] uppercase tracking-wide mb-3">
              Rate your team
            </p>
            <div className="flex flex-col gap-3">
              {acceptedPros.map((pro) => {
                const isRated = ratedPairs.has(`${shift.id}:${pro.id}`);
                return (
                  <div key={pro.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="ring-2 ring-[#F3F0FB] rounded-full">
                        {pro.photo_url ? (
                          <img
                            src={pro.photo_url}
                            alt={pro.full_name}
                            className="w-9 h-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7426E8] to-[#C084FC] flex items-center justify-center text-white text-sm font-bold">
                            {pro.full_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#12051F]">{pro.full_name}</p>
                        {isRated && (
                          <p className="text-xs text-[#28D96D] font-medium">Review submitted ✓</p>
                        )}
                      </div>
                    </div>

                    {isRated ? (
                      <span className="text-xs font-semibold text-[#28D96D] bg-[#F0FDF4] px-3 py-1.5 rounded-lg">
                        Done ✓
                      </span>
                    ) : (
                      <button
                        onClick={() => onRate(shift.id, pro)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FEF9EC] border border-[#FDE68A] text-[#92400E] text-xs font-semibold hover:bg-[#FEF3C7] transition-colors"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B" aria-hidden="true">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        Rate
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

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

          <div className="flex gap-2 items-center">
            {(shift.status === 'open' || shift.status === 'filled') && (
              <button
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#7426E8] text-[#7426E8] hover:bg-[#F3F0FB] transition-colors"
                onClick={() => onBoost(shift.id)}
              >
                ⚡ Boost
              </button>
            )}
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
              <div className="flex flex-col items-end gap-1">
                <Button
                  size="sm"
                  loading={isLoading}
                  disabled={!shiftEnded}
                  onClick={() => onComplete(shift.id)}
                >
                  {t('business.shifts.markCompleted')}
                </Button>
                {!shiftEnded && (
                  <span className="text-xs text-[#8B8299]">Available after shift ends</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
