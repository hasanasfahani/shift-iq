'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Toast, useToast } from '@/components/ui/Toast';
import { signupProSchema, type SignupProInput } from '@/lib/validations/auth.schema';
import { CITIES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';

/* ─── Helpers ────────────────────────────────────────────────── */

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '' };
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;
  const map = [
    { label: '',       color: '' },
    { label: 'Weak',   color: '#EF4444' },
    { label: 'Fair',   color: '#F97316' },
    { label: 'Good',   color: '#28D96D' },
    { label: 'Strong', color: '#0F3D36' },
  ];
  return { score: s, ...map[Math.min(s, 4)] };
}

function PasswordStrengthBar({ password }: { password: string }) {
  const { score, label, color } = getPasswordStrength(password);
  if (!password) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: i <= score ? color : '#E7E2EF' }}
          />
        ))}
      </div>
      {label && (
        <p className="text-xs font-medium" style={{ color }}>
          {label} password
        </p>
      )}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */

export default function SignupProPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast, show, dismiss } = useToast();

  const [step, setStep] = useState(1);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupProInput>({
    resolver: zodResolver(signupProSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const password = watch('password') ?? '';

  // Keep confirmPassword in sync so the schema .refine() always passes
  useEffect(() => {
    setValue('confirmPassword', password);
  }, [password, setValue]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function uploadPhoto(userId: string): Promise<string | null> {
    if (!photoFile) return null;
    const supabase = createClient();
    const ext = photoFile.name.split('.').pop();
    const path = `${userId}.${ext}`;
    const { error } = await supabase.storage.from('pro-photos').upload(path, photoFile, { upsert: true });
    if (error) return null;
    const { data } = supabase.storage.from('pro-photos').getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleNext() {
    const valid = await trigger(['firstName', 'lastName', 'dateOfBirth', 'phone', 'city']);
    if (valid) setStep(2);
  }

  async function onSubmit(data: SignupProInput) {
    if (!termsAccepted) {
      setTermsError('You must accept the Terms & Privacy Policy to continue.');
      return;
    }
    setServerError('');
    setTermsError('');

    const res = await fetch('/api/auth/signup/pro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) {
      setServerError(json.error ?? t('common.error.generic'));
      return;
    }

    if (photoFile) {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user?.id) {
        const photoUrl = await uploadPhoto(sessionData.session.user.id);
        if (photoUrl) {
          await supabase
            .from('pro_profiles')
            .update({ photo_url: photoUrl })
            .eq('user_id', sessionData.session.user.id);
        }
      }
    }

    router.push(json.redirectTo);
  }

  const cityOptions = CITIES.map((c) => ({ value: c, label: t(`cities.${c}`) }));

  return (
    <>
      <div className="bg-white rounded-3xl shadow-sm border border-[#E7E2EF] p-8">

        {/* Role toggle */}
        <div className="flex gap-1 bg-[#F3F0FB] p-1 rounded-full mb-6">
          <span className="flex-1 py-2 px-4 bg-[#7426E8] text-white text-sm font-bold rounded-full text-center">
            I&apos;m a Pro
          </span>
          <Link
            href="/signup/business"
            className="flex-1 py-2 px-4 text-[#8B8299] text-sm font-medium rounded-full text-center hover:text-[#12051F] transition-colors"
          >
            I&apos;m a Business
          </Link>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-1">
          {[1, 2].map((s) => (
            <div
              key={s}
              className="h-1.5 rounded-full flex-1 transition-all duration-500"
              style={{ backgroundColor: s <= step ? '#7426E8' : '#E7E2EF' }}
            />
          ))}
        </div>
        <p className="text-xs text-[#8B8299] mb-6">Step {step} of 2</p>

        {/* ── Step 1: Personal details ── */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-black text-[#12051F] mb-1">{t('auth.signupPro.title')}</h1>
              <p className="text-[#8B8299] text-sm">{t('auth.signupPro.subtitle')}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t('auth.signupPro.firstName')}
                type="text"
                placeholder={t('auth.signupPro.firstNamePlaceholder')}
                autoComplete="given-name"
                error={errors.firstName?.message}
                autoFocus
                {...register('firstName')}
              />
              <Input
                label={t('auth.signupPro.lastName')}
                type="text"
                placeholder={t('auth.signupPro.lastNamePlaceholder')}
                autoComplete="family-name"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            <Input
              label="Date of birth"
              type="date"
              autoComplete="bday"
              hint="You must be 18 or older to register"
              error={errors.dateOfBirth?.message}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
              {...register('dateOfBirth')}
            />

            <Input
              label={t('auth.signupPro.phone')}
              type="tel"
              placeholder={t('auth.signupPro.phonePlaceholder')}
              autoComplete="tel"
              hint="e.g. 07901234567"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Select
              label={t('auth.signupPro.city')}
              placeholder={t('auth.signupPro.cityPlaceholder')}
              options={cityOptions}
              error={errors.city?.message}
              defaultValue=""
              {...register('city')}
            />

            <Button type="button" fullWidth size="lg" onClick={handleNext} className="mt-1">
              Continue →
            </Button>
          </div>
        )}

        {/* ── Step 2: Photo + password ── */}
        {step === 2 && (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-black text-[#12051F] mb-1">Set up your access</h1>
              <p className="text-[#8B8299] text-sm">Add a photo and create your password.</p>
            </div>

            {/* Photo upload */}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-[#12051F]">
                {t('auth.signupPro.photo')}{' '}
                <span className="text-[#C9C4D2] font-normal">({t('common.optional')})</span>
              </span>
              <div
                className="flex items-center gap-4 p-4 bg-[#F7F4FC] rounded-2xl border border-dashed border-[#E7E2EF] cursor-pointer hover:border-[#7426E8] transition-colors group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-14 h-14 rounded-full bg-white border-2 border-[#E7E2EF] flex items-center justify-center overflow-hidden shrink-0 group-hover:border-[#7426E8] transition-colors">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-6 h-6 text-[#C9C4D2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#7426E8]">
                    {photoPreview ? 'Change photo' : 'Upload a profile photo'}
                  </p>
                  <p className="text-xs text-[#8B8299] mt-0.5">JPG, PNG or WebP · Max 5 MB</p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <Input
                label={t('auth.signupPro.password')}
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.signupPro.passwordPlaceholder')}
                autoComplete="new-password"
                error={errors.password?.message}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-[#8B8299] hover:text-[#7426E8] transition-colors p-0.5"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                }
                {...register('password')}
              />
              <PasswordStrengthBar password={password} />
            </div>

            {/* Terms */}
            <div className="flex flex-col gap-1">
              <label className="flex items-start gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (e.target.checked) setTermsError('');
                  }}
                  className="mt-0.5 w-4 h-4 rounded border-[#E7E2EF] accent-[#7426E8] cursor-pointer shrink-0"
                />
                <span className="text-sm text-[#8B8299] leading-relaxed group-hover:text-[#12051F] transition-colors select-none">
                  I agree to Shift.iq&apos;s{' '}
                  <a href="#" className="text-[#7426E8] hover:underline font-medium">Terms of Service</a>{' '}
                  and{' '}
                  <a href="#" className="text-[#7426E8] hover:underline font-medium">Privacy Policy</a>
                </span>
              </label>
              {termsError && (
                <p className="text-xs text-red-600" role="alert">{termsError}</p>
              )}
            </div>

            {serverError && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3" role="alert">
                {serverError}
              </p>
            )}

            <div className="flex gap-3 mt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3 text-sm font-semibold text-[#8B8299] hover:text-[#12051F] rounded-full border border-[#E7E2EF] hover:border-[#C9C4D2] transition-colors"
              >
                ← Back
              </button>
              <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
                {t('auth.signupPro.submit')}
              </Button>
            </div>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-[#8B8299]">
          {t('auth.signupPro.haveAccount')}{' '}
          <Link href="/login" className="text-[#7426E8] font-semibold hover:underline">
            {t('auth.signupPro.login')}
          </Link>
        </p>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismiss} />}
    </>
  );
}
