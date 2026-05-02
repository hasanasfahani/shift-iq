'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { BusinessLocation } from '@/types';
import type { ShiftInput } from '@/lib/validations/shift.schema';
import { buildFeeSummary } from '@/lib/fee';
import { formatIQD } from '@/lib/constants';

interface Props {
  locations: BusinessLocation[];
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-2 ${bold ? 'border-t border-[#E7E2EF] mt-1 pt-3' : ''}`}>
      <span className={`text-sm ${bold ? 'font-semibold text-[#12051F]' : 'text-[#8B8299]'}`}>{label}</span>
      <span className={`text-sm ${bold ? 'font-black text-[#12051F] text-base' : 'text-[#12051F] font-medium'}`}>{value}</span>
    </div>
  );
}

export default function Step3Review({ locations }: Props) {
  const { t } = useTranslation();
  const { watch } = useFormContext<ShiftInput>();

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
        <div className="flex gap-2">
          <span className="text-[#8B8299] w-24 shrink-0">{t('business.postShift.jobTitle')}</span>
          <span className="text-[#12051F]">{values.jobTitle ? t(`jobRoles.${values.jobTitle}`) : '—'}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-[#8B8299] w-24 shrink-0">{t('business.postShift.date')}</span>
          <span className="text-[#12051F]">{values.date ?? '—'}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-[#8B8299] w-24 shrink-0">{t('business.postShift.startTime')}</span>
          <span className="text-[#12051F]">{startTime} → {endTime}</span>
        </div>
      </div>

      {/* Fee summary */}
      {summary ? (
        <div className="bg-[#F7F4FC] rounded-2xl border border-[#E7E2EF] p-4">
          <p className="font-black text-[#12051F] mb-1">{t('business.postShift.feeSummaryTitle')}</p>
          <Row
            label={t('business.postShift.duration')}
            value={`${summary.durationHours.toFixed(2)} ${t('common.hours')}`}
          />
          <Row
            label={t('business.postShift.workers')}
            value={`${summary.workersNeeded}`}
          />
          <Row
            label={t('business.postShift.proHourlyRateLabel')}
            value={formatIQD(summary.proHourlyRateIQD)}
          />
          <Row
            label={t('business.postShift.totalProPay')}
            value={formatIQD(summary.totalProPayIQD)}
          />
          <Row
            label={t('business.postShift.platformFee')}
            value={formatIQD(summary.platformFeeIQD)}
          />
          <Row
            label={t('business.postShift.grandTotal')}
            value={formatIQD(summary.grandTotalIQD)}
            bold
          />
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
    </div>
  );
}
