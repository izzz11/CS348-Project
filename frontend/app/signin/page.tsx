'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaSignInAlt } from 'react-icons/fa';
import { useAuth } from '../../lib/AuthContext';
import { notifyAuthChange } from '../../lib/auth';

export default function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    // Check if already authenticated
    if (user) {
      // Already logged in, redirect
      router.push(callbackUrl);
    }
  }, [user, callbackUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.status === 200) {
        setSuccess('Login successful! Redirecting...');
        
        // Manually update auth context with the returned user data
        if (data.user) {
          // Force refresh the auth context with the new user data
          await refreshUser();
          
          // Notify other tabs/windows about the auth change
          notifyAuthChange();
        }
        
        // Navigate to the callback URL after a short delay
        setTimeout(() => router.push(callbackUrl), 500);
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Background Decoration Component
  const BackgroundDecoration = () => (
    <>
      <div 
        className="fixed top-0 left-0 w-[1000px] h-[1000px] bg-indigo-100/30 rounded-full blur-[150px] -z-10" 
        style={{ top: '-25%', left: '-25%' }} 
      />
      <div 
        className="fixed bottom-0 right-0 w-[800px] h-[800px] bg-purple-100/20 rounded-full blur-[120px] -z-10" 
        style={{ bottom: '-20%', right: '-20%' }} 
      />
    </>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 text-gray-800">
      <BackgroundDecoration />
      <div 
        className="absolute top-4 right-4 p-3 bg-indigo-50 rounded-full cursor-pointer hover:bg-indigo-100 transition-colors cursor-pointer"
        onClick={() => router.push('/')}
      >
        <FaSignInAlt className="text-3xl text-indigo-500" />
      </div>
      <div className="bg-white/70 backdrop-blur-sm p-12 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 w-full max-w-md mx-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Sign In to Your Account</h1>
          <p className="text-gray-600">Welcome back! Please log in.</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-800 placeholder-gray-400 
                       focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Choose a secure password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-800 placeholder-gray-400 
                       focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-center bg-red-50 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="text-green-500 text-center bg-green-50 p-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-medium
                     transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-70
                     flex items-center justify-center space-x-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing In...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/70 text-gray-500">or</span>
            </div>
          </div>
        </form>

        <p className="text-center text-gray-600">
          Don't have an account?{' '}
          <Link 
            href="/signup" 
            className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
} 