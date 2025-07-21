"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import MatchCard from '../../components/matching/MatchCard';
import Recommendations from '../../components/matching/Recommendations';
import { FaUserFriends, FaUsers, FaStar, FaHeart } from 'react-icons/fa';
import { useAuth } from '../../lib/AuthContext'; // Import the auth context
import { headers } from 'next/headers';

const BackgroundDecoration = () => (
  <>
    <div
      className="fixed top-0 left-0 w-[900px] h-[900px] bg-indigo-100/30 rounded-full blur-[150px] -z-10"
      style={{ top: '-20%', left: '-20%' }}
    />
    <div
      className="fixed bottom-0 right-0 w-[700px] h-[700px] bg-purple-100/20 rounded-full blur-[120px] -z-10"
      style={{ bottom: '-15%', right: '-15%' }}
    />
  </>
);

interface MatchCandidate {
  uid: string;
  username: string;
  name?: string;
  age?: number;
  country?: string;
  favorite_genres: string[];
  top_artists: string[];
  similarity_score: number;
  common_genres: number;
  common_songs: number;
}

interface MatchResponse {
  candidates: MatchCandidate[];
  total_candidates: number;
  current_page: number;
  total_pages: number;
}

export default function MatchPage() {
  const { user } = useAuth(); // Get the current user from auth context
  const router = useRouter();
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'matching' | 'matched' | 'liked'>('matching');
  const [likedUsers, setLikedUsers] = useState<MatchCandidate[]>([]);
  const [likedLoading, setLikedLoading] = useState(false);
  const [likedError, setLikedError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not logged in
    if (!user?.uid) {
      return; // Wait for user to be loaded
    }

    fetchCandidates();
    if (activeTab === 'liked') fetchLikedUsers();
  }, [user, router]);

  useEffect(() => {
    if (activeTab === 'liked' && user?.uid) {
      fetchLikedUsers();
    }
  }, [activeTab, user]);

  const fetchCandidates = async () => {
    if (!user?.uid) return; // Don't fetch if no user ID

    try {
      setLoading(true);
      const response = await fetch(`/api/matching?uid=${user.uid}&page=1&limit=20`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }

      const data: MatchResponse = await response.json();
      setCandidates(data.candidates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedUsers = async () => {

    if (!user?.uid) return;
    try {
      setLikedLoading(true);
      const response = await fetch(`/api/matching/likes/${user.uid}`);

      if (!response.ok) throw new Error('Failed to fetch liked users');
      const data = await response.json();
      setLikedUsers(data);
    } catch (err) {
      setLikedError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLikedLoading(false);
    }
  };

  // Update handleLike to use the actual user ID
  const handleLike = async (uid: string) => {
    if (!user?.uid) return;

    try {
      const response = await fetch('/api/matching', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user1_id: user.uid, // Use actual user ID
          user2_id: uid,
          liked_by_user1: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to like user');
      }

      // Remove liked candidate from the grid
      setCandidates(prev => prev.filter(c => c.uid !== uid));
    } catch (err) {
      console.error('Error liking user:', err);
    }
  };

  const resetCandidates = () => {
    fetchCandidates();
  };

  if (loading && activeTab === 'matching') {
    return (
      <div className="relative min-h-screen bg-gradient-to-b from-white to-gray-50">
        <Navbar />
        <BackgroundDecoration />
        <main className="flex flex-col items-center justify-center min-h-[85vh] pt-24 px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          <p className="mt-4 text-gray-600">Finding your perfect matches...</p>
        </main>
      </div>
    );
  }

  if (error && activeTab === 'matching') {
    return (
      <div className="relative min-h-screen bg-gradient-to-b from-white to-gray-50">
        <Navbar />
        <BackgroundDecoration />
        <main className="flex flex-col items-center justify-center min-h-[85vh] pt-24 px-4">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchCandidates}
              className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <BackgroundDecoration />
      <main className="pt-24 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-800 tracking-tight">
            Find Your Music Match
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Browse users, explore their music tastes, and connect with those who vibe with your style. Like users to match and discover new friends through music!
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-2 shadow-md">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('matching')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'matching'
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                <FaUsers className="inline mr-2" />
                Matching
              </button>
              <button
                onClick={() => setActiveTab('matched')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'matched'
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                <FaStar className="inline mr-2" />
                Matched
              </button>
              <button
                onClick={() => setActiveTab('liked')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'liked'
                    ? 'bg-pink-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                <FaHeart className="inline mr-2" />
                Liked
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'matching' ? (
          <div>
            {candidates.length === 0 ? (
              <div className="text-center">
                <div className="w-full max-w-md bg-white/70 backdrop-blur-sm rounded-3xl shadow-md p-8 flex flex-col items-center mb-8 border border-gray-100">
                  <FaUserFriends className="text-6xl text-gray-400 mb-4" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">No More Matches</h3>
                  <p className="text-gray-600 mb-6 text-center">
                    You've seen all available users for now. Check back later for new matches!
                  </p>
                  <button
                    onClick={resetCandidates}
                    className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                  >
                    Refresh Matches
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-10 px-64 grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {candidates.map(candidate => (
                  <MatchCard
                    key={candidate.uid}
                    candidate={candidate}
                    onLike={handleLike}
                    currentUserId={user?.uid || ''}
                    showLikeButton={true}
                  />
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'matched' ? (
          <div className="max-w-6xl mx-auto">
            <Recommendations userId={user?.uid || ''} type="matched" />
          </div>
        ) : activeTab === 'liked' ? (
          <div className="max-w-6xl mx-auto">
            {likedLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
              </div>
            ) : likedError ? (
              <div className="text-center p-8">
                <p className="text-red-500">{likedError}</p>
                <button
                  onClick={fetchLikedUsers}
                  className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                >
                  Retry
                </button>
              </div>
            ) : likedUsers.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">You haven't liked any users yet.</p>
              </div>
            ) : (
              <div className="py-10 px-52 grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
                {likedUsers.map(user => (
                  <MatchCard
                    key={user.uid}
                    candidate={user}
                    onLike={() => { }}
                    currentUserId={user?.uid || ''}
                    showLikeButton={false}
                  />
                ))}
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
} 