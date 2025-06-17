'use client';

import React, { useEffect, useState } from 'react';
import { Play, MoreHorizontal, Clock, Music, Heart, Headphones } from 'lucide-react';
import Link from 'next/link';

interface Song {
  sid: string;
  name: string;
  artist: string;
  genre: string;
  duration: number;
}

interface PlaylistSongsProps {
  pid: string;
  playlistName: string;
  description?: string;
}

const PlaylistSongs: React.FC<PlaylistSongsProps> = ({ pid, playlistName, description }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await fetch(`/api/playlist-songs/${pid}`);
        if (!response.ok) throw new Error('Failed to fetch songs');
        const data = await response.json();
        setSongs(data.songs);
      } catch (error) {
        console.error('Error fetching songs:', error);
        setError('Failed to load songs');
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, [pid]);

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C5CE7] mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading songs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500 bg-white rounded-xl shadow-lg p-6">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Playlist Header */}
      <div className="bg-white rounded-xl shadow-sm p-8 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full blur-xl" />
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full blur-lg" />
        
        <div className="relative">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{playlistName}</h1>
          {description && <p className="text-gray-600 mb-4">{description}</p>}
          <div className="flex items-center gap-4 text-gray-500">
            <div className="flex items-center gap-2">
              <Music size={18} />
              <span>{songs.length} songs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Songs List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {songs.length === 0 ? (
          <div className="text-center py-16">
            <Music className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-80" />
            <h3 className="text-xl font-semibold mb-2 text-gray-800">No Songs Yet</h3>
            <p className="text-gray-500">Start adding songs to your playlist!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 text-sm font-medium text-gray-500">
              <div className="col-span-1">#</div>
              <div className="col-span-4">Title</div>
              <div className="col-span-3">Artist</div>
              <div className="col-span-2">Genre</div>
              <div className="col-span-1 flex justify-center"><Clock size={16} /></div>
              <div className="col-span-1"></div>
            </div>

            {/* Songs */}
            {songs.map((song, index) => (
              <div
                key={song.sid}
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center text-sm hover:bg-gray-50/50 group transition-colors"
              >
                <div className="col-span-1 text-gray-400 group-hover:text-[#6C5CE7] transition-colors">
                  {index + 1}
                </div>
                <div className="col-span-4">
                  <Link 
                    href={`/play-song/${song.sid}`}
                    className="font-medium text-gray-900 hover:text-[#6C5CE7] transition-colors line-clamp-1"
                  >
                    {song.name}
                  </Link>
                </div>
                <div className="col-span-3 text-gray-600 line-clamp-1">{song.artist}</div>
                <div className="col-span-2">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-600">
                    {song.genre}
                  </span>
                </div>
                <div className="col-span-1 text-center text-gray-500">
                  {formatDuration(song.duration)}
                </div>
                <div className="col-span-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistSongs; 