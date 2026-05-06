import type { ReactNode } from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">

      {/* ── Left brand panel (desktop only) ─────────────────────── */}
      <div className="hidden lg:flex w-[44%] xl:w-[40%] bg-[#0F3D36] flex-col relative overflow-hidden shrink-0">
        {/* Decorative blobs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#28D96D]/10 pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-[#7426E8]/10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-white/[0.03] pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <Link href="/" className="text-2xl font-black text-[#28D96D] self-start">
            Shift.iq
          </Link>

          {/* Main content */}
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Iraq&apos;s shift platform<br />for real<br />
              <span className="text-[#28D96D]">professionals.</span>
            </h2>
            <p className="text-white/60 text-base mb-10 leading-relaxed max-w-xs">
              Join 10,000+ workers and hundreds of businesses already using Shift.iq across Iraq.
            </p>

            {/* Stats */}
            <div className="flex flex-col gap-3 mb-10">
              {[
                { value: '10,000+', label: 'Active Pros registered' },
                { value: '2,400+',  label: 'Shifts filled this month' },
                { value: '8',       label: 'Cities covered across Iraq' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#28D96D] shrink-0" />
                  <span className="text-white/80 text-sm font-medium">
                    <span className="text-white font-bold">{stat.value}</span>{' '}
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-5 border border-white/10">
              <p className="text-white/80 text-sm leading-relaxed mb-4 italic">
                &ldquo;Shift.iq helped me earn 3× more while keeping my schedule flexible. I pick shifts that work for me.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#28D96D]/25 flex items-center justify-center text-[#28D96D] font-bold text-sm shrink-0">
                  S
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">Sara Ahmed</p>
                  <p className="text-white/40 text-xs">Head Waitress · Erbil</p>
                </div>
                {/* Stars */}
                <div className="ml-auto flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="w-3 h-3 text-[#28D96D]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <p className="text-white/25 text-xs">© 2026 Shift.iq. All rights reserved.</p>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-[#F7F4FC] min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 lg:px-10 pt-6 pb-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[#8B8299] hover:text-[#12051F] font-medium transition-colors group"
          >
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>

          {/* Mobile logo */}
          <Link href="/" className="lg:hidden text-xl font-black text-[#0F3D36]">
            Shift.iq
          </Link>

          {/* Spacer to balance the back button */}
          <div className="w-12" />
        </div>

        {/* Centered form */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>

    </div>
  );
}
