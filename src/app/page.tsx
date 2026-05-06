import Link from 'next/link';
import Image from 'next/image';
import LandingHeader from '@/components/landing/LandingHeader';
import SearchBar from '@/components/landing/SearchBar';
import FaqAccordion from '@/components/landing/FaqAccordion';
import AnimateIn from '@/components/landing/AnimateIn';

/* ─── Data ───────────────────────────────────────────────────── */

const BENEFITS = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Apply in 60 seconds',
    desc: 'Browse open shifts nearby and apply instantly from your phone.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Transparent pay',
    desc: 'See the exact hourly rate before you apply — no surprises.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Flexible schedule',
    desc: 'Work when you want — mornings, evenings, weekends, one-offs.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: 'Verified businesses',
    desc: 'Every venue on Shift.iq is identity-verified and rated by other Pros.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    title: 'Build your reputation',
    desc: 'Earn ratings after each shift. The better your record, the more you earn.',
  },
];

const HOW_IT_WORKS_PRO = [
  {
    num: '01',
    bg: 'bg-[#DDF4EA]',
    textColor: 'text-[#0F3D36]',
    title: 'Create your profile',
    desc: 'Add your experience, skills, and availability in under 5 minutes.',
  },
  {
    num: '02',
    bg: 'bg-[#E9DEFF]',
    textColor: 'text-[#7426E8]',
    title: 'Browse & apply',
    desc: 'Find shifts near you. Filter by role, date, pay, or distance.',
  },
  {
    num: '03',
    bg: 'bg-[#0F3D36]',
    textColor: 'text-[#28D96D]',
    title: 'Show up & get paid',
    desc: 'Work the shift, collect your rating, and get paid directly.',
  },
];

const JOB_CATEGORIES = [
  { name: 'Hospitality', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80' },
  { name: 'Bartending', img: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&q=80' },
  { name: 'Events', img: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&q=80' },
  { name: 'Food & Beverage', img: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&q=80' },
  { name: 'Retail', img: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=400&q=80' },
  { name: 'Cleaning', img: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&q=80' },
  { name: 'Logistics', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&q=80' },
  { name: 'Security', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
];

const TRUST_POINTS = [
  'Every business is identity-verified before posting',
  'Worker profiles are reviewed for completeness',
  'Ratings are left by real employers after each shift',
  'Disputes are handled by our support team within 24 h',
];

const PROFILE_BENEFITS = [
  'Highlight your best skills per role',
  'Add work experience from any employer',
  'Set your weekly availability',
  'Get discovered by top venues in your city',
];

const FAQ_ITEMS = [
  {
    q: 'Who can sign up as a Pro?',
    a: 'Anyone with experience in hospitality, retail, events, logistics, cleaning, security, or general labor. Sign up takes 2 minutes.',
  },
  {
    q: 'How does payment work?',
    a: 'The hourly rate shown on each shift is what you earn. Payment is arranged directly with the business after shift completion.',
  },
  {
    q: 'Is Shift.iq available in my city?',
    a: 'We are currently live in Erbil, Sulaymaniyah, and Duhok — with Baghdad, Basra, Mosul, Kirkuk, Najaf, and Karbala coming soon.',
  },
  {
    q: 'What does it cost for businesses?',
    a: 'Businesses pay 1,000 IQD per hour per worker posted. Pros pay nothing — ever.',
  },
  {
    q: 'Can I post recurring shifts?',
    a: 'Yes — when creating a shift you can mark it as one-time, recurring, or temp-to-hire.',
  },
  {
    q: 'How do I get more applications?',
    a: 'Complete your business profile, add a clear job description, and set a competitive hourly rate. Verified businesses get 3× more applications.',
  },
];

const FOOTER_COLS = [
  {
    heading: 'For workers',
    links: ['Browse shifts', 'How it works', 'Earnings', 'Build a profile', 'Download app'],
  },
  {
    heading: 'For companies',
    links: ['Post a shift', 'Pricing', 'Manage applicants', 'Trust & Safety', 'Enterprise'],
  },
  {
    heading: 'Shift.iq',
    links: ['About us', 'Blog', 'Careers', 'Press', 'Contact'],
  },
  {
    heading: 'Sectors',
    links: ['Hospitality', 'Retail', 'Events', 'Logistics', 'Cleaning & Security'],
  },
  {
    heading: 'Legal',
    links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Accessibility'],
  },
];

/* ─── Sub-components ─────────────────────────────────────────── */

function FloatingJobCard() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 w-64 text-left">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-[#0F3D36] bg-[#DDF4EA] px-2 py-0.5 rounded-full">Open now</span>
        <span className="text-xs text-[#8B8299]">Erbil</span>
      </div>
      <p className="font-bold text-[#12051F] text-sm mb-1">Head Waiter · Grand Venue</p>
      <p className="text-xs text-[#8B8299] mb-3">Sat 3 May · 18:00 – 01:00 · 7 h</p>
      <div className="flex items-center justify-between">
        <span className="text-lg font-black text-[#0F3D36]">42,000 <span className="text-xs font-medium">IQD/h</span></span>
        <button className="bg-[#28D96D] text-[#0F3D36] text-xs font-bold px-3 py-1.5 rounded-full">Apply</button>
      </div>
    </div>
  );
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < rating ? 'text-[#28D96D]' : 'text-[#E7E2EF]'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />

      {/* ── 1. Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/hero-erbil.jpg"
            alt="Erbil city skyline at night"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[#0F3D36]/80" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-24 grid lg:grid-cols-2 gap-12 items-center w-full">
          <AnimateIn delay={100}>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#28D96D]/20 border border-[#28D96D]/40 text-[#28D96D] text-xs font-semibold rounded-full mb-6 tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#28D96D] animate-pulse" />
              Iraq&apos;s #1 shift platform
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
              Find a shift.<br />
              <span className="text-[#28D96D]">Fill a shift.</span><br />
              Today.
            </h1>
            <p className="text-white/70 text-lg mb-8 max-w-md leading-relaxed">
              Shift.iq connects skilled workers with venues that need them — in hours, not days.
            </p>
            <div className="mb-8">
              <SearchBar />
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup/pro" className="px-7 py-3 bg-[#28D96D] text-[#0F3D36] font-bold rounded-full hover:bg-[#00F06A] active:scale-95 transition-all text-sm whitespace-nowrap">
                Find shifts as a Pro →
              </Link>
              <Link href="/signup/business" className="px-7 py-3 bg-white/10 text-white font-bold rounded-full border border-white/30 hover:bg-white/20 active:scale-95 transition-all text-sm whitespace-nowrap">
                Post a shift as a Business
              </Link>
            </div>
          </AnimateIn>

          <AnimateIn delay={300} direction="left" className="hidden lg:flex justify-center items-center">
            <div className="relative animate-float">
              <FloatingJobCard />
              <div className="absolute -bottom-4 -right-4 bg-[#7426E8] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                247 shifts open today
              </div>
            </div>
          </AnimateIn>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 inset-x-0 flex justify-center z-10 pointer-events-none">
          <div className="flex flex-col items-center gap-1.5 text-white/40 animate-scroll-bounce">
            <span className="text-[10px] font-semibold tracking-widest uppercase">Scroll</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── 2. Benefits Strip ───────────────────────────────────── */}
      <section className="bg-white py-14 border-b border-[#E7E2EF]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <AnimateIn>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              {BENEFITS.map((b, i) => (
                <AnimateIn key={b.title} delay={i * 80} className="flex flex-col items-center text-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#DDF4EA] flex items-center justify-center text-[#0F3D36]">
                    {b.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#12051F] mb-0.5">{b.title}</p>
                    <p className="text-xs text-[#8B8299] leading-relaxed">{b.desc}</p>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ── 3. How It Works ─────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-[#F7F4FC]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <AnimateIn className="text-center mb-14">
            <p className="text-xs font-bold text-[#7426E8] tracking-widest uppercase mb-3">For workers</p>
            <h2 className="text-4xl font-extrabold text-[#12051F] mb-4">Work more. Earn more.</h2>
            <p className="text-[#8B8299] max-w-md mx-auto">Three simple steps from sign-up to payday.</p>
          </AnimateIn>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {HOW_IT_WORKS_PRO.map((step, i) => (
              <AnimateIn key={step.num} delay={i * 120}>
                <div className={`${step.bg} rounded-3xl p-8 h-full`}>
                  <span className={`text-5xl font-black ${step.textColor} opacity-30`}>{step.num}</span>
                  <h3 className={`text-xl font-bold ${step.textColor} mt-4 mb-2`}>{step.title}</h3>
                  <p className={`text-sm leading-relaxed ${step.textColor} opacity-70`}>{step.desc}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Job Categories ───────────────────────────────────── */}
      <section id="categories" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <AnimateIn className="text-center mb-14">
            <p className="text-xs font-bold text-[#7426E8] tracking-widest uppercase mb-3">Sectors</p>
            <h2 className="text-4xl font-extrabold text-[#12051F] mb-4">Every sector covered</h2>
            <p className="text-[#8B8299] max-w-md mx-auto">From hotel lobbies to delivery routes — Shift.iq has a role for you.</p>
          </AnimateIn>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {JOB_CATEGORIES.map((cat, i) => (
              <AnimateIn key={cat.name} delay={i * 60}>
                <Link href="/signup/pro" className="group relative aspect-square rounded-2xl overflow-hidden block">
                  <Image src={cat.img} alt={cat.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105" />
                  <div className="absolute inset-0 bg-[#12051F]/50 group-hover:bg-[#7426E8]/60 transition-colors duration-500 ease-in-out" />
                  <span className="absolute bottom-0 inset-x-0 p-4 text-white font-bold text-sm">{cat.name}</span>
                </Link>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Earnings ─────────────────────────────────────────── */}
      <section className="py-24 bg-[#0F3D36]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <AnimateIn>
            <p className="text-xs font-bold text-[#28D96D] tracking-widest uppercase mb-3">Earnings</p>
            <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">
              You set your rate.<br />We find the work.
            </h2>
            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              The hourly rate on every shift is transparent before you apply. No negotiating, no surprises — just show up and earn.
            </p>
            <div className="grid grid-cols-3 gap-6 mb-8">
              {[
                { label: 'Avg. hourly rate', value: '38,000', unit: 'IQD' },
                { label: 'Shifts filled today', value: '247', unit: '' },
                { label: 'Cities active', value: '8', unit: '' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-black text-[#28D96D]">{stat.value} <span className="text-sm font-medium text-white/40">{stat.unit}</span></p>
                  <p className="text-xs text-white/50 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
            <Link href="/signup/pro" className="inline-flex items-center gap-2 px-7 py-3 bg-[#28D96D] text-[#0F3D36] font-bold rounded-full hover:bg-[#00F06A] active:scale-95 transition-all text-sm">
              Start earning today →
            </Link>
          </AnimateIn>

          <AnimateIn delay={150} direction="left" className="flex justify-center">
            <div className="relative animate-float">
              <FloatingJobCard />
              <div className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-xl px-4 py-3 text-xs">
                <p className="font-bold text-[#12051F] mb-0.5">This week</p>
                <p className="text-2xl font-black text-[#0F3D36]">294,000 <span className="text-xs font-normal text-[#8B8299]">IQD</span></p>
                <p className="text-[#8B8299]">7 shifts completed</p>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ── 6. Trust & Safety ───────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <AnimateIn direction="right" className="flex justify-center">
            <div className="bg-[#F7F4FC] rounded-3xl p-6 w-72 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#E9DEFF] flex items-center justify-center text-[#7426E8] font-bold text-lg">S</div>
                <div>
                  <p className="font-bold text-[#12051F] text-sm">Sara Ahmed</p>
                  <p className="text-xs text-[#8B8299]">Head Waitress · Sulaymaniyah</p>
                </div>
                <div className="ml-auto">
                  <span className="bg-[#DDF4EA] text-[#0F3D36] text-xs font-bold px-2 py-0.5 rounded-full">Verified</span>
                </div>
              </div>
              <StarRow rating={5} />
              <p className="text-xs text-[#8B8299] mt-1 mb-4">4.9 · 83 shifts completed</p>
              <div className="flex flex-wrap gap-1.5">
                {['Fine dining', 'Events', 'Banquets', 'POS systems'].map((s) => (
                  <span key={s} className="text-[10px] font-medium text-[#7426E8] bg-[#E9DEFF] px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          </AnimateIn>

          <AnimateIn delay={150}>
            <p className="text-xs font-bold text-[#7426E8] tracking-widest uppercase mb-3">Trust & Safety</p>
            <h2 className="text-4xl font-extrabold text-[#12051F] mb-6 leading-tight">
              Every worker.<br />Every business.<br />Verified.
            </h2>
            <ul className="space-y-4 mb-8">
              {TRUST_POINTS.map((point, i) => (
                <AnimateIn key={point} delay={i * 80}>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#DDF4EA] flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-[#0F3D36]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-[#12051F] text-sm leading-relaxed">{point}</p>
                  </li>
                </AnimateIn>
              ))}
            </ul>
            <Link href="/signup/pro" className="inline-flex items-center gap-2 px-7 py-3 bg-[#0F3D36] text-white font-bold rounded-full hover:bg-[#15594D] active:scale-95 transition-all text-sm">
              Join as a Pro →
            </Link>
          </AnimateIn>
        </div>
      </section>

      {/* ── 7. Build Your Profile ───────────────────────────────── */}
      <section className="py-24 bg-[#F7F4FC]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <AnimateIn>
            <p className="text-xs font-bold text-[#7426E8] tracking-widest uppercase mb-3">Your profile</p>
            <h2 className="text-4xl font-extrabold text-[#12051F] mb-6 leading-tight">
              Your skills.<br />Your story.<br />Your rates.
            </h2>
            <p className="text-[#8B8299] text-lg mb-8 leading-relaxed">
              A Shift.iq profile is your professional identity. Show businesses exactly what you bring — and get booked for it.
            </p>
            <ul className="space-y-3 mb-8">
              {PROFILE_BENEFITS.map((b) => (
                <li key={b} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#7426E8] flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-[#12051F] text-sm font-medium">{b}</p>
                </li>
              ))}
            </ul>
            <Link href="/signup/pro" className="inline-flex items-center gap-2 px-7 py-3 bg-[#7426E8] text-white font-bold rounded-full hover:bg-[#6020C0] active:scale-95 transition-all text-sm">
              Build your profile →
            </Link>
          </AnimateIn>

          <AnimateIn delay={150} direction="left" className="flex justify-center">
            <div className="bg-white rounded-3xl shadow-lg p-6 w-72">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-full bg-[#E9DEFF] flex items-center justify-center text-[#7426E8] font-black text-xl">A</div>
                <div>
                  <p className="font-bold text-[#12051F]">Ali Hassan</p>
                  <p className="text-xs text-[#8B8299]">Bartender · Duhok</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-5">
                {[
                  { label: 'Shifts', value: '124' },
                  { label: 'Rating', value: '4.8' },
                  { label: 'Skills', value: '7' },
                ].map((s) => (
                  <div key={s.label} className="text-center bg-[#F7F4FC] rounded-xl py-3">
                    <p className="text-xl font-black text-[#12051F]">{s.value}</p>
                    <p className="text-[10px] text-[#8B8299]">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['Cocktails', 'Wine', 'Events', 'Flair'].map((s) => (
                  <span key={s} className="text-[10px] font-medium text-[#7426E8] bg-[#E9DEFF] px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ── 8. Worker Photo Grid ─────────────────────────────────── */}
      <section className="py-24 bg-[#0F3D36]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <AnimateIn className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-white mb-4">Meet our Pros</h2>
            <p className="text-white/60 max-w-md mx-auto">Thousands of experienced workers ready to fill your next shift across Iraq.</p>
          </AnimateIn>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {[
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
              'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
              'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
              'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
              'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=200&q=80',
              'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80',
            ].map((src, i) => (
              <AnimateIn key={i} delay={i * 50}>
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <Image src={src} alt="Pro worker" width={200} height={200} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              </AnimateIn>
            ))}
          </div>
          <AnimateIn delay={200} className="text-center mt-10">
            <Link href="/signup/pro" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#28D96D] text-[#0F3D36] font-bold rounded-full hover:bg-[#00F06A] active:scale-95 transition-all">
              Join 10,000+ Pros →
            </Link>
          </AnimateIn>
        </div>
      </section>

      {/* ── 9. For Companies ────────────────────────────────────── */}
      <section id="companies" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <AnimateIn>
            <p className="text-xs font-bold text-[#28D96D] tracking-widest uppercase mb-3">For businesses</p>
            <h2 className="text-4xl font-extrabold text-[#12051F] mb-6 leading-tight">
              Staff your venue.<br />Review applicants.<br />Accept in one tap.
            </h2>
            <p className="text-[#8B8299] text-lg mb-8 leading-relaxed">
              Post a shift in 2 minutes. Browse applicant profiles with ratings, experience, and skills — all verified. Accept who you want.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/signup/business" className="px-7 py-3 bg-[#28D96D] text-[#0F3D36] font-bold rounded-full hover:bg-[#00F06A] active:scale-95 transition-all text-sm text-center">
                Post your first shift →
              </Link>
              <Link href="/signup/business" className="px-7 py-3 bg-[#F7F4FC] text-[#7426E8] font-bold rounded-full hover:bg-[#E9DEFF] active:scale-95 transition-all text-sm text-center border border-[#E7E2EF]">
                See pricing
              </Link>
            </div>
          </AnimateIn>

          <AnimateIn delay={150} direction="left">
            <div className="flex flex-col gap-3">
              {[
                { name: 'Sara Ahmed', role: 'Head Waitress', rating: 5, shifts: 83, skills: ['Fine dining', 'Events'] },
                { name: 'Omar Salim', role: 'Bartender', rating: 4, shifts: 47, skills: ['Cocktails', 'Wine'] },
                { name: 'Nour Khalid', role: 'Chef de Partie', rating: 5, shifts: 121, skills: ['French cuisine', 'HACCP'] },
              ].map((ap, i) => (
                <AnimateIn key={ap.name} delay={i * 100}>
                  <div className="flex items-center gap-4 p-4 bg-[#F7F4FC] rounded-2xl border border-[#E7E2EF]">
                    <div className="w-10 h-10 rounded-full bg-[#E9DEFF] flex items-center justify-center text-[#7426E8] font-bold shrink-0">
                      {ap.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#12051F] text-sm">{ap.name}</p>
                      <p className="text-xs text-[#8B8299]">{ap.role} · {ap.shifts} shifts</p>
                      <StarRow rating={ap.rating} />
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">Decline</button>
                      <button className="text-xs font-bold text-[#0F3D36] bg-[#28D96D] px-3 py-1.5 rounded-full">Accept</button>
                    </div>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ── 10. FAQ ─────────────────────────────────────────────── */}
      <section id="faq" className="py-24 bg-[#F7F4FC]">
        <div className="max-w-2xl mx-auto px-4">
          <AnimateIn className="text-center mb-12">
            <p className="text-xs font-bold text-[#7426E8] tracking-widest uppercase mb-3">FAQ</p>
            <h2 className="text-4xl font-extrabold text-[#12051F]">Questions? Answered.</h2>
          </AnimateIn>
          <AnimateIn delay={100}>
            <div className="bg-white rounded-3xl border border-[#E7E2EF] px-6 shadow-sm">
              <FaqAccordion items={FAQ_ITEMS} />
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ── 11. Final CTA ───────────────────────────────────────── */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=1600&q=80" alt="Team working" fill className="object-cover" />
          <div className="absolute inset-0 bg-[#0F3D36]/85" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <AnimateIn>
            <h2 className="text-5xl font-extrabold text-white mb-6 leading-tight">
              Your next shift<br />
              <span className="text-[#28D96D]">starts here.</span>
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-lg mx-auto">
              Join thousands of Pros and businesses already building Iraq&apos;s new workforce together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link href="/signup/pro" className="px-9 py-4 bg-[#28D96D] text-[#0F3D36] font-bold rounded-full hover:bg-[#00F06A] active:scale-95 transition-all text-base">
                Get started as a Pro →
              </Link>
              <Link href="/signup/business" className="px-9 py-4 bg-white/10 text-white font-bold rounded-full border border-white/30 hover:bg-white/20 active:scale-95 transition-all text-base">
                Post a shift as a Business
              </Link>
            </div>
            <p className="text-white/40 text-sm">Free to join as a Pro · No subscription · Transparent fees</p>
          </AnimateIn>
        </div>
      </section>

      {/* ── 12. Footer ──────────────────────────────────────────── */}
      <footer className="bg-[#12051F] py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
            <div className="col-span-2 sm:col-span-3 lg:col-span-1">
              <span className="text-xl font-black text-[#28D96D]">Shift.iq</span>
              <p className="text-white/40 text-xs mt-2 leading-relaxed max-w-xs">
                Iraq&apos;s platform for on-demand hospitality, retail, and events staffing.
              </p>
            </div>
            {FOOTER_COLS.map((col) => (
              <div key={col.heading}>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">{col.heading}</p>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-white/40 hover:text-white text-sm transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-xs">© 2026 Shift.iq. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-white/30 hover:text-white text-xs transition-colors">Privacy</a>
              <a href="#" className="text-white/30 hover:text-white text-xs transition-colors">Terms</a>
              <a href="#" className="text-white/30 hover:text-white text-xs transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
