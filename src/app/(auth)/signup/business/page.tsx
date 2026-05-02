'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Toast, useToast } from '@/components/ui/Toast';
import { signupBusinessSchema, type SignupBusinessInput } from '@/lib/validations/auth.schema';
import { CITIES, BUSINESS_TYPES } from '@/lib/constants';

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

const STEP_TITLES = [
  { heading: 'Create your account', sub: 'Tell us about yourself.' },
  { heading: 'Your business',       sub: 'Help businesses find you faster.' },
  { heading: 'Set up access',       sub: 'Create a secure password.' },
];

/* ─── Page ───────────────────────────────────────────────────── */

export default function SignupBusinessPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast, dismiss } = useToast();

  const [step, setStep] = useState(1);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState('');

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupBusinessInput>({
    resolver: zodResolver(signupBusinessSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const password = watch('password') ?? '';

  useEffect(() => {
    setValue('confirmPassword', password);
  }, [password, setValue]);

  async function handleNext(fields: (keyof SignupBusinessInput)[]) {
    const valid = await trigger(fields);
    if (valid) setStep((s) => s + 1);
  }

  async function onSubmit(data: SignupBusinessInput) {
    if (!termsAccepted) {
      setTermsError('You must accept the Terms & Privacy Policy to continue.');
      return;
    }
    setServerError('');
    setTermsError('');

    const res = await fetch('/api/auth/signup/business', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) {
      setServerError(json.error ?? t('common.error.generic'));
      return;
    }

    router.push(json.redirectTo);
  }

  const cityOptions    = CITIES.map((c)  => ({ value: c,  label: t(`cities.${c}`) }));
  const typeOptions    = BUSINESS_TYPES.map((bt) => ({ value: bt, label: bt }));

  const { heading, sub } = STEP_TITLES[step - 1];

  return (
    <>
      <div className="bg-white rounded-3xl shadow-sm border border-[#E7E2EF] p-8">

        {/* Role toggle */}
        <div className="flex gap-1 bg-[#F3F0FB] p-1 rounded-full mb-6">
          <Link
            href="/signup/pro"
            className="flex-1 py-2 px-4 text-[#8B8299] text-sm font-medium rounded-full text-center hover:text-[#12051F] transition-colors"
          >
            I&apos;m a Pro
          </Link>
          <span className="flex-1 py-2 px-4 bg-[#0F3D36] text-white text-sm font-bold rounded-full text-center">
            I&apos;m a Business
          </span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-1">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="h-1.5 rounded-full flex-1 transition-all duration-500"
              style={{ backgroundColor: s <= step ? '#0F3D36' : '#E7E2EF' }}
            />
          ))}
        </div>
        <p className="text-xs text-[#8B8299] mb-6">Step {step} of 3</p>

        <h1 className="text-2xl font-black text-[#12051F] mb-1">{heading}</h1>
        <p className="text-[#8B8299] text-sm mb-6">{sub}</p>

        {/* ── Step 1: Personal ── */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <Input
              label={t('auth.signupBusiness.fullName')}
              type="text"
              placeholder={t('auth.signupBusiness.fullNamePlaceholder')}
              autoComplete="name"
              error={errors.fullName?.message}
              autoFocus
              {...register('fullName')}
            />

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
              label={t('auth.signupBusiness.phone')}
              type="tel"
              placeholder={t('auth.signupBusiness.phonePlaceholder')}
              autoComplete="tel"
              hint="e.g. 07901234567"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Button
              type="button"
              fullWidth
              size="lg"
              onClick={() => handleNext(['fullName', 'dateOfBirth', 'phone'])}
              className="mt-1"
            >
              Continue →
            </Button>
          </div>
        )}

        {/* ── Step 2: Business info ── */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <Input
              label={t('auth.signupBusiness.businessName')}
              type="text"
              placeholder={t('auth.signupBusiness.businessNamePlaceholder')}
              error={errors.businessName?.message}
              autoFocus
              {...register('businessName')}
            />

            <Select
              label={t('auth.signupBusiness.businessType')}
              placeholder={t('auth.signupBusiness.businessTypePlaceholder')}
              options={typeOptions}
              error={errors.businessType?.message}
              defaultValue=""
              {...register('businessType')}
            />

            <Select
              label={t('auth.signupBusiness.city')}
              placeholder={t('auth.signupBusiness.cityPlaceholder')}
              options={cityOptions}
              error={errors.city?.message}
              defaultValue=""
              {...register('city')}
            />

            {/* Verification hint */}
            <div className="flex items-start gap-2.5 bg-[#F7F4FC] rounded-xl px-4 py-3">
              <svg className="w-4 h-4 text-[#7426E8] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-[#8B8299] leading-relaxed">
                Business accounts are reviewed within <strong className="text-[#12051F]">24 hours</strong>. You can start posting shifts right away.
              </p>
            </div>

            <div className="flex gap-3 mt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3 text-sm font-semibold text-[#8B8299] hover:text-[#12051F] rounded-full border border-[#E7E2EF] hover:border-[#C9C4D2] transition-colors"
              >
                ← Back
              </button>
              <Button
                type="button"
                fullWidth
                size="lg"
                onClick={() => handleNext(['businessName', 'businessType', 'city'])}
              >
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Password ── */}
        {step === 3 && (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Input
                label={t('auth.signupBusiness.password')}
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.signupBusiness.passwordPlaceholder')}
                autoComplete="new-password"
                error={errors.password?.message}
                autoFocus
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
                onClick={() => setStep(2)}
                className="px-5 py-3 text-sm font-semibold text-[#8B8299] hover:text-[#12051F] rounded-full border border-[#E7E2EF] hover:border-[#C9C4D2] transition-colors"
              >
                ← Back
              </button>
              <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
                {t('auth.signupBusiness.submit')}
              </Button>
            </div>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-[#8B8299]">
          {t('auth.signupBusiness.haveAccount')}{' '}
          <Link href="/login" className="text-[#7426E8] font-semibold hover:underline">
            {t('auth.signupBusiness.login')}
          </Link>
        </p>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismiss} />}
    </>
  );
}
