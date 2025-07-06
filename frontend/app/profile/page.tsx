'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import Link from 'next/link';
import { FaUser, FaMusic, FaHeart, FaGlobe, FaHistory, FaPlay } from 'react-icons/fa';
import { MdEdit, MdSave, MdPerson, MdEmail, MdCalendarToday } from 'react-icons/md';
import { X } from 'lucide-react';

interface UserStats {
  totalPlaylists: number;
  favoriteSongs: number;
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

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch all data in parallel
        const [playlistsResponse, favoritesResponse, profileResponse, historyResponse] = await Promise.all([
          fetch(`/api/playlists?uid=${user.uid}`),
          fetch(`/api/user-actions/${user.uid}/favourites`),
          fetch(`/api/users/profile?uid=${user.uid}`),
          fetch(`/api/users/history?uid=${user.uid}`)
        ]);

        // Process responses in parallel
        const [playlistsData, favoritesData, profileData, historyData] = await Promise.all([
          playlistsResponse.json(),
          favoritesResponse.json(),
          profileResponse.json(),
          historyResponse.json()
        ]);

        // Update state with fetched data
        setStats({
          totalPlaylists: Array.isArray(playlistsData) ? playlistsData.length : 0,
          favoriteSongs: Array.isArray(favoritesData?.favourites) ? favoritesData.favourites.length : 0,
        });

        setProfile({
          username: profileData.username || user.username || '',
          email: profileData.email || '',
          age: profileData.age ? profileData.age.toString() : '',
          country: profileData.country || '',
        });
        console.log("History Data", historyData);
        setListeningHistory(historyData.history || []);
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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-8">
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
          <button
            onClick={() => editing ? handleSaveProfile() : setEditing(true)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-full transition-colors shadow-sm hover:shadow-md flex items-center gap-2"
          >
            {editing ? (
              <>
                <MdSave size={20} /> Save Changes
              </>
            ) : (
              <>
                <MdEdit size={20} /> Edit Profile
              </>
            )}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Profile Section */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-3xl shadow-sm p-8 h-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Personal Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-indigo-50 p-6 rounded-xl">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-3">
                    <MdPerson className="text-indigo-500" size={18} />
                    Username
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="username"
                      value={profile.username}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium py-3 text-lg">{profile.username}</p>
                  )}
                </div>

                <div className="bg-indigo-50 p-6 rounded-xl">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-3">
                    <MdEmail className="text-indigo-500" size={18} />
                    Email
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium py-3 text-lg">{profile.email || "Not provided"}</p>
                  )}
                </div>

                <div className="bg-indigo-50 p-6 rounded-xl">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-3">
                    <MdCalendarToday className="text-indigo-500" size={18} />
                    Age
                  </label>
                  {editing ? (
                    <input
                      type="number"
                      name="age"
                      value={profile.age}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium py-3 text-lg">{profile.age || "Not provided"}</p>
                  )}
                </div>

                <div className="bg-indigo-50 p-6 rounded-xl">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-3">
                    <FaGlobe className="text-indigo-500" size={18} />
                    Country
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="country"
                      value={profile.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium py-3 text-lg">{profile.country || "Not provided"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-3xl shadow-sm p-8 h-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Music Stats</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-6 p-6 bg-green-50 rounded-xl">
                  <div className="bg-green-100 p-4 rounded-full">
                    <FaMusic className="text-green-500 text-2xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Playlists</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalPlaylists}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 p-6 bg-pink-50 rounded-xl">
                  <div className="bg-pink-100 p-4 rounded-full">
                    <FaHeart className="text-pink-500 text-2xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Favorite Songs</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.favoriteSongs}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Listening History Section */}
        <div className="mt-8">
          <div className="bg-white rounded-3xl shadow-sm p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FaHistory className="text-indigo-500" /> Listening History
              </h2>
            </div>

            {historyLoading ? (
              <div className="flex gap-5 overflow-x-auto pb-6 px-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-56 h-72 bg-gray-100 rounded-2xl flex-shrink-0 animate-pulse"></div>
                ))}
              </div>
            ) : listeningHistory.length > 0 ? (
              <div className="relative pb-10">
                {/* Fixed wooden shelf background - positioned at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-b from-amber-700 to-amber-900 shadow-md z-10">
                  {/* Wood grain texture */}
                  <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'wood\' patternUnits=\'userSpaceOnUse\' width=\'100\' height=\'8\' patternTransform=\'scale(0.5) rotate(0)\'%3E%3Crect x=\'0\' y=\'0\' width=\'100%25\' height=\'100%25\' fill=\'%23a16207\'/%3E%3Cpath d=\'M-20 2 h140 v1 h-140z M-20 6 h140 v1 h-140z\' fill=\'%23854d0e\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23wood)\'/%3E%3C/svg%3E")' }}></div>
                  {/* Shelf edge highlight */}
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-amber-500 opacity-50"></div>
                </div>
                
                {/* Scrollable container with hidden scrollbar */}
                <div className="overflow-x-auto pb-2 px-2 -mx-2 scrollbar-hide" 
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
                      text-shadow: 0 0 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6);
                    }
                  `}</style>
                  
                  <div className="flex gap-5 pt-4">
                    {listeningHistory.map((item) => (
                      <div key={item.sid} className="relative mb-1">
                        {/* Card with vinyl record background - no background color, no rounded corners */}
                        <div className="mb-2 w-64 h-72 flex-shrink-0 transition-all flex flex-col justify-between overflow-visible group transform hover:scale-110 duration-300 relative">
                          {/* Vinyl record background - full opacity */}
                          <div className="absolute inset-0 w-full h-full bg-center bg-no-repeat bg-contain z-0" 
                               style={{ 
                                 backgroundImage: `url("/record.png")`,
                                 backgroundPosition: 'center'
                               }}></div>

                          {/* Content overlay */}
                          <div className="p-6 flex-1 flex flex-col items-center justify-center text-center z-10 relative h-full gap-4">
                            {/* Title at the top */}
                            <div className="font-bold text-white text-xl line-clamp-1 text-shadow mt-2">
                              {item.songDetails?.name || 'Unknown Song'}
                            </div>
                            
                            {/* Play button in the middle */}
                            <Link
                              href={`/play-song/${item.sid}`}
                              className="bg-blue-100/80 text-blue-400 hover:bg-blue-200 hover:text-blue-500 p-5 rounded-full flex items-center justify-center transition-all transform shadow-md"
                            >
                              <FaPlay size={36} />
                            </Link>
                            
                            {/* Artist at the bottom */}
                            <div className="text-white font-medium line-clamp-1 text-shadow mb-2">
                              {item.songDetails?.artist || 'Unknown Artist'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Enhanced shadow beneath the card */}
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3/4 h-2 bg-black/20 rounded-full blur-md"></div>
                      </div>
                    ))}
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
