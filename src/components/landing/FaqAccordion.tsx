'use client';

import { useState } from 'react';

interface FaqItem {
  q: string;
  a: string;
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="divide-y divide-[#E7E2EF]">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between py-5 text-left gap-4 group"
            aria-expanded={open === i}
          >
            <span className="font-semibold text-[#12051F] group-hover:text-[#0F3D36] transition-colors text-sm sm:text-base">
              {item.q}
            </span>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
              open === i
                ? 'bg-[#0F3D36] text-white rotate-180'
                : 'bg-[#F3F0FB] text-[#8B8299] group-hover:bg-[#E9DEFF] group-hover:text-[#7426E8]'
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              maxHeight: open === i ? '200px' : '0',
              opacity: open === i ? 1 : 0,
            }}
          >
            <p className="pb-5 text-[#8B8299] text-sm leading-relaxed">{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
