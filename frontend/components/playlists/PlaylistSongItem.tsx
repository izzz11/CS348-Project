'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, MoreHorizontal, Trash2 } from 'lucide-react';

interface Song {
  sid: string;
  name: string;
  genre: string;
  artist: string;
  duration: number;
  audio_path: string;
  audio_download_path: string;
}

interface PlaylistSongItemProps {
  song: Song;
  index: number;
  pid: string;
  onSongRemoved?: (sid: string) => void;
}

const PlaylistSongItem: React.FC<PlaylistSongItemProps> = ({ song, index, pid, onSongRemoved }) => {
  // No need to fetch song details, song is provided as prop
  const [error, setError] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleRemoveSong = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isRemoving) return;
    
    setIsRemoving(true);
    try {
      const response = await fetch(`/api/playlist-songs/remove?pid=${pid}&sid=${song.sid}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to remove song from playlist');
      }

      // Call the callback to update the parent component
      onSongRemoved?.(song.sid);
    } catch (err) {
      console.error('Error removing song:', err);
      setError('Failed to remove song from playlist');
    } finally {
      setIsRemoving(false);
    }
  };

  if (error || !song) {
    return (
      <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center text-sm text-red-500">
        <div className="col-span-12">Error loading song {song?.sid}</div>
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
      <div className="col-span-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity gap-1">
        <button 
          onClick={handleRemoveSong}
          disabled={isRemoving}
          className="p-1.5 hover:bg-red-50 rounded-full transition-colors text-gray-400 hover:text-red-500 disabled:opacity-50"
          title="Remove from playlist"
        >
          <Trash2 size={16} />
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
};

export default PlaylistSongItem; 