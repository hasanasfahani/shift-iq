import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BusinessProfileClient from '@/components/business/BusinessProfileClient';
import type { BusinessType } from '@/types';

export default async function BusinessProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('business_profiles')
    .select('business_name, business_type, description, photos, average_rating, total_ratings, is_verified')
    .eq('user_id', user.id)
    .single();

  if (!profile) redirect('/business/dashboard');

  return (
    <BusinessProfileClient
      initialProfile={{
        businessName: profile.business_name,
        businessType: profile.business_type as BusinessType,
        description: profile.description ?? '',
        photoUrl: profile.photos?.[0] ?? '',
        averageRating: profile.average_rating,
        totalRatings: profile.total_ratings,
        isVerified: profile.is_verified,
      }}
    />
  );
}

export const metadata = { title: 'Business Profile' };
