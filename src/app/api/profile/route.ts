import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(_request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [{ data: userData }, { data: profile }] = await Promise.all([
    supabase.from('users').select('full_name, phone, city').eq('id', user.id).single(),
    supabase.from('pro_profiles').select('bio, skills, photo_url, average_rating, completed_shifts').eq('user_id', user.id).single(),
  ]);

  return NextResponse.json({ user: userData, profile });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as {
    bio?: string;
    skills?: string[];
    photo_url?: string | null;
  };

  const updates: Record<string, unknown> = {};
  if (body.bio !== undefined) updates.bio = body.bio || null;
  if (body.skills !== undefined) updates.skills = body.skills;
  if (body.photo_url !== undefined) updates.photo_url = body.photo_url;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const { data: profile, error } = await supabase
    .from('pro_profiles')
    .update(updates)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 });

  return NextResponse.json({ profile });
}
