'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { BusinessLocation } from '@/types';
import type { ShiftInput } from '@/lib/validations/shift.schema';
import { buildFeeSummary } from '@/lib/fee';
import { formatIQD, SPECIAL_BADGES, CANCELLATION_POLICIES, PAYMENT_TERMS } from '@/lib/constants';

interface Props {
  locations: BusinessLocation[];
  onTemplateSaved?: () => void;
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-2 ${bold ? 'border-t border-[#E7E2EF] mt-1 pt-3' : ''}`}>
      <span className={`text-sm ${bold ? 'font-semibold text-[#12051F]' : 'text-[#8B8299]'}`}>{label}</span>
      <span className={`text-sm ${bold ? 'font-black text-[#12051F] text-base' : 'text-[#12051F] font-medium'}`}>{value}</span>
    </div>
  );
}

function SaveTemplateButton({ onSaved }: { onSaved?: () => void }) {
  const { watch } = useFormContext<ShiftInput>();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);

  const values = watch();

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch('/api/shift-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        locationId: values.locationId,
        jobTitle: values.jobTitle,
        workersNeeded: values.workersNeeded,
        proHourlyRateIQD: values.proHourlyRateIQD,
        shiftType: values.shiftType,
        description: values.description,
        whatToExpect: values.whatToExpect,
        clothingRules: values.clothingRules ?? [],
        requiredSkills: values.requiredSkills ?? [],
        preferredSkills: values.preferredSkills ?? [],
        rulesAndRegulations: values.rulesAndRegulations,
        cancellationPolicy: values.cancellationPolicy,
        paymentTerms: values.paymentTerms,
        specialBadge: values.specialBadge,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setOpen(false);
      onSaved?.();
    }
  }

  if (saved) {
    return (
      <span className="text-sm text-[#28D96D] font-medium flex items-center gap-1.5">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Template saved
      </span>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-[#7426E8] hover:underline font-medium flex items-center gap-1"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
        Save as template
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Template name…"
        autoFocus
        className="flex-1 rounded-xl border border-[#E7E2EF] bg-[#F3F0FB] px-3 py-1.5 text-sm text-[#12051F] placeholder:text-[#C9C4D2] focus:outline-none focus:ring-2 focus:ring-[#7426E8]"
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !name.trim()}
        className="px-3 py-1.5 rounded-xl bg-[#7426E8] text-white text-sm font-semibold disabled:opacity-50"
      >
        {saving ? '…' : 'Save'}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-[#8B8299] hover:text-[#12051F] text-sm">
        ✕
      </button>
    </div>
  );
}

function ProPreview({ values, location }: { values: ShiftInput; location: BusinessLocation | undefined }) {
  const venuePhoto = location?.photos?.[0];
  const badgeInfo = SPECIAL_BADGES.find((b) => b.value === values.specialBadge);
  const totalPay = values.startTime && values.endTime && values.workersNeeded && values.proHourlyRateIQD
    ? Math.round(((new Date(`1970-01-01T${values.endTime}`) as any) - (new Date(`1970-01-01T${values.startTime}`) as any)) / 3600000 * values.proHourlyRateIQD)
    : 0;
  const cancellationLabel = CANCELLATION_POLICIES.find((p) => p.value === values.cancellationPolicy)?.label;
  const paymentLabel = PAYMENT_TERMS.find((p) => p.value === values.paymentTerms)?.label;

  return (
    <div className="bg-[#F7F4FC] rounded-2xl border-2 border-dashed border-[#7426E8]/30 overflow-hidden">
      <div className="bg-[#7426E8]/10 px-4 py-2 flex items-center gap-2">
        <svg className="w-4 h-4 text-[#7426E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span className="text-xs font-semibold text-[#7426E8]">Preview as Pro</span>
      </div>

      {/* Shift card */}
      <div className="bg-white rounded-xl border border-[#E7E2EF] m-3 overflow-hidden shadow-sm">
        {venuePhoto && (
          <div className="h-24 overflow-hidden">
            <img src={venuePhoto} alt={location?.branch_name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            {badgeInfo && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: badgeInfo.color }}>
                {badgeInfo.label}
              </span>
            )}
            {values.shiftType && (
              <span className="px-2 py-0.5 bg-[#E9DEFF] text-[#7426E8] text-xs rounded-full">{values.shiftType}</span>
            )}
          </div>
          <p className="font-bold text-[#12051F]">{values.jobTitle || '—'}</p>
          {location && (
            <p className="text-sm text-[#8B8299] mt-0.5">
              {location.branch_name} · <span className="text-[#7426E8] bg-[#E9DEFF] rounded-full px-1.5 py-0.5 text-xs">{location.city}</span>
            </p>
          )}
          <p className="text-sm text-[#8B8299] mt-0.5">
            {values.date || '—'} · {values.startTime?.slice(0, 5) || '?'} – {values.endTime?.slice(0, 5) || '?'}
          </p>
          <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#E7E2EF]">
            <span className="text-xs text-[#8B8299]">{values.workersNeeded} worker{values.workersNeeded !== 1 ? 's' : ''} needed</span>
            <div className="text-right">
              <p className="text-sm font-black text-[#12051F]">
                {formatIQD(values.proHourlyRateIQD ?? 0)}<span className="text-xs font-normal text-[#8B8299]">/hr</span>
              </p>
              {totalPay > 0 && (
                <p className="text-xs text-[#28D96D]">Total: {formatIQD(totalPay)}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional details */}
      <div className="mx-3 mb-3 space-y-2">
        {values.whatToExpect && (
          <div className="bg-white rounded-xl border border-[#E7E2EF] p-3">
            <p className="text-xs font-black text-[#12051F] uppercase tracking-wide mb-1">What to expect</p>
            <p className="text-xs text-[#8B8299] leading-relaxed line-clamp-3">{values.whatToExpect}</p>
          </div>
        )}
        {(values.clothingRules?.length ?? 0) > 0 && (
          <div className="bg-white rounded-xl border border-[#E7E2EF] p-3">
            <p className="text-xs font-black text-[#12051F] uppercase tracking-wide mb-1">What to wear</p>
            <div className="flex flex-wrap gap-1">
              {values.clothingRules?.map((r) => (
                <span key={r} className="px-2 py-0.5 bg-[#F3F0FB] text-[#7426E8] text-xs rounded-full">{r}</span>
              ))}
            </div>
          </div>
        )}
        {(cancellationLabel || paymentLabel) && (
          <div className="grid grid-cols-2 gap-2">
            {cancellationLabel && (
              <div className="bg-white rounded-xl border border-[#E7E2EF] p-3">
                <p className="text-xs font-black text-[#12051F] uppercase tracking-wide mb-0.5">Cancellation</p>
                <p className="text-xs text-[#8B8299]">{cancellationLabel}</p>
              </div>
            )}
            {paymentLabel && (
              <div className="bg-white rounded-xl border border-[#E7E2EF] p-3">
                <p className="text-xs font-black text-[#12051F] uppercase tracking-wide mb-0.5">Payment</p>
                <p className="text-xs text-[#8B8299]">{paymentLabel}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Step4Review({ locations, onTemplateSaved }: Props) {
  const { t } = useTranslation();
  const { watch } = useFormContext<ShiftInput>();
  const [showPreview, setShowPreview] = useState(false);

  const values = watch();
  const location = locations.find((l) => l.id === values.locationId);

  const startTime = values.startTime ?? '';
  const endTime = values.endTime ?? '';
  const workers = Number(values.workersNeeded) || 0;
  const rate = Number(values.proHourlyRateIQD) || 0;

  const canCompute = startTime && endTime && workers > 0 && rate > 0;
  const summary = canCompute ? buildFeeSummary(startTime, endTime, workers, rate) : null;

  return (
    <div className="flex flex-col gap-5">
      {/* Shift summary */}
      <div className="bg-[#F7F4FC] rounded-xl border border-[#E7E2EF] p-4 flex flex-col gap-1 text-sm">
        <p className="font-black text-[#12051F] mb-2">{t('business.postShift.step2Title')}</p>
        {location && (
          <div className="flex gap-2">
            <span className="text-[#8B8299] w-24 shrink-0">{t('business.postShift.branchLabel')}</span>
            <span className="text-[#12051F]">{location.branch_name}, {location.city}</span>
          </div>
        )}
        {location?.photos?.[0] && (
          <div className="flex gap-2 mt-1">
            <span className="text-[#8B8299] w-24 shrink-0">Photo</span>
            <img src={location.photos[0]} alt="" className="h-10 w-16 rounded object-cover" />
          </div>
        )}
        <div className="flex gap-2">
          <span className="text-[#8B8299] w-24 shrink-0">{t('business.postShift.jobTitle')}</span>
          <span className="text-[#12051F]">{values.jobTitle ? t(`jobRoles.${values.jobTitle}`, { defaultValue: values.jobTitle }) : '—'}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-[#8B8299] w-24 shrink-0">{t('business.postShift.date')}</span>
          <span className="text-[#12051F]">{values.date ?? '—'}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-[#8B8299] w-24 shrink-0">{t('business.postShift.startTime')}</span>
          <span className="text-[#12051F]">{startTime} → {endTime}</span>
        </div>
        {(values.clothingRules?.length ?? 0) > 0 && (
          <div className="flex gap-2">
            <span className="text-[#8B8299] w-24 shrink-0">Clothing</span>
            <span className="text-[#12051F]">{values.clothingRules?.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Fee summary */}
      {summary ? (
        <div className="bg-[#F7F4FC] rounded-2xl border border-[#E7E2EF] p-4">
          <p className="font-black text-[#12051F] mb-1">{t('business.postShift.feeSummaryTitle')}</p>
          <Row label={t('business.postShift.duration')} value={`${summary.durationHours.toFixed(2)} ${t('common.hours')}`} />
          <Row label={t('business.postShift.workers')} value={`${summary.workersNeeded}`} />
          <Row label={t('business.postShift.proHourlyRateLabel')} value={formatIQD(summary.proHourlyRateIQD)} />
          <Row label={t('business.postShift.totalProPay')} value={formatIQD(summary.totalProPayIQD)} />
          <Row label={t('business.postShift.platformFee')} value={formatIQD(summary.platformFeeIQD)} />
          <Row label={t('business.postShift.grandTotal')} value={formatIQD(summary.grandTotalIQD)} bold />
        </div>
      ) : (
        <div className="bg-[#F7F4FC] rounded-xl border border-[#E7E2EF] p-4 text-sm text-[#8B8299] text-center">
          Complete shift details to see fee summary.
        </div>
      )}

      {/* Payment note */}
      <div className="flex items-start gap-2 bg-[#F7F4FC] border border-[#E7E2EF] rounded-xl px-4 py-3">
        <svg className="w-4 h-4 text-[#7426E8] mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <div>
          <p className="text-sm font-medium text-[#12051F]">{t('business.postShift.paymentStatus')}</p>
          <p className="text-xs text-[#8B8299] mt-0.5">{t('business.postShift.paymentNote')}</p>
        </div>
      </div>

      {/* Preview as Pro toggle */}
      <div className="pt-2 border-t border-[#E7E2EF]">
        <button
          type="button"
          onClick={() => setShowPreview((v) => !v)}
          className="flex items-center gap-2 text-sm font-semibold text-[#7426E8] hover:underline"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {showPreview ? 'Hide' : 'Preview as Pro'}
        </button>
        {showPreview && (
          <div className="mt-3">
            <ProPreview values={values} location={location} />
          </div>
        )}
      </div>

      {/* Save as template */}
      <div className="border-t border-[#E7E2EF] pt-2">
        <SaveTemplateButton onSaved={onTemplateSaved} />
      </div>
    </div>
  );
}
