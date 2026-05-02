'use client';

import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import Select from '@/components/ui/Select';
import type { BusinessLocation } from '@/types';
import type { ShiftInput } from '@/lib/validations/shift.schema';

interface Props {
  locations: BusinessLocation[];
}

export default function Step1Location({ locations }: Props) {
  const { t } = useTranslation();
  const { register, watch, setValue, formState: { errors } } = useFormContext<ShiftInput>();

  const selectedId = watch('locationId');
  const selected = locations.find((l) => l.id === selectedId);

  const locationOptions = locations.map((l) => ({
    value: l.id,
    label: `${l.branch_name} — ${l.city}`,
  }));

  if (locations.length === 0) {
    return (
      <div className="bg-[#F7F4FC] border border-[#E7E2EF] rounded-xl p-5 text-center">
        <p className="text-[#12051F] font-medium mb-2">
          {t('business.postShift.noLocationAlert')}
        </p>
        <Link
          href="/business/locations"
          className="text-sm text-[#7426E8] font-medium hover:underline"
        >
          {t('business.postShift.addLocationLink')} →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Select
        label={t('business.postShift.branchLabel')}
        placeholder={t('business.postShift.branchPlaceholder')}
        options={locationOptions}
        error={errors.locationId?.message}
        defaultValue=""
        {...register('locationId')}
      />

      {selected && (
        <div className="bg-[#F7F4FC] rounded-xl border border-[#E7E2EF] p-4 flex flex-col gap-1.5 text-sm">
          <div className="flex gap-2">
            <span className="text-[#8B8299] w-16 shrink-0">{t('business.postShift.branchCity')}</span>
            <span className="text-[#12051F] font-medium">{selected.city}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-[#8B8299] w-16 shrink-0">{t('business.postShift.branchAddress')}</span>
            <span className="text-[#12051F]">{selected.address}</span>
          </div>
        </div>
      )}
    </div>
  );
}
