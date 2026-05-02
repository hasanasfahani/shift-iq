import { normalizePhone } from './constants';

// Supabase Auth requires an email identifier.
// We derive a phantom email from the phone number — users never see this.
// normalizePhone ensures the format is always +964XXXXXXXXXX before hashing.
export function phoneToEmail(phone: string): string {
  const normalized = normalizePhone(phone);
  // Strip the + so it's a valid local-part
  const digits = normalized.replace('+', '');
  return `${digits}@auth.shiftiq.app`;
}
