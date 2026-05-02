'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const NAV_ITEMS = [
  {
    href: '/pro/dashboard',
    labelKey: 'nav.dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/pro/browse',
    labelKey: 'nav.browse',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    href: '/pro/applications',
    labelKey: 'nav.applications',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: '/pro/profile',
    labelKey: 'nav.profile',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function ProBottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm border-t border-[#E7E2EF] flex lg:hidden z-40">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 active:scale-90 transition-transform duration-100"
          >
            <span
              className={`flex items-center justify-center w-10 h-7 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-[#E9DEFF] scale-100 animate-nav-pop'
                  : 'scale-90 bg-transparent'
              }`}
            >
              <span className={`transition-colors duration-200 ${isActive ? 'text-[#7426E8]' : 'text-[#C9C4D2]'}`}>
                {item.icon}
              </span>
            </span>
            <span className={`text-[10px] font-semibold transition-all duration-200 ${
              isActive ? 'text-[#7426E8]' : 'text-[#C9C4D2]'
            }`}>
              {t(item.labelKey)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
