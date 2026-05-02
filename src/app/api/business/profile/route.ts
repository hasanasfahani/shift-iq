import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { BUSINESS_TYPES } from '@/lib/constants';

const patchSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters').optional(),
  businessType: z.enum(BUSINESS_TYPES as [string, ...string[]]).optional(),
  description: z.string().optional(),
  photoUrl: z.string().optional(),
});

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

export async function GET() {
  const { supabase, userId } = await getAuthenticatedBusiness();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('business_profiles')
    .select('business_name, business_type, description, photos, average_rating, total_ratings, is_verified')
    .eq('user_id', userId)
    .single();

  if (error) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  return NextResponse.json({ profile: data });
}

export async function PATCH(request: NextRequest) {
  const { supabase, userId } = await getAuthenticatedBusiness();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 });
  }

  const { businessName, businessType, description, photoUrl } = parsed.data;

  const updates: Record<string, unknown> = {};
  if (businessName !== undefined) updates.business_name = businessName;
  if (businessType !== undefined) updates.business_type = businessType;
  if (description !== undefined) updates.description = description || null;

  // Handle photos: fetch current, update first slot
  if (photoUrl !== undefined) {
    const { data: current } = await supabase
      .from('business_profiles')
      .select('photos')
      .eq('user_id', userId)
      .single();
    updates.photos = photoUrl ? [photoUrl, ...(current?.photos ?? []).slice(1)] : (current?.photos ?? []).slice(1);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('business_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  return NextResponse.json({ profile: data });
}
