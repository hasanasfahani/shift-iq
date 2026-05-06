import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { loginSchema } from '@/lib/validations/auth.schema';
import { normalizePhone } from '@/lib/constants';
import { phoneToEmail } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid phone or password.' }, { status: 400 });
  }

  const { phone, password } = parsed.data;
  const { next } = body as { next?: string };
  const normalizedPhone = normalizePhone(phone);
  const email = phoneToEmail(normalizedPhone);

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    console.error('[login] supabase error:', error, 'email used:', email);
    return NextResponse.json(
      { error: 'Invalid phone number or password.', _debug: error?.message },
      { status: 401 }
    );
  }

  // Fetch role to determine redirect destination
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single();

  const defaultRedirect =
    userData?.role === 'business' ? '/business/dashboard' : '/pro/browse';

  // Use ?next only if it's a safe internal path
  const redirectTo = next?.startsWith('/') ? next : defaultRedirect;

  return NextResponse.json({ redirectTo }, { status: 200 });
}
