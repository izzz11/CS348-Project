import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log In - Music App',
  description: 'Sign in to your Music App account',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 