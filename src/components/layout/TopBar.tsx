'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import NotificationBell from './NotificationBell';

interface TopBarProps {
  userName: string;
  role: 'business' | 'pro';
}

export default function TopBar({ userName, role }: TopBarProps) {
  const { t } = useTranslation();
  const dashboardHref = role === 'business' ? '/business/dashboard' : '/pro/dashboard';

  return (
    <header className="h-14 bg-[#0F3D36] border-b border-[#15594D] flex items-center justify-between px-4 lg:px-6 shrink-0">
      <Link href={dashboardHref} className="text-lg font-bold text-[#28D96D]">
        Shift.iq
      </Link>
      <div className="flex items-center gap-3">
        <NotificationBell />
        <span className="text-sm text-white/80 hidden sm:block">{userName}</span>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            {t('nav.logout')}
          </button>
        </form>
      </div>
    </header>
  );
}
