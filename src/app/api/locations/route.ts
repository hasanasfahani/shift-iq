import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { locationSchema } from '@/lib/validations/location.schema';
import { normalizePhone } from '@/lib/constants';

async function getAuthenticatedBusiness() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { supabase, user: null, userId: null };

  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (data?.role !== 'business') return { supabase, user: null, userId: null };
  return { supabase, user, userId: user.id };
}

export async function GET() {
  const { supabase, userId } = await getAuthenticatedBusiness();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('business_locations')
    .select('*')
    .eq('business_id', userId)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  return NextResponse.json({ locations: data });
}

export async function POST(request: NextRequest) {
  const { supabase, userId } = await getAuthenticatedBusiness();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = locationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 });
  }

  const { branchName, city, address, branchPhone, lat, lng, arrivalInstructions, photoUrl } = parsed.data;

  const { data, error } = await supabase
    .from('business_locations')
    .insert({
      business_id: userId,
      branch_name: branchName,
      city,
      address,
      branch_phone: normalizePhone(branchPhone),
      lat: lat ?? null,
      lng: lng ?? null,
      arrival_instructions: arrivalInstructions || null,
      photos: photoUrl ? [photoUrl] : [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Failed to create location' }, { status: 500 });
  return NextResponse.json({ location: data }, { status: 201 });
}
