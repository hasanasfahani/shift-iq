import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { SHIFT_TYPES } from '@/lib/constants';
import { computeDurationHours, calculatePlatformFee } from '@/lib/fee';
import type { ShiftStatus } from '@/types';

const ALLOWED_TRANSITIONS: Record<ShiftStatus, ShiftStatus[]> = {
  open:      ['cancelled'],
  filled:    ['completed'],
  completed: [],
  cancelled: [],
};

const editSchema = z.object({
  date: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  workersNeeded: z.number().int().min(1).optional(),
  proHourlyRateIQD: z.number().int().min(1).optional(),
  shiftType: z.enum(SHIFT_TYPES as [string, ...string[]]).optional(),
  description: z.string().optional(),
  whatToExpect: z.string().optional(),
  clothingRules: z.array(z.string()).optional(),
  requiredSkills: z.array(z.string()).optional(),
  preferredSkills: z.array(z.string()).optional(),
  rulesAndRegulations: z.string().optional(),
  cancellationPolicy: z.string().optional(),
  paymentTerms: z.string().optional(),
  specialBadge: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json() as Record<string, unknown>;

  // Fetch the shift and verify ownership
  const { data: shift } = await supabase
    .from('shifts')
    .select('id, status, business_id, workers_needed, job_title, date')
    .eq('id', id)
    .eq('business_id', user.id)
    .single();

  if (!shift) return NextResponse.json({ error: 'Shift not found' }, { status: 404 });

  // Status transition path
  if ('status' in body) {
    const newStatus = body.status as ShiftStatus;
    const allowed = ALLOWED_TRANSITIONS[shift.status as ShiftStatus];
    if (!allowed.includes(newStatus)) {
      return NextResponse.json(
        { error: `Cannot transition shift from '${shift.status}' to '${newStatus}'` },
        { status: 422 }
      );
    }

    const { data: updated, error } = await supabase
      .from('shifts')
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 });

    if (newStatus === 'completed' || newStatus === 'cancelled') {
      await notifyAcceptedPros(id, shift.job_title, shift.date, newStatus);
    }

    return NextResponse.json({ shift: updated });
  }

  // Content edit path — only allowed for open shifts with 0 applicants
  if (shift.status !== 'open') {
    return NextResponse.json({ error: 'Only open shifts can be edited' }, { status: 422 });
  }

  const { count: appCount } = await supabase
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .eq('shift_id', id);

  if ((appCount ?? 0) > 0) {
    return NextResponse.json({ error: 'Cannot edit a shift that already has applicants' }, { status: 422 });
  }

  const parsed = editSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 });
  }

  const {
    date, startTime, endTime, workersNeeded, proHourlyRateIQD,
    shiftType, description, whatToExpect, clothingRules, requiredSkills,
    preferredSkills, rulesAndRegulations, cancellationPolicy, paymentTerms, specialBadge,
  } = parsed.data;

  const updates: Record<string, unknown> = {};
  if (date !== undefined) updates.date = date;
  if (shiftType !== undefined) updates.shift_type = shiftType;
  if (description !== undefined) updates.description = description || null;
  if (whatToExpect !== undefined) updates.what_to_expect = whatToExpect || null;
  if (clothingRules !== undefined) updates.clothing_rules = clothingRules;
  if (requiredSkills !== undefined) updates.required_skills = requiredSkills;
  if (preferredSkills !== undefined) updates.preferred_skills = preferredSkills;
  if (rulesAndRegulations !== undefined) updates.rules_and_regulations = rulesAndRegulations || null;
  if (cancellationPolicy !== undefined) updates.cancellation_policy = cancellationPolicy || null;
  if (paymentTerms !== undefined) updates.payment_terms = paymentTerms || null;
  if (specialBadge !== undefined) updates.special_badge = specialBadge || null;
  if (workersNeeded !== undefined) updates.workers_needed = workersNeeded;

  // Recompute duration if times changed
  const newStart = startTime ?? undefined;
  const newEnd = endTime ?? undefined;
  if (newStart !== undefined) updates.start_time = newStart;
  if (newEnd !== undefined) updates.end_time = newEnd;

  if ((newStart !== undefined || newEnd !== undefined) || workersNeeded !== undefined || proHourlyRateIQD !== undefined) {
    const { data: current } = await supabase
      .from('shifts')
      .select('start_time, end_time, workers_needed, pro_hourly_rate_iqd')
      .eq('id', id)
      .single();

    if (current) {
      const finalStart = newStart ?? current.start_time;
      const finalEnd = newEnd ?? current.end_time;
      const finalWorkers = workersNeeded ?? current.workers_needed;
      const finalRate = proHourlyRateIQD ?? current.pro_hourly_rate_iqd;

      const durationHours = computeDurationHours(finalStart, finalEnd);
      if (durationHours <= 0) {
        return NextResponse.json({ error: 'End time must result in a positive shift duration' }, { status: 400 });
      }

      updates.duration_hours = durationHours;
      updates.pro_hourly_rate_iqd = finalRate;
      updates.platform_fee_iqd = calculatePlatformFee(durationHours, finalWorkers);
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const { data: updated, error } = await supabase
    .from('shifts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  return NextResponse.json({ shift: updated });
}

async function notifyAcceptedPros(
  shiftId: string,
  jobTitle: string,
  date: string,
  newStatus: 'completed' | 'cancelled'
) {
  try {
    const service = await createServiceClient();
    const { data: apps } = await service
      .from('applications')
      .select('pro_id')
      .eq('shift_id', shiftId)
      .eq('status', 'accepted');

    if (!apps?.length) return;

    const message =
      newStatus === 'completed'
        ? `Shift for ${jobTitle} on ${date} marked as complete`
        : `Shift for ${jobTitle} on ${date} has been cancelled`;

    await service.from('notifications').insert(
      apps.map((a) => ({ user_id: a.pro_id, message }))
    );
  } catch { /* ignore */ }
}
