import type { IraqiCity, BusinessType, JobTitle, ShiftType } from '@/types';

export const CITIES: IraqiCity[] = [
  'Baghdad',
  'Erbil',
  'Basra',
  'Sulaymaniyah',
  'Mosul',
  'Kirkuk',
  'Najaf',
  'Karbala',
];

export const BUSINESS_TYPES: BusinessType[] = [
  'Restaurant',
  'Café',
  'Hotel',
  'Catering Company',
  'Event Venue',
  'Other',
];

export const JOB_TITLES: JobTitle[] = [
  'Line Cook',
  'Prep Cook',
  'Banquet Cook',
  'Baker / Pastry Cook',
  'Server Assistant',
  'Restaurant Server',
  'Banquet Server',
  'Food Runner',
  'Busser',
  'Host',
  'Bartender',
  'Beer & Wine Bartender',
  'Mixologist',
  'Barback',
  'Barista',
  'Dishwasher',
  'FOH Support',
  'Coat Check Attendant',
  'Event Staff',
  'Event Help',
  'Event Lead',
  'Event Coordinator',
  'Banquet Captain',
  'Banquet Setup',
  'General Laborer',
  'General Cleaning',
  'Maintenance',
  'Food Assembler',
  'Volunteer',
  'Stage',
  'Delivery Driver',
];

export const SKILLS_BY_ROLE: Partial<Record<JobTitle, string[]>> = {
  'Line Cook': ['Knife skills', 'Food safety & hygiene', 'Station setup & breakdown', 'Grill operation', 'Fryer operation', 'Speed under pressure', 'Recipe adherence', 'Inventory management'],
  'Prep Cook': ['Ingredient preparation', 'Knife skills', 'Food safety & hygiene', 'Cold prep', 'Portioning', 'Speed & efficiency'],
  'Banquet Cook': ['Large-batch cooking', 'Banquet menu execution', 'Food safety & hygiene', 'Speed under pressure', 'Station management'],
  'Baker / Pastry Cook': ['Bread & pastry baking', 'Cake decoration', 'Dessert plating', 'Dough preparation', 'Temperature control', 'Recipe scaling'],
  'Server Assistant': ['Table setting', 'Food delivery', 'Guest interaction', 'Side work', 'Section coordination'],
  'Restaurant Server': ['Table service', 'Menu knowledge', 'Order taking', 'POS system', 'Upselling', 'Guest interaction', 'Cash handling', 'Tray carrying'],
  'Banquet Server': ['Banquet service', 'Formal table setting', 'Plated meal service', 'Tray carrying', 'Guest interaction', 'Banquet setup'],
  'Food Runner': ['Food delivery', 'Order accuracy', 'Speed & urgency', 'Team communication', 'Kitchen coordination'],
  'Busser': ['Table bussing', 'Table resetting', 'Side work', 'Speed & efficiency', 'Team support'],
  'Host': ['Guest greeting & seating', 'Reservation management', 'Waitlist management', 'Phone etiquette', 'Floor coordination'],
  'Bartender': ['Cocktail preparation', 'Bar setup & breakdown', 'Cash handling', 'Customer service', 'Drink knowledge', 'Speed under pressure', 'Age verification'],
  'Beer & Wine Bartender': ['Beer service', 'Wine knowledge', 'Cellar management', 'Customer service', 'Age verification'],
  'Mixologist': ['Cocktail creation', 'Advanced mixology', 'Garnish preparation', 'Drink menu development', 'Customer engagement'],
  'Barback': ['Bar restocking', 'Ice management', 'Glass washing', 'Bar cleaning', 'Speed & support'],
  'Barista': ['Espresso preparation', 'Latte art', 'Coffee grinding & brewing', 'POS operation', 'Customer service', 'Menu knowledge'],
  'Dishwasher': ['Commercial dishwasher operation', 'Sanitization standards', 'Kitchen cleaning', 'Waste disposal', 'Speed under pressure'],
  'FOH Support': ['Guest services', 'Floor support', 'Communication', 'Multi-tasking', 'Problem solving'],
  'Coat Check Attendant': ['Item tagging & tracking', 'Guest interaction', 'Organization', 'Cash handling'],
  'Event Staff': ['Event setup & breakdown', 'Guest services', 'Equipment handling', 'Communication'],
  'Event Help': ['Physical setup', 'Guest support', 'Team coordination', 'Adaptability'],
  'Event Lead': ['Team supervision', 'Event coordination', 'Problem solving', 'Client communication'],
  'Event Coordinator': ['Event planning', 'Vendor coordination', 'Timeline management', 'Client relations', 'Logistics'],
  'Banquet Captain': ['Team leadership', 'Service coordination', 'Client communication', 'Quality control', 'Banquet execution'],
  'Banquet Setup': ['Table & chair setup', 'Linen management', 'Equipment arrangement', 'Physical stamina', 'Attention to detail'],
  'General Laborer': ['Physical stamina', 'Equipment operation', 'Safety compliance', 'Teamwork', 'Adaptability'],
  'General Cleaning': ['Sweeping & mopping', 'Surface sanitation', 'Restroom cleaning', 'Waste management', 'Attention to detail'],
  'Maintenance': ['Basic repairs', 'Equipment maintenance', 'Safety compliance', 'Problem solving', 'Physical stamina'],
  'Food Assembler': ['Food preparation', 'Speed & accuracy', 'Food safety', 'Order accuracy', 'Portion control'],
  'Volunteer': ['Teamwork', 'Adaptability', 'Guest interaction', 'Physical stamina'],
  'Stage': ['Stage setup & breakdown', 'Equipment handling', 'Physical stamina', 'Team coordination'],
  'Delivery Driver': ['Route navigation', 'Timely delivery', 'Customer interaction', 'Vehicle operation', 'Time management'],
};

export const SHIFT_TYPES: ShiftType[] = ['one-time', 'recurring', 'temp-to-hire'];

export const ROLES_BY_BUSINESS_TYPE: Record<BusinessType, JobTitle[]> = {
  Restaurant: ['Line Cook', 'Prep Cook', 'Baker / Pastry Cook', 'Server Assistant', 'Restaurant Server', 'Food Runner', 'Busser', 'Host', 'Bartender', 'Barista', 'Dishwasher', 'FOH Support'],
  Café: ['Server Assistant', 'Restaurant Server', 'Host', 'Barista', 'Baker / Pastry Cook', 'Dishwasher'],
  Hotel: ['Line Cook', 'Prep Cook', 'Banquet Cook', 'Baker / Pastry Cook', 'Server Assistant', 'Restaurant Server', 'Banquet Server', 'Food Runner', 'Busser', 'Host', 'Bartender', 'Beer & Wine Bartender', 'Barista', 'Dishwasher', 'Coat Check Attendant', 'Event Staff', 'Event Coordinator', 'Banquet Captain', 'Banquet Setup', 'General Cleaning', 'General Laborer', 'Maintenance', 'FOH Support'],
  'Catering Company': ['Line Cook', 'Prep Cook', 'Banquet Cook', 'Baker / Pastry Cook', 'Server Assistant', 'Banquet Server', 'Food Runner', 'Dishwasher', 'Banquet Captain', 'Banquet Setup', 'Event Staff', 'Event Help', 'General Laborer', 'Food Assembler'],
  'Event Venue': ['Server Assistant', 'Banquet Server', 'Restaurant Server', 'Host', 'Bartender', 'Beer & Wine Bartender', 'Barista', 'Coat Check Attendant', 'Event Staff', 'Event Help', 'Event Lead', 'Event Coordinator', 'Banquet Captain', 'Banquet Setup', 'General Laborer', 'FOH Support', 'Stage'],
  Other: ['Line Cook', 'Prep Cook', 'Banquet Cook', 'Baker / Pastry Cook', 'Server Assistant', 'Restaurant Server', 'Banquet Server', 'Food Runner', 'Busser', 'Host', 'Bartender', 'Beer & Wine Bartender', 'Mixologist', 'Barback', 'Barista', 'Dishwasher', 'FOH Support', 'Coat Check Attendant', 'Event Staff', 'Event Help', 'Event Lead', 'Event Coordinator', 'Banquet Captain', 'Banquet Setup', 'General Laborer', 'General Cleaning', 'Maintenance', 'Food Assembler', 'Volunteer', 'Stage', 'Delivery Driver'],
};

export const CLOTHING_OPTIONS = [
  'Black trousers',
  'Black shoes',
  'White shirt',
  'Black shirt',
  'Full uniform provided',
  'Smart casual',
  'All black outfit',
  'Chef whites',
  'Apron provided',
  'Non-slip shoes required',
] as const;

export const CANCELLATION_POLICIES = [
  { value: '24h', label: 'Cancel up to 24 hours before' },
  { value: '48h', label: 'Cancel up to 48 hours before' },
  { value: '72h', label: 'Cancel up to 72 hours before' },
  { value: 'no_cancel', label: 'No cancellation once accepted' },
] as const;

export const PAYMENT_TERMS = [
  { value: 'on_completion', label: 'Paid on shift completion' },
  { value: 'weekly', label: 'Weekly pay' },
  { value: 'bi_weekly', label: 'Bi-weekly pay' },
] as const;

export const SPECIAL_BADGES = [
  { value: 'urgent', label: 'Urgent', color: '#EF4444' },
  { value: 'top_rated', label: 'Top-rated business', color: '#F97316' },
  { value: 'new', label: 'New on Shift.iq', color: '#7426E8' },
  { value: 'premium_pay', label: 'Premium pay', color: '#28D96D' },
] as const;

export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
export const WEEKLY_HOURS_OPTIONS = ['Less than 10', '10–20', '20–30', '30–40'] as const;
export const WORK_TYPE_OPTIONS = ['Gig work', 'Part-time work', 'Full-time work', 'Contract'] as const;
export const SHIFT_PREFERENCE_OPTIONS = ['Morning', 'Daytime', 'Evening'] as const;

// Platform fee charged to businesses — stored as integer IQD, never changes for historical shifts
export const PLATFORM_FEE_PER_HOUR_IQD = 1_000;

// Iraqi phone regex — accepts: 07XXXXXXXXX, 7XXXXXXXXX, +9647XXXXXXXXX
export const IRAQI_PHONE_REGEX = /^(\+964|0)?7[3-9]\d{8}$/;

// Normalize any valid Iraqi phone format to +964XXXXXXXXXX
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('964')) return `+${digits}`;
  if (digits.startsWith('0')) return `+964${digits.slice(1)}`;
  return `+964${digits}`;
}

// Format IQD for display: 25000 → "25,000 IQD"
export function formatIQD(amount: number): string {
  return `${amount.toLocaleString('en-US')} IQD`;
}
