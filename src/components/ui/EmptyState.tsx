interface Props {
  illustration: 'no-shifts' | 'no-applications' | 'no-applicants' | 'no-templates' | 'no-locations';
  heading: string;
  body?: string;
  action?: { label: string; href?: string; onClick?: () => void };
}

const illustrations: Record<Props['illustration'], React.ReactNode> = {
  'no-shifts': (
    <svg viewBox="0 0 120 100" fill="none" className="w-full h-full">
      <circle cx="60" cy="50" r="38" fill="#F3F0FB" />
      <rect x="32" y="28" width="56" height="44" rx="6" fill="white" stroke="#E7E2EF" strokeWidth="2" />
      <rect x="32" y="28" width="56" height="12" rx="6" fill="#E9DEFF" />
      <rect x="40" y="50" width="24" height="3" rx="1.5" fill="#E7E2EF" />
      <rect x="40" y="58" width="16" height="3" rx="1.5" fill="#E7E2EF" />
      <circle cx="86" cy="34" r="6" fill="#28D96D" />
      <path d="M83 34l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  'no-applications': (
    <svg viewBox="0 0 120 100" fill="none" className="w-full h-full">
      <circle cx="60" cy="50" r="38" fill="#F3F0FB" />
      <rect x="36" y="26" width="48" height="56" rx="6" fill="white" stroke="#E7E2EF" strokeWidth="2" />
      <rect x="44" y="36" width="32" height="3" rx="1.5" fill="#E9DEFF" />
      <rect x="44" y="44" width="24" height="3" rx="1.5" fill="#E7E2EF" />
      <rect x="44" y="52" width="28" height="3" rx="1.5" fill="#E7E2EF" />
      <rect x="44" y="60" width="20" height="3" rx="1.5" fill="#E7E2EF" />
      <circle cx="60" cy="74" r="8" fill="#7426E8" />
      <path d="M57 74h6M60 71v6" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  'no-applicants': (
    <svg viewBox="0 0 120 100" fill="none" className="w-full h-full">
      <circle cx="60" cy="50" r="38" fill="#F3F0FB" />
      <circle cx="50" cy="40" r="10" fill="#E9DEFF" stroke="#7426E8" strokeWidth="1.5" />
      <path d="M35 65c0-8.284 6.716-15 15-15s15 6.716 15 15" stroke="#7426E8" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="74" cy="42" r="8" fill="#E9DEFF" stroke="#C9C4D2" strokeWidth="1.5" />
      <path d="M62 65c0-6.627 5.373-12 12-12" stroke="#C9C4D2" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  'no-templates': (
    <svg viewBox="0 0 120 100" fill="none" className="w-full h-full">
      <circle cx="60" cy="50" r="38" fill="#F3F0FB" />
      <rect x="30" y="32" width="60" height="36" rx="6" fill="white" stroke="#E7E2EF" strokeWidth="2" />
      <rect x="38" y="40" width="20" height="3" rx="1.5" fill="#E9DEFF" />
      <rect x="38" y="48" width="44" height="3" rx="1.5" fill="#E7E2EF" />
      <rect x="38" y="56" width="32" height="3" rx="1.5" fill="#E7E2EF" />
      <path d="M76 30l4 4-4 4" stroke="#28D96D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  'no-locations': (
    <svg viewBox="0 0 120 100" fill="none" className="w-full h-full">
      <circle cx="60" cy="50" r="38" fill="#F3F0FB" />
      <path d="M60 26c-9.941 0-18 8.059-18 18 0 13.5 18 30 18 30s18-16.5 18-30c0-9.941-8.059-18-18-18z" fill="white" stroke="#E7E2EF" strokeWidth="2" />
      <circle cx="60" cy="44" r="6" fill="#E9DEFF" stroke="#7426E8" strokeWidth="1.5" />
    </svg>
  ),
};

export default function EmptyState({ illustration, heading, body, action }: Props) {
  return (
    <div className="bg-[#F7F4FC] rounded-2xl border border-[#E7E2EF] p-10 flex flex-col items-center text-center">
      <div className="w-28 h-24 mb-4">
        {illustrations[illustration]}
      </div>
      <h3 className="text-base font-bold text-[#12051F] mb-1">{heading}</h3>
      {body && <p className="text-sm text-[#8B8299] mb-4 max-w-xs">{body}</p>}
      {action && (
        action.href ? (
          <a
            href={action.href}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#7426E8] text-white text-sm font-semibold hover:bg-[#6315d0] transition-colors"
          >
            {action.label}
          </a>
        ) : (
          <button
            type="button"
            onClick={action.onClick}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#7426E8] text-white text-sm font-semibold hover:bg-[#6315d0] transition-colors"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
