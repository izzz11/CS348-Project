'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaLock, FaLockOpen, FaShare, FaTrash } from 'react-icons/fa';

type Playlist = {
  pid: string;
  uid: string;
  name: string;
  description: string;
  private: boolean;
  shared_with: string;
};

export default function PlaylistPage() {
  const params = useParams();
  const router = useRouter();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await fetch(`http://localhost:8000/playlists/${params.playlist}`);
        console.log(response)
        if (!response.ok) {
          throw new Error('Failed to fetch playlist');
        }
        const data = await response.json();
        setPlaylist(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load playlist. Please try again later.');
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [params.playlist]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C5CE7] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading playlist...</p>
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-8">
        <div className="text-center py-8 text-red-500 bg-white rounded-2xl shadow-sm p-8">
          {error || 'Playlist not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/playlists">
            <button className="text-gray-600 hover:text-gray-800 transition-colors">
              <FaArrowLeft size={20} />
            </button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">{playlist.name}</h1>
          {playlist.private ? (
            <div className="text-[#6C5CE7]">
              <FaLock size={16} />
            </div>
          ) : (
            <div className="text-[#6C5CE7]">
              <FaLockOpen size={16} />
            </div>
          )}
        </div>

        {/* Playlist Info */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
          <p className="text-gray-500 mb-4">{playlist.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-2">
              <FaShare size={14} />
              {playlist.shared_with ? `${playlist.shared_with.split(',').length} shared users` : '0 shared users'}
            </span>
          </div>
        </div>

        {/* Songs Section - Placeholder for now */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Songs</h2>
          <p className="text-gray-500">No songs in this playlist yet.</p>
        </div>
      </main>
    </div>
  );
}
