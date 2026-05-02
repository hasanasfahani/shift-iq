'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { shiftSchema, type ShiftInput } from '@/lib/validations/shift.schema';
import type { BusinessLocation, BusinessType, ShiftTemplate } from '@/types';
import Button from '@/components/ui/Button';
import { Toast, useToast } from '@/components/ui/Toast';
import Step1Location from './Step1Location';
import Step2Details from './Step2Details';
import Step3Requirements from './Step3Requirements';
import Step4Review from './Step4Review';

interface Props {
  locations: BusinessLocation[];
  businessType: BusinessType;
  initialTemplates: ShiftTemplate[];
}

const STEPS = [
  { key: 'location',     label: 'Location' },
  { key: 'details',      label: 'Details' },
  { key: 'requirements', label: 'Requirements' },
  { key: 'review',       label: 'Review' },
];

const STEP_FIELDS: Record<number, (keyof ShiftInput)[]> = {
  0: ['locationId'],
  1: ['jobTitle', 'date', 'startTime', 'endTime', 'workersNeeded', 'proHourlyRateIQD', 'shiftType'],
  2: ['whatToExpect'],
};

export default function PostShiftForm({ locations, businessType, initialTemplates }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast, show, dismiss } = useToast();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [armed, setArmed] = useState(false);
  const [templates, setTemplates] = useState<ShiftTemplate[]>(initialTemplates);
  const [showTemplates, setShowTemplates] = useState(initialTemplates.length > 0);

  const methods = useForm<ShiftInput>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      shiftType: 'one-time',
      workersNeeded: 1,
      description: '',
      whatToExpect: '',
      clothingRules: [],
      requiredSkills: [],
      preferredSkills: [],
      rulesAndRegulations: '',
      specialBadge: '',
    },
    mode: 'onTouched',
  });

  const { handleSubmit, trigger, reset, formState: { isSubmitting } } = methods;

  function loadTemplate(tpl: ShiftTemplate) {
    reset({
      locationId: tpl.location_id ?? '',
      jobTitle: tpl.job_title as any,
      shiftType: tpl.shift_type,
      workersNeeded: tpl.workers_needed,
      proHourlyRateIQD: tpl.pro_hourly_rate_iqd,
      description: tpl.description ?? '',
      whatToExpect: tpl.what_to_expect ?? '',
      clothingRules: tpl.clothing_rules,
      requiredSkills: tpl.required_skills,
      preferredSkills: tpl.preferred_skills ?? [],
      rulesAndRegulations: tpl.rules_and_regulations ?? '',
      cancellationPolicy: tpl.cancellation_policy ?? '',
      paymentTerms: tpl.payment_terms ?? '',
      specialBadge: tpl.special_badge ?? '',
      // date/time must be filled manually each time
      date: '',
      startTime: '',
      endTime: '',
    });
    setShowTemplates(false);
    show(`Template "${tpl.name}" loaded`, 'success');
  }

  async function deleteTemplate(id: string) {
    await fetch(`/api/shift-templates/${id}`, { method: 'DELETE' });
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }

  async function goNext() {
    const fieldsToValidate = STEP_FIELDS[step];
    const valid = fieldsToValidate ? await trigger(fieldsToValidate) : true;
    if (valid) { setArmed(false); setStep((s) => s + 1); }
  }

  async function onSubmit(data: ShiftInput) {
    const res = await fetch('/api/shifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) {
      show(json.error ?? t('common.error.generic'), 'error');
      return;
    }

    setSubmitted(true);
    setTimeout(() => router.push('/business/shifts'), 2500);
  }

  return (
    <FormProvider {...methods}>
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#12051F] mb-4">{t('business.postShift.title')}</h1>

          {/* Step indicator */}
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center gap-0 flex-1">
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      i < step
                        ? 'bg-[#0F3D36] text-white'
                        : i === step
                        ? 'bg-[#28D96D] text-[#0F3D36] ring-4 ring-[#DDF4EA]'
                        : 'bg-[#F3F0FB] text-[#C9C4D2]'
                    }`}
                  >
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-[#28D96D]' : 'text-[#C9C4D2]'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-[#28D96D]' : 'bg-[#E7E2EF]'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Template picker — shown above Step 0 when templates exist */}
        {step === 0 && templates.length > 0 && !submitted && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowTemplates((v) => !v)}
              className="flex items-center gap-2 text-sm font-semibold text-[#7426E8] hover:underline"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              {showTemplates ? 'Hide' : 'Load from'} templates ({templates.length})
            </button>

            {showTemplates && (
              <div className="mt-2 bg-white rounded-2xl border border-[#E7E2EF] overflow-hidden">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-[#F7F4FC] transition-colors border-b border-[#E7E2EF] last:border-b-0"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#12051F]">{tpl.name}</p>
                      <p className="text-xs text-[#8B8299]">
                        {tpl.job_title} · {tpl.workers_needed} worker{tpl.workers_needed !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => loadTemplate(tpl)}
                        className="px-3 py-1 rounded-full bg-[#E9DEFF] text-[#7426E8] text-xs font-semibold hover:bg-[#7426E8] hover:text-white transition-colors"
                      >
                        Use
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTemplate(tpl.id)}
                        className="text-[#C9C4D2] hover:text-red-500 transition-colors"
                        aria-label="Delete template"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-[#E7E2EF] p-6">
          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="w-16 h-16 rounded-full bg-[#DDF4EA] flex items-center justify-center">
                <svg className="w-8 h-8 text-[#28D96D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-black text-[#0F3D36]">{t('business.postShift.success')}</p>
                <p className="text-sm text-[#8B8299] mt-1">{t('business.postShift.redirecting')}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {step === 0 && <Step1Location locations={locations} />}
              {step === 1 && <Step2Details businessType={businessType} />}
              {step === 2 && <Step3Requirements />}
              {step === 3 && (
                <Step4Review
                  locations={locations}
                  onTemplateSaved={() => {
                    // Refresh templates list silently
                    fetch('/api/shift-templates')
                      .then((r) => r.json())
                      .then((json) => setTemplates(json.templates ?? []));
                  }}
                />
              )}

              <div className="flex gap-3 mt-6 pt-5 border-t border-[#E7E2EF]">
                {step > 0 && (
                  <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)} className="w-28">
                    ← {t('common.back')}
                  </Button>
                )}
                <div className="flex-1" />
                {step < STEPS.length - 1 ? (
                  <Button type="button" onClick={goNext} disabled={locations.length === 0}>
                    {t('common.next')} →
                  </Button>
                ) : armed ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#8B8299]">Ready to publish?</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setArmed(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button type="submit" loading={isSubmitting}>
                      {t('business.postShift.confirmPost')}
                    </Button>
                  </div>
                ) : (
                  <Button type="button" onClick={() => setArmed(true)}>
                    {t('business.postShift.confirmPost')}
                  </Button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismiss} />}
    </FormProvider>
  );
}
