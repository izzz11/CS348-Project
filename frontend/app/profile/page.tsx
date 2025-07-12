'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import Link from 'next/link';
import { FaUser, FaMusic, FaHeart, FaGlobe, FaHistory, FaPlay, FaTrophy, FaMedal } from 'react-icons/fa';
import { MdEdit, MdSave, MdPerson, MdEmail, MdCalendarToday } from 'react-icons/md';
import { X } from 'lucide-react';

interface UserStats {
  totalPlaylists: number;
  favoriteSongs: number;
  totalListenDuration?: {
    total_duration_seconds: number;
    formatted_duration: string;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

interface UserProfile {
  username: string;
  email: string;
  age: string;
  country: string;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

interface SongHistory {
  uid: string;
  sid: string;
  last_listened: string;
  total_plays: number;
  favourite: boolean;
  rating: number | null;
  songDetails: {
    sid: string;
    name: string;
    artist: string;
    genre: string;
    duration: number;
    audio_path: string;
  } | null;
}

interface GenreCount {
  genre: string;
  count: number;
}

// Helper function to get width class based on number of genres
const getGenreWidthClass = (genreCount: number): string => {
  switch (genreCount) {
    case 1: return 'w-40 mx-auto';
    case 2: return 'w-80 mx-auto';
    case 3: return 'w-[30rem] mx-auto';
    case 4: return 'w-[40rem] mx-auto';
    default: return 'w-full max-w-[50rem] mx-auto';
  }
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    totalPlaylists: 0,
    favoriteSongs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    username: '',
    email: '',
    age: '',
    country: '',
  });
  const [toast, setToast] = useState<Toast | null>(null);
  const [listeningHistory, setListeningHistory] = useState<SongHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [favoriteGenres, setFavoriteGenres] = useState<GenreCount[]>([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch all data in parallel
        const [playlistsResponse, favoritesResponse, profileResponse, historyResponse, listenDurationResponse] = await Promise.all([
          fetch(`/api/playlists?uid=${user.uid}`),
          fetch(`/api/user-actions/${user.uid}/favourites`),
          fetch(`/api/users/profile?uid=${user.uid}`),
          fetch(`/api/users/history?uid=${user.uid}`),
          fetch(`/api/users/${user.uid}/total_listen_duration`)
        ]);

        // Process responses in parallel
        const [playlistsData, favoritesData, profileData, historyData, listenDurationData] = await Promise.all([
          playlistsResponse.json(),
          favoritesResponse.json(),
          profileResponse.json(),
          historyResponse.json(),
          listenDurationResponse.json()
        ]);

        // Update state with fetched data
        setStats({
          totalPlaylists: Array.isArray(playlistsData) ? playlistsData.length : 0,
          favoriteSongs: Array.isArray(favoritesData?.favourites) ? favoritesData.favourites.length : 0,
          totalListenDuration: listenDurationData
        });

        setProfile({
          username: profileData.username || user.username || '',
          email: profileData.email || '',
          age: profileData.age ? profileData.age.toString() : '',
          country: profileData.country || '',
        });
        
        setListeningHistory(historyData.history || []);
        
        // Calculate favorite genres from history
        if (historyData.history && historyData.history.length > 0) {
          const genreCounts: Record<string, number> = {};
          
          historyData.history.forEach((item: SongHistory) => {
            if (item.songDetails?.genre) {
              // Handle multiple genres separated by commas
              const genres = item.songDetails.genre.split(',').map(g => g.trim());
              
              genres.forEach(genre => {
                if (genre) {
                  genreCounts[genre] = (genreCounts[genre] || 0) + (item.favourite ? 2 : 1);
                }
              });
            }
          });
          
          // Convert to array and sort
          const sortedGenres = Object.entries(genreCounts)
            .map(([genre, count]) => ({ genre, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Get top 5
            
          setFavoriteGenres(sortedGenres);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        showToast('Failed to load user data', 'error');

        // Fallback to basic user data if profile fetch fails
        setProfile({
          username: user.username || '',
          email: user.email || '',
          age: user.age || '',
          country: user.country || '',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); // Hide after 3 seconds
  };

  const handleSaveProfile = async () => {
    try {
      if (!user) {
        showToast('User not authenticated', 'error');
        return;
      }

      // Call the API to update user profile
      const response = await fetch('/api/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user.uid, // Include user ID explicitly
          username: profile.username,
          email: profile.email,
          age: profile.age ? parseInt(profile.age) : null,
          country: profile.country
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const updatedUser = await response.json();

      // Update local user data
      setProfile({
        username: updatedUser.username || '',
        email: updatedUser.email || '',
        age: updatedUser.age ? updatedUser.age.toString() : '',
        country: updatedUser.country || '',
      });

      setEditing(false);
      showToast('Profile updated successfully', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast(error instanceof Error ? error.message : 'Failed to update profile', 'error');
    }
  };


  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Sign In</h2>
            <p className="text-gray-600 mb-6">You need to be logged in to view your profile</p>
            <Link
              href="/signin"
              className="bg-indigo-500 text-white hover:bg-indigo-600 px-6 py-3 rounded-full transition-colors shadow-sm hover:shadow-md"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="h-8 bg-gray-200 rounded-full w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded-full w-1/4 mx-auto mb-8"></div>
            <div className="grid grid-cols-2 gap-6">
              <div className="h-24 bg-gray-200 rounded-lg"></div>
              <div className="h-24 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow">
        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white`}>
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">User Profile</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 h-full">
          {/* Main Profile Section - Updated with minimalist design */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-md border border-gray-200 p-8 h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
                <button
                  onClick={() => editing ? handleSaveProfile() : setEditing(true)}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
                >
                  {editing ? (
                    <>
                      <MdSave size={18} /> Save
                    </>
                  ) : (
                    <>
                      <MdEdit size={18} /> Edit
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-col gap-6">
                <div className="border-b border-gray-200 pb-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                    <MdPerson className="text-gray-400" size={18} />
                    Username
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="username"
                      value={profile.username}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 border-0 border-b-2 border-gray-200 focus:border-gray-500 focus:ring-0 focus:outline-none transition-colors"
                      placeholder="Enter username"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium py-2">{profile.username}</p>
                  )}
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                    <MdEmail className="text-gray-400" size={18} />
                    Email
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 border-0 border-b-2 border-gray-200 focus:border-gray-500 focus:ring-0 focus:outline-none transition-colors"
                      placeholder="Enter email address"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium py-2">{profile.email || "Not provided"}</p>
                  )}
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                    <MdCalendarToday className="text-gray-400" size={18} />
                    Age
                  </label>
                  {editing ? (
                    <input
                      type="number"
                      name="age"
                      value={profile.age}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 border-0 border-b-2 border-gray-200 focus:border-gray-500 focus:ring-0 focus:outline-none transition-colors"
                      placeholder="Enter age"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium py-2">{profile.age || "Not provided"}</p>
                  )}
                </div>

                <div className="pb-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                    <FaGlobe className="text-gray-400" size={18} />
                    Country
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="country"
                      value={profile.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 border-0 border-b-2 border-gray-200 focus:border-gray-500 focus:ring-0 focus:outline-none transition-colors"
                      placeholder="Enter country"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium py-2">{profile.country || "Not provided"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section - Unchanged */}
          <div className="lg:w-2/3 h-full">
            <div className="bg-white rounded-3xl shadow-sm p-8 h-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Music Stats</h2>
              <div className="flex flex-col h-full">
                {/* Stats Grid - Top Row */}
                <div className="grid grid-cols-2 gap-8 mb-8 flex-grow">
                  {/* Left Column - Stacked Cards */}
                  <div className="flex flex-col gap-4 h-full justify-between">
                    {/* Playlists Card */}
                    <div className="bg-green-50 p-6 rounded-xl relative overflow-hidden">
                      <div className="flex flex-col">
                        <span className="text-green-800 font-medium mb-1">Playlists</span>
                        <span className="text-4xl font-bold text-green-700">{stats.totalPlaylists}</span>
                      </div>
                      <div className="absolute right-4 bottom-4 opacity-20 group">
                        <FaMusic className="text-green-500 cursor-pointer text-5xl group-hover:text-green-700 transition-colors duration-200" />
                      </div>
                    </div>

                    {/* Favorites Card */}
                    <div className="bg-pink-50 p-6 rounded-xl relative overflow-hidden">
                      <div className="flex flex-col">
                        <span className="text-pink-800 font-medium mb-1">Favorites</span>
                        <span className="text-4xl font-bold text-pink-700">{stats.favoriteSongs}</span>
                      </div>
                      <div className="absolute right-4 bottom-4 opacity-20 group">
                        <FaHeart className="text-pink-500 cursor-pointer text-5xl group-hover:text-pink-700 transition-colors duration-200" />
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Full Height Card */}
                  <div className="bg-purple-50 p-8 rounded-xl relative overflow-hidden flex flex-col h-full">
                    <div className="flex flex-col">
                      <span className="text-purple-800 font-medium mb-8">Total Listening Time</span>
                      <span className="text-4xl font-bold text-purple-700">
                        {stats.totalListenDuration ? stats.totalListenDuration.formatted_duration : "0h 0m 0s"}
                      </span>
                    </div>
                    <div className="absolute right-4 bottom-4 opacity-20 group">
                      <FaPlay className="text-purple-500 cursor-pointer text-5xl group-hover:text-purple-900 transition-colors duration-200" />
                    </div>
                  </div>
                </div>

                {/* Bottom Row - Full Width */}
                <div className="bg-blue-50 p-6 rounded-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <FaTrophy className="text-blue-600" />
                    <h3 className="text-lg font-semibold text-blue-800">Top 5 Genres</h3>
                  </div>

                  {favoriteGenres.length > 0 ? (
                    <div className="relative pt-10 pb-4 overflow-hidden">
                      {/* Podium base */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-200"></div>
                      
                      {/* Leaderboard podiums with fixed positioning */}
                      <div className={`flex items-end justify-center gap-4 ${getGenreWidthClass(favoriteGenres.length)}`}>
                        {/* Order: 4, 2, 1, 3, 5 */}
                        
                        {/* 4th place - leftmost when available */}
                        {favoriteGenres.length > 3 && (
                          <div className="flex flex-col items-center w-32 order-1">
                            <div className="text-center mb-2 w-full">
                              <span className="font-medium text-sm line-clamp-1">{favoriteGenres[3].genre}</span>
                              <span className="block text-xs text-gray-500">{favoriteGenres[3].count} plays</span>
                            </div>
                            <div className="relative w-full">
                              <div className="w-full h-10 bg-blue-300 rounded-t-md flex items-center justify-center">
                                <span className="text-white text-sm font-bold">4</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* 2nd place - always second from left or leftmost if 3 genres */}
                        {favoriteGenres.length > 1 && (
                          <div className="flex flex-col items-center w-32 order-2">
                            <div className="text-center mb-2 w-full">
                              <span className="font-medium text-sm line-clamp-1">{favoriteGenres[1].genre}</span>
                              <span className="block text-xs text-gray-500">{favoriteGenres[1].count} plays</span>
                            </div>
                            <div className="relative w-full">
                              <div className="w-full h-16 bg-gray-300 rounded-t-md flex items-center justify-center">
                                <span className="text-white text-xl font-bold">2</span>
                              </div>
                              <div className="absolute -top-3 -right-1">
                                <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center">
                                  <FaMedal className="text-white text-xs" />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* 1st place - always in the middle */}
                        {favoriteGenres.length > 0 && (
                          <div className="flex flex-col items-center w-32 order-3">
                            <div className="text-center mb-2 w-full">
                              <span className="font-medium text-sm line-clamp-1">{favoriteGenres[0].genre}</span>
                              <span className="block text-xs text-gray-500">{favoriteGenres[0].count} plays</span>
                            </div>
                            <div className="relative w-full">
                              <div className="w-full h-24 bg-yellow-400 rounded-t-md flex items-center justify-center">
                                <span className="text-white text-2xl font-bold">1</span>
                              </div>
                              <div className="absolute -top-3 -right-1">
                                <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
                                  <FaTrophy className="text-white text-xs" />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* 3rd place - always second from right or rightmost if 3 genres */}
                        {favoriteGenres.length > 2 && (
                          <div className="flex flex-col items-center w-32 order-4">
                            <div className="text-center mb-2 w-full">
                              <span className="font-medium text-sm line-clamp-1">{favoriteGenres[2].genre}</span>
                              <span className="block text-xs text-gray-500">{favoriteGenres[2].count} plays</span>
                            </div>
                            <div className="relative w-full">
                              <div className="w-full h-12 bg-amber-700 rounded-t-md flex items-center justify-center">
                                <span className="text-white text-xl font-bold">3</span>
                              </div>
                              <div className="absolute -top-3 -right-1">
                                <div className="w-6 h-6 rounded-full bg-amber-800 flex items-center justify-center">
                                  <FaMedal className="text-white text-xs" />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* 5th place - always rightmost when available */}
                        {favoriteGenres.length > 4 && (
                          <div className="flex flex-col items-center w-32 order-5">
                            <div className="text-center mb-2 w-full">
                              <span className="font-medium text-sm line-clamp-1">{favoriteGenres[4].genre}</span>
                              <span className="block text-xs text-gray-500">{favoriteGenres[4].count} plays</span>
                            </div>
                            <div className="relative w-full">
                              <div className="w-full h-8 bg-blue-200 rounded-t-md flex items-center justify-center">
                                <span className="text-white text-sm font-bold">5</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-3 text-blue-500">
                      <p>No genre data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Listening History Section - Updated with improved design */}
        <div className="mt-8">
          <div className="bg-white rounded-3xl shadow-sm p-8 pb-0 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FaHistory className="text-gray-500" /> Listening History
              </h2>
            </div>

            {historyLoading ? (
              <div className="flex gap-5 overflow-x-auto pb-6 px-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-56 h-72 bg-gray-100 rounded-2xl flex-shrink-0 animate-pulse"></div>
                ))}
              </div>
            ) : listeningHistory.length > 0 ? (
              <div>
                {/* Scrollable container with hidden scrollbar */}
                <div className="overflow-x-auto px-2 -mx-2 scrollbar-hide" 
                     style={{ 
                       scrollbarWidth: 'none', 
                       msOverflowStyle: 'none' 
                     }}>
                  {/* Apply custom scrollbar hiding */}
                  <style jsx>{`
                    div::-webkit-scrollbar {
                      display: none;
                    }
                    .text-shadow {
                      text-shadow: 0 2px 4px rgba(0,0,0,0.8);
                    }
                    .vinyl-spin {
                      animation: spin 4s linear infinite paused;
                    }
                    .group:hover .vinyl-spin {
                      animation-play-state: running;
                    }
                    @keyframes spin {
                      from {
                        transform: rotate(0deg);
                      }
                      to {
                        transform: rotate(360deg);
                      }
                    }
                  `}</style>
                  
                  <div className="flex gap-8 pt-4 pb-10">
                    {listeningHistory.map((item) => (
                      <div key={item.sid} className="relative group">
                        {/* Vinyl record with improved styling */}
                        <div className="w-56 h-56 flex-shrink-0 transition-all duration-300 transform hover:scale-105 relative">
                          {/* Vinyl record background - with spinning animation */}
                          <div className="absolute inset-0 w-full h-full rounded-full bg-black vinyl-spin" 
                               style={{ 
                                 backgroundImage: `radial-gradient(circle at center, transparent 18%, rgba(30,30,30,0.4) 19%, rgba(50,50,50,0.3) 20%, rgba(0,0,0,0.5) 25%, rgba(0,0,0,0.7) 30%, rgba(10,10,10,0.8) 40%, black 45%, black 100%)`,
                                 boxShadow: '0 0 20px 2px rgba(0,0,0,0.3), 0 0 6px 3px rgba(0,0,0,0.2), inset 0 0 10px rgba(0,0,0,0.8)'
                               }}></div>
                          
                          {/* Outer glow effect */}
                          <div className="absolute -inset-2 rounded-full bg-black/5 blur-md -z-10"></div>
                          
                          {/* Center label */}
                          <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                            <div className="w-[36%] h-[36%] rounded-full bg-gradient-to-br from-sky-200 to-sky-300 flex items-center justify-center shadow-inner">
                              <Link
                                href={`/play-song/${item.sid}`}
                                className="w-12 h-12 rounded-full bg-white/80 text-sky-500 hover:bg-white hover:text-sky-600 flex items-center justify-center transition-all shadow-md z-10"
                              >
                                <FaPlay size={20} />
                              </Link>
                            </div>
                          </div>
                          
                          {/* Song title overlay - positioned at top */}
                          <div className="absolute top-8 left-0 right-0 text-center">
                            <div className="font-bold text-white text-lg line-clamp-1 text-shadow px-3">
                              {item.songDetails?.name || 'Unknown Song'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Artist name below the vinyl */}
                        <div className="mt-3 text-center">
                          <p className="text-gray-700 font-medium">{item.songDetails?.artist || 'Unknown Artist'}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.total_plays} {item.total_plays === 1 ? 'play' : 'plays'}
                          </p>
                        </div>
                        
                        {/* Enhanced reflection beneath the record */}
                        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-6 bg-black/15 rounded-full blur-xl"></div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Full-width brown bar at the bottom */}
                <div className="h-6 bg-gradient-to-b from-amber-700 to-amber-900 -mx-8 mt-0">
                  {/* Wood grain texture */}
                  <div className="h-full w-full relative">
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'wood\' patternUnits=\'userSpaceOnUse\' width=\'100\' height=\'8\' patternTransform=\'scale(0.5) rotate(0)\'%3E%3Crect x=\'0\' y=\'0\' width=\'100%25\' height=\'100%25\' fill=\'%23a16207\'/%3E%3Cpath d=\'M-20 2 h140 v1 h-140z M-20 6 h140 v1 h-140z\' fill=\'%23854d0e\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23wood)\'/%3E%3C/svg%3E")' }}></div>
                    {/* Shelf edge highlight */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-amber-500 opacity-50"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaHistory className="mx-auto text-gray-300 text-4xl mb-3" />
                <p>No listening history available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

