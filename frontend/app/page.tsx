'use client';
import { useState, useEffect } from 'react';
import { FaPlay, FaHeart, FaThumbsUp, FaUsers, FaChartBar } from 'react-icons/fa';
import Link from 'next/link';
import "../globals.css";
import Navbar from './components/Navbar';
import { useAuth } from '../lib/AuthContext';

// Song card interface
interface SongCardProps {
  id: string;
  title: string;
  artist: string;
  genre: string;
  imageUrl?: string;
  isFavorite?: boolean;
}

// Dashboard data interfaces
interface SongStats {
  sid: string;
  name: string;
  artist: string;
  plays: number;
}

interface ArtistStats {
  artist: string;
  plays: number;
}

interface GenreStats {
  genre: string;
  plays: number;
}

// Song Card Component
const SongCard: React.FC<SongCardProps> = ({ id, title, artist, genre, imageUrl, isFavorite = false }) => {
  // Split genre string by comma and trim whitespace
  const genres = genre ? genre.split(',').map(g => g.trim()).filter(g => g) : [];
  
  return (
    <Link href={`/play-song/${id}`} className="block">
      <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl hover:bg-white/60 transition-all duration-300 flex flex-row items-center shadow-sm hover:shadow-md border border-gray-100 cursor-pointer group">
        {/* Left - Image */}
        <div className="bg-gray-200 h-20 w-20 rounded-xl overflow-hidden flex-shrink-0 mr-4 transition-transform duration-200 group-hover:scale-105 group-hover:shadow-lg">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 transition-colors duration-200 group-hover:bg-gradient-to-br group-hover:from-indigo-200 group-hover:to-purple-200">
              <FaPlay className="text-indigo-300 text-xl group-hover:text-indigo-500 transition-colors duration-200" />
            </div>
          )}
        </div>
        
        {/* Middle - Song Info */}
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{title}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-gray-600 line-clamp-1">{artist}</p>
            {genres.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {genres.map((g, index) => (
                  <span key={index} className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                    {g}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                Unknown
              </span>
            )}
          </div>
        </div>
        
        {/* Right - Controls */}
        <div className="flex items-center gap-3 ml-2">
          <button
            className={`${isFavorite ? 'text-pink-500' : 'text-gray-400'} hover:text-pink-500 transition-colors duration-300`}
            tabIndex={-1}
            onClick={e => e.preventDefault()}
          >
            <FaHeart className="text-lg" />
          </button>
        </div>
      </div>
    </Link>
  );
};

// Background Decoration Component
const BackgroundDecoration = () => (
  <>
    <div 
      className="fixed top-0 left-0 w-[1000px] h-[1000px] bg-indigo-100/30 rounded-full blur-[150px] -z-10" 
      style={{ top: '-25%', left: '-25%' }} 
    />
    <div 
      className="fixed bottom-0 right-0 w-[800px] h-[800px] bg-purple-100/20 rounded-full blur-[120px] -z-10" 
      style={{ bottom: '-20%', right: '-20%' }} 
    />
  </>
);

// Hero Section Component
const HeroSection = ({ isPlaying, setIsPlaying }: { isPlaying: boolean; setIsPlaying: (value: boolean) => void }) => (
  <section className="flex flex-col items-center justify-center min-h-[85vh] text-center max-w-7xl mx-auto px-4 md:px-8 pt-20">
    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8 text-gray-800 tracking-tight">
      Find Your Music Soulmate
    </h1>
    <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 md:mb-12 leading-relaxed max-w-3xl">
      Discover, stream, and match with music lovers who share your taste. 
      Like Tinder, but for finding your perfect listening buddy.
    </p>
    <div className="flex flex-col sm:flex-row gap-4">
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="group flex items-center justify-center space-x-3 bg-indigo-500 hover:bg-indigo-600 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-medium shadow-sm hover:shadow-md transition-all duration-300"
      >
        <FaPlay className={`${isPlaying ? 'hidden' : 'block'} group-hover:scale-110 transition-transform`} />
        <span>{isPlaying ? 'Pause' : 'Start Listening'}</span>
      </button>
      <Link href="/match">
        <button className="group flex items-center justify-center space-x-3 bg-pink-500 hover:bg-pink-600 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-medium shadow-sm hover:shadow-md transition-all duration-300">
          <FaHeart className="group-hover:scale-110 transition-transform" />
          <span>Find Matches</span>
        </button>
      </Link>
    </div>
  </section>
);

// Recommendation Section Component
const RecommendationSection = () => {
  const { user } = useAuth();
  const [guessYourFavorite, setGuessYourFavorite] = useState<SongCardProps[]>([]);
  const [recommendedFromFavorites, setRecommendedFromFavorites] = useState<SongCardProps[]>([]);
  const [recommendedFromFriends, setRecommendedFromFriends] = useState<SongCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshingFavorites, setRefreshingFavorites] = useState(false);
  const [refreshingRecommendations, setRefreshingRecommendations] = useState(false);

  // Fetch user's favorite songs
  const fetchFavorites = async () => {
    if (!user?.uid) return;
    
    try {
      const favoritesResponse = await fetch(`/api/user-actions/${user.uid}/favourites`);
      let favoriteSongs: SongCardProps[] = [];
      
      if (favoritesResponse.ok) {
        const favorites = await favoritesResponse.json();
        
        // Extract song IDs from favorites
        const songIds = favorites['favourites'].map((fav: any) => fav.sid);
        
        // Fetch song details for each favorite song
        const songPromises = songIds.map(async (sid: string) => {
          try {
            const songResponse = await fetch(`/api/song/play-song?songId=${sid}`);
            if (songResponse.ok) {
              const songData = await songResponse.json();
              return {
                id: songData.sid,
                title: songData.name,
                artist: songData.artist,
                genre: songData.genre || 'Unknown'
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching song ${sid}:`, error);
            return null;
          }
        });
        
        const songDetails = await Promise.all(songPromises);
        favoriteSongs = songDetails.filter(song => song !== null) as SongCardProps[];
      }
      
      // Select 3 random songs from favorites, or max 3 if no favorites
      if (favoriteSongs.length > 0) {
        const shuffled = [...favoriteSongs].sort(() => 0.5 - Math.random());
        setGuessYourFavorite(shuffled.slice(0, Math.min(3, shuffled.length)));
      } else {
        // Fallback to default songs if no favorites
        setGuessYourFavorite([
          {
            id: '1',
            title: 'Sunset Dreams',
            artist: 'Chill Wave',
            genre: 'Electronic'
          },
          {
            id: '2',
            title: 'Mountain High',
            artist: 'Nature Sounds',
            genre: 'Ambient'
          },
          {
            id: '3',
            title: 'Urban Rhythm',
            artist: 'City Beats',
            genre: 'Hip Hop'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      // Fallback to default favorites
      setGuessYourFavorite([
        {
          id: '1',
          title: 'Sunset Dreams',
          artist: 'Chill Wave',
          genre: 'Electronic'
        },
        {
          id: '2',
          title: 'Mountain High',
          artist: 'Nature Sounds',
          genre: 'Ambient'
        },
        {
          id: '3',
          title: 'Urban Rhythm',
          artist: 'City Beats',
          genre: 'Hip Hop'
        }
      ]);
    }
  };

  // Function to handle refresh of favorites
  const handleRefreshFavorites = async () => {
    if (!user?.uid || refreshingFavorites) return;
    
    setRefreshingFavorites(true);
    try {
      await fetchFavorites();
    } catch (error) {
      console.error('Error refreshing favorites:', error);
    } finally {
      setRefreshingFavorites(false);
    }
  };
  
  // Fetch personalized recommendations based on user's history
  const fetchPersonalizedRecommendations = async () => {
    if (!user?.uid) return;
    
    try {
      // Fetch personalized recommendations
      const response = await fetch(`/api/songs/recommendations?uid=${user.uid}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      
      const recommendations = await response.json();
      console.log('Recommendations:', recommendations);
      
      // Transform backend data to match frontend interface
      const transformedRecommendations: SongCardProps[] = recommendations.map((song: any) => ({
        id: song.sid,
        title: song.name,
        artist: song.artist,
        genre: song.genre || 'Unknown'
      }));
      
      setRecommendedFromFavorites(transformedRecommendations.slice(0, 3));
    } catch (error) {
      console.error('Error fetching personalized recommendations:', error);
      // Fallback to default recommendations
      setRecommendedFromFavorites([
        {
          id: '4',
          title: 'Jazz Nights',
          artist: 'Smooth Operator',
          genre: 'Jazz'
        },
        {
          id: '5',
          title: 'Rock Anthem',
          artist: 'Power Chord',
          genre: 'Rock'
        },
        {
          id: '6',
          title: 'Classical Morning',
          artist: 'Symphony Orchestra',
          genre: 'Classical'
        }
      ]);
    }
  };

  // Function to handle refresh of recommendations
  const handleRefreshRecommendations = async () => {
    if (!user?.uid || refreshingRecommendations) return;
    
    setRefreshingRecommendations(true);
    try {
      await fetchPersonalizedRecommendations();
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
    } finally {
      setRefreshingRecommendations(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!user?.uid) {
          // Show default recommendations for non-authenticated users
          setDefaultRecommendations();
          setLoading(false);
          return;
        }
        
        await Promise.all([
          fetchFavorites(),
          fetchPersonalizedRecommendations(),
          fetchFriendRecommendations()
        ]);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load recommendations');
        setDefaultRecommendations();
      } finally {
        setLoading(false);
      }
    };

    // Set default recommendations for non-authenticated users
    const setDefaultRecommendations = () => {
      setGuessYourFavorite([
        {
          id: '1',
          title: 'Sunset Dreams',
          artist: 'Chill Wave',
          genre: 'Electronic'
        },
        {
          id: '2',
          title: 'Mountain High',
          artist: 'Nature Sounds',
          genre: 'Ambient'
        },
        {
          id: '3',
          title: 'Urban Rhythm',
          artist: 'City Beats',
          genre: 'Hip Hop'
        }
      ]);
      
      setRecommendedFromFavorites([
        {
          id: '4',
          title: 'Jazz Nights',
          artist: 'Smooth Operator',
          genre: 'Jazz'
        },
        {
          id: '5',
          title: 'Rock Anthem',
          artist: 'Power Chord',
          genre: 'Rock'
        },
        {
          id: '6',
          title: 'Classical Morning',
          artist: 'Symphony Orchestra',
          genre: 'Classical'
        }
      ]);
      
      setRecommendedFromFriends([
        {
          id: '7',
          title: 'Ocean Waves',
          artist: 'Deep Blue',
          genre: 'Ambient'
        },
        {
          id: '8',
          title: 'Electric Dreams',
          artist: 'Synth Master',
          genre: 'Synthwave'
        },
        {
          id: '9',
          title: 'Midnight Drive',
          artist: 'Night Cruiser',
          genre: 'Electronic'
        }
      ]);
    };
    
    // Fetch friend recommendations
    const fetchFriendRecommendations = async () => {
      if (!user?.uid) return;
      
      try {
        // In a real app, this would be a separate API call to get friend recommendations
        // For now, we'll use the same recommendations API but take different items
        const response = await fetch(`/api/songs/recommendations?uid=${user.uid}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch friend recommendations');
        }
        
        const recommendations = await response.json();
        
        // Transform backend data to match frontend interface
        const transformedRecommendations: SongCardProps[] = recommendations.map((song: any) => ({
          id: song.sid,
          title: song.name,
          artist: song.artist,
          genre: song.genre || 'Unknown'
        }));
        
        // Take different items than the ones used for personalized recommendations
        setRecommendedFromFriends(transformedRecommendations.slice(3, 6));
      } catch (error) {
        console.error('Error fetching friend recommendations:', error);
        // Fallback to default friend recommendations
        setRecommendedFromFriends([
          {
            id: '7',
            title: 'Ocean Waves',
            artist: 'Deep Blue',
            genre: 'Ambient'
          },
          {
            id: '8',
            title: 'Electric Dreams',
            artist: 'Synth Master',
            genre: 'Synthwave'
          },
          {
            id: '9',
            title: 'Midnight Drive',
            artist: 'Night Cruiser',
            genre: 'Electronic'
          }
        ]);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="flex flex-col">
          <div className="w-full mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Your Recommendations</h1>
            <p className="text-lg text-gray-600">Loading your personalized music...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* First Column - Guess Your Favorite */}
            <div className="flex flex-col">
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Guess Your Favorite</h2>
                <p className="text-gray-600 text-sm md:text-base">Loading your favorite picks...</p>
              </div>
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl animate-pulse">
                    <div className="flex items-center">
                      <div className="bg-gray-200 h-20 w-20 rounded-xl mr-4"></div>
                      <div className="flex-grow">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Second Column - Based on Favorites */}
            <div className="flex flex-col mt-8 md:mt-0">
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Songs You Might Enjoy</h2>
                <p className="text-gray-600 text-sm md:text-base">Loading personalized recommendations...</p>
              </div>
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl animate-pulse">
                    <div className="flex items-center">
                      <div className="bg-gray-200 h-20 w-20 rounded-xl mr-4"></div>
                      <div className="flex-grow">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Third Column - From Friends */}
            <div className="flex flex-col mt-8 lg:mt-0">
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">From Your Friends</h2>
                <p className="text-gray-600 text-sm md:text-base">Loading friend recommendations...</p>
              </div>
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl animate-pulse">
                    <div className="flex items-center">
                      <div className="bg-gray-200 h-20 w-20 rounded-xl mr-4"></div>
                      <div className="flex-grow">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
      <div className="flex flex-col">
        <div className="w-full mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Your Recommendations</h1>
          <p className="text-lg text-gray-600">Handpicked music just for you</p>
        </div>
        <hr className="w-full mb-8 border-t-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-70" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* First Column - Guess Your Favorite */}
          <div className="flex flex-col">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Guess Your Favorite</h2>
                <p className="text-gray-600 text-sm md:text-base">
                  {user ? 'We think you might love these from your favorites' : 'Popular songs you might like'}
                </p>
              </div>
              {user && (
                <button 
                  onClick={handleRefreshFavorites}
                  disabled={refreshingFavorites}
                  className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors duration-300 flex-shrink-0"
                  title="Refresh favorites"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-5 w-5 text-purple-600 ${refreshingFavorites ? 'animate-spin' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                    />
                  </svg>
                </button>
              )}
            </div>
            <div className="flex flex-col gap-4">
              {guessYourFavorite.length > 0 ? (
                guessYourFavorite.map((song) => (
                  <SongCard key={song.id} {...song} isFavorite={true} />
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No favorite picks available</p>
              )}
            </div>
          </div>
          
          {/* Second Column - Based on Favorites */}
          <div className="flex flex-col mt-8 md:mt-0">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Songs You Might Enjoy</h2>
                <p className="text-gray-600 text-sm md:text-base">
                  {user ? 'Songs you might enjoy based on your listening history' : 'Popular songs you might like'}
                </p>
              </div>
              {user && (
                <button 
                  onClick={handleRefreshRecommendations}
                  disabled={refreshingRecommendations}
                  className="p-2 rounded-full bg-indigo-100 hover:bg-indigo-200 transition-colors duration-300 flex-shrink-0"
                  title="Refresh recommendations"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-5 w-5 text-indigo-600 ${refreshingRecommendations ? 'animate-spin' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                    />
                  </svg>
                </button>
              )}
            </div>
            <div className="flex flex-col gap-4">
              {recommendedFromFavorites.length > 0 ? (
                recommendedFromFavorites.map((song) => (
                  <SongCard key={song.id} {...song} />
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No recommendations available</p>
              )}
            </div>
            <div className="mt-6 text-center">
              <Link href="/songs">
                <button className="bg-indigo-500 text-white hover:bg-indigo-600 px-6 py-2 rounded-full transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md">
                  Explore Similar Music
                </button>
              </Link>
            </div>
          </div>
          
          {/* Third Column - From Friends */}
          <div className="flex flex-col mt-8 lg:mt-0">
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">From Your Friends</h2>
              <p className="text-gray-600 text-sm md:text-base">
                {user ? 'Tracks your friends are listening to right now' : 'Trending songs from the community'}
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {recommendedFromFriends.length > 0 ? (
                recommendedFromFriends.map((song) => (
                  <SongCard key={song.id} {...song} />
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No friend recommendations available</p>
              )}
            </div>
            <div className="mt-6 text-center">
              <Link href="/match">
                <button className="bg-pink-500 text-white hover:bg-pink-600 px-6 py-2 rounded-full transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md">
                  Find More Friends
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </section>
  );
};

// Dashboard Preview Component
const DashboardPreview = () => {
  const [topSongs, setTopSongs] = useState<SongStats[]>([]);
  const [topArtists, setTopArtists] = useState<ArtistStats[]>([]);
  const [topGenres, setTopGenres] = useState<GenreStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch top songs
        const songsResponse = await fetch('/api/dashboard/global/top-songs');
        if (!songsResponse.ok) throw new Error('Failed to fetch top songs');
        const songsData = await songsResponse.json();
        setTopSongs(songsData);
        
        // Fetch top artists
        const artistsResponse = await fetch('/api/dashboard/global/top-artists');
        if (!artistsResponse.ok) throw new Error('Failed to fetch top artists');
        const artistsData = await artistsResponse.json();
        setTopArtists(artistsData);
        
        // Fetch top genres
        const genresResponse = await fetch('/api/dashboard/global/top-genres');
        if (!genresResponse.ok) throw new Error('Failed to fetch top genres');
        const genresData = await genresResponse.json();
        setTopGenres(genresData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const StatItem = ({ rank, name, subtext, count }: { rank: number; name: string; subtext?: string; count: number }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center">
        <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium mr-4">
          {rank}
        </span>
        <div>
          <h3 className="font-medium text-gray-800">{name}</h3>
          {subtext && <p className="text-sm text-gray-500">{subtext}</p>}
        </div>
      </div>
      <div className="flex items-center">
        <span className="text-gray-600 font-medium">{count.toLocaleString()}</span>
        <span className="text-gray-400 ml-1 text-sm">plays</span>
      </div>
    </div>
  );

  const DashboardCard = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        {icon}
        <span className="ml-2">{title}</span>
      </h3>
      {children}
    </div>
  );

  return (
    <section className="py-16 px-4 md:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Global Music Trends</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See what's trending across our music platform right now
          </p>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-6 animate-pulse"></div>
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full mr-4 animate-pulse"></div>
                        <div>
                          <div className="h-5 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Top Songs Card */}
            <DashboardCard title="Top Songs" icon={<FaPlay className="text-indigo-500" />}>
              <div className="space-y-1">
                {topSongs.length > 0 ? (
                  topSongs.map((song, index) => (
                    <StatItem 
                      key={song.sid}
                      rank={index + 1}
                      name={song.name}
                      subtext={song.artist}
                      count={song.plays}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No song data available</p>
                )}
              </div>
            </DashboardCard>
            
            {/* Top Artists Card */}
            <DashboardCard title="Top Artists" icon={<FaUsers className="text-indigo-500" />}>
              <div className="space-y-1">
                {topArtists.length > 0 ? (
                  topArtists.map((artist, index) => (
                    <StatItem 
                      key={artist.artist}
                      rank={index + 1}
                      name={artist.artist}
                      count={artist.plays}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No artist data available</p>
                )}
              </div>
            </DashboardCard>
            
            {/* Top Genres Card */}
            <DashboardCard title="Top Genres" icon={<FaChartBar className="text-indigo-500" />}>
              <div className="space-y-1">
                {topGenres.length > 0 ? (
                  topGenres.map((genre, index) => (
                    <StatItem 
                      key={genre.genre}
                      rank={index + 1}
                      name={genre.genre}
                      count={genre.plays}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No genre data available</p>
                )}
              </div>
            </DashboardCard>
          </div>
        )}
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => (
  <footer className="bg-white/50 backdrop-blur-sm border-t border-gray-100 py-8 md:py-12 mt-16 md:mt-20">
    <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
          <p className="text-lg md:text-xl font-semibold">
            Developed with ❤️ by
          </p>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-2 text-base md:text-lg font-medium">
            <span className="hover:scale-105 transition-transform duration-200">Benny</span>
            <span className="hover:scale-105 transition-transform duration-200">Steven</span>
            <span className="hover:scale-105 transition-transform duration-200">Isabelle</span>
            <span className="hover:scale-105 transition-transform duration-200">Eloise</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2 md:mt-4">
          CS348 Project ✨
        </p>
      </div>
    </div>
  </footer>
);

// Main Component
export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <BackgroundDecoration />
      <main>
        <HeroSection isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
        <DashboardPreview />
        <RecommendationSection />
      </main>
      <Footer />
    </div>
  );
} 