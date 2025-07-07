// app/signup/page.tsx
import type { Metadata } from 'next';
import SignUpViewPage from '@/components/features/auth/signup-view';

export const metadata: Metadata = {
  title: 'HippoVis - Sign Up',
  description: 'Create an account to access the medical image viewer.',
};

export default function SignupPage() {
  return <SignUpViewPage />;
}
