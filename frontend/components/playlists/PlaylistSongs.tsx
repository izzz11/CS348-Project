'use client';

import React, { useEffect, useState } from 'react';
import { Play, MoreHorizontal, Clock, Music, Heart, Headphones } from 'lucide-react';
import Link from 'next/link';
import PlaylistSongItem from './PlaylistSongItem';

interface Song {
  sid: string;
  name: string;
  genre: string;
  artist: string;
  duration: number;
  audio_path: string;
  audio_download_path: string;
}

interface PlaylistSongsProps {
  pid: string;
  playlistName: string;
  description?: string;
  songs?: Song[];
}

const PlaylistSongs: React.FC<PlaylistSongsProps> = ({ pid, playlistName, description, songs }) => {
  const [currentSongs, setCurrentSongs] = useState<Song[]>(songs || []);

  // Update songs when the prop changes
  useEffect(() => {
    setCurrentSongs(songs || []);
  }, [songs]);

  const handleSongRemoved = (removedSid: string) => {
    setCurrentSongs(prevSongs => prevSongs.filter(song => song.sid !== removedSid));
  };

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
              <span>{currentSongs?.length} songs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Songs List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {currentSongs?.length === 0 ? (
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
            {currentSongs?.map((song, index) => (
              <PlaylistSongItem 
                key={song.sid}
                song={song}
                index={index}
                pid={pid}
                onSongRemoved={handleSongRemoved}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistSongs; 