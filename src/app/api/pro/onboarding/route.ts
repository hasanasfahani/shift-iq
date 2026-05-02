import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify user is a pro
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userData?.role !== 'pro') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const service = await createServiceClient();

  const {
    firstName,
    lastName,
    photoUrl,
    city,
    daysAvailability,
    weeklyHours,
    workType,
    shiftPreference,
    roles,
    yearsPerRole,
    skillsByRole,
    about,
    step,
    completed,
    experiences,
  } = body;

  // Update users table if name or city fields provided
  const userUpdates: Record<string, unknown> = {};
  if (firstName !== undefined) userUpdates.first_name = firstName;
  if (lastName !== undefined) userUpdates.last_name = lastName;
  if (firstName !== undefined && lastName !== undefined) {
    userUpdates.full_name = `${firstName} ${lastName}`;
  }
  if (city !== undefined) userUpdates.city = city;

  if (Object.keys(userUpdates).length > 0) {
    const { error: userError } = await service
      .from('users')
      .update(userUpdates)
      .eq('id', user.id);

    if (userError) {
      return NextResponse.json({ error: 'Failed to update user data.' }, { status: 500 });
    }
  }

  // Update pro_profiles
  const profileUpdates: Record<string, unknown> = {};
  if (photoUrl !== undefined) profileUpdates.photo_url = photoUrl;
  if (daysAvailability !== undefined) profileUpdates.days_availability = daysAvailability;
  if (weeklyHours !== undefined) profileUpdates.weekly_hours = weeklyHours;
  if (workType !== undefined) profileUpdates.work_type = workType;
  if (shiftPreference !== undefined) profileUpdates.shift_preference = shiftPreference;
  if (roles !== undefined) profileUpdates.skills = roles;
  if (yearsPerRole !== undefined) profileUpdates.years_per_role = yearsPerRole;
  if (skillsByRole !== undefined) profileUpdates.skills_by_role = skillsByRole;
  if (about !== undefined) profileUpdates.bio = about;
  if (step !== undefined) profileUpdates.onboarding_step = step;
  if (completed !== undefined) profileUpdates.onboarding_completed = completed;

  if (Object.keys(profileUpdates).length > 0) {
    const { error: profileError } = await service
      .from('pro_profiles')
      .update(profileUpdates)
      .eq('user_id', user.id);

    if (profileError) {
      return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
    }
  }

  // Handle experience actions
  if (experiences) {
    const { action, experience, experienceId } = experiences;

    if (action === 'add' && experience) {
      const { error: expError } = await service.from('pro_experiences').insert({
        pro_id: user.id,
        position: experience.position,
        business_name: experience.business_name,
        start_date: experience.start_date,
        end_date: experience.end_date ?? null,
        is_current: experience.is_current ?? false,
      });

      if (expError) {
        return NextResponse.json({ error: 'Failed to add experience.' }, { status: 500 });
      }
    } else if (action === 'delete' && experienceId) {
      const { error: delError } = await service
        .from('pro_experiences')
        .delete()
        .eq('id', experienceId)
        .eq('pro_id', user.id);

      if (delError) {
        return NextResponse.json({ error: 'Failed to delete experience.' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
