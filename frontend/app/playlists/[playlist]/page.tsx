'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import PlaylistSongs from '@/components/playlists/PlaylistSongs';
import { ArrowLeft, Share2, Lock, LockOpen } from 'lucide-react';

interface Playlist {
  pid: string;
  name: string;
  description: string;
  private: boolean;
}

interface Song {
  sid: string;
  name: string;
  genre: string;
  artist: string;
  duration: number;
  audio_path: string;
  audio_download_path: string;
}

export default function PlaylistPage({ params }: { params: { playlist: string } }) {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        // Fetch playlist details and songs from new API route
        const playlistInfo = await fetch(`/api/playlists/${params.playlist}`);
        if (!playlistInfo.ok) throw new Error('Failed to fetch playlist');
        const playlistInfoData = await playlistInfo.json();
        setPlaylist(playlistInfoData.playlist); // data.playlist should be the playlist object

        const songsInfo = await fetch(`/api/playlist-songs/${params.playlist}`);
        if (!songsInfo.ok) throw new Error('Failed to fetch songs data');
        const songsInfoData = await songsInfo.json();
        console.log("HEY", songsInfoData)
        setSongs(songsInfoData.songs); // data.songs should be an array of song objects
        
      } catch (error) {
        console.error('Error fetching playlist:', error);
        setError('Failed to load playlist');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [params.playlist]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C5CE7] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading playlist...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center py-8 text-red-500 bg-white rounded-xl shadow-lg p-6">
            {error || 'Playlist not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <div className="container mx-auto px-6 py-8">
        {/* Navigation */}
        <div className="mb-8 flex items-center justify-between">
          <Link 
            href="/playlists"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Playlists</span>
          </Link>

          <div className="flex items-center gap-4">
            {playlist.private ? (
              <div className="flex items-center gap-2 text-gray-600">
                <Lock size={18} />
                <span>Private</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-600">
                <LockOpen size={18} />
                <span>Public</span>
              </div>
            )}
            {!playlist.private && (
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Share2 size={18} />
                <span>Share</span>
              </button>
            )}
          </div>
        </div>

        {/* Playlist Content */}
        <PlaylistSongs 
          pid={playlist.pid} 
          playlistName={playlist.name}
          description={playlist.description}
          songs={songs} // Pass the full song objects
        />
      </div>
    </div>
  );
}
