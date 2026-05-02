'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import type { ShiftInput } from '@/lib/validations/shift.schema';
import type { BusinessType } from '@/types';
import { ROLES_BY_BUSINESS_TYPE, SHIFT_TYPES } from '@/lib/constants';

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

const selectCls = (hasError: boolean) =>
  [
    'w-full rounded-xl border bg-[#F3F0FB] px-3 py-2.5 text-sm text-[#12051F]',
    'appearance-none transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-[#7426E8] focus:border-[#7426E8]',
    hasError ? 'border-red-400' : 'border-[#E7E2EF] hover:border-[#7426E8]',
  ].join(' ');

function TimeSelect({
  field,
  label,
  error,
}: {
  field: 'startTime' | 'endTime';
  label: string;
  error?: string;
}) {
  const { setValue, watch } = useFormContext<ShiftInput>();
  const raw = watch(field) ?? '';
  const [hh = '', mm = ''] = raw.split(':');

  function set(newH: string, newM: string) {
    if (newH && newM) {
      setValue(field, `${newH}:${newM}`, { shouldValidate: true, shouldDirty: true });
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-[#12051F]">{label}</label>
      <div className="flex items-center gap-2">
        <select
          value={hh}
          onChange={(e) => set(e.target.value, mm || '00')}
          className={selectCls(!!error)}
        >
          <option value="" disabled>HH</option>
          {HOURS.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
        <span className="text-lg font-semibold text-[#C9C4D2] shrink-0">:</span>
        <select
          value={mm}
          onChange={(e) => set(hh || '00', e.target.value)}
          className={selectCls(!!error)}
        >
          <option value="" disabled>MM</option>
          {MINUTES.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function Step2Details({ businessType }: { businessType: BusinessType }) {
  const { t } = useTranslation();
  const { register, formState: { errors } } = useFormContext<ShiftInput>();

  const today = new Date().toISOString().split('T')[0];

  const jobOptions = ROLES_BY_BUSINESS_TYPE[businessType].map((j) => ({ value: j, label: t(`jobRoles.${j}`) }));
  const shiftTypeOptions = SHIFT_TYPES.map((s) => ({ value: s, label: t(`shiftTypes.${s}`) }));

  return (
    <div className="flex flex-col gap-4">
      <Select
        label={t('business.postShift.jobTitle')}
        placeholder={t('business.postShift.jobTitlePlaceholder')}
        options={jobOptions}
        error={errors.jobTitle?.message}
        defaultValue=""
        {...register('jobTitle')}
      />

      <Input
        label={t('business.postShift.date')}
        type="date"
        min={today}
        error={errors.date?.message}
        {...register('date')}
      />

      <div className="grid grid-cols-2 gap-3">
        <TimeSelect
          field="startTime"
          label={t('business.postShift.startTime')}
          error={errors.startTime?.message}
        />
        <TimeSelect
          field="endTime"
          label={t('business.postShift.endTime')}
          error={errors.endTime?.message}
        />
      </div>

      <Input
        label={t('business.postShift.workersNeeded')}
        type="number"
        min={1}
        placeholder="1"
        error={errors.workersNeeded?.message}
        {...register('workersNeeded', { valueAsNumber: true })}
      />

      <Input
        label={t('business.postShift.proHourlyRate')}
        type="number"
        min={1}
        placeholder={t('business.postShift.proHourlyRatePlaceholder')}
        error={errors.proHourlyRateIQD?.message}
        {...register('proHourlyRateIQD', { valueAsNumber: true })}
      />

      <Select
        label={t('business.postShift.shiftType')}
        options={shiftTypeOptions}
        error={errors.shiftType?.message}
        defaultValue="one-time"
        {...register('shiftType')}
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-[#12051F]">
          {t('business.postShift.description')}{' '}
          <span className="text-[#C9C4D2] font-normal">({t('common.optional')})</span>
        </label>
        <textarea
          rows={3}
          placeholder={t('business.postShift.descriptionPlaceholder')}
          className="w-full rounded-xl border border-[#E7E2EF] bg-[#F3F0FB] px-3 py-2.5 text-sm text-[#12051F] placeholder:text-[#C9C4D2] focus:outline-none focus:ring-2 focus:ring-[#7426E8] focus:border-[#7426E8] focus:bg-white hover:border-[#7426E8] transition-colors resize-none"
          {...register('description')}
        />
      </div>
    </div>
  );
}
