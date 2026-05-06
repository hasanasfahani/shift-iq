// ─── Enums (mirror DB enums exactly) ─────────────────────────

export type UserRole = 'business' | 'pro';

export type IraqiCity =
  | 'Erbil'
  | 'Sulaymaniyah'
  | 'Duhok'
  | 'Baghdad'
  | 'Basra'
  | 'Mosul'
  | 'Kirkuk'
  | 'Najaf'
  | 'Karbala';

export type BusinessType =
  | 'Restaurant'
  | 'Café'
  | 'Hotel'
  | 'Catering Company'
  | 'Event Venue'
  | 'Other';

export type ShiftStatus = 'open' | 'filled' | 'completed' | 'cancelled';

export type ApplicationStatus = 'pending' | 'accepted' | 'declined' | 'withdrawn' | 'no_show' | 'cancelled_by_worker';

export type ShiftType = 'one-time' | 'recurring' | 'temp-to-hire';

export type JobTitle =
  | 'Line Cook'
  | 'Prep Cook'
  | 'Banquet Cook'
  | 'Baker / Pastry Cook'
  | 'Server Assistant'
  | 'Restaurant Server'
  | 'Banquet Server'
  | 'Food Runner'
  | 'Busser'
  | 'Host'
  | 'Bartender'
  | 'Beer & Wine Bartender'
  | 'Mixologist'
  | 'Barback'
  | 'Barista'
  | 'Dishwasher'
  | 'FOH Support'
  | 'Coat Check Attendant'
  | 'Event Staff'
  | 'Event Help'
  | 'Event Lead'
  | 'Event Coordinator'
  | 'Banquet Captain'
  | 'Banquet Setup'
  | 'General Laborer'
  | 'General Cleaning'
  | 'Maintenance'
  | 'Food Assembler'
  | 'Volunteer'
  | 'Stage'
  | 'Delivery Driver';

// ─── Database Row Types ───────────────────────────────────────

export interface User {
  id: string;
  full_name: string;
  first_name: string | null;
  last_name: string | null;
  phone: string;
  role: UserRole;
  city: IraqiCity;
  created_at: string;
}

export interface BusinessProfile {
  user_id: string;
  business_name: string;
  business_type: BusinessType;
  description: string | null;
  photos: string[];
  average_rating: number;
  total_ratings: number;
  is_verified: boolean;
}

export interface BusinessLocation {
  id: string;
  business_id: string;
  branch_name: string;
  city: IraqiCity;
  address: string;
  branch_phone: string;
  lat: number | null;
  lng: number | null;
  photos: string[];
  arrival_instructions: string | null;
  created_at: string;
}

export interface ProProfile {
  user_id: string;
  bio: string | null;
  skills: string[];
  photo_url: string | null;
  average_rating: number;
  completed_shifts: number;
  days_availability: string[];
  weekly_hours: string | null;
  work_type: string[];
  shift_preference: string[];
  skills_by_role: Record<string, string[]>;
  years_per_role: Record<string, number>;
  onboarding_completed: boolean;
  onboarding_step: number;
  worker_status: 'active' | 'suspended';
}

export interface ProExperience {
  id: string;
  pro_id: string;
  position: string;
  business_name: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  created_at: string;
}

export interface Shift {
  id: string;
  business_id: string;
  location_id: string;
  job_title: JobTitle;
  date: string;           // ISO date string YYYY-MM-DD
  start_time: string;     // HH:MM
  end_time: string;       // HH:MM
  duration_hours: number;
  workers_needed: number;
  pro_hourly_rate_iqd: number;
  shift_type: ShiftType;
  description: string | null;
  what_to_expect: string | null;
  clothing_rules: string[];
  required_skills: string[];
  preferred_skills: string[];
  rules_and_regulations: string | null;
  cancellation_policy: string | null;
  payment_terms: string | null;
  special_badge: string | null;
  platform_fee_iqd: number;
  status: ShiftStatus;
  created_at: string;
}

export interface Application {
  id: string;
  shift_id: string;
  pro_id: string;
  status: ApplicationStatus;
  applied_at: string;
  confirmed_clothing: boolean;
  confirmed_cancellation_policy: boolean;
  expires_at: string | null;
}

export interface Rating {
  id: string;
  shift_id: string;
  rater_id: string;
  rated_id: string;
  stars: number;
  comment: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ─── Joined / View Types ──────────────────────────────────────

export interface ShiftWithLocation extends Shift {
  business_locations: BusinessLocation;
}

export interface ShiftWithBusiness extends Shift {
  users: Pick<User, 'id' | 'full_name'>;
  business_profiles: Pick<BusinessProfile, 'business_name'>;
  business_locations: Pick<BusinessLocation, 'city' | 'address' | 'branch_name'>;
}

export interface ApplicationWithPro extends Application {
  users: Pick<User, 'id' | 'full_name' | 'city'>;
  pro_profiles: Pick<ProProfile, 'skills' | 'photo_url' | 'average_rating' | 'completed_shifts' | 'bio'>;
}

export interface ShiftTemplate {
  id: string;
  business_id: string;
  name: string;
  location_id: string | null;
  job_title: string;
  workers_needed: number;
  pro_hourly_rate_iqd: number;
  shift_type: ShiftType;
  description: string | null;
  what_to_expect: string | null;
  clothing_rules: string[];
  required_skills: string[];
  preferred_skills: string[];
  rules_and_regulations: string | null;
  cancellation_policy: string | null;
  payment_terms: string | null;
  special_badge: string | null;
  created_at: string;
}

// ─── Session / Auth ───────────────────────────────────────────

export interface SessionUser {
  id: string;
  role: UserRole;
  full_name: string;
  city: IraqiCity;
  phone: string;
}
