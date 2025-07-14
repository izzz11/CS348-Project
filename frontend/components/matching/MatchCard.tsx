"use client";
import React, { useState } from 'react';
import { FaUserFriends, FaHeart, FaSearch, FaMusic, FaStar } from 'react-icons/fa';

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
  onPass: (uid: string) => void;
  currentUserId: string;
}

const MatchCard: React.FC<MatchCardProps> = ({ 
  candidate, 
  onLike, 
  onPass, 
  currentUserId 
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isPassed, setIsPassed] = useState(false);

  const handleLike = () => {
    setIsLiked(true);
    onLike(candidate.uid);
  };

  const handlePass = () => {
    setIsPassed(true);
    onPass(candidate.uid);
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 0.7) return 'text-green-500';
    if (score >= 0.4) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSimilarityText = (score: number) => {
    if (score >= 0.7) return 'Excellent Match!';
    if (score >= 0.4) return 'Good Match';
    return 'Fair Match';
  };

  if (isLiked || isPassed) {
    return null;
  }

  return (
    <div className="w-full max-w-md bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg p-8 flex flex-col items-center border border-gray-100 transform transition-all duration-300 hover:scale-105">
      {/* User Info */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
          <FaUserFriends className="text-2xl text-white" />
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800">
            {candidate.name || candidate.username}
          </h3>
          {candidate.age && (
            <p className="text-gray-600">{candidate.age} years old</p>
          )}
          {candidate.country && (
            <p className="text-gray-500 text-sm">{candidate.country}</p>
          )}
        </div>
      </div>

      {/* Similarity Score */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <FaStar className={`text-xl ${getSimilarityColor(candidate.similarity_score)}`} />
          <span className={`text-lg font-semibold ${getSimilarityColor(candidate.similarity_score)}`}>
            {Math.round(candidate.similarity_score * 100)}%
          </span>
        </div>
        <p className="text-sm text-gray-600">{getSimilarityText(candidate.similarity_score)}</p>
      </div>

      {/* Music Taste */}
      <div className="w-full mb-6">
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
            <FaMusic className="mr-2 text-indigo-500" />
            Favorite Genres
          </h4>
          <div className="flex flex-wrap gap-2">
            {candidate.favorite_genres.slice(0, 3).map((genre, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
              >
                {genre}
              </span>
            ))}
            {candidate.favorite_genres.length > 3 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                +{candidate.favorite_genres.length - 3} more
              </span>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Top Artists</h4>
          <div className="flex flex-wrap gap-2">
            {candidate.top_artists.slice(0, 3).map((artist, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
              >
                {artist}
              </span>
            ))}
            {candidate.top_artists.length > 3 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                +{candidate.top_artists.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Common Elements */}
      <div className="w-full mb-6">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-2xl font-bold text-green-600">{candidate.common_genres}</p>
            <p className="text-sm text-green-700">Common Genres</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-2xl font-bold text-blue-600">{candidate.common_songs}</p>
            <p className="text-sm text-blue-700">Common Songs</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-8">
        <button
          onClick={handlePass}
          className="bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-full p-4 text-2xl transition-colors duration-200 transform hover:scale-110"
          title="Pass"
        >
          <FaSearch />
        </button>
        <button
          onClick={handleLike}
          className="bg-pink-500 hover:bg-pink-600 text-white rounded-full p-4 text-2xl transition-colors duration-200 transform hover:scale-110"
          title="Like"
        >
          <FaHeart />
        </button>
      </div>
    </div>
  );
};

export default MatchCard; 