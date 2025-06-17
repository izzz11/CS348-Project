'use client';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FaPlus, FaTrash, FaEdit, FaLock, FaLockOpen, FaMusic } from 'react-icons/fa';
import axios from 'axios';

type Playlist = {
  pid: string;
  uid: string;
  name: string;
  description: string;
  private: boolean;
  shared_with: string;
};

export default function Playlists() {
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
        const uid = localStorage.getItem('uid');
        if (!uid) {
          setError('User not logged in.');
          setLoading(false);
          return;
        }
  
        const response = await axios.get(`http://localhost:8000/playlists/user/${uid}`);
        setPlaylists(response.data);
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
      const response = await axios.post('http://localhost:8000/playlists/', {
        uid: localStorage.getItem('uid'),
        name: newPlaylist.name,
        description: newPlaylist.description,
        private: newPlaylist.private,
        shared_with: "abc",
      });

      console.log(response);
      setPlaylists([...playlists, response.data as Playlist]);
      setShowCreateModal(false);
      setNewPlaylist({ name: '', description: '', private: false });
    } catch (err) {
      console.error('Error creating playlist:', err);
      setError('Failed to create playlist. Please try again.');
    }
  };

  const handleDeletePlaylist = async (pid: string) => {
    try {
      await axios.delete(`http://localhost:8000/playlists/${pid}`);
      setPlaylists(playlists.filter(p => p.pid !== pid));
    } catch (err) {
      setError('Failed to delete playlist. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Head>
        <title>My Playlists - Music App</title>
        <meta name="description" content="Create and manage your playlists" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            My Playlists
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <FaPlus /> Create Playlist
            </button>
            <Link href="/">
              <button className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors">
                Back to Home
              </button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4">Loading playlists...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            {error}
          </div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/80 rounded-xl">
            <FaMusic className="text-6xl text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">No Playlists Yet</h3>
            <p className="text-gray-400 mb-6">Create your first playlist to get started!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors flex items-center gap-2 mx-auto"
            >
              <FaPlus /> Create Your First Playlist
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist) => (
              <div
                key={playlist.pid}
                className="bg-gray-800/80 rounded-xl p-6 hover:bg-gray-700/90 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{playlist.name}</h3>
                    <p className="text-gray-400 text-sm mt-1">{playlist.description}</p>
                  </div>
                  <div className="flex gap-2">
                    {playlist.private ? (
                      <FaLock className="text-gray-400" />
                    ) : (
                      <FaLockOpen className="text-gray-400" />
                    )}
                    <button
                      onClick={() => handleDeletePlaylist(playlist.pid)}
                      className="text-red-500 hover:text-red-400 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {playlist.shared_with.length} shared users
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Playlist Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Create New Playlist</h2>
              <form onSubmit={handleCreatePlaylist}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={newPlaylist.name}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                    className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={newPlaylist.description}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                    className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                  />
                </div>
                <div className="mb-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newPlaylist.private}
                      onChange={(e) => setNewPlaylist({ ...newPlaylist, private: e.target.checked })}
                      className="rounded text-purple-500 focus:ring-purple-500"
                    />
                    <span>Private Playlist</span>
                  </label>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition-colors"
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