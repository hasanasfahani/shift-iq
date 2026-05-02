import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { ratingSchema } from '@/lib/validations/rating.schema';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = ratingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 });
  }

  const { shiftId, ratedId, stars, comment } = parsed.data;

  // Insert via anon client — RLS enforces:
  // shift must be completed, rater must be a party (business owner or accepted pro)
  const { data: rating, error } = await supabase
    .from('ratings')
    .insert({
      shift_id: shiftId,
      rater_id: user.id,
      rated_id: ratedId,
      stars,
      comment: comment ?? null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'You have already rated this shift' }, { status: 409 });
    }
    // RLS violation (not a party to the shift)
    if (error.code === '42501') {
      return NextResponse.json({ error: 'You are not authorized to rate this shift' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 });
  }

  // Notify the rated user — best-effort
  try {
    const service = await createServiceClient();
    await service.from('notifications').insert({
      user_id: ratedId,
      message: `You received a ${stars}-star rating`,
    });
  } catch { /* ignore */ }

  return NextResponse.json({ rating }, { status: 201 });
}
