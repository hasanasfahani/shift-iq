'use client';

import { usePathname } from 'next/navigation';
import ProOnboardingBanner from './ProOnboardingBanner';

export default function ProOnboardingBannerClient() {
  const pathname = usePathname();
  const isOnboardingPage = pathname === '/pro/onboarding';
  return <ProOnboardingBanner show={!isOnboardingPage} />;
}
