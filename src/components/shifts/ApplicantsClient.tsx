'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import type { ApplicationStatus, IraqiCity } from '@/types';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import { Toast, useToast } from '@/components/ui/Toast';
import RatingModal from '@/components/ui/RatingModal';

interface ProProfile {
  skills: string[];
  skills_by_role: Record<string, string[]> | null;
  photo_url: string | null;
  average_rating: number;
  completed_shifts: number;
  bio: string | null;
}

interface ProExperience {
  id: string;
  position: string;
  business_name: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
}

interface ProUser {
  id: string;
  full_name: string;
  city: IraqiCity;
  phone: string;
  pro_profiles: ProProfile | null;
  pro_experiences: ProExperience[] | null;
}

interface Applicant {
  id: string;
  status: ApplicationStatus;
  applied_at: string;
  users: ProUser | null;
}

interface ShiftSummary {
  id: string;
  workers_needed: number;
  job_title: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
}

interface Props {
  shift: ShiftSummary;
  initialApplicants: Applicant[];
  ratedProIds: Set<string>;
}

export default function ApplicantsClient({ shift, initialApplicants, ratedProIds }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast, show, dismiss } = useToast();
  const [applicants, setApplicants] = useState(initialApplicants);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rated, setRated] = useState<Set<string>>(ratedProIds);
  const [ratingTarget, setRatingTarget] = useState<{ proId: string; name: string } | null>(null);

  const acceptedCount = applicants.filter((a) => a.status === 'accepted').length;
  const allFilled = acceptedCount >= shift.workers_needed;
  const isCompleted = shift.status === 'completed';

  async function handleNoShow(appId: string) {
    if (!confirm('Mark this pro as no-show? This cannot be undone.')) return;
    setLoadingId(appId);
    const res = await fetch(`/api/applications/${appId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'no_show' }),
    });
    setLoadingId(null);

    if (!res.ok) {
      const json = await res.json();
      show(json.error ?? t('common.error.generic'), 'error');
      return;
    }

    setApplicants((prev) => prev.map((a) => (a.id === appId ? { ...a, status: 'no_show' as any } : a)));
    show('No-show recorded', 'success');
    router.refresh();
  }

  async function handleAction(appId: string, newStatus: 'accepted' | 'declined') {
    setLoadingId(appId);
    const res = await fetch(`/api/applications/${appId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoadingId(null);

    if (!res.ok) {
      const json = await res.json();
      show(json.error ?? t('common.error.generic'), 'error');
      return;
    }

    const json = await res.json();
    setApplicants((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
    );

    if (newStatus === 'accepted') {
      show(t('business.applicants.acceptConfirm'), 'success');
      if (json.shiftNowFilled) show(`${shift.job_title} shift is now fully filled!`, 'success');
    } else {
      show(t('business.applicants.declineConfirm'), 'success');
    }

    router.refresh();
  }

  async function handleRatingSubmit(stars: number, comment: string) {
    if (!ratingTarget) return;

    const res = await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shiftId: shift.id,
        ratedId: ratingTarget.proId,
        stars,
        comment,
      }),
    });

    if (!res.ok) {
      const json = await res.json();
      show(json.error ?? t('common.error.generic'), 'error');
    } else {
      setRated((prev) => new Set([...prev, ratingTarget.proId]));
      show('Rating submitted!', 'success');
    }

    setRatingTarget(null);
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-[#7426E8] font-medium hover:underline mb-3 flex items-center gap-1"
        >
          ← {t('business.shifts.title')}
        </button>
        <h1 className="text-2xl font-black text-[#12051F]">
          {t('business.applicants.title', { role: shift.job_title })}
        </h1>
        <p className="text-sm text-[#8B8299] mt-1">
          {shift.date} · {shift.start_time.slice(0, 5)} – {shift.end_time.slice(0, 5)}
        </p>

        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-[#E9DEFF] text-[#7426E8]">
          <span>
            {acceptedCount} / {shift.workers_needed} {t('business.shifts.workers')} filled
          </span>
          {allFilled && <span>· {t('business.applicants.allFilled')}</span>}
        </div>
      </div>

      {applicants.length === 0 ? (
        <EmptyState
          illustration="no-applicants"
          heading="No applicants yet"
          body="Applications will appear here as pros apply to this shift."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {applicants.map((app) => (
            <ApplicantCard
              key={app.id}
              app={app}
              shiftJobTitle={shift.job_title}
              allFilled={allFilled}
              isLoading={loadingId === app.id}
              isCompleted={isCompleted}
              alreadyRated={rated.has(app.users?.id ?? '')}
              onAccept={() => handleAction(app.id, 'accepted')}
              onDecline={() => handleAction(app.id, 'declined')}
              onNoShow={() => handleNoShow(app.id)}
              onRate={() => setRatingTarget({ proId: app.users?.id ?? '', name: app.users?.full_name ?? '' })}
              t={t}
            />
          ))}
        </div>
      )}

      <RatingModal
        open={ratingTarget !== null}
        title={`Rate ${ratingTarget?.name ?? ''}`}
        onClose={() => setRatingTarget(null)}
        onSubmit={handleRatingSubmit}
      />

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismiss} />}
    </>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'text-[#FFB536]' : 'text-[#E7E2EF]'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-[#8B8299] ms-1">{Number(rating).toFixed(1)}</span>
    </div>
  );
}

function ApplicantCard({
  app,
  shiftJobTitle,
  allFilled,
  isLoading,
  isCompleted,
  alreadyRated,
  onAccept,
  onDecline,
  onRate,
  onNoShow,
  t,
}: {
  app: Applicant;
  shiftJobTitle: string;
  allFilled: boolean;
  isLoading: boolean;
  isCompleted: boolean;
  alreadyRated: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onRate: () => void;
  onNoShow: () => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const [showAllExp, setShowAllExp] = useState(false);
  const user = app.users;
  const profile = user?.pro_profiles;
  const experiences = user?.pro_experiences ?? [];
  const isPending = app.status === 'pending';
  const isAccepted = app.status === 'accepted';

  if (!user || !profile) {
    return (
      <div className="bg-white rounded-2xl border border-[#E7E2EF] p-5 text-sm text-[#8B8299]">
        Applicant profile unavailable
      </div>
    );
  }

  // Skills relevant to the shift's job title
  const relevantSkills = profile.skills_by_role?.[shiftJobTitle] ?? [];
  // Fall back to general roles list if no specific skills stored
  const displaySkills = relevantSkills.length > 0 ? relevantSkills : profile.skills;

  const visibleExperiences = showAllExp ? experiences : experiences.slice(0, 2);

  return (
    <div className="tap-card bg-white rounded-2xl border border-[#E7E2EF] shadow-sm overflow-hidden">
      {/* Top section: identity + stats */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-[#E7E2EF] bg-[#F7F4FC] overflow-hidden shrink-0">
            {profile.photo_url ? (
              <Image
                src={profile.photo_url}
                alt={user.full_name}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#8B8299] text-xl font-semibold">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[#12051F] text-base">{user.full_name}</span>
              <Badge variant={app.status} label={t(`business.applicants.${app.status}`)} />
            </div>
            <p className="text-sm text-[#8B8299] mt-0.5">{user.city}</p>
            {user.phone && (
              <a
                href={`tel:${user.phone}`}
                className="inline-flex items-center gap-1 text-xs text-[#7426E8] font-semibold hover:underline mt-0.5"
              >
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {user.phone}
              </a>
            )}
            <div className="mt-1.5 flex items-center gap-3 flex-wrap">
              {profile.average_rating > 0 ? (
                <StarRating rating={profile.average_rating} />
              ) : (
                <span className="text-xs text-[#8B8299]">No rating yet</span>
              )}
              <span className="text-xs text-[#8B8299]">
                {profile.completed_shifts} shift{profile.completed_shifts !== 1 ? 's' : ''} completed
              </span>
            </div>
          </div>
        </div>

        {/* Personal pitch / bio */}
        {profile.bio && (
          <div className="mt-4 bg-[#F7F4FC] rounded-xl px-4 py-3">
            <p className="text-xs font-semibold text-[#8B8299] uppercase tracking-wide mb-1">Personal Pitch</p>
            <p className="text-sm text-[#12051F] leading-relaxed">{profile.bio}</p>
          </div>
        )}
      </div>

      {/* Skills for this role */}
      {displaySkills.length > 0 && (
        <div className="px-5 pb-4">
          <p className="text-xs font-semibold text-[#8B8299] uppercase tracking-wide mb-2">
            {relevantSkills.length > 0 ? `Skills for ${shiftJobTitle}` : 'Roles'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {displaySkills.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 bg-[#E9DEFF] text-[#7426E8] text-xs font-medium rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Work experience */}
      {experiences.length > 0 && (
        <div className="px-5 pb-4 border-t border-[#E7E2EF] pt-4">
          <p className="text-xs font-semibold text-[#8B8299] uppercase tracking-wide mb-2">Experience</p>
          <div className="flex flex-col gap-2">
            {visibleExperiences.map((exp) => (
              <div key={exp.id} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#28D96D] mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[#12051F]">
                    {exp.position} <span className="font-normal text-[#8B8299]">at</span> {exp.business_name}
                  </p>
                  <p className="text-xs text-[#8B8299]">
                    {exp.start_date} – {exp.is_current ? 'Present' : (exp.end_date ?? '')}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {experiences.length > 2 && (
            <button
              type="button"
              onClick={() => setShowAllExp((v) => !v)}
              className="mt-2 text-xs text-[#7426E8] hover:underline"
            >
              {showAllExp ? 'Show less' : `+${experiences.length - 2} more`}
            </button>
          )}
        </div>
      )}

      {/* Accept / decline */}
      {isPending && (
        <div className="flex gap-2 px-5 py-3 border-t border-[#E7E2EF] bg-[#F7F4FC]">
          <Button
            variant="ghost"
            size="sm"
            loading={isLoading}
            onClick={onDecline}
            className="text-red-500 hover:bg-red-50 rounded-full"
          >
            {t('business.applicants.decline')}
          </Button>
          <div className="flex-1" />
          <Button
            size="sm"
            loading={isLoading}
            disabled={allFilled}
            onClick={onAccept}
          >
            {t('business.applicants.accept')}
          </Button>
        </div>
      )}

      {/* No-show for accepted pros */}
      {isAccepted && !isCompleted && (
        <div className="border-t border-[#E7E2EF] bg-[#F7F4FC]">
          <div className="px-5 py-3 flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              loading={isLoading}
              onClick={onNoShow}
              className="text-red-500 hover:bg-red-50 rounded-full text-xs"
            >
              Mark no-show
            </Button>
          </div>
        </div>
      )}

      {/* Rate button for accepted pros on completed shift */}
      {isCompleted && isAccepted && (
        <div className="flex justify-end px-5 py-3 border-t border-[#E7E2EF] bg-[#F7F4FC]">
          {alreadyRated ? (
            <span className="text-sm text-[#8B8299]">✓ Rated</span>
          ) : (
            <Button size="sm" variant="secondary" onClick={onRate}>
              {t('ratings.ratePro', { name: user.full_name })}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
