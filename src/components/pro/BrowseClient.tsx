'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Toast, useToast } from '@/components/ui/Toast';
import EmptyState from '@/components/ui/EmptyState';
import { CITIES, JOB_TITLES, SHIFT_TYPES, SPECIAL_BADGES, formatIQD } from '@/lib/constants';

interface ShiftLocation {
  branch_name: string;
  city: string;
  address: string;
  branch_phone: string;
  photos?: string[];
}

interface BrowseShift {
  id: string;
  job_title: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  workers_needed: number;
  accepted_count: number;
  pro_hourly_rate_iqd: number;
  shift_type: string;
  description: string | null;
  special_badge: string | null;
  status: string;
  created_at: string;
  business_locations: ShiftLocation;
  users?: { business_profiles?: { business_name?: string; is_verified?: boolean } | null } | null;
}

interface Props {
  initialShifts: BrowseShift[];
  appliedShiftIds: string[];
  totalCount: number;
  currentCity: string;
  currentRole: string;
  currentShiftType: string;
  currentSort: string;
  currentMinRate: string;
  currentMaxRate: string;
}

function buildDateStrip() {
  const dates: { iso: string; label: string; dayLabel: string }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-GB', { weekday: 'short' });
    const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    dates.push({ iso, label, dayLabel });
  }
  return dates;
}

const DATE_STRIP = buildDateStrip();

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return mins <= 1 ? 'Just posted' : `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function ShiftCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E7E2EF] shadow-sm overflow-hidden animate-pulse">
      <div className="h-28 bg-[#F3F0FB]" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-[#F3F0FB] rounded-full" />
          <div className="h-5 w-12 bg-[#F3F0FB] rounded-full" />
        </div>
        <div className="h-5 w-40 bg-[#F3F0FB] rounded" />
        <div className="h-4 w-56 bg-[#F3F0FB] rounded" />
        <div className="h-4 w-48 bg-[#F3F0FB] rounded" />
        <div className="flex justify-between pt-2 border-t border-[#E7E2EF]">
          <div className="h-4 w-24 bg-[#F3F0FB] rounded" />
          <div className="h-4 w-20 bg-[#F3F0FB] rounded" />
        </div>
      </div>
    </div>
  );
}

export default function BrowseClient({
  initialShifts,
  appliedShiftIds,
  totalCount,
  currentCity,
  currentRole,
  currentShiftType,
  currentSort,
  currentMinRate,
  currentMaxRate,
}: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const { toast, show, dismiss } = useToast();
  const [isPending, startTransition] = useTransition();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [minRate, setMinRate] = useState(currentMinRate);
  const [maxRate, setMaxRate] = useState(currentMaxRate);

  const [applied] = useState<Set<string>>(new Set(appliedShiftIds));

  function buildParams(overrides: Record<string, string>) {
    const base: Record<string, string> = {};
    if (currentCity) base.city = currentCity;
    if (currentRole) base.role = currentRole;
    if (currentShiftType) base.shiftType = currentShiftType;
    if (currentSort) base.sort = currentSort;
    if (currentMinRate) base.minRate = currentMinRate;
    if (currentMaxRate) base.maxRate = currentMaxRate;
    if (selectedDate) base.dateFrom = selectedDate;
    return new URLSearchParams({ ...base, ...overrides });
  }

  function updateFilter(key: string, value: string) {
    const params = buildParams({ [key]: value });
    if (!value) params.delete(key);
    const qs = params.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname));
  }

  function handleDateSelect(iso: string) {
    const next = selectedDate === iso ? '' : iso;
    setSelectedDate(next);
    const params = buildParams(next ? { dateFrom: next } : {});
    if (!next) params.delete('dateFrom');
    const qs = params.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname));
  }

  function applyRateFilter() {
    const params = buildParams({});
    if (minRate) params.set('minRate', minRate); else params.delete('minRate');
    if (maxRate) params.set('maxRate', maxRate); else params.delete('maxRate');
    const qs = params.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname));
  }

  function clearFilters() {
    setSelectedDate('');
    setMinRate('');
    setMaxRate('');
    startTransition(() => router.push(pathname));
  }

  const hasFilters = currentCity || currentRole || selectedDate || currentShiftType || currentMinRate || currentMaxRate;

  const filteredShifts = selectedDate
    ? initialShifts.filter((s) => s.date === selectedDate)
    : initialShifts;

  return (
    <>
      {/* Live counter header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-[#12051F]">{t('pro.browse.title', { defaultValue: 'Browse Shifts' })}</h1>
          <p className="text-sm text-[#8B8299] mt-0.5">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#28D96D] animate-pulse inline-block" />
              <span className="font-semibold text-[#0F3D36]">{totalCount} open shift{totalCount !== 1 ? 's' : ''}</span>
              {' '}available now
            </span>
          </p>
        </div>
      </div>

      {/* Date strip */}
      <div className="mb-4 -mx-1">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide px-1">
          {DATE_STRIP.map(({ iso, label, dayLabel }) => {
            const isSelected = selectedDate === iso;
            const shiftsOnDate = initialShifts.filter((s) => s.date === iso).length;
            return (
              <button
                key={iso}
                type="button"
                onClick={() => handleDateSelect(iso)}
                className={`shrink-0 flex flex-col items-center gap-0.5 px-3 pt-2 pb-2 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-[#0F3D36] border-[#0F3D36] text-white'
                    : 'bg-white border-[#E7E2EF] text-[#12051F] hover:border-[#0F3D36]'
                }`}
              >
                <span className={`text-xs font-semibold ${isSelected ? 'text-white/70' : 'text-[#8B8299]'}`}>
                  {dayLabel}
                </span>
                <span className="text-sm font-black">{label}</span>
                {shiftsOnDate > 0 && (
                  <span
                    className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-[#28D96D] text-[#0F3D36]' : 'bg-[#F3F0FB] text-[#7426E8]'
                    }`}
                  >
                    {shiftsOnDate}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-3">
        <select
          value={currentCity}
          onChange={(e) => updateFilter('city', e.target.value)}
          className="px-3 py-2 rounded-full border border-[#E9DEFF] bg-[#F3F0FB] text-sm text-[#7426E8] focus:outline-none focus:ring-2 focus:ring-[#7426E8]"
        >
          <option value="">{t('pro.browse.filterCity')}: All</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={currentRole}
          onChange={(e) => updateFilter('role', e.target.value)}
          className="px-3 py-2 rounded-full border border-[#E9DEFF] bg-[#F3F0FB] text-sm text-[#7426E8] focus:outline-none focus:ring-2 focus:ring-[#7426E8]"
        >
          <option value="">{t('pro.browse.filterRole')}: All</option>
          {JOB_TITLES.map((r) => (
            <option key={r} value={r}>{t(`jobRoles.${r}`, { defaultValue: r })}</option>
          ))}
        </select>

        <select
          value={currentSort}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="px-3 py-2 rounded-full border border-[#E9DEFF] bg-[#F3F0FB] text-sm text-[#7426E8] focus:outline-none focus:ring-2 focus:ring-[#7426E8]"
        >
          <option value="">Sort: Date</option>
          <option value="pay_desc">Pay: High → Low</option>
          <option value="pay_asc">Pay: Low → High</option>
          <option value="duration_desc">Longest first</option>
        </select>

        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className={`px-3 py-2 rounded-full border text-sm font-medium transition-colors ${
            showAdvanced || currentShiftType || currentMinRate || currentMaxRate
              ? 'bg-[#7426E8] text-white border-[#7426E8]'
              : 'border-[#E9DEFF] bg-[#F3F0FB] text-[#7426E8]'
          }`}
        >
          Filters {(currentShiftType || currentMinRate || currentMaxRate) ? '●' : ''}
        </button>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm text-[#8B8299] hover:text-[#12051F]"
          >
            {t('common.clearFilters')}
          </button>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="mb-4 bg-[#F7F4FC] rounded-2xl border border-[#E7E2EF] p-4 flex flex-wrap gap-4">
          <div className="flex flex-col gap-1 min-w-[150px]">
            <label className="text-xs font-semibold text-[#8B8299] uppercase tracking-wide">Shift type</label>
            <select
              value={currentShiftType}
              onChange={(e) => updateFilter('shiftType', e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#E7E2EF] bg-white text-sm text-[#12051F] focus:outline-none focus:ring-2 focus:ring-[#7426E8]"
            >
              <option value="">All types</option>
              {SHIFT_TYPES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#8B8299] uppercase tracking-wide">Hourly rate (IQD)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minRate}
                onChange={(e) => setMinRate(e.target.value)}
                className="w-24 px-3 py-2 rounded-xl border border-[#E7E2EF] bg-white text-sm text-[#12051F] focus:outline-none focus:ring-2 focus:ring-[#7426E8]"
              />
              <span className="text-[#8B8299] text-sm">–</span>
              <input
                type="number"
                placeholder="Max"
                value={maxRate}
                onChange={(e) => setMaxRate(e.target.value)}
                className="w-24 px-3 py-2 rounded-xl border border-[#E7E2EF] bg-white text-sm text-[#12051F] focus:outline-none focus:ring-2 focus:ring-[#7426E8]"
              />
              <button
                type="button"
                onClick={applyRateFilter}
                className="px-3 py-2 rounded-xl bg-[#7426E8] text-white text-sm font-semibold hover:bg-[#6315d0] transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shift cards */}
      {isPending ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((n) => <ShiftCardSkeleton key={n} />)}
        </div>
      ) : filteredShifts.length === 0 ? (
        <EmptyState
          illustration="no-shifts"
          heading={hasFilters ? 'No shifts match your filters' : 'No open shifts right now'}
          body={hasFilters ? 'Try a different date, city, or role.' : 'Check back soon — new shifts are posted daily.'}
          action={hasFilters ? { label: 'Clear filters', onClick: clearFilters } : undefined}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filteredShifts.map((shift) => {
            const isApplied = applied.has(shift.id);
            const totalPay = Math.round(shift.duration_hours * shift.pro_hourly_rate_iqd);
            const badgeInfo = SPECIAL_BADGES.find((b) => b.value === shift.special_badge);
            const venuePhoto = shift.business_locations?.photos?.[0];
            const businessName = shift.users?.business_profiles?.business_name;
            const isVerified = shift.users?.business_profiles?.is_verified ?? false;
            const spotsLeft = Math.max(0, shift.workers_needed - (shift.accepted_count ?? 0));
            const fillPct = shift.workers_needed > 0
              ? Math.round(((shift.accepted_count ?? 0) / shift.workers_needed) * 100)
              : 0;
            const isUrgent = spotsLeft <= 2 && spotsLeft > 0;
            const isFull = spotsLeft === 0;

            return (
              <Link
                key={shift.id}
                href={`/pro/shifts/${shift.id}`}
                className="bg-white rounded-2xl border border-[#E7E2EF] shadow-sm hover:shadow-md hover:border-[#7426E8]/30 transition-all block overflow-hidden"
              >
                {venuePhoto ? (
                  <div className="h-28 overflow-hidden relative">
                    <img src={venuePhoto} alt={shift.business_locations.branch_name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-2 right-3 text-xs text-white/80">
                      {relativeTime(shift.created_at)}
                    </div>
                  </div>
                ) : null}

                <div className="p-5">
                  {/* Badge row */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {badgeInfo && (
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: badgeInfo.color }}
                      >
                        {badgeInfo.label}
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-[#E9DEFF] text-[#7426E8] text-xs rounded-full">
                      {shift.shift_type}
                    </span>
                    {isUrgent && (
                      <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] text-xs font-semibold rounded-full">
                        Almost full
                      </span>
                    )}
                    {!venuePhoto && (
                      <span className="ms-auto text-xs text-[#C9C4D2]">{relativeTime(shift.created_at)}</span>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#12051F] mb-0.5">{shift.job_title}</p>
                      {businessName && (
                        <p className="text-xs font-medium text-[#7426E8] mb-0.5 flex items-center gap-1">
                          {businessName}
                          {isVerified && (
                            <svg className="w-3.5 h-3.5 text-[#28D96D] shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </p>
                      )}
                      <p className="text-sm text-[#8B8299]">
                        {shift.business_locations.branch_name}{' '}
                        <span className="text-[#7426E8] bg-[#E9DEFF] text-xs rounded-full px-2 py-0.5">
                          {shift.business_locations.city}
                        </span>
                      </p>
                      <p className="text-sm text-[#8B8299] mt-0.5">
                        {new Date(shift.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                        {' · '}
                        {shift.start_time.slice(0, 5)} – {shift.end_time.slice(0, 5)}
                        {' · '}
                        {shift.duration_hours}h
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-lg font-black text-[#12051F]">
                        {formatIQD(shift.pro_hourly_rate_iqd)}
                        <span className="text-sm font-normal text-[#8B8299]">/hr</span>
                      </p>
                      <p className="text-xs text-[#28D96D] font-medium mt-0.5">
                        Total: {formatIQD(totalPay)}
                      </p>
                    </div>
                  </div>

                  {/* Spots urgency bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-xs font-medium ${isFull ? 'text-[#8B8299]' : isUrgent ? 'text-[#EF4444]' : 'text-[#8B8299]'}`}>
                        {isFull ? 'Fully booked' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
                      </p>
                      <p className="text-xs text-[#C9C4D2]">{shift.accepted_count ?? 0}/{shift.workers_needed} filled</p>
                    </div>
                    <div className="h-1.5 bg-[#E7E2EF] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          fillPct >= 100 ? 'bg-[#28D96D]' :
                          fillPct >= 80  ? 'bg-[#F59E0B]' :
                                           'bg-[#7426E8]'
                        }`}
                        style={{ width: `${Math.min(fillPct, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#E7E2EF] flex items-center justify-end">
                    {isApplied ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DDF4EA] text-[#15594D] text-xs font-semibold">
                        ✓ {t('pro.browse.applied')}
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-[#7426E8]">
                        View & apply →
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismiss} />}
    </>
  );
}
