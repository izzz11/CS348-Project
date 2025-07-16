"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import MatchCard from '../../components/matching/MatchCard';
import Recommendations from '../../components/matching/Recommendations';
import { FaUserFriends, FaUsers, FaStar } from 'react-icons/fa';
import { useAuth } from '../../lib/AuthContext'; // Import the auth context

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
  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'matching' | 'recommendations'>('matching');

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push('/signin');
      return;
    }
    
    fetchCandidates();
  }, [user, router]);

  const fetchCandidates = async () => {
    if (!user?.uid) return; // Don't fetch if no user ID
    
    try {
      setLoading(true);
      const response = await fetch(`/api/matching?uid=${user.uid}&page=1&limit=10`);
      
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
          liked_by_user2: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to like user');
      }

      // Move to next candidate
      setCurrentCandidateIndex(prev => prev + 1);
    } catch (err) {
      console.error('Error liking user:', err);
    }
  };

  const handlePass = async (uid: string) => {
    // Move to next candidate
    setCurrentCandidateIndex(prev => prev + 1);
  };

  const getCurrentCandidate = () => {
    return candidates[currentCandidateIndex];
  };

  const hasMoreCandidates = () => {
    return currentCandidateIndex < candidates.length;
  };

  const resetCandidates = () => {
    setCurrentCandidateIndex(0);
    fetchCandidates();
  };

  if (loading) {
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

  if (error) {
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
            Swipe through users, explore their music tastes, and connect with those who vibe with your style. Start matching and discover new friends through music!
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-2 shadow-md">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('matching')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'matching'
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FaUsers className="inline mr-2" />
                Matching
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'recommendations'
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FaStar className="inline mr-2" />
                Recommendations
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'matching' ? (
          <div className="flex flex-col items-center">
            {hasMoreCandidates() ? (
              <MatchCard
                candidate={getCurrentCandidate()}
                onLike={handleLike}
                onPass={handlePass}
                currentUserId={user?.uid || ''}
              />
            ) : (
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
            )}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <Recommendations userId={user?.uid || ''} type="users" />
          </div>
        )}
      </main>
    </div>
  );
} 