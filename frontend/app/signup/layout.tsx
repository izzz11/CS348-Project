import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - Music Dating App',
  description: 'Create your Music Dating App account',
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 