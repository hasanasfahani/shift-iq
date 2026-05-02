'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SEARCH_CATEGORIES = [
  'All categories',
  'Hospitality',
  'Retail',
  'Logistics',
  'Delivery',
  'Events',
  'Food & beverage',
  'Cleaning',
  'Security',
  'General labor',
];

export default function SearchBar() {
  const [category, setCategory] = useState('All categories');
  const [location, setLocation] = useState('');
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push('/pro/browse');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden flex flex-col sm:flex-row items-stretch"
    >
      {/* Category */}
      <div className="flex-1 flex items-center px-4 py-1 min-w-0">
        <svg className="w-4 h-4 text-[#8B8299] shrink-0 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h10" />
        </svg>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-transparent py-3.5 text-sm text-[#12051F] outline-none cursor-pointer appearance-none font-medium"
          aria-label="Job category"
        >
          {SEARCH_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px bg-[#E7E2EF] self-stretch" />

      {/* Location */}
      <div className="flex-1 flex items-center px-4 py-1 border-t border-[#E7E2EF] sm:border-0 min-w-0">
        <svg className="w-4 h-4 text-[#8B8299] shrink-0 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City or location..."
          className="w-full bg-transparent py-3.5 text-sm text-[#12051F] placeholder:text-[#C9C4D2] outline-none min-w-0"
          aria-label="Location"
        />
      </div>

      {/* Submit */}
      <div className="p-2">
        <button
          type="submit"
          className="w-full sm:w-auto bg-[#28D96D] hover:bg-[#00F06A] active:scale-95 text-[#0F3D36] font-bold px-8 py-3 rounded-xl text-sm whitespace-nowrap transition-all"
        >
          Find a shift
        </button>
      </div>
    </form>
  );
}
