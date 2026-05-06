'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Toast, useToast } from '@/components/ui/Toast';
import { loginSchema, type LoginInput } from '@/lib/validations/auth.schema';
import { createClient } from '@/lib/supabase/client';
import { normalizePhone } from '@/lib/constants';
import { phoneToEmail } from '@/lib/auth';

interface Props {
  next?: string;
}

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

export default function LoginForm({ next }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast, show, dismiss } = useToast();
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [shake, setShake] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    if (serverError) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(t);
    }
  }, [serverError]);

  async function onSubmit(data: LoginInput) {
    setServerError('');

    const supabase = createClient();
    const email = phoneToEmail(normalizePhone(data.phone));

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: data.password,
    });

    if (error) {
      setServerError('Invalid phone number or password.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user!.id)
      .single();

    const defaultRedirect = userData?.role === 'business' ? '/business/dashboard' : '/pro/browse';
    const redirectTo = next?.startsWith('/') ? next : defaultRedirect;
    router.push(redirectTo);
  }

  return (
    <>
      <div className={`bg-white rounded-3xl shadow-sm border border-[#E7E2EF] p-8 ${shake ? 'animate-shake' : ''}`}>
        <h1 className="text-2xl font-black text-[#12051F] mb-1">{t('auth.login.title')}</h1>
        <p className="text-[#8B8299] text-sm mb-6">{t('auth.login.subtitle')}</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Input
            label={t('auth.login.phone')}
            type="tel"
            placeholder={t('auth.login.phonePlaceholder')}
            autoComplete="tel"
            hint="e.g. 07901234567"
            error={errors.phone?.message}
            autoFocus
            {...register('phone')}
          />

          <Input
            label={t('auth.login.password')}
            type={showPassword ? 'text' : 'password'}
            placeholder={t('auth.login.passwordPlaceholder')}
            autoComplete="current-password"
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

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#E7E2EF] accent-[#7426E8] cursor-pointer"
              />
              <span className="text-sm text-[#8B8299] group-hover:text-[#12051F] transition-colors select-none">
                Remember me
              </span>
            </label>
            <a href="#" className="text-sm text-[#7426E8] hover:underline font-medium">
              Forgot password?
            </a>
          </div>

          {serverError && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3" role="alert">
              {serverError}
            </p>
          )}

          <Button type="submit" fullWidth size="lg" loading={isSubmitting} className="mt-1">
            {t('auth.login.submit')}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#F3F0FB] text-center text-sm text-[#8B8299]">
          <p>
            {t('auth.login.noAccount')}{' '}
            <Link href="/signup/business" className="text-[#7426E8] font-semibold hover:underline">
              {t('auth.login.signupBusiness')}
            </Link>
            {' '}or{' '}
            <Link href="/signup/pro" className="text-[#7426E8] font-semibold hover:underline">
              {t('auth.login.signupPro')}
            </Link>
          </p>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismiss} />}
    </>
  );
}
