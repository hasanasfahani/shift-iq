'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  JOB_TITLES,
  SKILLS_BY_ROLE,
  DAYS_OF_WEEK,
  WEEKLY_HOURS_OPTIONS,
  WORK_TYPE_OPTIONS,
  SHIFT_PREFERENCE_OPTIONS,
} from '@/lib/constants';
import type { ProExperience } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface InitialData {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  photoUrl: string | null;
  daysAvailability: string[];
  weeklyHours: string | null;
  workType: string[];
  shiftPreference: string[];
  roles: string[];
  yearsPerRole: Record<string, number>;
  skillsByRole: Record<string, string[]>;
  about: string;
  onboardingStep: number;
  onboardingCompleted: boolean;
  experiences: ProExperience[];
}

interface Props {
  initialData: InitialData;
}

const TOTAL_STEPS = 6; // 0..5

const STEP_LABELS = [
  'Availability',
  'Roles',
  'Skills',
  'Experience',
  'About',
  'Preview',
];

async function saveStep(payload: Record<string, unknown>) {
  await fetch('/api/pro/onboarding', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export default function OnboardingWizard({ initialData }: Props) {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [daysAvailability, setDaysAvailability] = useState<string[]>(initialData.daysAvailability);
  const [weeklyHours, setWeeklyHours] = useState<string | null>(initialData.weeklyHours);
  const [workType, setWorkType] = useState<string[]>(initialData.workType);
  const [shiftPreference, setShiftPreference] = useState<string[]>(initialData.shiftPreference);
  const [roles, setRoles] = useState<string[]>(initialData.roles);
  const [yearsPerRole, setYearsPerRole] = useState<Record<string, number>>(initialData.yearsPerRole ?? {});
  const [skillsByRole, setSkillsByRole] = useState<Record<string, string[]>>(initialData.skillsByRole);
  const [about, setAbout] = useState(initialData.about);
  const [experiences, setExperiences] = useState<ProExperience[]>(initialData.experiences);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  // Experience form state
  const [showExpForm, setShowExpForm] = useState(false);
  const [expPosition, setExpPosition] = useState('');
  const [expBusiness, setExpBusiness] = useState('');
  const [expStartDate, setExpStartDate] = useState('');
  const [expEndDate, setExpEndDate] = useState('');
  const [expIsCurrent, setExpIsCurrent] = useState(false);
  const [expSaving, setExpSaving] = useState(false);

  function toggleArray<T>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
  }

  async function handleNext() {
    setSaving(true);
    setError('');
    try {
      const payload: Record<string, unknown> = { step: step + 1 };

      if (step === 0) {
        payload.daysAvailability = daysAvailability;
        payload.weeklyHours = weeklyHours;
        payload.workType = workType;
        payload.shiftPreference = shiftPreference;
      } else if (step === 1) {
        payload.roles = roles;
        payload.yearsPerRole = yearsPerRole;
      } else if (step === 2) {
        payload.skillsByRole = skillsByRole;
      } else if (step === 3) {
        // experiences saved individually
      } else if (step === 4) {
        payload.about = about;
      }

      await saveStep(payload);
      setStep((s) => s + 1);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  async function handleFinish() {
    setSaving(true);
    setError('');
    try {
      await saveStep({ completed: true, about, step: TOTAL_STEPS });
      router.push('/pro/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
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
        const supabase = createClient();
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
        setExpPosition('');
        setExpBusiness('');
        setExpStartDate('');
        setExpEndDate('');
        setExpIsCurrent(false);
      }
    } finally {
      setExpSaving(false);
    }
  }

  async function handleDeleteExperience(id: string) {
    await fetch('/api/pro/onboarding', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        experiences: { action: 'delete', experienceId: id },
      }),
    });
    setExperiences((prev) => prev.filter((e) => e.id !== id));
  }

  function toggleRoleSkill(role: string, skill: string) {
    setSkillsByRole((prev) => {
      const current = prev[role] ?? [];
      const next = current.includes(skill)
        ? current.filter((s) => s !== skill)
        : [...current, skill];
      return { ...prev, [role]: next };
    });
  }

  const isLastStep = step === TOTAL_STEPS - 1;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header with skip button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-[#12051F]">Set Up Your Profile</h1>
            <p className="text-sm text-[#8B8299] mt-0.5">Complete your profile to get more opportunities</p>
          </div>
          <button
            onClick={() => router.push('/pro/dashboard')}
            className="text-sm text-[#8B8299] hover:text-[#12051F] font-medium px-3 py-1.5 rounded-full hover:bg-[#F3F0FB] transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-6 overflow-x-auto pb-2">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-0 flex-1 min-w-0">
              <div className="flex flex-col items-center gap-1 shrink-0">
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
                <span
                  className={`text-xs font-medium hidden sm:block whitespace-nowrap ${
                    i === step ? 'text-[#28D96D]' : 'text-[#C9C4D2]'
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 mt-0 sm:-mt-4 ${i < step ? 'bg-[#28D96D]' : 'bg-[#E7E2EF]'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="bg-white rounded-2xl border border-[#E7E2EF] p-6">
          {error && (
            <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Step 0: Work Preferences */}
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-lg font-black text-[#12051F]">Work Preferences</h2>
                <p className="text-sm text-[#8B8299] mt-1">Tell businesses when and how you like to work</p>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-[#12051F]">Available days</span>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setDaysAvailability((prev) => toggleArray(prev, day))}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                        daysAvailability.includes(day)
                          ? 'bg-[#7426E8] text-white border-[#7426E8]'
                          : 'bg-[#F3F0FB] text-[#8B8299] border-[#E7E2EF] hover:border-[#7426E8]'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-[#12051F]">Hours per week</span>
                <div className="flex flex-wrap gap-2">
                  {WEEKLY_HOURS_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setWeeklyHours(weeklyHours === opt ? null : opt)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                        weeklyHours === opt
                          ? 'bg-[#7426E8] text-white border-[#7426E8]'
                          : 'bg-[#F3F0FB] text-[#8B8299] border-[#E7E2EF] hover:border-[#7426E8]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-[#12051F]">Work type</span>
                <div className="flex flex-wrap gap-2">
                  {WORK_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setWorkType((prev) => toggleArray(prev, opt))}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                        workType.includes(opt)
                          ? 'bg-[#7426E8] text-white border-[#7426E8]'
                          : 'bg-[#F3F0FB] text-[#8B8299] border-[#E7E2EF] hover:border-[#7426E8]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-[#12051F]">Shift preference</span>
                <div className="flex flex-wrap gap-2">
                  {SHIFT_PREFERENCE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setShiftPreference((prev) => toggleArray(prev, opt))}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                        shiftPreference.includes(opt)
                          ? 'bg-[#7426E8] text-white border-[#7426E8]'
                          : 'bg-[#F3F0FB] text-[#8B8299] border-[#E7E2EF] hover:border-[#7426E8]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-black text-[#12051F]">What roles can you fill?</h2>
                <p className="text-sm text-[#8B8299] mt-1">Select all that apply</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {JOB_TITLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setRoles((prev) => toggleArray(prev, role));
                      if (roles.includes(role)) {
                        setSkillsByRole((prev) => {
                          const next = { ...prev };
                          delete next[role];
                          return next;
                        });
                      }
                    }}
                    className={`px-2 py-2 rounded-xl text-xs font-medium text-left transition-colors border ${
                      roles.includes(role)
                        ? 'bg-[#7426E8] text-white border-[#7426E8]'
                        : 'bg-[#F3F0FB] text-[#8B8299] border-[#E7E2EF] hover:border-[#7426E8]'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
              {roles.length > 0 && (
                <>
                  <p className="text-xs text-[#8B8299]">{roles.length} role{roles.length !== 1 ? 's' : ''} selected</p>
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-[#12051F]">Years of experience per role</span>
                    <p className="text-xs text-[#8B8299]">Optional — helps businesses match you to the right shifts.</p>
                    <div className="flex flex-col gap-2">
                      {roles.map((role) => (
                        <div key={role} className="flex items-center justify-between bg-[#F7F4FC] rounded-xl border border-[#E7E2EF] px-4 py-2.5">
                          <span className="text-sm text-[#12051F] font-medium">{role}</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              max={50}
                              step={1}
                              placeholder="—"
                              value={yearsPerRole[role] ?? ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? undefined : parseInt(e.target.value);
                                setYearsPerRole((prev) => {
                                  const next = { ...prev };
                                  if (val === undefined) {
                                    delete next[role];
                                  } else {
                                    next[role] = val;
                                  }
                                  return next;
                                });
                              }}
                              className="w-16 rounded-lg border border-[#E7E2EF] bg-white px-2 py-1 text-sm text-[#12051F] text-center focus:outline-none focus:ring-2 focus:ring-[#7426E8]"
                            />
                            <span className="text-xs text-[#8B8299]">yr{!yearsPerRole[role] || yearsPerRole[role] !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 2: Skills per role */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-black text-[#12051F]">Skills by Role</h2>
                <p className="text-sm text-[#8B8299] mt-1">Select your skills for each role</p>
              </div>

              {roles.length === 0 ? (
                <p className="text-sm text-[#8B8299] py-4 text-center">No roles selected. Go back to select roles first.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {roles.map((role) => {
                    const availableSkills = SKILLS_BY_ROLE[role as keyof typeof SKILLS_BY_ROLE] ?? [];
                    const selectedSkills = skillsByRole[role] ?? [];
                    const isExpanded = expandedRole === role;

                    return (
                      <div key={role} className="border border-[#E7E2EF] rounded-xl overflow-hidden bg-[#F7F4FC]">
                        <button
                          type="button"
                          onClick={() => setExpandedRole(isExpanded ? null : role)}
                          className="w-full flex items-center justify-between px-4 py-3 bg-[#F7F4FC] hover:bg-[#F3F0FB] transition-colors text-left"
                        >
                          <span className="text-sm font-medium text-[#12051F]">{role}</span>
                          <div className="flex items-center gap-2">
                            {selectedSkills.length > 0 && (
                              <span className="text-xs text-[#7426E8] font-medium">{selectedSkills.length} selected</span>
                            )}
                            <svg
                              className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>
                        {isExpanded && (
                          <div className="p-4 flex flex-wrap gap-2">
                            {availableSkills.map((skill) => (
                              <button
                                key={skill}
                                type="button"
                                onClick={() => toggleRoleSkill(role, skill)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                                  selectedSkills.includes(skill)
                                    ? 'bg-[#7426E8] text-white border-[#7426E8]'
                                    : 'bg-[#F3F0FB] text-[#8B8299] border-[#E7E2EF] hover:border-[#7426E8]'
                                }`}
                              >
                                {skill}
                              </button>
                            ))}
                            {availableSkills.length === 0 && (
                              <p className="text-xs text-[#8B8299]">No specific skills listed for this role</p>
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

          {/* Step 3: Experience */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-black text-[#12051F]">Work Experience</h2>
                <p className="text-sm text-[#8B8299] mt-1">Add your hospitality work history</p>
              </div>

              {experiences.length > 0 && (
                <div className="flex flex-col gap-3">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="flex items-start justify-between p-4 bg-[#F7F4FC] rounded-xl border border-[#E7E2EF]">
                      <div>
                        <p className="text-sm font-semibold text-[#12051F]">{exp.position}</p>
                        <p className="text-sm text-[#8B8299]">{exp.business_name}</p>
                        <p className="text-xs text-[#8B8299] mt-0.5">
                          {exp.start_date} – {exp.is_current ? 'Present' : (exp.end_date ?? '')}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteExperience(exp.id)}
                        className="text-red-400 hover:text-red-600 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {showExpForm ? (
                <div className="border border-[#E7E2EF] bg-[#F7F4FC] rounded-xl p-4 flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-[#12051F]">Add Experience</h3>
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
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowExpForm(false)}
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleAddExperience}
                      loading={expSaving}
                      size="sm"
                      disabled={!expPosition || !expBusiness || !expStartDate}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowExpForm(true)}
                  className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-[#E7E2EF] rounded-xl text-sm text-[#8B8299] hover:border-[#7426E8] hover:text-[#7426E8] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Experience
                </button>
              )}
            </div>
          )}

          {/* Step 4: About */}
          {step === 4 && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-black text-[#12051F]">About You</h2>
                <p className="text-sm text-[#8B8299] mt-1">Write a short bio for businesses to read</p>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#12051F]">Bio <span className="text-[#C9C4D2] font-normal">(optional)</span></label>
                <textarea
                  value={about}
                  onChange={(e) => {
                    if (e.target.value.length <= 255) setAbout(e.target.value);
                  }}
                  placeholder="Tell businesses about your experience, work style, and what makes you a great hire..."
                  rows={5}
                  className="w-full rounded-xl border border-[#E7E2EF] bg-[#F3F0FB] px-3 py-2.5 text-sm text-[#12051F] placeholder:text-[#C9C4D2] focus:outline-none focus:ring-2 focus:ring-[#7426E8] focus:bg-white focus:border-[#7426E8] resize-none"
                />
                <p className="text-xs text-[#8B8299] text-right">{about.length}/255</p>
              </div>
            </div>
          )}

          {/* Step 5: Preview */}
          {step === 5 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-lg font-black text-[#12051F]">Profile Preview</h2>
                <p className="text-sm text-[#8B8299] mt-1">Review your information before finishing</p>
              </div>

              {/* Photo + Name */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-[#E7E2EF] bg-[#F7F4FC] overflow-hidden shrink-0 flex items-center justify-center">
                  {initialData.photoUrl ? (
                    <img src={initialData.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-7 h-7 text-[#8B8299]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-black text-[#12051F]">{initialData.firstName} {initialData.lastName}</p>
                  <p className="text-sm text-[#8B8299]">{initialData.city} · {initialData.phone}</p>
                </div>
              </div>

              {/* Availability */}
              <div className="border-t border-[#E7E2EF] pt-4">
                <p className="text-xs font-semibold text-[#8B8299] uppercase tracking-wide mb-2">Availability</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {daysAvailability.length > 0
                    ? daysAvailability.map((d) => (
                        <span key={d} className="px-2 py-0.5 bg-[#DDF4EA] text-[#0F3D36] rounded-full text-xs">{d}</span>
                      ))
                    : <span className="text-sm text-[#8B8299]">Not specified</span>
                  }
                </div>
                {weeklyHours && <p className="text-sm text-[#12051F]">{weeklyHours} hrs/week</p>}
                {workType.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {workType.map((w) => <span key={w} className="px-2 py-0.5 bg-[#F3F0FB] text-[#8B8299] rounded-full text-xs">{w}</span>)}
                  </div>
                )}
                {shiftPreference.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {shiftPreference.map((s) => <span key={s} className="px-2 py-0.5 bg-[#F3F0FB] text-[#8B8299] rounded-full text-xs">{s}</span>)}
                  </div>
                )}
              </div>

              {/* Roles */}
              {roles.length > 0 && (
                <div className="border-t border-[#E7E2EF] pt-4">
                  <p className="text-xs font-semibold text-[#8B8299] uppercase tracking-wide mb-2">Roles ({roles.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {roles.map((r) => (
                      <span key={r} className="px-2 py-0.5 bg-[#E9DEFF] text-[#7426E8] rounded-full text-xs">{r}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {experiences.length > 0 && (
                <div className="border-t border-[#E7E2EF] pt-4">
                  <p className="text-xs font-semibold text-[#8B8299] uppercase tracking-wide mb-2">Experience</p>
                  <div className="flex flex-col gap-2">
                    {experiences.map((exp) => (
                      <div key={exp.id}>
                        <p className="text-sm font-medium text-[#12051F]">{exp.position} at {exp.business_name}</p>
                        <p className="text-xs text-[#8B8299]">{exp.start_date} – {exp.is_current ? 'Present' : (exp.end_date ?? '')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* About */}
              {about && (
                <div className="border-t border-[#E7E2EF] pt-4">
                  <p className="text-xs font-semibold text-[#8B8299] uppercase tracking-wide mb-2">About</p>
                  <p className="text-sm text-[#12051F]">{about}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-6 pt-5 border-t border-[#E7E2EF]">
            {step > 0 && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                className="w-28"
                disabled={saving}
              >
                ← Back
              </Button>
            )}
            <div className="flex-1" />
            {isLastStep ? (
              <Button
                type="button"
                onClick={handleFinish}
                loading={saving}
              >
                Finish →
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleNext}
                loading={saving}
              >
                {step === 3 ? 'Continue' : 'Save & Continue'} →
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
