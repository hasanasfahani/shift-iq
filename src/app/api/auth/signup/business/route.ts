import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { signupBusinessSchema } from '@/lib/validations/auth.schema';
import { normalizePhone } from '@/lib/constants';
import { phoneToEmail } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const parsed = signupBusinessSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { fullName, dateOfBirth, businessName, businessType, city, phone, password } = parsed.data;
  const normalizedPhone = normalizePhone(phone);
  const email = phoneToEmail(normalizedPhone);

  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: undefined },
  });

  if (authError || !authData.user) {
    if (authError?.message?.toLowerCase().includes('already registered')) {
      return NextResponse.json({ error: 'Phone number is already registered.' }, { status: 409 });
    }
    return NextResponse.json({ error: authError?.message ?? 'Signup failed.' }, { status: 400 });
  }

  const userId = authData.user.id;
  const service = await createServiceClient();

  const { error: userError } = await service.from('users').insert({
    id: userId,
    full_name: fullName,
    phone: normalizedPhone,
    role: 'business',
    city,
    date_of_birth: dateOfBirth,
  });

  if (userError) {
    await service.auth.admin.deleteUser(userId);
    if (userError.code === '23505') {
      return NextResponse.json({ error: 'Phone number is already registered.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Account creation failed.' }, { status: 500 });
  }

  const { error: profileError } = await service.from('business_profiles').insert({
    user_id: userId,
    business_name: businessName,
    business_type: businessType,
  });

  if (profileError) {
    await service.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: 'Account creation failed.' }, { status: 500 });
  }

  await service.from('business_locations').insert({
    business_id: userId,
    branch_name: businessName,
    city,
    address: city,
    branch_phone: normalizedPhone,
  });

  return NextResponse.json({ redirectTo: '/business/dashboard' }, { status: 201 });
}
