'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaMusic } from 'react-icons/fa';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUsername = localStorage.getItem('username');
    setUsername(storedUsername);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('uid');
    localStorage.removeItem('username');
    setUsername(null);
    router.push('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-3">
            <FaMusic className="text-2xl text-indigo-500" />
            <span className="text-xl font-semibold text-gray-800">Music App</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/songs" className="text-gray-600 hover:text-indigo-500 transition-colors">
              Browse Songs
            </Link>
            <Link href="/playlists" className="text-gray-600 hover:text-indigo-500 transition-colors">
              Playlists
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {username ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Welcome, {username}</span>
                <button
                  onClick={handleLogout}
                  className="bg-white text-indigo-500 hover:text-indigo-600 px-4 py-2 rounded-full border border-indigo-100 
                           hover:border-indigo-200 transition-colors text-sm font-medium"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-indigo-500 transition-colors text-sm font-medium"
                >
                  Log In
                </Link>
                <Link
                  href="/signin"
                  className="bg-indigo-500 text-white hover:bg-indigo-600 px-4 py-2 rounded-full 
                           transition-colors text-sm font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 