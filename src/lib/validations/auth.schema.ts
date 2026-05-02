import { z } from 'zod';
import { CITIES, BUSINESS_TYPES, IRAQI_PHONE_REGEX } from '@/lib/constants';

const phoneField = z
  .string()
  .min(1, 'Phone number is required')
  .regex(IRAQI_PHONE_REGEX, 'Enter a valid Iraqi phone number (e.g. 07901234567)');

const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters');

function isAtLeast18(dob: string): boolean {
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return false;
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  return age > 18 || (age === 18 && (m > 0 || (m === 0 && today.getDate() >= birth.getDate())));
}

const dobField = z
  .string()
  .min(1, 'Date of birth is required')
  .refine(isAtLeast18, { message: 'You must be at least 18 years old to register' });

export const loginSchema = z.object({
  phone: phoneField,
  password: z.string().min(1, 'Password is required'),
});

export const signupBusinessSchema = z
  .object({
    fullName: z.string().min(2, 'Full name is required'),
    dateOfBirth: dobField,
    businessName: z.string().min(2, 'Business name is required'),
    businessType: z.enum(BUSINESS_TYPES as [string, ...string[]], {
      error: 'Select a business type',
    }),
    city: z.enum(CITIES as [string, ...string[]], {
      error: 'Select a city',
    }),
    phone: phoneField,
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const signupProSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dateOfBirth: dobField,
    city: z.enum(CITIES as [string, ...string[]], { error: 'Select a city' }),
    phone: phoneField,
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupBusinessInput = z.infer<typeof signupBusinessSchema>;
export type SignupProInput = z.infer<typeof signupProSchema>;
