import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - Music App',
  description: 'Create your Music App account',
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 