'use client';

import Link from 'next/link';
import { formatIQD } from '@/lib/constants';

interface Transaction {
  shift_id: string;
  shifts: {
    id: string;
    job_title: string;
    date: string;
    start_time: string;
    end_time: string;
    duration_hours: number;
    pro_hourly_rate_iqd: number;
    status: string;
    business_locations: { branch_name: string; city: string } | null;
    users: { business_profiles: { business_name: string; business_type?: string | null } | null } | null;
  };
}

interface Props {
  transactions: Transaction[];
  userName: string;
}

function formatMonthLabel(yearMonth: string) {
  const [year, month] = yearMonth.split('-');
  return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
}

export default function FinanceClient({ transactions, userName }: Props) {
  const totalEarned = transactions.reduce(
    (sum, tx) => sum + Math.round(tx.shifts.duration_hours * tx.shifts.pro_hourly_rate_iqd),
    0
  );
  const totalShifts = transactions.length;
  const avgPerShift = totalShifts > 0 ? Math.round(totalEarned / totalShifts) : 0;
  const bestShift = transactions.reduce((best, tx) => {
    const pay = Math.round(tx.shifts.duration_hours * tx.shifts.pro_hourly_rate_iqd);
    return pay > best ? pay : best;
  }, 0);

  // Group by year-month descending
  const grouped: Record<string, Transaction[]> = {};
  for (const tx of transactions) {
    const key = tx.shifts.date.slice(0, 7);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(tx);
  }
  const sortedMonths = Object.keys(grouped).sort().reverse();

  if (transactions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/pro/dashboard"
            className="w-9 h-9 rounded-xl bg-[#F3F0FB] flex items-center justify-center hover:bg-[#E9DEFF] transition-colors"
          >
            <svg className="w-4 h-4 text-[#7426E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-black text-[#12051F]">Finance</h1>
        </div>

        <div className="rounded-2xl bg-[#0F3D36] p-8 text-center mb-6">
          <p className="text-white/50 text-sm mb-2">Total Earned</p>
          <p className="text-4xl font-black text-[#28D96D] tabular-nums">0 IQD</p>
        </div>

        <div className="rounded-2xl border border-[#E7E2EF] bg-white p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#DDF4EA] flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-base font-bold text-[#12051F] mb-1">No earnings yet</p>
          <p className="text-sm text-[#8B8299] mb-5">Complete your first shift to see your transactions here.</p>
          <Link
            href="/pro/browse"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7426E8] text-white text-sm font-bold hover:bg-[#6315d0] transition-colors"
          >
            Browse shifts
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/pro/dashboard"
          className="w-9 h-9 rounded-xl bg-[#F3F0FB] flex items-center justify-center hover:bg-[#E9DEFF] transition-colors shrink-0"
        >
          <svg className="w-4 h-4 text-[#7426E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-black text-[#12051F]">Finance</h1>
      </div>

      {/* Hero earnings card */}
      <div className="rounded-2xl bg-[#0F3D36] overflow-hidden relative">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-12 -right-12 w-52 h-52 rounded-full bg-[#28D96D]/8" />
        <div className="pointer-events-none absolute -bottom-10 -left-8 w-40 h-40 rounded-full bg-white/4" />

        <div className="relative px-6 pt-7 pb-6">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1">
            Total Earned
          </p>
          <p className="text-4xl font-black text-[#28D96D] tabular-nums leading-none mb-1">
            {formatIQD(totalEarned)}
          </p>
          <p className="text-xs text-white/30 mb-6">
            from {totalShifts} completed shift{totalShifts !== 1 ? 's' : ''}
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/8 rounded-xl px-3 py-3">
              <p className="text-xs text-white/40 mb-1">Avg per shift</p>
              <p className="text-sm font-black text-white tabular-nums">{formatIQD(avgPerShift)}</p>
            </div>
            <div className="bg-white/8 rounded-xl px-3 py-3">
              <p className="text-xs text-white/40 mb-1">Best shift</p>
              <p className="text-sm font-black text-[#28D96D] tabular-nums">{formatIQD(bestShift)}</p>
            </div>
            <div className="bg-white/8 rounded-xl px-3 py-3">
              <p className="text-xs text-white/40 mb-1">Shifts done</p>
              <p className="text-sm font-black text-white tabular-nums">{totalShifts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction list grouped by month */}
      <div className="space-y-6">
        {sortedMonths.map((month) => {
          const txs = grouped[month];
          const monthTotal = txs.reduce(
            (sum, tx) => sum + Math.round(tx.shifts.duration_hours * tx.shifts.pro_hourly_rate_iqd),
            0
          );

          return (
            <div key={month}>
              {/* Month header */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-black text-[#12051F] uppercase tracking-wider">
                  {formatMonthLabel(month)}
                </h2>
                <span className="text-xs font-bold text-[#28D96D]">
                  +{formatIQD(monthTotal)}
                </span>
              </div>

              {/* Transaction cards */}
              <div className="rounded-2xl border border-[#E7E2EF] bg-white overflow-hidden divide-y divide-[#F7F4FC]">
                {txs.map((tx, idx) => {
                  const shift = tx.shifts;
                  const pay = Math.round(shift.duration_hours * shift.pro_hourly_rate_iqd);
                  const shiftDate = new Date(shift.date);
                  const bizProfile = shift.users?.business_profiles;

                  return (
                    <div key={tx.shift_id} className="flex items-start gap-4 px-4 py-4">
                      {/* Date column */}
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

                      {/* Divider */}
                      <div className="w-px self-stretch bg-[#F3F0FB] shrink-0" />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#12051F] truncate">{shift.job_title}</p>
                        {bizProfile?.business_name && (
                          <p className="text-xs font-semibold text-[#7426E8] mt-0.5 truncate">
                            {bizProfile.business_name}
                          </p>
                        )}
                        <p className="text-xs text-[#8B8299] mt-0.5 truncate">
                          {shift.business_locations?.branch_name ?? '—'}
                          {shift.business_locations?.city ? ` · ${shift.business_locations.city}` : ''}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#F7F4FC] text-[#8B8299] text-[11px] font-medium">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {shift.start_time.slice(0, 5)}–{shift.end_time.slice(0, 5)}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-[#F7F4FC] text-[#8B8299] text-[11px] font-medium">
                            {shift.duration_hours}h
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-[#F7F4FC] text-[#8B8299] text-[11px] font-medium">
                            {formatIQD(shift.pro_hourly_rate_iqd)}/hr
                          </span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-black text-[#28D96D] tabular-nums">
                          +{formatIQD(pay)}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-[#DDF4EA] text-[#059669] text-[10px] font-semibold">
                          Paid
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
    </div>
  );
}
