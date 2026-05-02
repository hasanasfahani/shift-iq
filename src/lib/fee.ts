import { PLATFORM_FEE_PER_HOUR_IQD } from './constants';

// Single source of truth for platform fee calculation.
// Called on the client (Step 3 preview) and server (shift creation API).
// Result is stored in shifts.platform_fee_iqd at creation and never recalculated.
export function calculatePlatformFee(durationHours: number, workersNeeded: number): number {
  return Math.round(durationHours * workersNeeded * PLATFORM_FEE_PER_HOUR_IQD);
}

// Compute shift duration in hours from HH:MM strings.
// Handles midnight-crossing: if end <= start, treat as next-day end.
export function computeDurationHours(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);

  let startMinutes = sh * 60 + sm;
  let endMinutes = eh * 60 + em;

  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  return (endMinutes - startMinutes) / 60;
}

export interface FeeSummary {
  durationHours: number;
  workersNeeded: number;
  proHourlyRateIQD: number;
  totalProPayIQD: number;
  platformFeeIQD: number;
  grandTotalIQD: number;
}

export function buildFeeSummary(
  startTime: string,
  endTime: string,
  workersNeeded: number,
  proHourlyRateIQD: number
): FeeSummary {
  const durationHours = computeDurationHours(startTime, endTime);
  const totalProPayIQD = Math.round(durationHours * workersNeeded * proHourlyRateIQD);
  const platformFeeIQD = calculatePlatformFee(durationHours, workersNeeded);
  return {
    durationHours,
    workersNeeded,
    proHourlyRateIQD,
    totalProPayIQD,
    platformFeeIQD,
    grandTotalIQD: totalProPayIQD + platformFeeIQD,
  };
}
