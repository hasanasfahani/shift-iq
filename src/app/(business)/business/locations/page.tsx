import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LocationsClient from '@/components/locations/LocationsClient';
import type { BusinessLocation } from '@/types';

export default async function BusinessLocationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: locations } = await supabase
    .from('business_locations')
    .select('*')
    .eq('business_id', user.id)
    .order('created_at', { ascending: true });

  return <LocationsClient initialLocations={(locations ?? []) as BusinessLocation[]} />;
}

export const metadata = { title: 'Locations' };
