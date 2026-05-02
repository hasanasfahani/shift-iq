'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Toast, useToast } from '@/components/ui/Toast';
import { CITIES } from '@/lib/constants';
import type { IraqiCity, UserRole } from '@/types';
import { createBrowserClient } from '@supabase/ssr';

interface Props {
  initialFullName: string;
  initialCity: IraqiCity;
  phone: string;
  role: UserRole;
}

export default function SettingsForm({ initialFullName, initialCity, phone, role }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast, show, dismiss } = useToast();

  // Profile section
  const [fullName, setFullName] = useState(initialFullName);
  const [city, setCity] = useState<IraqiCity>(initialCity);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password section
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Delete section
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dashboardHref = role === 'business' ? '/business/dashboard' : '/pro/dashboard';

  async function saveProfile() {
    setSavingProfile(true);
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, city }),
    });
    setSavingProfile(false);

    if (!res.ok) {
      show(t('common.error.generic'), 'error');
      return;
    }

    show(t('settings.success.updated'), 'success');
    router.refresh();
  }

  async function changePassword() {
    if (newPassword !== confirmPassword) {
      show(t('settings.error.passwordMismatch'), 'error');
      return;
    }
    if (newPassword.length < 8) {
      show(t('auth.signupPro.error.weakPassword'), 'error');
      return;
    }

    setSavingPassword(true);
    const res = await fetch('/api/settings/password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setSavingPassword(false);

    const json = await res.json();
    if (!res.ok) {
      show(json.error ?? t('common.error.generic'), 'error');
      return;
    }

    show(t('settings.success.passwordChanged'), 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }

  async function deleteAccount() {
    setDeleting(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    // Sign out after server-side delete — the cascade on auth.users handles DB cleanup
    // For MVP: sign out then let the user know to contact support for full deletion
    // Full admin delete requires service role which can't be called client-side
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <>
      <div className="space-y-6">
        {/* Back link */}
        <a href={dashboardHref} className="text-sm text-[#7426E8] hover:underline flex items-center gap-1">
          ← Dashboard
        </a>

        <h1 className="text-2xl font-black text-[#12051F]">{t('settings.title')}</h1>

        {/* Profile section */}
        <div className="bg-[#F7F4FC] rounded-2xl border border-[#E7E2EF] p-5">
          <h2 className="font-semibold text-[#12051F] mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#12051F] mb-1.5">
                {t('settings.fullName')}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-[#E7E2EF] bg-[#F3F0FB] rounded-xl text-sm text-[#12051F] focus:outline-none focus:ring-2 focus:ring-[#7426E8] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#12051F] mb-1.5">
                {t('settings.city')}
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value as IraqiCity)}
                className="w-full px-3 py-2 border border-[#E7E2EF] rounded-xl text-sm bg-[#F3F0FB] text-[#12051F] focus:outline-none focus:ring-2 focus:ring-[#7426E8]"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#12051F] mb-1.5">Phone number</label>
              <input
                type="text"
                value={phone}
                disabled
                className="w-full px-3 py-2 border border-[#E7E2EF] rounded-xl text-sm bg-[#F7F4FC] text-[#C9C4D2] cursor-not-allowed"
              />
              <p className="text-xs text-[#8B8299] mt-1">Phone number cannot be changed</p>
            </div>

            <Button loading={savingProfile} onClick={saveProfile}>
              {t('settings.saveChanges')}
            </Button>
          </div>
        </div>

        {/* Password section */}
        <div className="bg-[#F7F4FC] rounded-2xl border border-[#E7E2EF] p-5">
          <h2 className="font-semibold text-[#12051F] mb-4">{t('settings.changePassword')}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#12051F] mb-1.5">
                {t('settings.currentPassword')}
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full px-3 py-2 border border-[#E7E2EF] bg-[#F3F0FB] rounded-xl text-sm text-[#12051F] focus:outline-none focus:ring-2 focus:ring-[#7426E8] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#12051F] mb-1.5">
                {t('settings.newPassword')}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full px-3 py-2 border border-[#E7E2EF] bg-[#F3F0FB] rounded-xl text-sm text-[#12051F] focus:outline-none focus:ring-2 focus:ring-[#7426E8] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#12051F] mb-1.5">
                {t('settings.confirmNewPassword')}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full px-3 py-2 border border-[#E7E2EF] bg-[#F3F0FB] rounded-xl text-sm text-[#12051F] focus:outline-none focus:ring-2 focus:ring-[#7426E8] focus:bg-white"
              />
            </div>

            <Button
              loading={savingPassword}
              disabled={!currentPassword || !newPassword || !confirmPassword}
              onClick={changePassword}
            >
              {t('settings.saveChanges')}
            </Button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-white border-2 border-red-200 rounded-2xl p-5">
          <h2 className="font-semibold text-red-700 mb-2">{t('settings.deleteAccount')}</h2>
          <p className="text-sm text-[#8B8299] mb-4">{t('settings.deleteWarning')}</p>
          <Button variant="danger" onClick={() => setDeleteModal(true)}>
            {t('settings.deleteAccount')}
          </Button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        title={t('settings.deleteConfirm')}
        maxWidth="sm"
      >
        <p className="text-sm text-[#8B8299] mb-6">{t('settings.deleteWarning')}</p>
        <div className="flex gap-3">
          <Button variant="ghost" fullWidth onClick={() => setDeleteModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" fullWidth loading={deleting} onClick={deleteAccount}>
            {t('settings.deleteButton')}
          </Button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismiss} />}
    </>
  );
}
