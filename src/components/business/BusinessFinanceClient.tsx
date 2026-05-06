'use client';

import Link from 'next/link';
import { formatIQD } from '@/lib/constants';

interface ShiftRecord {
  id: string;
  job_title: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  workers_needed: number;
  platform_fee_iqd: number;
  pro_hourly_rate_iqd: number;
  status: string;
  created_at: string;
  business_locations: { branch_name: string; city: string } | null;
  applications: { id: string; status: string }[];
}

interface Props {
  shifts: ShiftRecord[];
  businessName: string;
}

function formatMonthLabel(yearMonth: string) {
  const [year, month] = yearMonth.split('-');
  return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
}

function shiftTotals(shift: ShiftRecord) {
  const acceptedCount = shift.applications.filter((a) => a.status === 'accepted').length;
  const proWages = Math.round(acceptedCount * shift.duration_hours * shift.pro_hourly_rate_iqd);
  const platformFee = shift.platform_fee_iqd;
  const total = proWages + platformFee;
  return { acceptedCount, proWages, platformFee, total };
}

const STATUS_CONFIG: Record<string, { label: string; pillClass: string; dim: boolean }> = {
  completed: { label: 'Paid',      pillClass: 'bg-[#DDF4EA] text-[#059669]', dim: false },
  open:      { label: 'Pending',   pillClass: 'bg-[#FEF3C7] text-[#92400E]', dim: false },
  filled:    { label: 'Pending',   pillClass: 'bg-[#FEF3C7] text-[#92400E]', dim: false },
  cancelled: { label: 'Cancelled', pillClass: 'bg-[#F3F0FB] text-[#8B8299]',  dim: true  },
};

export default function BusinessFinanceClient({ shifts }: Props) {
  const nonCancelled = shifts.filter((s) => s.status !== 'cancelled');
  const completed    = shifts.filter((s) => s.status === 'completed');
  const pending      = shifts.filter((s) => s.status === 'open' || s.status === 'filled');

  const totalPaid        = completed.reduce((sum, s) => sum + shiftTotals(s).total, 0);
  const totalPending     = pending.reduce((sum, s) => sum + shiftTotals(s).total, 0);
  const totalAll         = totalPaid + totalPending;
  const totalPlatformAll = nonCancelled.reduce((sum, s) => sum + s.platform_fee_iqd, 0);
  const totalProWagesAll = nonCancelled.reduce((sum, s) => sum + shiftTotals(s).proWages, 0);
  const avgPerShift      = nonCancelled.length > 0 ? Math.round(totalAll / nonCancelled.length) : 0;

  const grouped: Record<string, ShiftRecord[]> = {};
  for (const shift of shifts) {
    const key = shift.date.slice(0, 7);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(shift);
  }
  const sortedMonths = Object.keys(grouped).sort().reverse();

  if (shifts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <BackLink />
          <h1 className="text-2xl font-black text-[#12051F]">Finance</h1>
        </div>
        <div className="rounded-2xl bg-[#0F3D36] p-8 text-center mb-6">
          <p className="text-white/50 text-sm mb-2">Total Cost</p>
          <p className="text-4xl font-black text-[#28D96D] tabular-nums">0 IQD</p>
        </div>
        <div className="rounded-2xl border border-[#E7E2EF] bg-white p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#F3F0FB] flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-[#C9C4D2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
            </svg>
          </div>
          <p className="text-base font-bold text-[#12051F] mb-1">No transactions yet</p>
          <p className="text-sm text-[#8B8299] mb-5">Post your first shift to start tracking costs here.</p>
          <Link href="/business/post-shift" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7426E8] text-white text-sm font-bold hover:bg-[#6315d0] transition-colors">
            Post a shift
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <BackLink />
        <h1 className="text-2xl font-black text-[#12051F]">Finance</h1>
      </div>

      {/* ── HERO CARD ── */}
      <div className="rounded-2xl bg-[#0F3D36] px-6 pt-7 pb-6">

        {/* Total */}
        <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1">
          Total Cost
        </p>
        <p className="text-4xl font-black text-[#28D96D] tabular-nums leading-none mb-1">
          {formatIQD(totalAll)}
        </p>
        <p className="text-xs text-white/30 mb-5">
          across {nonCancelled.length} shift{nonCancelled.length !== 1 ? 's' : ''}
        </p>

        {/* Paid / Pending split */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl px-4 py-3 border border-white/10 bg-white/[0.07]">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Paid</p>
            <p className="text-lg font-black text-[#28D96D] tabular-nums leading-tight">{formatIQD(totalPaid)}</p>
            <p className="text-[10px] text-white/30 mt-1">{completed.length} shift{completed.length !== 1 ? 's' : ''} completed</p>
          </div>
          <div className="rounded-xl px-4 py-3 border border-white/10 bg-white/[0.07]">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Pending</p>
            <p className="text-lg font-black text-[#F59E0B] tabular-nums leading-tight">{formatIQD(totalPending)}</p>
            <p className="text-[10px] text-white/30 mt-1">{pending.length} shift{pending.length !== 1 ? 's' : ''} active</p>
          </div>
        </div>

        {/* Breakdown chips */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl px-3 py-3 bg-white/[0.07]">
            <p className="text-[10px] text-white/40 mb-1.5">Platform fees</p>
            <p className="text-sm font-black text-white tabular-nums leading-tight">{formatIQD(totalPlatformAll)}</p>
          </div>
          <div className="rounded-xl px-3 py-3 bg-white/[0.07]">
            <p className="text-[10px] text-white/40 mb-1.5">Pro wages</p>
            <p className="text-sm font-black text-white tabular-nums leading-tight">{formatIQD(totalProWagesAll)}</p>
          </div>
          <div className="rounded-xl px-3 py-3 bg-white/[0.07]">
            <p className="text-[10px] text-white/40 mb-1.5">Avg / shift</p>
            <p className="text-sm font-black text-white tabular-nums leading-tight">{formatIQD(avgPerShift)}</p>
          </div>
        </div>
      </div>

      {/* ── TRANSACTION LIST ── */}
      <div className="space-y-6">
        {sortedMonths.map((month) => {
          const monthShifts = grouped[month];
          const monthTotal = monthShifts
            .filter((s) => s.status !== 'cancelled')
            .reduce((sum, s) => sum + shiftTotals(s).total, 0);

          return (
            <div key={month}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-black text-[#12051F] uppercase tracking-wider">
                  {formatMonthLabel(month)}
                </h2>
                <span className="text-xs font-bold text-[#8B8299]">{formatIQD(monthTotal)}</span>
              </div>

              <div className="rounded-2xl border border-[#E7E2EF] bg-white overflow-hidden divide-y divide-[#F7F4FC]">
                {monthShifts.map((shift) => {
                  const { acceptedCount, proWages, platformFee, total } = shiftTotals(shift);
                  const shiftDate = new Date(shift.date);
                  const cfg = STATUS_CONFIG[shift.status] ?? STATUS_CONFIG.cancelled;
                  const isCancelled = cfg.dim;

                  return (
                    <div key={shift.id} className={`flex items-start gap-4 px-4 py-4 ${isCancelled ? 'opacity-50' : ''}`}>

                      {/* Date */}
                      <div className="shrink-0 w-10 text-center pt-0.5">
                        <p className="text-[10px] font-black text-[#7426E8] uppercase leading-none">
                          {shiftDate.toLocaleDateString('en-GB', { month: 'short' })}
                        </p>
                        <p className="text-xl font-black text-[#12051F] leading-tight tabular-nums">
                          {shiftDate.getDate()}
                        </p>
                        <p className="text-[10px] text-[#C9C4D2] leading-none">
                          {shiftDate.toLocaleDateString('en-GB', { weekday: 'short' })}
                        </p>
                      </div>

                      <div className="w-px self-stretch bg-[#F3F0FB] shrink-0" />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#12051F] truncate">{shift.job_title}</p>
                        <p className="text-xs text-[#8B8299] mt-0.5 truncate">
                          {shift.business_locations?.branch_name ?? '—'}
                          {shift.business_locations?.city ? ` · ${shift.business_locations.city}` : ''}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-lg bg-[#F7F4FC] text-[#8B8299] text-[11px] font-medium">
                            {shift.start_time.slice(0, 5)}–{shift.end_time.slice(0, 5)}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-[#F7F4FC] text-[#8B8299] text-[11px] font-medium">
                            {shift.duration_hours}h
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-[#F7F4FC] text-[#8B8299] text-[11px] font-medium">
                            {acceptedCount}/{shift.workers_needed} hired
                          </span>
                        </div>

                        {/* Cost breakdown */}
                        {!isCancelled && (
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[11px] text-[#C9C4D2]">
                              Platform <span className="text-[#8B8299] font-medium">{formatIQD(platformFee)}</span>
                            </span>
                            <span className="text-[#E7E2EF]">·</span>
                            <span className="text-[11px] text-[#C9C4D2]">
                              Pro wages <span className="text-[#8B8299] font-medium">{formatIQD(proWages)}</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Total + status */}
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-black text-[#12051F] tabular-nums">
                          {isCancelled ? '—' : formatIQD(total)}
                        </p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.pillClass}`}>
                          {cfg.label}
                        </span>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-center text-[#C9C4D2] pb-2">
        Platform fee · 1,000 IQD/hr per worker · Pro wages paid directly to workers
      </p>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/business/dashboard"
      className="w-9 h-9 rounded-xl bg-[#F3F0FB] flex items-center justify-center hover:bg-[#E9DEFF] transition-colors shrink-0"
    >
      <svg className="w-4 h-4 text-[#7426E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </Link>
  );
}
