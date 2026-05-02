import { z } from 'zod';
import { CITIES, IRAQI_PHONE_REGEX } from '@/lib/constants';

export const locationSchema = z.object({
  branchName: z.string().min(2, 'Branch name is required'),
  city: z.enum(CITIES as [string, ...string[]], {
    error: 'Select a city',
  }),
  address: z.string().min(5, 'Address is required'),
  branchPhone: z
    .string()
    .min(1, 'Branch phone is required')
    .regex(IRAQI_PHONE_REGEX, 'Enter a valid Iraqi phone number'),
  lat: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : parseFloat(String(v))),
    z.number().min(-90).max(90).nullable().optional()
  ),
  lng: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : parseFloat(String(v))),
    z.number().min(-180).max(180).nullable().optional()
  ),
  arrivalInstructions: z.string().optional(),
  photoUrl: z.string().optional(),
});

export type LocationInput = z.infer<typeof locationSchema>;
