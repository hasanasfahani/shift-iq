'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { ShiftInput } from '@/lib/validations/shift.schema';
import { CLOTHING_OPTIONS, CANCELLATION_POLICIES, PAYMENT_TERMS, SPECIAL_BADGES, SKILLS_BY_ROLE } from '@/lib/constants';
import type { JobTitle } from '@/types';

const selectCls = (hasError: boolean) =>
  [
    'w-full rounded-xl border bg-[#F3F0FB] px-3 py-2.5 text-sm text-[#12051F]',
    'appearance-none transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-[#7426E8] focus:border-[#7426E8]',
    hasError ? 'border-red-400' : 'border-[#E7E2EF] hover:border-[#7426E8]',
  ].join(' ');

function TagPicker({
  label,
  options,
  fieldName,
  description,
}: {
  label: string;
  options: readonly string[];
  fieldName: 'clothingRules' | 'requiredSkills' | 'preferredSkills';
  description?: string;
}) {
  const { setValue, watch } = useFormContext<ShiftInput>();
  const selected: string[] = watch(fieldName) ?? [];

  function toggle(option: string) {
    if (selected.includes(option)) {
      setValue(fieldName, selected.filter((s) => s !== option), { shouldDirty: true });
    } else {
      setValue(fieldName, [...selected, option], { shouldDirty: true });
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-[#12051F]">{label}</label>
      {description && <p className="text-xs text-[#8B8299]">{description}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isSelected
                  ? 'bg-[#7426E8] text-white'
                  : 'bg-[#F3F0FB] text-[#8B8299] hover:bg-[#E9DEFF] hover:text-[#7426E8]'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const BADGE_OPTIONS = [
  { value: '', label: 'None', color: '#C9C4D2' },
  ...SPECIAL_BADGES,
];

function BadgePicker() {
  const { setValue, watch } = useFormContext<ShiftInput>();
  const selected = watch('specialBadge') ?? '';

  return (
    <div className="flex flex-wrap gap-2">
      {BADGE_OPTIONS.map((badge) => {
        const isSelected = selected === badge.value;
        return (
          <button
            key={badge.value || 'none'}
            type="button"
            onClick={() => setValue('specialBadge', badge.value, { shouldDirty: true })}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              isSelected
                ? 'text-white border-transparent'
                : 'bg-[#F3F0FB] text-[#8B8299] border-[#E7E2EF] hover:border-[#7426E8]'
            }`}
            style={isSelected ? { backgroundColor: badge.color } : {}}
          >
            {badge.label}
          </button>
        );
      })}
    </div>
  );
}

export default function Step3Requirements() {
  const { t } = useTranslation();
  const { register, formState: { errors } } = useFormContext<ShiftInput>();
  const jobTitle = useWatch<ShiftInput, 'jobTitle'>({ name: 'jobTitle' }) as JobTitle | undefined;

  const skillOptions = jobTitle ? (SKILLS_BY_ROLE[jobTitle] ?? []) : [];

  return (
    <div className="flex flex-col gap-5">
      {/* What to expect */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-[#12051F]">What to expect</label>
        <p className="text-xs text-[#8B8299]">
          Describe the work environment, pace, and tasks. Workers see this before applying.
        </p>
        <textarea
          rows={4}
          placeholder="e.g. Fast-paced restaurant during peak dinner hours. A supervisor will brief you on arrival. Breaks every 2 hours."
          className={`w-full rounded-xl border bg-[#F3F0FB] px-3 py-2.5 text-sm text-[#12051F] placeholder:text-[#C9C4D2] focus:outline-none focus:ring-2 focus:ring-[#7426E8] focus:border-[#7426E8] focus:bg-white hover:border-[#7426E8] transition-colors resize-none ${
            errors.whatToExpect ? 'border-red-400' : 'border-[#E7E2EF]'
          }`}
          {...register('whatToExpect')}
        />
        {errors.whatToExpect && (
          <p className="text-xs text-red-600" role="alert">{errors.whatToExpect.message}</p>
        )}
      </div>

      {/* Required skills */}
      {skillOptions.length > 0 && (
        <TagPicker
          label="Required skills"
          options={skillOptions}
          fieldName="requiredSkills"
          description="Workers will be shown which skills they match. Missing skills don't block applications."
        />
      )}

      {/* Preferred skills */}
      {skillOptions.length > 0 && (
        <TagPicker
          label="Preferred skills"
          options={skillOptions}
          fieldName="preferredSkills"
          description="Nice-to-have skills. Workers with these will be highlighted in your applicant list."
        />
      )}

      {/* Clothing rules */}
      <TagPicker
        label="Clothing requirements"
        options={CLOTHING_OPTIONS}
        fieldName="clothingRules"
      />

      {/* Rules and regulations */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-[#12051F]">
          Rules & regulations{' '}
          <span className="text-[#C9C4D2] font-normal">({t('common.optional')})</span>
        </label>
        <p className="text-xs text-[#8B8299]">
          Health & safety rules, site policies, or conduct requirements workers must follow.
        </p>
        <textarea
          rows={3}
          placeholder="e.g. No phone use on the floor. Mandatory safety briefing on arrival. No-show will be reported."
          className="w-full rounded-xl border border-[#E7E2EF] bg-[#F3F0FB] px-3 py-2.5 text-sm text-[#12051F] placeholder:text-[#C9C4D2] focus:outline-none focus:ring-2 focus:ring-[#7426E8] focus:border-[#7426E8] hover:border-[#7426E8] transition-colors resize-none"
          {...register('rulesAndRegulations')}
        />
      </div>

      {/* Cancellation policy */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-[#12051F]">
          Cancellation policy{' '}
          <span className="text-[#C9C4D2] font-normal">({t('common.optional')})</span>
        </label>
        <select className={selectCls(false)} {...register('cancellationPolicy')}>
          <option value="">No specific policy</option>
          {CANCELLATION_POLICIES.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Payment terms */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-[#12051F]">
          Payment terms{' '}
          <span className="text-[#C9C4D2] font-normal">({t('common.optional')})</span>
        </label>
        <select className={selectCls(false)} {...register('paymentTerms')}>
          <option value="">Not specified</option>
          {PAYMENT_TERMS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Special badge */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-[#12051F]">
          Highlight badge{' '}
          <span className="text-[#C9C4D2] font-normal">({t('common.optional')})</span>
        </label>
        <p className="text-xs text-[#8B8299]">Add a badge to attract more applicants.</p>
        <BadgePicker />
      </div>
    </div>
  );
}
