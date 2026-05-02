import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

// Called by Vercel Cron every hour.
// Sends a T-24h reminder to all accepted pros whose shift starts in 23–25 hours.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const service = await createServiceClient();

  const now = new Date();
  // Window: shifts starting between 23h and 25h from now
  const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const windowEnd   = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  const windowStartDate = windowStart.toISOString().split('T')[0];
  const windowEndDate   = windowEnd.toISOString().split('T')[0];

  // Fetch accepted applications for shifts in the window that haven't been reminded
  const { data: applications, error } = await service
    .from('applications')
    .select(`
      id, pro_id, reminder_sent_at,
      shifts ( id, job_title, date, start_time, business_id,
        business_locations ( branch_name, city ) )
    `)
    .eq('status', 'accepted')
    .is('reminder_sent_at', null)
    .gte('shifts.date', windowStartDate)
    .lte('shifts.date', windowEndDate);

  if (error) {
    console.error('[cron/shift-reminders] query error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const apps = (applications ?? []) as any[];

  // Further filter: shift start_time falls inside the exact 23-25h window
  const eligible = apps.filter((app) => {
    const s = app.shifts;
    if (!s) return false;
    const shiftDatetime = new Date(`${s.date}T${s.start_time}`);
    return shiftDatetime >= windowStart && shiftDatetime <= windowEnd;
  });

  if (eligible.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const notifications = eligible.map((app: any) => ({
    user_id: app.pro_id,
    message: `Reminder: your ${app.shifts.job_title} shift at ${app.shifts.business_locations?.branch_name ?? ''} starts in ~24 hours on ${app.shifts.date} at ${app.shifts.start_time?.slice(0, 5)}.`,
  }));

  await service.from('notifications').insert(notifications);

  // Mark reminder as sent to prevent duplicates
  const appIds = eligible.map((a: any) => a.id);
  await service
    .from('applications')
    .update({ reminder_sent_at: now.toISOString() })
    .in('id', appIds);

  return NextResponse.json({ sent: eligible.length });
}
