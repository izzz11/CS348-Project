'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, MoreHorizontal } from 'lucide-react';

interface Song {
  sid: string;
  name: string;
  artist: string;
  genre: string;
  duration: number;
}

interface PlaylistSongItemProps {
  sid: string;
  index: number;
}

const PlaylistSongItem: React.FC<PlaylistSongItemProps> = ({ sid, index }) => {
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSongDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8000/songs/fetch-song?sid=${sid}`);
        if (!response.ok) throw new Error(`Failed to fetch song ${sid}`);
        const data = await response.json();
        setSong(data);
      } catch (error) {
        console.error('Error fetching song:', error);
        setError('Failed to load song');
      } finally {
        setLoading(false);
      }
    };

    fetchSongDetails();
  }, [sid]);

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center text-sm animate-pulse">
        <div className="col-span-1 bg-gray-200 h-4 rounded"></div>
        <div className="col-span-4 bg-gray-200 h-4 rounded"></div>
        <div className="col-span-3 bg-gray-200 h-4 rounded"></div>
        <div className="col-span-2 bg-gray-200 h-4 rounded"></div>
        <div className="col-span-1 bg-gray-200 h-4 rounded"></div>
        <div className="col-span-1"></div>
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center text-sm text-red-500">
        <div className="col-span-12">Error loading song {sid}</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center text-sm hover:bg-gray-50/50 group transition-colors">
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
  );
};

export default PlaylistSongItem; 