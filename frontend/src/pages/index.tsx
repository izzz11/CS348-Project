import React, { useState } from 'react';
import { Play, Heart, TrendingUp, Clock, Star, Search, Bell, User, Menu, X, ChevronRight, Music, Headphones, Radio, Mic2 } from 'lucide-react';

interface Track {
  id: number;
  title: string;
  artist: string;
  plays: string;
  duration: string;
  cover: string;
  isLiked?: boolean;
}

interface Playlist {
  id: number;
  name: string;
  trackCount: number;
  cover: string;
  gradient: string;
}

export default function Page () {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [likedTracks, setLikedTracks] = useState<Set<number>>(new Set([1, 3]));

  const featuredTracks: Track[] = [
    {
      id: 1,
      title: "Summer Breeze",
      artist: "Ocean Waves",
      plays: "2.4M",
      duration: "3:24",
      cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
      isLiked: true
    },
    {
      id: 2,
      title: "Golden Hour",
      artist: "Sunset Collective",
      plays: "1.8M",
      duration: "4:12",
      cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop"
    },
    {
      id: 3,
      title: "City Lights",
      artist: "Urban Dreams",
      plays: "3.1M",
      duration: "3:56",
      cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop",
      isLiked: true
    },
    {
      id: 4,
      title: "Peaceful Mind",
      artist: "Zen Garden",
      plays: "956K",
      duration: "5:23",
      cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop"
    }
  ];

  const playlists: Playlist[] = [
    {
      id: 1,
      name: "Chill Vibes",
      trackCount: 24,
      cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop",
      gradient: "from-blue-400 to-cyan-300"
    },
    {
      id: 2,
      name: "Workout Hits",
      trackCount: 18,
      cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop",
      gradient: "from-purple-400 to-pink-300"
    },
    {
      id: 3,
      name: "Focus Flow",
      trackCount: 32,
      cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200&h=200&fit=crop",
      gradient: "from-green-400 to-emerald-300"
    },
    {
      id: 4,
      name: "Night Drive",
      trackCount: 15,
      cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop",
      gradient: "from-orange-400 to-rose-300"
    }
  ];

  const toggleLike = (trackId: number) => {
    setLikedTracks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(trackId)) {
        newSet.delete(trackId);
      } else {
        newSet.add(trackId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Music className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SoundWave
              </h1>
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">Discover</a>
              <a href="#" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">Browse</a>
              <a href="#" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">Radio</a>
              <a href="#" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">Library</a>
            </nav>

            {/* Search & Profile */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center bg-slate-100/80 rounded-full px-4 py-2 w-64">
                <Search className="w-4 h-4 text-slate-400 mr-3" />
                <input 
                  type="text" 
                  placeholder="Search songs, artists..." 
                  className="flex-1 bg-transparent text-slate-700 placeholder-slate-400 text-sm focus:outline-none"
                />
              </div>
              <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                <User className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Discover Your Next
                  <span className="block">Favorite Song</span>
                </h2>
                <p className="text-lg md:text-xl text-white/90 mb-8">
                  Explore millions of tracks from emerging and established artists worldwide
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="bg-white text-slate-900 px-8 py-3 rounded-full font-semibold hover:bg-white/90 transition-colors flex items-center justify-center">
                    <Play className="w-5 h-5 mr-2" />
                    Start Listening
                  </button>
                  <button className="border-2 border-white/30 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors">
                    Browse Genres
                  </button>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-4 right-12 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
          </div>
        </section>

        {/* Quick Access */}
        <section className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: TrendingUp, label: "Trending", color: "from-red-400 to-pink-400" },
              { icon: Clock, label: "Recently Played", color: "from-blue-400 to-cyan-400" },
              { icon: Heart, label: "Liked Songs", color: "from-pink-400 to-rose-400" },
              { icon: Radio, label: "Radio", color: "from-green-400 to-emerald-400" }
            ].map((item, index) => (
              <button key={index} className="bg-white/70 backdrop-blur-sm hover:bg-white/90 rounded-2xl p-6 border border-slate-200/60 transition-all hover:scale-105 hover:shadow-lg group">
                <div className={`w-10 h-10 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <p className="font-semibold text-slate-700">{item.label}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Featured Playlists */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-800">Featured Playlists</h3>
            <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {playlists.map((playlist) => (
              <div key={playlist.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/60 hover:bg-white/90 hover:scale-105 transition-all cursor-pointer group">
                <div className="relative mb-4">
                  <img 
                    src={playlist.cover} 
                    alt={playlist.name}
                    className="w-full aspect-square rounded-xl object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${playlist.gradient} opacity-60 rounded-xl`}></div>
                  <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 text-slate-700 ml-0.5" />
                    </div>
                  </button>
                </div>
                <h4 className="font-semibold text-slate-800 mb-1">{playlist.name}</h4>
                <p className="text-sm text-slate-500">{playlist.trackCount} tracks</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trending Now */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-800">Trending Now</h3>
            <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 overflow-hidden">
            {featuredTracks.map((track, index) => (
              <div key={track.id} className={`flex items-center p-4 hover:bg-slate-50/80 transition-colors group ${index !== featuredTracks.length - 1 ? 'border-b border-slate-200/60' : ''}`}>
                <div className="flex items-center space-x-4 flex-1">
                  <div className="relative">
                    <img src={track.cover} alt={track.title} className="w-12 h-12 rounded-lg object-cover" />
                    <button className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-800 truncate">{track.title}</h4>
                    <p className="text-sm text-slate-500 truncate">{track.artist}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-slate-500">
                  <span className="hidden sm:block">{track.plays} plays</span>
                  <button 
                    onClick={() => toggleLike(track.id)}
                    className={`p-2 rounded-full transition-colors ${
                      likedTracks.has(track.id) 
                        ? 'text-red-500 hover:text-red-600' 
                        : 'text-slate-400 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${likedTracks.has(track.id) ? 'fill-current' : ''}`} />
                  </button>
                  <span className="hidden md:block w-12 text-right">{track.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Color Reference Comment - Not visible to users */}
      {/* 
      COLOR PALETTE REFERENCE:
      
      Primary Colors:
      - Blue: #3B82F6 (blue-500), #2563EB (blue-600)
      - Purple: #8B5CF6 (purple-500), #7C3AED (purple-600)
      - Pink: #EC4899 (pink-500), #DB2777 (pink-600)
      
      Background Colors:
      - Light Gray: #F8FAFC (slate-50)
      - Light Blue: #EFF6FF (blue-50)
      - Light Indigo: #EEF2FF (indigo-50)
      
      Neutral Colors:
      - Dark Text: #1E293B (slate-800)
      - Medium Text: #475569 (slate-600)
      - Light Text: #64748B (slate-500)
      - Subtle Text: #94A3B8 (slate-400)
      
      Surface Colors:
      - White Overlay: rgba(255, 255, 255, 0.7)
      - White Hover: rgba(255, 255, 255, 0.9)
      - Border: rgba(226, 232, 240, 0.6) (slate-200/60)
      
      Gradient Combinations:
      - Hero: from-blue-500 via-purple-500 to-pink-500
      - Logo: from-blue-600 to-purple-600
      - Playlist Gradients:
        * Blue-Cyan: from-blue-400 to-cyan-300
        * Purple-Pink: from-purple-400 to-pink-300
        * Green-Emerald: from-green-400 to-emerald-300
        * Orange-Rose: from-orange-400 to-rose-300
      */}
    </div>
  );
};

