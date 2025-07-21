"use client";
import React, { useState } from 'react';
import { FaHeart, FaMusic, FaStar } from 'react-icons/fa';

interface MatchCandidate {
  uid: string;
  username: string;
  name?: string;
  age?: number;
  country?: string;
  favorite_genres: string[];
  top_artists: string[];
  similarity_score: number;
  common_genres: number;
  common_songs: number;
}

interface MatchCardProps {
  candidate: MatchCandidate;
  onLike: (uid: string) => void;
  currentUserId: string;
  showLikeButton?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ candidate, onLike, currentUserId, showLikeButton = true }) => {
  const [isLiked, setIsLiked] = useState(false);
  
  const handleLike = () => {
    setIsLiked(true);
    onLike(candidate.uid);
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 0.7) return 'text-green-500';
    if (score >= 0.4) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (isLiked) return null;

  // Get first letter of name or username
  const firstLetter = (candidate.name?.trim() || candidate.username.trim())[0]?.toUpperCase() || '?';

  return (
    <div className="bg-white/80 rounded-xl shadow p-4 flex flex-col items-center border border-gray-100 hover:shadow-lg transition-all min-w-[220px] max-w-[280px] mx-auto">
      <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center mb-2">
        <span className="text-xl font-bold text-white select-none">{firstLetter}</span>
      </div>
      <h3 className="text-base font-semibold text-gray-800 text-center line-clamp-1 mb-1">
        {candidate.name || candidate.username}
      </h3>
      <div className="flex items-center justify-center space-x-1 mb-2">
        <FaStar className={`text-xs ${getSimilarityColor(candidate.similarity_score)}`} />
        <span className={`text-xs font-semibold ${getSimilarityColor(candidate.similarity_score)}`}>{Math.round(candidate.similarity_score * 100)}%</span>
      </div>
      <div className="flex flex-wrap gap-1 justify-center mb-2">
        {candidate.favorite_genres && candidate.favorite_genres.slice(0, 2).map((genre, i) => (
          <span key={i} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium line-clamp-1">{genre}</span>
        ))}
      </div>
      <div className="flex flex-wrap gap-1 justify-center mb-2">
        {candidate.favorite_genres && candidate.top_artists.slice(0, 2).map((artist, i) => (
          <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium line-clamp-1">{artist}</span>
        ))}
      </div>
      {showLikeButton && (
        <button
          onClick={handleLike}
          className="mt-2 w-full flex items-center justify-center gap-1 px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm font-medium transition-colors"
          title="Like"
        >
          <FaHeart className="text-base" /> Like
        </button>
      )}
    </div>
  );
};

export default MatchCard; 