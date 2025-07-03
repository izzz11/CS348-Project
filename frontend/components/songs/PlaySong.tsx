'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Shuffle, Repeat, MoreHorizontal, X, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SongData {
  sid: string;
  name: string;
  artist: string;
  genre: string;
  duration: number;
  audio_path: string;
  audio_download_path: string;
}

interface Playlist {
  pid: string;
  name: string;
  description: string;
  private: boolean;
}

interface MusicInterfaceProps {
  songId: string;
  userId: string;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

const MusicInterface: React.FC<MusicInterfaceProps> = ({ songId, userId }) => {
  const router = useRouter();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isLiked, setIsLiked] = useState(false);
  const [songData, setSongData] = useState<SongData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [favoritePlaylistId, setFavoritePlaylistId] = useState<string | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  // New state for all songs and current song index
  const [allSongs, setAllSongs] = useState<SongData[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);
  
  // Audio stuff
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioLoaded, setAudioLoaded] = useState(false);
  
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Fetch all songs
  useEffect(() => {
    const fetchAllSongs = async () => {
      try {
        const response = await fetch('http://localhost:8000/songs/fetch_all');
        if (!response.ok) throw new Error('Failed to fetch songs');
        const data = await response.json();
        setAllSongs(data);
        
        // Find the index of the current song
        const index = data.findIndex((song: SongData) => song.sid === songId);
        setCurrentSongIndex(index !== -1 ? index : 0);
      } catch (error) {
        console.error('Error fetching all songs:', error);
      }
    };
    
    fetchAllSongs();
  }, [songId]);

  // Fetch song data on component mount
  useEffect(() => {
    const fetchSongData = async () => {
      try {
        const res = await fetch(`/api/song/play-song?songId=${songId}`);
        if (!res.ok) throw new Error('Failed to fetch song');
        const data = await res.json();
        setSongData(data);
        
        // Pre-load audio element when song data is available
        if (data && data.audio_path) {
          const audio = new Audio();
          audio.src = data.audio_path;
          audio.volume = volume / 100;
          
          audio.onloadedmetadata = () => {
            setDuration(audio.duration || data.duration);
          };
          
          audio.onended = () => setIsPlaying(false);
          audio.ontimeupdate = () => {
            setCurrentTime(audio.currentTime);
            setProgress((audio.currentTime / (audio.duration || 1)) * 100);
          };
          
          audio.onerror = (e) => {
            console.error('Audio loading error:', e);
            setError('Failed to load audio file');
          };
          
          audioRef.current = audio;
          setAudioLoaded(true);
        }
      } catch (error) {
        console.error('Error fetching song:', error);
        setError('Failed to load song information');
      }
    };
    
    const checkFavoriteStatus = async () => {
      if (!userId) return;
      
      try {
        const res = await fetch(`/api/playlist-songs/check-favorite?uid=${userId}&sid=${songId}`);
        if (!res.ok) throw new Error('Failed to check favorite status');
        const data = await res.json();
        setIsLiked(data.inFavorites);
        setFavoritePlaylistId(data.favoritePlaylistId);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };
    
    fetchUserPlaylists();
    fetchSongData();
    checkFavoriteStatus();

    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, [songId, userId]);

  // Add a separate useEffect to handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const addSongToPlaylist = async (pid: string, sid: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/playlist-songs/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pid, sid })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add song to playlist');
      }
      
      const data = await response.json();
      return true;
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      return false;
    }
  }

  const addSongToFavoritePlaylist = async () => {
    const sid = songData?.sid;
    const pid = favoritePlaylistId || playlists[0]?.pid;

    if (!pid || !sid) {
      showToast("Could not find favorite playlist", "error");
      return;
    }
    try {
      if (isLiked) {
        // Remove from favorites using API route
        console.log("REMOVING", `/api/playlist-songs/${pid}?sid=${sid}`);
        const response = await fetch(`/api/playlist-songs/${pid}?sid=${sid}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) throw new Error('Failed to remove from favorites');
        
        showToast("Removed from favorites", "success");
      } else {
        // Add to favorites
        await addSongToPlaylist(pid, sid);
        showToast("Added to favourites", "success");
      }
      
      // Toggle liked state
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error updating favorites:', error);
      showToast("Failed to update favorites", "error");
    }
  }

  // Function to navigate to the next song
  const playNextSong = () => {
    if (allSongs.length === 0 || currentSongIndex === -1) return;
    
    const nextIndex = (currentSongIndex + 1) % allSongs.length;
    const nextSongId = allSongs[nextIndex].sid;
    
    // Navigate to the next song
    router.push(`/play-song/${nextSongId}`);
  };

  // Function to navigate to the previous song
  const playPreviousSong = () => {
    if (allSongs.length === 0 || currentSongIndex === -1) return;
    
    const prevIndex = (currentSongIndex - 1 + allSongs.length) % allSongs.length;
    const prevSongId = allSongs[prevIndex].sid;
    
    // Navigate to the previous song
    router.push(`/play-song/${prevSongId}`);
  };

  const playAudio = async () => {
    try {
      if (!audioRef.current) {
        setError('Audio player not initialized');
        return;
      }

      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (playError) {
        console.error('Error playing audio:', playError);
        setError('Failed to play song. The audio file may be missing or corrupted.');
      }
    } catch (error) {
      console.error('Error in playAudio:', error);
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
      setCurrentTime(newTime);
      setProgress(Math.max(0, Math.min(100, newProgress)));
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) {
      setError('Audio player not initialized');
      return;
    }
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      playAudio();
    }
  };

  const fetchUserPlaylists = async () => {
    try {
      if (!userId) return;
      
      const response = await fetch(`http://localhost:8000/playlists/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch playlists');
      const data = await response.json();
      setPlaylists(data);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); // Hide after 3 seconds
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-red-500 text-xl mb-6">{error}</div>
        <button 
          onClick={() => {
            setError(null);
            if (songId) {
              // Try to reload the audio
              const fetchSongData = async () => {
                try {
                  const res = await fetch(`/api/song/play-song?songId=${songId}`);
                  if (!res.ok) throw new Error('Failed to fetch song');
                  const data = await res.json();
                  setSongData(data);
                  
                  if (data && data.audio_path) {
                    const audio = new Audio();
                    audio.src = data.audio_path;
                    audio.volume = volume / 100;
                    
                    audio.onloadedmetadata = () => {
                      setDuration(audio.duration || data.duration);
                    };
                    
                    audio.onended = () => setIsPlaying(false);
                    audio.ontimeupdate = () => {
                      setCurrentTime(audio.currentTime);
                      setProgress((audio.currentTime / (audio.duration || 1)) * 100);
                    };
                    
                    audio.onerror = (e) => {
                      console.error('Audio loading error:', e);
                      setError('Failed to load audio file');
                    };
                    
                    audioRef.current = audio;
                    setAudioLoaded(true);
                  }
                } catch (error) {
                  console.error('Error fetching song:', error);
                  setError('Failed to load song information');
                }
              };
              
              fetchSongData();
            }
          }}
          className="px-6 py-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!songData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-gray-600">Loading song...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          <span>{toast.message}</span>
          <button 
            onClick={() => setToast(null)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

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

              {/* Progress Bar with Time Display */}
              <div className="flex-grow flex flex-col justify-center">
                <div className="w-full mb-8">
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
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
              <div className="flex items-center justify-center gap-8">
                <button 
                  onClick={playPreviousSong}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <SkipBack size={24} />
                </button>
                
                <button
                  onClick={togglePlay}
                  className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center hover:bg-indigo-600 
                           transition-all duration-200 text-white shadow-md"
                >
                  {isPlaying ? 
                    <Pause size={28} /> : 
                    <Play size={28} className="ml-1" />
                  }
                </button>
                
                <button 
                  onClick={playNextSong}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <SkipForward size={24} />
                </button>
                
                <button
                  onClick={addSongToFavoritePlaylist}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Heart 
                    size={24} 
                    fill={isLiked ? 'currentColor' : 'none'} 
                    className={isLiked ? 'text-red-500' : ''}
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
                {/* Like Song Button */}
                <button
                  onClick={addSongToFavoritePlaylist}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200
                    ${isLiked 
                      ? 'bg-red-100 text-red-500' 
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <span className="font-medium flex items-center gap-3">
                    <Heart 
                      size={20} 
                      fill={isLiked ? 'currentColor' : 'none'} 
                      className={isLiked ? 'text-red-500' : 'text-gray-500'}
                    />
                    Like Song
                  </span>
                  <span className="text-sm font-medium">
                    {isLiked ? 'Liked' : 'Like'}
                  </span>
                </button>

                {/* Add to Playlist Button */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setShowPlaylists(!showPlaylists);
                    }}
                    className="w-full flex items-center justify-between p-4 rounded-xl
                      bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                  >
                    <span className="font-medium flex items-center gap-3">
                      <svg 
                        className="w-5 h-5 text-gray-500" 
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
                    <span className="text-sm font-medium text-gray-500">
                      Choose
                    </span>
                  </button>

                  {/* Playlist Selection Dropdown */}
                  {showPlaylists && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-y-auto z-10">
                      {playlists.length === 0 ? (
                        <div className="p-4 text-gray-500 text-center">No playlists found</div>
                      ) : (
                        <div className="py-2">
                          {playlists.map((playlist) => (
                            <button
                              key={playlist.pid}
                              onClick={async () => {
                                if (!songData) return;
                                const success = await addSongToPlaylist(playlist.pid, songData.sid);
                                if (success) {
                                  // Show green success notification at the top of the screen
                                  const notificationElement = document.createElement('div');
                                  notificationElement.className = 'fixed top-0 left-0 right-0 bg-green-500 text-white p-4 flex justify-between items-center';
                                  notificationElement.innerHTML = `
                                    <span>Added to favorites</span>
                                    <button class="text-white">&times;</button>
                                  `;
                                  document.body.appendChild(notificationElement);
                                  
                                  // Remove after 3 seconds
                                  setTimeout(() => {
                                    document.body.removeChild(notificationElement);
                                  }, 3000);
                                  
                                  setShowPlaylists(false);
                                } else {
                                  showToast('Failed to add to playlist', 'error');
                                }
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-150
                                       flex items-center justify-between"
                            >
                              <span className="font-medium text-gray-700">{playlist.name}</span>
                              <span className="text-sm text-gray-400">Add</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
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