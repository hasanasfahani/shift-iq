import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-extrabold text-[#28D96D] mb-4">404</p>
        <h1 className="text-2xl font-black text-[#12051F] mb-2">Page not found</h1>
        <p className="text-[#8B8299] mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#28D96D] text-[#0F3D36] font-bold rounded-full hover:bg-[#00F06A] transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
