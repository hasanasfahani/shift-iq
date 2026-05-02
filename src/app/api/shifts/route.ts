import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { SHIFT_TYPES } from '@/lib/constants';
import { calculatePlatformFee, computeDurationHours } from '@/lib/fee';

const shiftRequestSchema = z.object({
  locationId: z.string().min(1),
  jobTitle: z.string().min(1, 'Job title is required'),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  workersNeeded: z.number().int().min(1),
  proHourlyRateIQD: z.number().int().min(1),
  shiftType: z.enum(SHIFT_TYPES as [string, ...string[]]),
  description: z.string().optional(),
  whatToExpect: z.string().optional(),
  clothingRules: z.array(z.string()).optional(),
  requiredSkills: z.array(z.string()).optional(),
  preferredSkills: z.array(z.string()).optional(),
  rulesAndRegulations: z.string().optional(),
  cancellationPolicy: z.string().optional(),
  paymentTerms: z.string().optional(),
  specialBadge: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const role = searchParams.get('role');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');

  let query = supabase
    .from('shifts')
    .select(`
      id, job_title, date, start_time, end_time, duration_hours,
      workers_needed, pro_hourly_rate_iqd, shift_type, description,
      what_to_expect, clothing_rules, required_skills, special_badge,
      cancellation_policy, payment_terms, status,
      business_locations ( branch_name, city, address, branch_phone, photos )
    `)
    .eq('status', 'open')
    .order('date', { ascending: true });

  if (role) query = query.eq('job_title', role);
  if (dateFrom) query = query.gte('date', dateFrom);
  if (dateTo) query = query.lte('date', dateTo);

  const { data: shifts, error } = await query;
  if (error) return NextResponse.json({ error: 'Failed to fetch shifts' }, { status: 500 });

  const result = city
    ? (shifts ?? []).filter((s: any) => s.business_locations?.city === city)
    : (shifts ?? []);

  return NextResponse.json({ shifts: result });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userData?.role !== 'business') {
    return NextResponse.json({ error: 'Only businesses can post shifts' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = shiftRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 });
  }

  const {
    locationId,
    jobTitle,
    date,
    startTime,
    endTime,
    workersNeeded,
    proHourlyRateIQD,
    shiftType,
    description,
    whatToExpect,
    clothingRules,
    requiredSkills,
    preferredSkills,
    rulesAndRegulations,
    cancellationPolicy,
    paymentTerms,
    specialBadge,
  } = parsed.data;

  const { data: location } = await supabase
    .from('business_locations')
    .select('id')
    .eq('id', locationId)
    .eq('business_id', user.id)
    .single();

  if (!location) {
    return NextResponse.json({ error: 'Location not found' }, { status: 404 });
  }

  const durationHours = computeDurationHours(startTime, endTime);
  const platformFeeIQD = calculatePlatformFee(durationHours, workersNeeded);

  const { data: shift, error } = await supabase
    .from('shifts')
    .insert({
      business_id: user.id,
      location_id: locationId,
      job_title: jobTitle,
      date,
      start_time: startTime,
      end_time: endTime,
      duration_hours: durationHours,
      workers_needed: workersNeeded,
      pro_hourly_rate_iqd: proHourlyRateIQD,
      shift_type: shiftType,
      description: description ?? null,
      what_to_expect: whatToExpect ?? null,
      clothing_rules: clothingRules ?? [],
      required_skills: requiredSkills ?? [],
      preferred_skills: preferredSkills ?? [],
      rules_and_regulations: rulesAndRegulations ?? null,
      cancellation_policy: cancellationPolicy ?? null,
      payment_terms: paymentTerms ?? null,
      special_badge: specialBadge ?? null,
      platform_fee_iqd: platformFeeIQD,
      status: 'open',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Failed to create shift' }, { status: 500 });
  return NextResponse.json({ shift }, { status: 201 });
}
