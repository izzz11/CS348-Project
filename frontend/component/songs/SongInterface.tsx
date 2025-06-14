import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Shuffle, Repeat, MoreHorizontal } from 'lucide-react';

interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover: string;
}

const MusicInterface: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isLiked, setIsLiked] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  const tracks: Track[] = [
    {
      id: 1,
      title: "Midnight Vibes",
      artist: "Luna Eclipse",
      album: "Neon Dreams",
      duration: "3:24",
      cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop"
    },
    {
      id: 2,
      title: "Electric Pulse",
      artist: "Synthwave City",
      album: "Digital Horizon",
      duration: "4:12",
      cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop"
    },
    {
      id: 3,
      title: "Cosmic Journey",
      artist: "Stellar Drift",
      album: "Infinity Loop",
      duration: "5:47",
      cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop"
    },
    {
      id: 4,
      title: "Neon Nights",
      artist: "Retro Future",
      album: "Cyberpunk Dreams",
      duration: "3:56",
      cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop"
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => (prev >= 100 ? 0 : prev + 0.5));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newProgress = (clickX / rect.width) * 100;
      setProgress(Math.max(0, Math.min(100, newProgress)));
    }
  };

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
    setProgress(0);
  };
  
  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + tracks.length) % tracks.length);
    setProgress(0);
  };

  const currentSong = tracks[currentTrack];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Main Container */}
      <div className="max-w-6xl mx-auto p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold">♫</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              SoundWave
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Now Playing - Large Album Art */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-3xl p-8 border border-purple-500/20">
              <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
                
                {/* Album Art */}
                <div className="relative group">
                  <img 
                    src={currentSong.cover} 
                    alt={currentSong.album}
                    className="w-64 h-64 rounded-2xl shadow-2xl transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={togglePlay}
                      className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                    </button>
                  </div>
                </div>

                {/* Track Info */}
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold mb-2">{currentSong.title}</h2>
                  <p className="text-xl text-purple-300 mb-1">{currentSong.artist}</p>
                  <p className="text-gray-400 mb-6">{currentSong.album}</p>
                  
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div 
                      ref={progressRef}
                      onClick={handleProgressClick}
                      className="w-full h-2 bg-slate-700 rounded-full cursor-pointer group"
                    >
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full relative transition-all group-hover:h-3"
                        style={{ width: `${progress}%` }}
                      >
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400 mt-2">
                      <span>{Math.floor(progress * 0.034)}:{String(Math.floor((progress * 2.04) % 60)).padStart(2, '0')}</span>
                      <span>{currentSong.duration}</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center space-x-6">
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                      <Shuffle size={20} />
                    </button>
                    <button onClick={prevTrack} className="p-3 hover:bg-white/10 rounded-full transition-colors">
                      <SkipBack size={24} />
                    </button>
                    <button 
                      onClick={togglePlay}
                      className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                    >
                      {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                    </button>
                    <button onClick={nextTrack} className="p-3 hover:bg-white/10 rounded-full transition-colors">
                      <SkipForward size={24} />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                      <Repeat size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Volume Control */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
              <div className="flex items-center space-x-4">
                <Volume2 size={20} className="text-purple-400" />
                <div className="flex-1">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer slider"
                  />
                </div>
                <span className="text-sm text-gray-400 w-8">{volume}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setIsLiked(!isLiked)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                    isLiked ? 'bg-red-500/20 text-red-400' : 'hover:bg-white/10'
                  }`}
                >
                  <Heart size={18} className={isLiked ? 'fill-current' : ''} />
                  <span>Like Song</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white/10 transition-colors">
                  <span className="text-purple-400">+</span>
                  <span>Add to Playlist</span>
                </button>
              </div>
            </div>

            {/* Up Next */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
              <h3 className="text-lg font-semibold mb-4">Up Next</h3>
              <div className="space-y-3">
                {tracks.slice(currentTrack + 1, currentTrack + 3).map((track, index) => (
                  <div key={track.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                    <img src={track.cover} alt={track.album} className="w-10 h-10 rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{track.title}</p>
                      <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: linear-gradient(to right, #a855f7, #ec4899);
          border-radius: 50%;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: linear-gradient(to right, #a855f7, #ec4899);
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default MusicInterface;