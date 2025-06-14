// src/pages/_app.tsx
import type { AppProps } from 'next/app';
import '../style/globals.css';  // adjust if your CSS lives elsewhere

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}