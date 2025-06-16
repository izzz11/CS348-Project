import Head from 'next/head';
import Link from 'next/link';
import { FaSignInAlt } from 'react-icons/fa';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.status === 200) {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => router.push('/'), 1200);
      } else {
        const data = await res.json();
        setError(data.detail || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white">
      <Head>
        <title>Log In - Music App</title>
      </Head>
      <div className="bg-gray-800/90 p-10 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center">
        <FaSignInAlt className="text-4xl text-purple-400 mb-4" />
        <h1 className="text-3xl font-bold mb-6">Welcome Back</h1>
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="px-4 py-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="px-4 py-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
          {error && <div className="text-red-400 text-center">{error}</div>}
          {success && <div className="text-green-400 text-center">{success}</div>}
          <button type="submit" className="mt-4 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg disabled:opacity-60" disabled={loading}>
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </form>
        <p className="mt-6 text-gray-400 text-sm">
          Don't have an account?{' '}
          <Link href="/signin" className="text-purple-400 hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
} 