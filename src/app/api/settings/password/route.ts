import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { phoneToEmail } from '@/lib/auth';

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { currentPassword, newPassword } = await request.json() as {
    currentPassword: string;
    newPassword: string;
  };

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Both passwords are required' }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
  }

  // Fetch the user's phone to reconstruct phantom email
  const { data: userData } = await supabase
    .from('users')
    .select('phone')
    .eq('id', user.id)
    .single();

  if (!userData?.phone) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const phantomEmail = phoneToEmail(userData.phone);

  // Verify current password by attempting sign-in with a stateless client
  const verifyClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

  const { error: signInError } = await verifyClient.auth.signInWithPassword({
    email: phantomEmail,
    password: currentPassword,
  });

  if (signInError) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 422 });
  }

  // Update password via admin API
  const service = await createServiceClient();
  const { error: updateError } = await service.auth.admin.updateUserById(user.id, {
    password: newPassword,
  });

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
