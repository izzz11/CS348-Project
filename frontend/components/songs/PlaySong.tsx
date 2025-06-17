'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Shuffle, Repeat, MoreHorizontal } from 'lucide-react';

interface SongData {
  sid: string;
  name: string;
  artist: string;
  genre: string;
  duration: number;
  audio_path: string;
  audio_download_path: string;
}

interface MusicInterfaceProps {
  songId: string;
}

const MusicInterface: React.FC<MusicInterfaceProps> = ({ songId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isLiked, setIsLiked] = useState(false);
  const [songData, setSongData] = useState<SongData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Audio stuff
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioLoaded, setAudioLoaded] = useState(false);

  // Fetch song data on component mount
  useEffect(() => {
    const fetchSongData = async () => {
      try {
        const res = await fetch(`/api/song/play-song?songId=${songId}`);
        if (!res.ok) throw new Error('Failed to fetch song');
        const data = await res.json();
        setSongData(data);
      } catch (error) {
        console.error('Error fetching song:', error);
        setError('Failed to load song information');
      }
    };

    fetchSongData();

    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [songId]);

  const playAudio = async () => {
    try {
      if (!songData) throw new Error('No song data available');

      if (audioRef.current) {
        audioRef.current.pause();
      }

      audioRef.current = new Audio(songData.audio_path);
      audioRef.current.volume = volume / 100;

      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.ontimeupdate = () => {
        const current = audioRef.current?.currentTime ?? 0;
        const total = audioRef.current?.duration ?? 1;
        setProgress((current / total) * 100);
      };

      await audioRef.current.play();
      setAudioLoaded(true);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing song:', error);
      setError('Failed to play song');
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && audioRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newProgress = (clickX / rect.width) * 100;
      const newTime = (newProgress / 100) * (audioRef.current.duration || 0);
      audioRef.current.currentTime = newTime;
      setProgress(Math.max(0, Math.min(100, newProgress)));
    }
  };

  const togglePlay = () => {
    if (!audioLoaded) {
      playAudio();
    } else {
      if (isPlaying && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (!songData) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Player Section */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-3xl shadow-sm p-8 h-full">
            <div className="flex flex-col h-full">
              {/* Song Info */}
              <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
                <div className="w-72 h-72 rounded-2xl bg-indigo-500 flex items-center justify-center flex-shrink-0">
                  <div className="text-white text-9xl font-light">{songData.name[0]}</div>
                </div>
                <div className="flex flex-col items-start pt-4">
                  <h2 className="text-4xl font-bold text-gray-900 mb-3">{songData.name}</h2>
                  <p className="text-xl text-indigo-600 mb-2 hover:text-indigo-700 cursor-pointer">{songData.artist}</p>
                  <p className="text-gray-500 text-lg">{songData.genre}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex-grow flex items-center">
                <div className="w-full">
                  <div
                    ref={progressRef}
                    onClick={handleProgressClick}
                    className="h-1 bg-gray-200 rounded-full cursor-pointer relative"
                  >
                    <div
                      className="absolute left-0 top-0 h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6 mt-12">
                <button
                  onClick={togglePlay}
                  className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center hover:bg-indigo-600 
                           transition-all duration-200 text-white shadow-lg hover:shadow-indigo-200"
                >
                  {isPlaying ? 
                    <Pause size={28} /> : 
                    <Play size={28} className="ml-1" />
                  }
                </button>
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200
                    ${isLiked 
                      ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                      : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'
                    }`}
                >
                  <Heart 
                    size={24} 
                    className="transition-transform hover:scale-110"
                    fill={isLiked ? 'currentColor' : 'none'} 
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-sm p-8 h-full">
            <h3 className="text-2xl font-bold text-gray-800 mb-8">Quick Actions</h3>
            <div className="space-y-8">
              {/* Volume Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium flex items-center gap-2">
                    <Volume2 size={20} className="text-gray-500" />
                    Volume
                  </span>
                  <span className="text-sm font-medium text-gray-500">{volume}%</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => {
                      const newVolume = parseInt(e.target.value);
                      setVolume(newVolume);
                      if (audioRef.current) {
                        audioRef.current.volume = newVolume / 100;
                      }
                    }}
                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer 
                             accent-indigo-500 hover:accent-indigo-600 transition-all
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  />
                  <div 
                    className="absolute left-0 top-1/2 h-2 bg-indigo-500 rounded-l-lg -translate-y-1/2 pointer-events-none" 
                    style={{ width: `${volume}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200
                    ${isLiked 
                      ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                      : 'hover:bg-gray-50 text-gray-700'
                    } group`}
                >
                  <span className="font-medium flex items-center gap-3">
                    <Heart 
                      size={20} 
                      className={`transition-transform group-hover:scale-110 
                        ${isLiked ? 'fill-red-500' : ''}`}
                    />
                    Like Song
                  </span>
                  <span className="text-sm font-medium">
                    {isLiked ? 'Liked' : 'Like'}
                  </span>
                </button>

                <button 
                  className="w-full flex items-center justify-between p-4 rounded-xl
                    hover:bg-gray-50 text-gray-700 transition-all duration-200 group"
                >
                  <span className="font-medium flex items-center gap-3">
                    <svg 
                      className="w-5 h-5 transition-transform group-hover:scale-110" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 4v16m8-8H4" 
                      />
                    </svg>
                    Add to Playlist
                  </span>
                  <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700">
                    Choose
                  </span>
                </button>
              </div>

              {/* Song Info */}
              <div className="pt-6 border-t border-gray-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Song Details</h4>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-sm text-gray-500">Genre</span>
                        <p className="font-medium text-gray-900">
                          {songData.genre.split(',').map((genre, index) => (
                            <span 
                              key={index} 
                              className="inline-block bg-indigo-50 text-indigo-700 rounded-full px-3 py-1 text-sm mr-2"
                            >
                              {genre.trim()}
                            </span>
                          ))}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-sm text-gray-500">Duration</span>
                        <p className="font-medium text-gray-900 flex items-center gap-2">
                          <svg 
                            className="w-4 h-4 text-gray-400" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                            />
                          </svg>
                          {Math.floor(songData.duration / 60)}:{String(songData.duration % 60).padStart(2, '0')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicInterface;