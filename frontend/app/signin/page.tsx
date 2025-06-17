'use client';
import Head from 'next/head';
import Link from 'next/link';
import { FaUserPlus } from 'react-icons/fa';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function SignIn() {
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
      const res = await fetch('http://localhost:8000/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      console.log(res);
      if (res.status === 201) {
        setSuccess('Account created! Redirecting to login...');
        setTimeout(() => router.push('/login'), 1500);
      } else {
        const data = await res.json();
        setError(data.detail || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white w-full">
      <div className="bg-slate-800/95 p-12 rounded-3xl shadow-xl border border-slate-700/50 w-1/2">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Your Account</h1>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-4 rounded-xl bg-slate-700/70 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-4 rounded-xl bg-slate-700/70 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>
          {error && <div className="text-red-400 text-center">{error}</div>}
          {success && <div className="text-green-400 text-center">{success}</div>}
          <button
            type="submit"
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-8 text-center text-slate-400 text-sm">
          Already have an account?
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors ml-1">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
} 