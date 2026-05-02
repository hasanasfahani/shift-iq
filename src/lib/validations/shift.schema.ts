import { z } from 'zod';
import { JOB_TITLES, SHIFT_TYPES } from '@/lib/constants';
import { computeDurationHours } from '@/lib/fee';

export const shiftSchema = z
  .object({
    locationId: z.string().min(1, 'Select a branch'),
    jobTitle: z.enum(JOB_TITLES as [string, ...string[]], {
      error: 'Select a job role',
    }),
    date: z
      .string()
      .min(1, 'Date is required')
      .refine((d) => new Date(d) >= new Date(new Date().toDateString()), {
        message: 'Shift date cannot be in the past',
      }),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    workersNeeded: z.number().int().min(1, 'At least 1 worker is required'),
    proHourlyRateIQD: z.number().int().min(1, 'Hourly rate must be greater than 0'),
    shiftType: z.enum(SHIFT_TYPES as [string, ...string[]], {
      error: 'Select a shift type',
    }),
    description: z.string().optional(),
    // Requirements step
    whatToExpect: z.string().min(10, 'Please describe what to expect (min 10 characters)'),
    clothingRules: z.array(z.string()).optional(),
    requiredSkills: z.array(z.string()).optional(),
    preferredSkills: z.array(z.string()).optional(),
    rulesAndRegulations: z.string().optional(),
    cancellationPolicy: z.string().optional(),
    paymentTerms: z.string().optional(),
    specialBadge: z.string().optional(),
  })
  .refine(
    (data) => computeDurationHours(data.startTime, data.endTime) > 0,
    {
      message: 'End time must result in a positive shift duration',
      path: ['endTime'],
    }
  );

export type ShiftInput = z.infer<typeof shiftSchema>;
