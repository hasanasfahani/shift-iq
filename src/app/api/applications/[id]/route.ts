import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import type { ApplicationStatus, UserRole } from '@/types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { status: newStatus } = await request.json() as { status: ApplicationStatus };

  const validStatuses: ApplicationStatus[] = ['accepted', 'declined', 'withdrawn', 'no_show', 'cancelled_by_worker'];
  if (!validStatuses.includes(newStatus)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = userData?.role as UserRole;

  // Fetch application with shift details
  const { data: application } = await supabase
    .from('applications')
    .select(`
      id, status, pro_id, shift_id,
      shifts ( id, business_id, workers_needed, job_title, date, status )
    `)
    .eq('id', id)
    .single();

  if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

  const shift = application.shifts as any;

  // ── Pro withdrawing their own pending application ──
  if (newStatus === 'withdrawn') {
    if (role !== 'pro' || application.pro_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (application.status !== 'pending') {
      return NextResponse.json({ error: 'Only pending applications can be withdrawn' }, { status: 409 });
    }

    const service = await createServiceClient();
    const { data: updated, error } = await service
      .from('applications')
      .update({ status: 'withdrawn' })
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    return NextResponse.json({ application: updated });
  }

  // ── Pro cancelling their own accepted shift ──
  if (newStatus === 'cancelled_by_worker') {
    if (role !== 'pro' || application.pro_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (application.status !== 'accepted') {
      return NextResponse.json({ error: 'Only accepted applications can be cancelled' }, { status: 409 });
    }

    const service = await createServiceClient();
    const { data: updated, error } = await service
      .from('applications')
      .update({ status: 'cancelled_by_worker' })
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 });

    // Notify the business
    try {
      await service.from('notifications').insert({
        user_id: shift.business_id,
        message: `A worker cancelled their accepted shift for ${shift.job_title} on ${shift.date}`,
      });
    } catch { /* ignore */ }

    // Re-open the shift if it was filled
    if (shift.status === 'filled') {
      await service.from('shifts').update({ status: 'open' }).eq('id', shift.id);
    }

    return NextResponse.json({ application: updated });
  }

  // ── Business marking no-show on accepted application ──
  if (newStatus === 'no_show') {
    if (role !== 'business' || shift.business_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (application.status !== 'accepted') {
      return NextResponse.json({ error: 'Only accepted applications can be marked no-show' }, { status: 409 });
    }

    const service = await createServiceClient();
    const { data: updated, error } = await service
      .from('applications')
      .update({ status: 'no_show' })
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 });

    // Notify the pro
    try {
      await service.from('notifications').insert({
        user_id: application.pro_id,
        message: `You were marked no-show for ${shift.job_title} on ${shift.date}`,
      });
    } catch { /* ignore */ }

    return NextResponse.json({ application: updated });
  }

  // ── Business accepting / declining pending applications ──
  if (newStatus !== 'accepted' && newStatus !== 'declined') {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  if (shift.business_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (application.status !== 'pending') {
    return NextResponse.json({ error: 'Application has already been decided' }, { status: 409 });
  }
  if (shift.status === 'filled' && newStatus === 'accepted') {
    return NextResponse.json({ error: 'Shift is already filled' }, { status: 422 });
  }

  const service = await createServiceClient();

  const { data: updated, error } = await service
    .from('applications')
    .update({ status: newStatus })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 });

  let shiftNowFilled = false;

  if (newStatus === 'accepted') {
    const { count } = await service
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('shift_id', shift.id)
      .eq('status', 'accepted');

    if ((count ?? 0) >= shift.workers_needed && shift.status === 'open') {
      await service.from('shifts').update({ status: 'filled' }).eq('id', shift.id);
      shiftNowFilled = true;
    }
  }

  // Notify the pro
  try {
    const message =
      newStatus === 'accepted'
        ? `You've been accepted for ${shift.job_title} on ${shift.date}`
        : `Your application for ${shift.job_title} on ${shift.date} was not accepted`;

    await service.from('notifications').insert({ user_id: application.pro_id, message });
  } catch { /* ignore */ }

  return NextResponse.json({ application: updated, shiftNowFilled });
}
