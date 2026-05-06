'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '@/hooks/useNotifications';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationBell() {
  const { t } = useTranslation();
  const router = useRouter();
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  function toggleOpen() {
    if (!open && unreadCount > 0) {
      markAllRead();
    }
    setOpen((prev) => !prev);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label={t('nav.notifications')}
        onClick={toggleOpen}
        className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
      >
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-[#0F3D36] bg-[#28D96D] rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 top-full mt-2 w-80 bg-white rounded-2xl border border-[#E7E2EF] shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E7E2EF] flex items-center justify-between">
            <span className="font-semibold text-sm text-[#12051F]">{t('nav.notifications')}</span>
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[#8B8299]">
              {t('nav.noNotifications')}
            </div>
          ) : (
            <ul className="divide-y divide-[#E7E2EF] max-h-96 overflow-y-auto">
              {notifications.map((n) => {
                const inner = (
                  <>
                    <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!n.is_read ? 'bg-[#7426E8]' : ''}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#12051F] leading-snug">{n.message}</p>
                      <p className="text-xs text-[#8B8299] mt-0.5">{timeAgo(n.created_at)}</p>
                    </div>
                    {n.link && (
                      <svg className="w-4 h-4 text-[#7426E8] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </>
                );
                const cls = `flex items-start gap-3 px-4 py-3 ${!n.is_read ? 'bg-[#F3F0FB]' : ''} ${n.link ? 'cursor-pointer hover:bg-[#F7F4FC] transition-colors' : ''}`;
                return n.link ? (
                  <li key={n.id} className={cls} onClick={() => { setOpen(false); router.push(n.link!); }}>
                    {inner}
                  </li>
                ) : (
                  <li key={n.id} className={cls}>{inner}</li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
