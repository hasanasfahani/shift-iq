'use client';

import Link from 'next/link';

interface Props {
  show: boolean;
}

export default function ProOnboardingBanner({ show }: Props) {
  if (!show) return null;

  return (
    <div className="bg-[#0F3D36] border-b border-[#15594D] px-4 py-2.5 flex items-center justify-between gap-2 text-sm">
      <p className="text-white font-medium">
        Complete your profile to get more opportunities
      </p>
      <Link
        href="/pro/onboarding"
        className="shrink-0 text-[#28D96D] font-semibold hover:underline"
      >
        Complete now →
      </Link>
    </div>
  );
}
