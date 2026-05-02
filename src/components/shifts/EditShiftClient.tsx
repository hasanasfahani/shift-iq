'use client';

import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { shiftSchema, type ShiftInput } from '@/lib/validations/shift.schema';
import type { BusinessLocation, BusinessType } from '@/types';
import Button from '@/components/ui/Button';
import { Toast, useToast } from '@/components/ui/Toast';
import Step1Location from './PostShiftForm/Step1Location';
import Step2Details from './PostShiftForm/Step2Details';
import Step3Requirements from './PostShiftForm/Step3Requirements';

interface Props {
  shiftId: string;
  initialData: ShiftInput;
  locations: BusinessLocation[];
  businessType: BusinessType;
}

export default function EditShiftClient({ shiftId, initialData, locations, businessType }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast, show, dismiss } = useToast();

  const methods = useForm<ShiftInput>({
    resolver: zodResolver(shiftSchema),
    defaultValues: initialData,
    mode: 'onTouched',
  });

  const { handleSubmit, formState: { isSubmitting } } = methods;

  async function onSubmit(data: ShiftInput) {
    const res = await fetch(`/api/shifts/${shiftId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locationId: data.locationId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        workersNeeded: data.workersNeeded,
        proHourlyRateIQD: data.proHourlyRateIQD,
        shiftType: data.shiftType,
        description: data.description,
        whatToExpect: data.whatToExpect,
        clothingRules: data.clothingRules,
        requiredSkills: data.requiredSkills,
        preferredSkills: data.preferredSkills,
        rulesAndRegulations: data.rulesAndRegulations,
        cancellationPolicy: data.cancellationPolicy,
        paymentTerms: data.paymentTerms,
        specialBadge: data.specialBadge,
      }),
    });

    if (!res.ok) {
      const json = await res.json();
      show(json.error ?? t('common.error.generic'), 'error');
      return;
    }

    show('Shift updated', 'success');
    setTimeout(() => router.push('/business/shifts'), 1200);
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
        <div className="bg-white rounded-2xl border border-[#E7E2EF] p-6">
          <h2 className="text-base font-black text-[#12051F] mb-4">Location</h2>
          <Step1Location locations={locations} />
        </div>

        <div className="bg-white rounded-2xl border border-[#E7E2EF] p-6">
          <h2 className="text-base font-black text-[#12051F] mb-4">Shift details</h2>
          <Step2Details businessType={businessType} />
        </div>

        <div className="bg-white rounded-2xl border border-[#E7E2EF] p-6">
          <h2 className="text-base font-black text-[#12051F] mb-4">Requirements</h2>
          <Step3Requirements />
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={() => router.push('/business/shifts')}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Save changes
          </Button>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismiss} />}
    </FormProvider>
  );
}
