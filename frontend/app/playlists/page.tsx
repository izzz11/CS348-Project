'use client';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaPlus, FaTrash, FaEdit, FaLock, FaLockOpen, FaMusic, FaHeadphones, FaUsers } from 'react-icons/fa';

type Playlist = {
  pid: string;
  name: string;
  description: string;
  private: boolean;
};

export default function Playlists() {
  const uid = localStorage.getItem('uid')
  const router = useRouter();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    description: '',
    private: false,
  });

  // Fetch user's playlists
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        if (!uid) {
          setError('User not logged in.');
          setLoading(false);
          return;
        }
  
        const response = await fetch(`http://localhost:8000/playlists/user/${uid}`);
        if (!response.ok) {
          throw new Error('Failed to fetch playlists');
        }
        const data = await response.json();
        setPlaylists(data);
        console.log("playlists", data)
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch playlists. Please try again later.');
        setLoading(false);
      }
    };
  
    fetchPlaylists();
  }, []);

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const uid = localStorage.getItem('uid');
      const response = await fetch(`/api/playlists?uid=${uid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newPlaylist.name,
          description: newPlaylist.description,
          private: newPlaylist.private,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create playlist');
      }

      const data = await response.json();
      setPlaylists([...playlists, data as Playlist]);
      setShowCreateModal(false);
      setNewPlaylist({ name: '', description: '', private: false });
    } catch (err) {
      console.error('Error creating playlist:', err);
      setError('Failed to create playlist. Please try again.');
    }
  };

  const handleDeletePlaylist = async (pid: string) => {
    try {
      const response = await fetch(`/api/playlists?pid=${pid}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete playlist');
      }

      setPlaylists(playlists.filter(p => p.pid !== pid));
    } catch (err) {
      setError('Failed to delete playlist. Please try again.');
    }
  };

  const handlePlaylistClick = (pid: string) => {
    router.push(`/playlists/${pid}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <Head>
        <title>My Playlists - Music App</title>
        <meta name="description" content="Create and manage your playlists" />
      </Head>

      <main className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            My Playlists
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#6C5CE7] hover:bg-[#5A4ED1] text-white px-6 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-indigo-200"
            >
              <FaPlus /> Create Playlist
            </button>
            <Link href="/">
              <button className="bg-white text-gray-700 hover:bg-gray-50 px-6 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg">
                Back to Home
              </button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C5CE7] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading playlists...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500 bg-white rounded-xl shadow-lg p-6">
            {error}
          </div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <FaHeadphones className="text-6xl text-[#6C5CE7] mx-auto mb-4 opacity-80" />
            <h3 className="text-2xl font-semibold mb-2 text-gray-800">No Playlists Yet</h3>
            <p className="text-gray-500 mb-6">Create your first playlist to get started!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#6C5CE7] hover:bg-[#5A4ED1] text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 mx-auto"
            >
              <FaPlus /> Create Your First Playlist
            </button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto grid grid-cols-1 gap-6">
            {playlists.map((playlist) => (
              <div
                key={playlist.pid}
                onClick={() => handlePlaylistClick(playlist.pid)}
                className="group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300"
              >
                {/* Playlist Card Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-500 opacity-90 group-hover:opacity-100 transition-opacity" />
                
                {/* Playlist Visual Element */}
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/20 rounded-full blur-lg group-hover:scale-150 transition-transform duration-700" />
                
                {/* Content */}
                <div className="relative p-6 h-48 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-white group-hover:scale-105 transition-transform">
                        {playlist.name}
                      </h3>
                      <div className="flex gap-2">
                        {playlist.private ? (
                          <FaLock className="text-white/80" size={16} />
                        ) : (
                          <FaLockOpen className="text-white/80" size={16} />
                        )}
                        {playlist.name !== 'My Favourites' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePlaylist(playlist.pid);
                            }}
                            className="text-white/70 hover:text-red-300 transition-colors"
                          >
                            <FaTrash size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-white/70 text-sm line-clamp-2 mb-4">
                      {playlist.description}
                    </p>
                  </div>
                  
                  {/* Bottom Info */}
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <FaUsers size={14} />
                    <span>Shared with users</span>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <FaMusic className="text-white opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-150 duration-300" size={24} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Playlist Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Playlist</h2>
              <form onSubmit={handleCreatePlaylist}>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={newPlaylist.name}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] border border-gray-200"
                    required
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newPlaylist.description}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] border border-gray-200"
                    rows={3}
                  />
                </div>
                <div className="mb-8">
                  <label className="flex items-center gap-3 text-gray-700">
                    <input
                      type="checkbox"
                      checked={newPlaylist.private}
                      onChange={(e) => setNewPlaylist({ ...newPlaylist, private: e.target.checked })}
                      className="rounded text-[#6C5CE7] focus:ring-[#6C5CE7] w-5 h-5"
                    />
                    <span className="font-medium">Private Playlist</span>
                  </label>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#6C5CE7] hover:bg-[#5A4ED1] text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 