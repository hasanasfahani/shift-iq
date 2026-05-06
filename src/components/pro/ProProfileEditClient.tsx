'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';
import {
  JOB_TITLES,
  SKILLS_BY_ROLE,
  DAYS_OF_WEEK,
  WEEKLY_HOURS_OPTIONS,
  WORK_TYPE_OPTIONS,
  SHIFT_PREFERENCE_OPTIONS,
  CITIES,
} from '@/lib/constants';
import type { ProExperience } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Toast, useToast } from '@/components/ui/Toast';

interface InitialData {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  fullName: string;
  photoUrl: string | null;
  bio: string;
  roles: string[];
  skillsByRole: Record<string, string[]>;
  yearsPerRole: Record<string, number>;
  daysAvailability: string[];
  weeklyHours: string | null;
  workType: string[];
  shiftPreference: string[];
  averageRating: number;
  completedShifts: number;
  experiences: ProExperience[];
}

interface Props {
  initialData: InitialData;
}

type Section = 'personal' | 'availability' | 'roles' | 'skills' | 'experience' | 'bio';

const SECTIONS: { key: Section; label: string; icon: React.ReactNode }[] = [
  {
    key: 'personal',
    label: 'Personal info',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    key: 'availability',
    label: 'Availability',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    key: 'roles',
    label: 'Roles',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    key: 'skills',
    label: 'Skills',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    key: 'experience',
    label: 'Experience',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    key: 'bio',
    label: 'About',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
];

function toggleArray<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

export default function ProProfileEditClient({ initialData }: Props) {
  const router = useRouter();
  const { toast, show, dismiss } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>('personal');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Personal
  const [firstName, setFirstName] = useState(initialData.firstName || initialData.fullName.split(' ')[0] || '');
  const [lastName, setLastName] = useState(initialData.lastName || initialData.fullName.split(' ').slice(1).join(' ') || '');
  const [phone, setPhone] = useState(initialData.phone);
  const [city, setCity] = useState(initialData.city);
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialData.photoUrl);

  // Availability
  const [daysAvailability, setDaysAvailability] = useState<string[]>(initialData.daysAvailability);
  const [weeklyHours, setWeeklyHours] = useState<string | null>(initialData.weeklyHours);
  const [workType, setWorkType] = useState<string[]>(initialData.workType);
  const [shiftPreference, setShiftPreference] = useState<string[]>(initialData.shiftPreference);

  // Roles
  const [roles, setRoles] = useState<string[]>(initialData.roles);
  const [yearsPerRole, setYearsPerRole] = useState<Record<string, number>>(initialData.yearsPerRole);

  // Skills
  const [skillsByRole, setSkillsByRole] = useState<Record<string, string[]>>(initialData.skillsByRole);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  // Experience
  const [experiences, setExperiences] = useState<ProExperience[]>(initialData.experiences);
  const [showExpForm, setShowExpForm] = useState(false);
  const [expPosition, setExpPosition] = useState('');
  const [expBusiness, setExpBusiness] = useState('');
  const [expStartDate, setExpStartDate] = useState('');
  const [expEndDate, setExpEndDate] = useState('');
  const [expIsCurrent, setExpIsCurrent] = useState(false);
  const [expSaving, setExpSaving] = useState(false);

  // Bio
  const [bio, setBio] = useState(initialData.bio);

  async function handlePhotoUpload(file: File) {
    setUploading(true);
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('pro-photos').upload(path, file, { upsert: true });
      if (error) { show('Photo upload failed', 'error'); return; }
      const { data } = supabase.storage.from('pro-photos').getPublicUrl(path);
      setPhotoUrl(data.publicUrl);
    } finally {
      setUploading(false);
    }
  }

  function handleCancel() {
    setFirstName(initialData.firstName || initialData.fullName.split(' ')[0] || '');
    setLastName(initialData.lastName || initialData.fullName.split(' ').slice(1).join(' ') || '');
    setPhone(initialData.phone);
    setCity(initialData.city);
    setPhotoUrl(initialData.photoUrl);
    setDaysAvailability(initialData.daysAvailability);
    setWeeklyHours(initialData.weeklyHours);
    setWorkType(initialData.workType);
    setShiftPreference(initialData.shiftPreference);
    setRoles(initialData.roles);
    setYearsPerRole(initialData.yearsPerRole);
    setSkillsByRole(initialData.skillsByRole);
    setBio(initialData.bio);
    setIsEditing(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        firstName,
        lastName,
        city,
        photoUrl,
        daysAvailability,
        weeklyHours,
        workType,
        shiftPreference,
        roles,
        yearsPerRole,
        skillsByRole,
        about: bio,
      };

      const [onboardingRes, profileRes] = await Promise.all([
        fetch('/api/pro/onboarding', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }),
        fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bio, skills: roles, photo_url: photoUrl }),
        }),
      ]);

      if (!onboardingRes.ok || !profileRes.ok) {
        show('Failed to save changes', 'error');
        return;
      }

      show('Profile updated', 'success');
      setIsEditing(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleAddExperience() {
    if (!expPosition || !expBusiness || !expStartDate) return;
    setExpSaving(true);
    try {
      const res = await fetch('/api/pro/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experiences: {
            action: 'add',
            experience: {
              position: expPosition,
              business_name: expBusiness,
              start_date: expStartDate,
              end_date: expIsCurrent ? null : expEndDate || null,
              is_current: expIsCurrent,
            },
          },
        }),
      });
      if (res.ok) {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: exps } = await supabase
            .from('pro_experiences')
            .select('*')
            .eq('pro_id', user.id)
            .order('start_date', { ascending: false });
          setExperiences(exps ?? []);
        }
        setShowExpForm(false);
        setExpPosition(''); setExpBusiness('');
        setExpStartDate(''); setExpEndDate('');
        setExpIsCurrent(false);
        show('Experience added', 'success');
      }
    } finally {
      setExpSaving(false);
    }
  }

  async function handleDeleteExperience(id: string) {
    await fetch('/api/pro/onboarding', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ experiences: { action: 'delete', experienceId: id } }),
    });
    setExperiences((prev) => prev.filter((e) => e.id !== id));
    show('Experience removed', 'success');
  }

  function toggleRoleSkill(role: string, skill: string) {
    setSkillsByRole((prev) => {
      const current = prev[role] ?? [];
      return {
        ...prev,
        [role]: current.includes(skill) ? current.filter((s) => s !== skill) : [...current, skill],
      };
    });
  }

  const displayName = [firstName, lastName].filter(Boolean).join(' ') || initialData.fullName;
  const initials = displayName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page header */}
      <div className="flex items-center gap-4 mb-6">
        {/* Avatar */}
        <div
          className={`relative shrink-0 ${isEditing ? 'cursor-pointer group' : 'cursor-default'}`}
          onClick={() => isEditing && fileInputRef.current?.click()}
        >
          <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-[#E7E2EF] bg-gradient-to-br from-[#7426E8] to-[#5C1FBA]">
            {photoUrl ? (
              <Image src={photoUrl} alt="Profile" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-black text-lg">
                {initials || '?'}
              </div>
            )}
            <div className={`absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center rounded-2xl ${isEditing ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'}`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); }}
        />

        <div>
          <h1 className="text-xl font-black text-[#12051F]">{displayName || 'Your Profile'}</h1>
          <p className="text-xs text-[#8B8299] mt-0.5">
            {initialData.averageRating > 0 ? `${Number(initialData.averageRating).toFixed(1)} · ` : ''}
            {initialData.completedShifts} shift{initialData.completedShifts !== 1 ? 's' : ''} completed
          </p>
          {isEditing && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-[#7426E8] font-semibold hover:underline mt-1"
            >
              Change photo
            </button>
          )}
        </div>
      </div>

      {/* Section nav */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-5 scrollbar-hide">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setActiveSection(s.key)}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeSection === s.key
                ? 'bg-[#7426E8] text-white'
                : 'bg-[#F3F0FB] text-[#8B8299] hover:text-[#7426E8]'
            }`}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div className="rounded-2xl border border-[#E7E2EF] bg-white p-6">

        {/* ── PERSONAL ── */}
        {activeSection === 'personal' && (
          <div className="space-y-4">
            <SectionHeading title="Personal information" subtitle="Your name, city, and contact details" />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First"
                disabled={!isEditing}
              />
              <Input
                label="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last"
                disabled={!isEditing}
              />
            </div>
            <Input
              label="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+964 7xx xxx xxxx"
              type="tel"
              disabled={!isEditing}
            />
            <div>
              <label className="block text-sm font-semibold text-[#12051F] mb-1.5">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2.5 border border-[#E7E2EF] bg-[#F3F0FB] rounded-xl text-sm text-[#12051F] focus:outline-none focus:ring-2 focus:ring-[#7426E8] focus:bg-white disabled:opacity-60 disabled:cursor-default"
              >
                <option value="">Select city</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* ── AVAILABILITY ── */}
        {activeSection === 'availability' && (
          <div className="space-y-5">
            <SectionHeading title="Work availability" subtitle="Tell businesses when and how you prefer to work" />

            <div>
              <label className="block text-sm font-semibold text-[#12051F] mb-2">Available days</label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <ToggleChip
                    key={day}
                    label={day}
                    active={daysAvailability.includes(day)}
                    onClick={() => setDaysAvailability((prev) => toggleArray(prev, day))}
                    readOnly={!isEditing}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#12051F] mb-2">Hours per week</label>
              <div className="flex flex-wrap gap-2">
                {WEEKLY_HOURS_OPTIONS.map((opt) => (
                  <ToggleChip
                    key={opt}
                    label={opt}
                    active={weeklyHours === opt}
                    onClick={() => setWeeklyHours(weeklyHours === opt ? null : opt)}
                    readOnly={!isEditing}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#12051F] mb-2">Work type</label>
              <div className="flex flex-wrap gap-2">
                {WORK_TYPE_OPTIONS.map((opt) => (
                  <ToggleChip
                    key={opt}
                    label={opt}
                    active={workType.includes(opt)}
                    onClick={() => setWorkType((prev) => toggleArray(prev, opt))}
                    readOnly={!isEditing}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#12051F] mb-2">Shift preference</label>
              <div className="flex flex-wrap gap-2">
                {SHIFT_PREFERENCE_OPTIONS.map((opt) => (
                  <ToggleChip
                    key={opt}
                    label={opt}
                    active={shiftPreference.includes(opt)}
                    onClick={() => setShiftPreference((prev) => toggleArray(prev, opt))}
                    readOnly={!isEditing}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ROLES ── */}
        {activeSection === 'roles' && (
          <div className="space-y-5">
            <SectionHeading title="Roles you can fill" subtitle="Select all that apply · add years of experience per role" />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {JOB_TITLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  disabled={!isEditing}
                  onClick={() => {
                    setRoles((prev) => {
                      if (prev.includes(role)) {
                        setSkillsByRole((s) => { const n = { ...s }; delete n[role]; return n; });
                        setYearsPerRole((y) => { const n = { ...y }; delete n[role]; return n; });
                      }
                      return toggleArray(prev, role);
                    });
                  }}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors border disabled:cursor-default ${
                    roles.includes(role)
                      ? 'bg-[#7426E8] text-white border-[#7426E8]'
                      : 'bg-[#F3F0FB] text-[#8B8299] border-[#E7E2EF] hover:border-[#7426E8] hover:text-[#7426E8]'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {roles.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-[#12051F] mb-3">
                  Years of experience <span className="text-[#C9C4D2] font-normal">(optional)</span>
                </label>
                <div className="space-y-2">
                  {roles.map((role) => (
                    <div key={role} className="flex items-center justify-between bg-[#F7F4FC] rounded-xl border border-[#E7E2EF] px-4 py-2.5">
                      <span className="text-sm font-medium text-[#12051F]">{role}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={50}
                          placeholder="—"
                          disabled={!isEditing}
                          value={yearsPerRole[role] ?? ''}
                          onChange={(e) => {
                            const val = e.target.value === '' ? undefined : parseInt(e.target.value);
                            setYearsPerRole((prev) => {
                              const next = { ...prev };
                              if (val === undefined) delete next[role]; else next[role] = val;
                              return next;
                            });
                          }}
                          className="w-16 rounded-lg border border-[#E7E2EF] bg-white px-2 py-1 text-sm text-center text-[#12051F] focus:outline-none focus:ring-2 focus:ring-[#7426E8] disabled:opacity-60 disabled:cursor-default"
                        />
                        <span className="text-xs text-[#8B8299]">yrs</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SKILLS ── */}
        {activeSection === 'skills' && (
          <div className="space-y-4">
            <SectionHeading title="Skills by role" subtitle="Select specific skills for each of your roles" />

            {roles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-[#8B8299] mb-3">No roles selected yet.</p>
                <button
                  type="button"
                  onClick={() => setActiveSection('roles')}
                  className="text-sm font-semibold text-[#7426E8] hover:underline"
                >
                  Add roles first →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {roles.map((role) => {
                  const availableSkills = SKILLS_BY_ROLE[role as keyof typeof SKILLS_BY_ROLE] ?? [];
                  const selectedSkills = skillsByRole[role] ?? [];
                  const isExpanded = expandedRole === role;
                  return (
                    <div key={role} className="rounded-xl border border-[#E7E2EF] overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setExpandedRole(isExpanded ? null : role)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-[#F7F4FC] hover:bg-[#F3F0FB] transition-colors text-left"
                      >
                        <span className="text-sm font-semibold text-[#12051F]">{role}</span>
                        <div className="flex items-center gap-2">
                          {selectedSkills.length > 0 && (
                            <span className="text-xs font-bold text-[#7426E8] bg-[#E9DEFF] px-2 py-0.5 rounded-full">
                              {selectedSkills.length}
                            </span>
                          )}
                          <svg className={`w-4 h-4 text-[#8B8299] transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="p-4 flex flex-wrap gap-2">
                          {availableSkills.length > 0 ? availableSkills.map((skill) => (
                            <ToggleChip
                              key={skill}
                              label={skill}
                              active={selectedSkills.includes(skill)}
                              onClick={() => toggleRoleSkill(role, skill)}
                              readOnly={!isEditing}
                              small
                            />
                          )) : (
                            <p className="text-xs text-[#C9C4D2]">No specific skills listed for this role</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── EXPERIENCE ── */}
        {activeSection === 'experience' && (
          <div className="space-y-4">
            <SectionHeading title="Work experience" subtitle="Add your hospitality work history" />

            {experiences.length > 0 && (
              <div className="space-y-2">
                {experiences.map((exp) => (
                  <div key={exp.id} className="flex items-start justify-between p-4 bg-[#F7F4FC] rounded-xl border border-[#E7E2EF]">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#28D96D] mt-2 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-[#12051F]">{exp.position}</p>
                        <p className="text-sm text-[#8B8299]">{exp.business_name}</p>
                        <p className="text-xs text-[#C9C4D2] mt-0.5">
                          {exp.start_date} – {exp.is_current ? 'Present' : (exp.end_date ?? '')}
                        </p>
                      </div>
                    </div>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => handleDeleteExperience(exp.id)}
                        className="shrink-0 text-[#C9C4D2] hover:text-red-500 transition-colors p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {isEditing && showExpForm ? (
              <div className="rounded-xl border border-[#E7E2EF] bg-[#F7F4FC] p-4 space-y-3">
                <p className="text-sm font-bold text-[#12051F]">Add experience</p>
                <Input
                  label="Position"
                  placeholder="e.g. Head Bartender"
                  value={expPosition}
                  onChange={(e) => setExpPosition(e.target.value)}
                />
                <Input
                  label="Business name"
                  placeholder="e.g. Al-Hamra Hotel"
                  value={expBusiness}
                  onChange={(e) => setExpBusiness(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Start date"
                    type="month"
                    value={expStartDate}
                    onChange={(e) => setExpStartDate(e.target.value)}
                  />
                  {!expIsCurrent && (
                    <Input
                      label="End date"
                      type="month"
                      value={expEndDate}
                      onChange={(e) => setExpEndDate(e.target.value)}
                    />
                  )}
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={expIsCurrent}
                    onChange={(e) => setExpIsCurrent(e.target.checked)}
                    className="w-4 h-4 rounded border-[#E7E2EF] text-[#7426E8]"
                  />
                  <span className="text-sm text-[#12051F]">Currently working here</span>
                </label>
                <div className="flex gap-2 pt-1">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowExpForm(false)}>Cancel</Button>
                  <Button
                    type="button"
                    size="sm"
                    loading={expSaving}
                    disabled={!expPosition || !expBusiness || !expStartDate}
                    onClick={handleAddExperience}
                  >
                    Add
                  </Button>
                </div>
              </div>
            ) : isEditing ? (
              <button
                type="button"
                onClick={() => setShowExpForm(true)}
                className="w-full flex items-center gap-2 px-4 py-3.5 border-2 border-dashed border-[#E7E2EF] rounded-xl text-sm text-[#8B8299] hover:border-[#7426E8] hover:text-[#7426E8] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add experience
              </button>
            ) : null}
          </div>
        )}

        {/* ── BIO ── */}
        {activeSection === 'bio' && (
          <div className="space-y-4">
            <SectionHeading title="About you" subtitle="Write a short bio for businesses to read on your profile" />
            <div>
              <label className="block text-sm font-semibold text-[#12051F] mb-1.5">
                Bio <span className="text-[#C9C4D2] font-normal">(optional)</span>
              </label>
              <textarea
                value={bio}
                readOnly={!isEditing}
                onChange={(e) => { if (isEditing && e.target.value.length <= 255) setBio(e.target.value); }}
                placeholder="Tell businesses about your experience, work style, and what makes you a great hire..."
                rows={6}
                className={`w-full px-3 py-2.5 border border-[#E7E2EF] rounded-xl text-sm text-[#12051F] placeholder:text-[#C9C4D2] focus:outline-none resize-none ${isEditing ? 'bg-[#F3F0FB] focus:ring-2 focus:ring-[#7426E8] focus:bg-white' : 'bg-[#F7F4FC] cursor-default'}`}
              />
              <p className="text-xs text-[#C9C4D2] text-right mt-1">{bio.length}/255</p>
            </div>
          </div>
        )}

        {/* Bottom action bar */}
        <div className="mt-6 pt-5 border-t border-[#E7E2EF] flex items-center justify-end gap-3">
          {isEditing ? (
            <>
              <Button variant="ghost" size="md" onClick={handleCancel}>Cancel</Button>
              {activeSection !== 'experience' && (
                <Button size="md" loading={saving || uploading} onClick={handleSave}>Save changes</Button>
              )}
            </>
          ) : (
            <Button size="md" onClick={() => setIsEditing(true)}>Edit profile</Button>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismiss} />}
    </div>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-2">
      <h2 className="text-base font-bold text-[#12051F]">{title}</h2>
      <p className="text-xs text-[#8B8299] mt-0.5">{subtitle}</p>
    </div>
  );
}

function ToggleChip({
  label, active, onClick, small, readOnly,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  small?: boolean;
  readOnly?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={readOnly}
      onClick={onClick}
      className={`${small ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'} rounded-full font-medium border transition-colors disabled:cursor-default ${
        active
          ? 'bg-[#7426E8] text-white border-[#7426E8]'
          : 'bg-[#F3F0FB] text-[#8B8299] border-[#E7E2EF] hover:border-[#7426E8] hover:text-[#7426E8]'
      }`}
    >
      {label}
    </button>
  );
}
