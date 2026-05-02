import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function GET(_request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: applications, error } = await supabase
    .from('applications')
    .select(`
      id, status, applied_at,
      shifts (
        id, job_title, date, start_time, end_time, duration_hours,
        pro_hourly_rate_iqd, status, business_id, special_badge,
        business_locations ( branch_name, city, address, branch_phone )
      )
    `)
    .eq('pro_id', user.id)
    .order('applied_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });

  return NextResponse.json({ applications: applications ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userData?.role !== 'pro') {
    return NextResponse.json({ error: 'Only pros can apply to shifts' }, { status: 403 });
  }

  // Onboarding check
  const { data: proProfile } = await supabase
    .from('pro_profiles')
    .select('onboarding_completed, worker_status')
    .eq('user_id', user.id)
    .single();

  if (!proProfile?.onboarding_completed) {
    return NextResponse.json(
      { error: 'Complete your profile setup before applying to shifts', code: 'ONBOARDING_INCOMPLETE' },
      { status: 403 }
    );
  }

  if (proProfile.worker_status === 'suspended') {
    return NextResponse.json(
      { error: 'Your account is currently suspended. Contact support.' },
      { status: 403 }
    );
  }

  const { shiftId, confirmedClothing, confirmedCancellationPolicy } = await request.json() as {
    shiftId: string;
    confirmedClothing?: boolean;
    confirmedCancellationPolicy?: boolean;
  };

  if (!shiftId) return NextResponse.json({ error: 'shiftId is required' }, { status: 400 });

  // Verify shift exists and is open
  const { data: shift } = await supabase
    .from('shifts')
    .select('id, status, job_title, date, start_time, end_time, business_id, clothing_rules, cancellation_policy')
    .eq('id', shiftId)
    .eq('status', 'open')
    .single();

  if (!shift) {
    return NextResponse.json({ error: 'Shift not found or not open' }, { status: 404 });
  }

  // Schedule conflict check: any accepted shift on the same date overlapping in time
  const { data: conflictingApps } = await supabase
    .from('applications')
    .select(`
      id,
      shifts ( date, start_time, end_time )
    `)
    .eq('pro_id', user.id)
    .eq('status', 'accepted');

  const hasConflict = (conflictingApps ?? []).some((app: any) => {
    const s = app.shifts;
    if (!s || s.date !== shift.date) return false;
    // Overlap: existing start < new end AND existing end > new start
    return s.start_time < shift.end_time && s.end_time > shift.start_time;
  });

  if (hasConflict) {
    return NextResponse.json(
      { error: 'You already have an accepted shift that overlaps with this one', code: 'SCHEDULE_CONFLICT' },
      { status: 409 }
    );
  }

  // expires_at = shift date + 1 day (applications expire the day after the shift)
  const expiresAt = new Date(shift.date);
  expiresAt.setDate(expiresAt.getDate() + 1);

  const { data: application, error } = await supabase
    .from('applications')
    .insert({
      shift_id: shiftId,
      pro_id: user.id,
      confirmed_clothing: confirmedClothing ?? false,
      confirmed_cancellation_policy: confirmedCancellationPolicy ?? false,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'You have already applied to this shift' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to apply' }, { status: 500 });
  }

  // Notify business + confirm to worker — best-effort
  try {
    const service = await createServiceClient();
    await service.from('notifications').insert([
      {
        user_id: shift.business_id,
        message: `New applicant for ${shift.job_title} on ${shift.date}`,
      },
      {
        user_id: user.id,
        message: `Your application for ${shift.job_title} on ${shift.date} has been submitted. We'll notify you when the business responds.`,
      },
    ]);
  } catch { /* ignore */ }

  return NextResponse.json({ application }, { status: 201 });
}
