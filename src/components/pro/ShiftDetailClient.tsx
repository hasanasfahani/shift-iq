'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Toast, useToast } from '@/components/ui/Toast';
import { formatIQD } from '@/lib/constants';
import type { ApplicationStatus } from '@/types';

interface Props {
  shiftId: string;
  totalPay: number;
  hourlyRate: number;
  durationHours: number;
  hasClothingRules: boolean;
  hasCancellationPolicy: boolean;
  canApply: boolean;
  alreadyApplied: boolean;
  appStatus: ApplicationStatus | null;
  onboardingComplete: boolean;
  missingSkills?: string[];
}

export default function ShiftDetailClient({
  shiftId,
  totalPay,
  hourlyRate,
  durationHours,
  hasClothingRules,
  hasCancellationPolicy,
  canApply,
  alreadyApplied,
  appStatus,
  onboardingComplete,
  missingSkills = [],
}: Props) {
  const router = useRouter();
  const { toast, show, dismiss } = useToast();
  const [applying, setApplying] = useState(false);
  const [confirmedClothing, setConfirmedClothing] = useState(false);
  const [confirmedPolicy, setConfirmedPolicy] = useState(false);
  const [applied, setApplied] = useState(alreadyApplied);
  const [currentStatus, setCurrentStatus] = useState(appStatus);
  const [showConfirm, setShowConfirm] = useState(false);

  const clothingOk = !hasClothingRules || confirmedClothing;
  const policyOk = !hasCancellationPolicy || confirmedPolicy;
  const readyToApply = clothingOk && policyOk;

  async function handleApply() {
    if (!readyToApply || !canApply) return;
    setApplying(true);

    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shiftId,
        confirmedClothing,
        confirmedCancellationPolicy: confirmedPolicy,
      }),
    });

    setApplying(false);

    if (!res.ok) {
      const json = await res.json();
      if (json.code === 'ONBOARDING_INCOMPLETE') {
        show('Complete your profile setup first', 'error');
        return;
      }
      if (json.code === 'SCHEDULE_CONFLICT') {
        show('You already have an accepted shift at this time', 'error');
        return;
      }
      show(json.error ?? 'Failed to apply', 'error');
      return;
    }

    setApplied(true);
    setCurrentStatus('pending');
    setShowConfirm(false);
    show('Application submitted!', 'success');
    router.refresh();
  }

  if (applied || currentStatus) {
    const statusColors: Record<string, string> = {
      pending: 'bg-[#E9DEFF] text-[#7426E8]',
      accepted: 'bg-[#DDF4EA] text-[#0F3D36]',
      declined: 'bg-[#FFE4E4] text-red-700',
      withdrawn: 'bg-[#F3F0FB] text-[#8B8299]',
    };

    const statusLabels: Record<string, string> = {
      pending: 'Application pending',
      accepted: 'You\'ve been accepted',
      declined: 'Application not accepted',
      withdrawn: 'Application withdrawn',
    };

    const cls = statusColors[currentStatus ?? 'pending'] ?? statusColors.pending;
    const label = statusLabels[currentStatus ?? 'pending'] ?? 'Applied';

    return (
      <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E7E2EF] shadow-lg px-4 py-4 lg:px-8">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-[#8B8299]">Your total estimated pay</p>
            <p className="text-xl font-black text-[#12051F]">{formatIQD(totalPay)}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${cls}`}>{label}</span>
        </div>
      </div>
    );
  }

  if (!onboardingComplete) {
    return (
      <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E7E2EF] shadow-lg px-4 py-4 lg:px-8">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-[#8B8299]">Complete your profile to apply</p>
            <p className="text-xl font-black text-[#12051F]">{formatIQD(totalPay)}</p>
          </div>
          <Link
            href="/pro/onboarding"
            className="px-5 py-2.5 rounded-full bg-[#7426E8] text-white text-sm font-semibold hover:bg-[#6315d0] transition-colors"
          >
            Complete profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Confirmation sheet */}
      {showConfirm && (hasClothingRules || hasCancellationPolicy || missingSkills.length > 0) ? (
        <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E7E2EF] shadow-2xl rounded-t-3xl px-5 pt-5 pb-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-base font-black text-[#12051F] mb-4">Before you apply</h3>

            {missingSkills.length > 0 && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-4">
                <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-xs font-semibold text-amber-800">You&apos;re missing {missingSkills.length} required skill{missingSkills.length !== 1 ? 's' : ''}</p>
                  <p className="text-xs text-amber-700 mt-0.5">{missingSkills.join(', ')}. You can still apply — the business makes the final decision.</p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 mb-5">
              {hasClothingRules && (
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmedClothing}
                    onChange={(e) => setConfirmedClothing(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#7426E8] shrink-0"
                  />
                  <span className="text-sm text-[#8B8299] leading-relaxed select-none">
                    I have read the clothing requirements and can meet them for this shift.
                  </span>
                </label>
              )}
              {hasCancellationPolicy && (
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmedPolicy}
                    onChange={(e) => setConfirmedPolicy(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#7426E8] shrink-0"
                  />
                  <span className="text-sm text-[#8B8299] leading-relaxed select-none">
                    I have read and accept the cancellation policy.
                  </span>
                </label>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-full border border-[#E7E2EF] text-sm font-semibold text-[#8B8299] hover:border-[#C9C4D2] transition-colors"
              >
                Cancel
              </button>
              <Button
                fullWidth
                size="lg"
                disabled={!readyToApply}
                loading={applying}
                onClick={handleApply}
              >
                Confirm & Apply
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E7E2EF] shadow-lg px-4 py-4 lg:px-8">
          <div className="max-w-2xl mx-auto">
            {missingSkills.length > 0 && !showConfirm && (
              <p className="text-xs text-amber-600 mb-2 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Missing {missingSkills.length} required skill{missingSkills.length !== 1 ? 's' : ''} — you can still apply
              </p>
            )}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-[#8B8299]">{formatIQD(hourlyRate)}/hr · {durationHours}h</p>
                <p className="text-xl font-black text-[#12051F]">{formatIQD(totalPay)}</p>
              </div>
              <Button
                size="lg"
                loading={applying}
                onClick={() => {
                  if (hasClothingRules || hasCancellationPolicy || missingSkills.length > 0) {
                    setShowConfirm(true);
                  } else {
                    handleApply();
                  }
                }}
              >
                Apply now
              </Button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismiss} />}
    </>
  );
}
