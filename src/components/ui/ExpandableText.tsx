'use client';

import { useState } from 'react';

interface Props {
  text: string;
  maxLength?: number;
}

export default function ExpandableText({ text, maxLength = 200 }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (text.length <= maxLength) {
    return <p className="text-sm text-[#8B8299] leading-relaxed">{text}</p>;
  }

  return (
    <div>
      <p className="text-sm text-[#8B8299] leading-relaxed">
        {expanded ? text : `${text.slice(0, maxLength)}…`}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-1.5 text-xs font-semibold text-[#7426E8] hover:underline"
      >
        {expanded ? 'Show less' : 'Show more'}
      </button>
    </div>
  );
}
