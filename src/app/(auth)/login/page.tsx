import LoginForm from '@/components/auth/LoginForm';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // Only pass through internal redirects — prevent open redirect attacks
  const safeNext = next?.startsWith('/') ? next : undefined;

  return <LoginForm next={safeNext} />;
}

export const metadata = { title: 'Sign In' };
