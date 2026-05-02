'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { BUSINESS_TYPES } from '@/lib/constants';
import type { BusinessType } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Toast, useToast } from '@/components/ui/Toast';

const profileSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  businessType: z.enum(BUSINESS_TYPES as [string, ...string[]], { error: 'Select a business type' }),
  description: z.string().optional(),
  photoUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
});

type ProfileInput = z.infer<typeof profileSchema>;

interface InitialProfile {
  businessName: string;
  businessType: BusinessType;
  description: string;
  photoUrl: string;
  averageRating: number;
  totalRatings: number;
  isVerified: boolean;
}

interface Props {
  initialProfile: InitialProfile;
}

export default function BusinessProfileClient({ initialProfile }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast, show, dismiss } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      businessName: initialProfile.businessName,
      businessType: initialProfile.businessType,
      description: initialProfile.description,
      photoUrl: initialProfile.photoUrl,
    },
  });

  async function onSubmit(data: ProfileInput) {
    const res = await fetch('/api/business/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: data.businessName,
        businessType: data.businessType,
        description: data.description,
        photoUrl: data.photoUrl,
      }),
    });

    if (!res.ok) {
      const json = await res.json();
      show(json.error ?? t('common.error.generic'), 'error');
      return;
    }

    show('Profile updated successfully', 'success');
    router.refresh();
  }

  return (
    <>
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#12051F]">Business Profile</h1>
          <p className="text-sm text-[#8B8299] mt-1">Manage how your business appears to workers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[#F7F4FC] rounded-2xl p-4 text-center border border-[#E7E2EF]">
            <p className="text-xl font-black text-[#12051F]">
              {initialProfile.averageRating > 0 ? Number(initialProfile.averageRating).toFixed(1) : '—'}
            </p>
            <p className="text-xs text-[#8B8299] mt-0.5">Avg rating</p>
          </div>
          <div className="bg-[#F7F4FC] rounded-2xl p-4 text-center border border-[#E7E2EF]">
            <p className="text-xl font-black text-[#12051F]">{initialProfile.totalRatings}</p>
            <p className="text-xs text-[#8B8299] mt-0.5">Reviews</p>
          </div>
          <div className="bg-[#F7F4FC] rounded-2xl p-4 text-center border border-[#E7E2EF]">
            {initialProfile.isVerified ? (
              <>
                <p className="text-xl font-black text-[#28D96D]">✓</p>
                <p className="text-xs text-[#8B8299] mt-0.5">Verified</p>
              </>
            ) : (
              <>
                <p className="text-xl font-black text-[#C9C4D2]">—</p>
                <p className="text-xs text-[#8B8299] mt-0.5">Not verified</p>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7E2EF] p-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
            <Input
              label="Business name"
              placeholder="e.g. Grand Babylon Hotel"
              error={errors.businessName?.message}
              {...register('businessName')}
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#12051F]">Business type</label>
              <select
                className="w-full rounded-xl border border-[#E7E2EF] bg-[#F3F0FB] px-3 py-2.5 text-sm text-[#12051F] appearance-none focus:outline-none focus:ring-2 focus:ring-[#7426E8]"
                {...register('businessType')}
              >
                {BUSINESS_TYPES.map((bt) => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
              {errors.businessType && (
                <p className="text-xs text-red-600">{errors.businessType.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#12051F]">
                Description <span className="text-[#C9C4D2] font-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Tell workers about your business, culture, and what to expect."
                className="w-full rounded-xl border border-[#E7E2EF] bg-[#F3F0FB] px-3 py-2.5 text-sm text-[#12051F] placeholder:text-[#C9C4D2] focus:outline-none focus:ring-2 focus:ring-[#7426E8] resize-none"
                {...register('description')}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Input
                label="Profile photo URL"
                type="url"
                placeholder="https://example.com/logo.jpg (optional)"
                error={errors.photoUrl?.message}
                {...register('photoUrl')}
              />
              <p className="text-xs text-[#8B8299]">Shown on your business listing and shift cards.</p>
              {initialProfile.photoUrl && (
                <div className="mt-1">
                  <img
                    src={initialProfile.photoUrl}
                    alt="Business photo"
                    className="w-16 h-16 rounded-xl object-cover border border-[#E7E2EF]"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-1 border-t border-[#E7E2EF]">
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={!isDirty}
              >
                Save changes
              </Button>
            </div>
          </form>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismiss} />}
    </>
  );
}
