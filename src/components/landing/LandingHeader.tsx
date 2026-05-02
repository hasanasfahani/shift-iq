'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const NAV_LINKS = [
  { label: 'For workers', href: '#how-it-works' },
  { label: 'For companies', href: '#companies' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Categories', href: '#categories' },
  { label: 'FAQ', href: '#faq' },
];

export default function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  function isActive(href: string) {
    const id = href.replace('#', '');
    return activeSection === id;
  }

  return (
    <header
      className={[
        'fixed top-0 inset-x-0 z-50 transition-[background-color,box-shadow,border-color] duration-300',
        scrolled
          ? 'bg-[#0F3D36]/95 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/20'
          : 'bg-[#0F3D36]',
      ].join(' ')}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-black text-[#28D96D] shrink-0 tracking-tight">
          Shift.iq
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={[
                'text-sm font-medium whitespace-nowrap transition-colors relative py-1',
                isActive(link.href)
                  ? 'text-white'
                  : 'text-white/60 hover:text-white',
              ].join(' ')}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute -bottom-0.5 inset-x-0 h-0.5 bg-[#28D96D] rounded-full" />
              )}
            </a>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            className="hidden sm:flex items-center gap-1.5 text-white/60 hover:text-white text-sm font-medium transition-colors px-2 py-1.5 rounded-full hover:bg-white/10"
            aria-label="Switch language"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden md:inline">EN</span>
          </button>

          <Link
            href="/login"
            className="hidden sm:block text-sm text-white/80 hover:text-white font-semibold px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            Log in
          </Link>

          <Link
            href="/signup/pro"
            className="bg-[#28D96D] hover:bg-[#00F06A] active:scale-95 text-[#0F3D36] font-bold text-sm px-5 py-2 rounded-full transition-all whitespace-nowrap"
          >
            Sign up now
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <svg
              className="w-5 h-5 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown — animated with max-height */}
      <div
        className={[
          'lg:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out',
          'bg-[#0F3D36] border-t border-white/10',
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
        ].join(' ')}
      >
        <div className="px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={[
                'font-medium py-2.5 px-3 rounded-xl transition-colors',
                isActive(link.href)
                  ? 'text-white bg-white/10'
                  : 'text-white/80 hover:text-white hover:bg-white/10',
              ].join(' ')}
            >
              {link.label}
            </a>
          ))}
          <div className="border-t border-white/10 pt-3 mt-2 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="text-white/60 hover:text-white font-medium py-2 px-3"
            >
              Log in
            </Link>
            <Link
              href="/signup/pro"
              onClick={() => setMenuOpen(false)}
              className="bg-[#28D96D] text-[#0F3D36] font-bold text-sm px-5 py-2.5 rounded-full text-center"
            >
              Sign up now
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
