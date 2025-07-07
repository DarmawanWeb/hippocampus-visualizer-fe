// app/login/page.tsx
import type { Metadata } from 'next';
import LoginViewPage from '@/components/features/auth/login-view';

export const metadata: Metadata = {
  title: 'HippoVis - Sign In',
  description: 'Sign in to access the medical image viewer.',
};

export default function LoginPage() {
  return <LoginViewPage />;
}
