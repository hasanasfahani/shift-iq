import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { locationSchema } from '@/lib/validations/location.schema';
import { normalizePhone } from '@/lib/constants';

async function getAuthenticatedBusiness() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, userId: null };

  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (data?.role !== 'business') return { supabase, userId: null };
  return { supabase, userId: user.id };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, userId } = await getAuthenticatedBusiness();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const parsed = locationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 });
  }

  const { branchName, city, address, branchPhone, lat, lng, arrivalInstructions, photoUrl } = parsed.data;

  const { data: current } = await supabase
    .from('business_locations')
    .select('photos')
    .eq('id', id)
    .eq('business_id', userId)
    .single();

  const photos = photoUrl !== undefined
    ? (photoUrl ? [photoUrl] : [])
    : (current?.photos ?? []);

  const { data, error } = await supabase
    .from('business_locations')
    .update({
      branch_name: branchName,
      city,
      address,
      branch_phone: normalizePhone(branchPhone),
      lat: lat ?? null,
      lng: lng ?? null,
      arrival_instructions: arrivalInstructions || null,
      photos,
    })
    .eq('id', id)
    .eq('business_id', userId)
    .select()
    .single();

  if (error || !data) return NextResponse.json({ error: 'Location not found or update failed' }, { status: 404 });
  return NextResponse.json({ location: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, userId } = await getAuthenticatedBusiness();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const { error } = await supabase
    .from('business_locations')
    .delete()
    .eq('id', id)
    .eq('business_id', userId);

  if (error) return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  return NextResponse.json({ success: true });
}
