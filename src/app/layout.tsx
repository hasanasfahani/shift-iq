import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import I18nProvider from '@/i18n/I18nProvider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://shift.iq';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Shift.iq — Iraq\'s Hospitality Gig Platform',
    template: '%s · Shift.iq',
  },
  description: 'Fill hospitality shifts in hours. Connect venues with skilled workers across Iraq.',
  openGraph: {
    type: 'website',
    siteName: 'Shift.iq',
    title: 'Shift.iq — Iraq\'s Hospitality Gig Platform',
    description: 'Fill hospitality shifts in hours. Connect venues with skilled workers across Iraq.',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shift.iq — Iraq\'s Hospitality Gig Platform',
    description: 'Fill hospitality shifts in hours. Connect venues with skilled workers across Iraq.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // lang and dir are set to 'en' / 'ltr' for MVP.
  // When multi-language support is added, read locale from cookies/header here
  // and pass the correct dir value ('rtl' for Arabic and Kurdish).
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full bg-white text-slate-900 antialiased">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
