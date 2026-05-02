'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';
import { JOB_TITLES } from '@/lib/constants';
import Button from '@/components/ui/Button';
import { Toast, useToast } from '@/components/ui/Toast';

interface ProProfileData {
  full_name: string;
  city: string;
  phone: string;
  bio: string | null;
  skills: string[];
  photo_url: string | null;
  average_rating: number;
  completed_shifts: number;
}

interface Props {
  initialData: ProProfileData;
}

export default function ProProfileForm({ initialData }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast, show, dismiss } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bio, setBio] = useState(initialData.bio ?? '');
  const [skills, setSkills] = useState<string[]>(initialData.skills);
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialData.photo_url);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function toggleSkill(skill: string) {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  async function handlePhotoUpload(file: File) {
    setUploading(true);
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const ext = file.name.split('.').pop();
      const path = `${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('pro-photos')
        .upload(path, file, { upsert: true });

      if (uploadError) {
        show('Photo upload failed. Make sure the pro-photos bucket exists.', 'error');
        return;
      }

      const { data } = supabase.storage.from('pro-photos').getPublicUrl(path);
      setPhotoUrl(data.publicUrl);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio, skills, photo_url: photoUrl }),
    });
    setSaving(false);

    if (!res.ok) {
      show(t('common.error.generic'), 'error');
      return;
    }

    show(t('pro.profile.success'), 'success');
    router.refresh();
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-[#E7E2EF] p-6 space-y-6">
        {/* Stats row */}
        <div className="flex items-center gap-6 pb-5 border-b border-[#E7E2EF]">
          {/* Avatar */}
          <div
            className="relative w-20 h-20 rounded-full border-4 border-[#E7E2EF] bg-[#F7F4FC] overflow-hidden shrink-0 cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            {photoUrl ? (
              <Image src={photoUrl} alt="Profile" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#8B8299] text-2xl font-semibold">
                {initialData.full_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {uploading ? '...' : t('pro.profile.photoChange')}
              </span>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePhotoUpload(file);
            }}
          />

          <div>
            <p className="text-2xl font-black text-[#12051F]">{initialData.full_name}</p>
            <p className="text-sm text-[#8B8299]">{initialData.city} · {initialData.phone}</p>
            <div className="flex gap-4 mt-2 text-sm text-[#8B8299]">
              <span>⭐ {Number(initialData.average_rating).toFixed(1)} {initialData.average_rating === 0 ? `(${t('pro.profile.noRatingYet')})` : ''}</span>
              <span>✓ {initialData.completed_shifts} {t('pro.profile.completedShifts')}</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-semibold text-[#12051F] mb-1.5">
            {t('pro.profile.bio')}
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={t('pro.profile.bioPlaceholder')}
            rows={4}
            className="w-full px-3 py-2 border border-[#E7E2EF] bg-[#F3F0FB] rounded-xl text-sm text-[#12051F] placeholder:text-[#C9C4D2] focus:outline-none focus:ring-2 focus:ring-[#7426E8] focus:bg-white resize-none"
          />
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-semibold text-[#12051F] mb-2">
            {t('pro.profile.skills')}
          </label>
          <div className="flex flex-wrap gap-2">
            {JOB_TITLES.map((skill) => {
              const selected = skills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    selected
                      ? 'bg-[#7426E8] text-white border-[#7426E8]'
                      : 'bg-[#F3F0FB] text-[#8B8299] border-[#E7E2EF] hover:border-[#7426E8]'
                  }`}
                >
                  {t(`jobRoles.${skill}`, { defaultValue: skill })}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save */}
        <div className="pt-2">
          <Button
            size="md"
            loading={saving || uploading}
            onClick={handleSave}
          >
            {t('pro.profile.saveProfile')}
          </Button>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismiss} />}
    </>
  );
}
