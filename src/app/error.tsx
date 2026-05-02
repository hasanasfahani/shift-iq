'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to an error reporting service in production
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-5xl font-extrabold text-[#C9C4D2] mb-4">!</p>
        <h1 className="text-2xl font-black text-[#12051F] mb-2">Something went wrong</h1>
        <p className="text-[#8B8299] mb-8 max-w-sm mx-auto">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[#28D96D] text-[#0F3D36] font-bold rounded-full hover:bg-[#00F06A] transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="px-6 py-3 bg-white text-[#8B8299] font-semibold rounded-full border border-[#E7E2EF] hover:bg-[#F7F4FC] transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
