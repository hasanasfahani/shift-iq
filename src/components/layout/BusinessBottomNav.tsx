'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const NAV_ITEMS = [
  {
    href: '/business/dashboard',
    labelKey: 'nav.dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/business/shifts',
    labelKey: 'nav.shifts',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    href: '/business/post-shift',
    labelKey: 'nav.postShift',
    isAction: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    href: '/business/locations',
    labelKey: 'nav.locations',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: '/business/profile',
    labelKey: 'nav.profile',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
];

export default function BusinessBottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm border-t border-[#E7E2EF] flex lg:hidden z-40">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

        if ((item as any).isAction) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 active:scale-90 transition-transform duration-100"
            >
              <span className="flex items-center justify-center w-10 h-7 rounded-xl bg-[#7426E8] text-white transition-all duration-150 active:scale-95 animate-nav-pop">
                {item.icon}
              </span>
              <span className="text-[10px] font-semibold text-[#7426E8]">
                {t(item.labelKey)}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 active:scale-90 transition-transform duration-100"
          >
            <span
              className={`flex items-center justify-center w-10 h-7 rounded-xl transition-all duration-200 ${
                isActive ? 'bg-[#E9DEFF] scale-100 animate-nav-pop' : 'scale-90 bg-transparent'
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
