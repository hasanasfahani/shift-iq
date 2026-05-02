import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import type { IraqiCity } from '@/types';

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as { fullName?: string; city?: IraqiCity };
  const updates: Record<string, unknown> = {};
  if (body.fullName?.trim()) updates.full_name = body.fullName.trim();
  if (body.city) updates.city = body.city;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  // No UPDATE RLS policy on users — must use service role
  const service = await createServiceClient();
  const { error } = await service
    .from('users')
    .update(updates)
    .eq('id', user.id);

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 });

  return NextResponse.json({ ok: true });
}
