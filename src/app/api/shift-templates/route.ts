import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { SHIFT_TYPES } from '@/lib/constants';

const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  locationId: z.string().uuid().optional().nullable(),
  jobTitle: z.string().min(1),
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

export async function GET(_request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: templates, error } = await supabase
    .from('shift_templates')
    .select('*')
    .eq('business_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  return NextResponse.json({ templates: templates ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (userData?.role !== 'business') {
    return NextResponse.json({ error: 'Only businesses can save templates' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = templateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 });
  }

  const d = parsed.data;

  const { data: template, error } = await supabase
    .from('shift_templates')
    .insert({
      business_id: user.id,
      name: d.name,
      location_id: d.locationId ?? null,
      job_title: d.jobTitle,
      workers_needed: d.workersNeeded,
      pro_hourly_rate_iqd: d.proHourlyRateIQD,
      shift_type: d.shiftType,
      description: d.description ?? null,
      what_to_expect: d.whatToExpect ?? null,
      clothing_rules: d.clothingRules ?? [],
      required_skills: d.requiredSkills ?? [],
      preferred_skills: d.preferredSkills ?? [],
      rules_and_regulations: d.rulesAndRegulations ?? null,
      cancellation_policy: d.cancellationPolicy ?? null,
      payment_terms: d.paymentTerms ?? null,
      special_badge: d.specialBadge ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Failed to save template' }, { status: 500 });
  return NextResponse.json({ template }, { status: 201 });
}
