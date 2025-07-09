"use client";
import React, { useState, useEffect } from 'react';
import { FaMusic, FaUsers, FaPlay, FaHeart, FaStar } from 'react-icons/fa';

interface Recommendation {
  uid?: string;
  sid?: string;
  pid?: string;
  username?: string;
  name?: string;
  artist?: string;
  genre?: string;
  duration?: number;
  description?: string;
  recommendation_reason: string;
  confidence_score: number;
}

interface RecommendationsProps {
  userId: string;
  type: 'users' | 'songs' | 'playlists';
}

const Recommendations: React.FC<RecommendationsProps> = ({ userId, type }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, [userId, type]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/matching/recommendations/${userId}?type=${type}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      
      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'users':
        return <FaUsers className="text-2xl text-blue-500" />;
      case 'songs':
        return <FaMusic className="text-2xl text-green-500" />;
      case 'playlists':
        return <FaPlay className="text-2xl text-purple-500" />;
      default:
        return <FaStar className="text-2xl text-yellow-500" />;
    }
  };

  const getTypeTitle = () => {
    switch (type) {
      case 'users':
        return 'User Recommendations';
      case 'songs':
        return 'Song Recommendations';
      case 'playlists':
        return 'Playlist Recommendations';
      default:
        return 'Recommendations';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.7) return 'text-green-500';
    if (score >= 0.4) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchRecommendations}
          className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        {getTypeIcon()}
        <h2 className="text-2xl font-bold text-gray-800">{getTypeTitle()}</h2>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No recommendations available yet.</p>
          <p className="text-sm text-gray-500 mt-2">
            Start listening to music and favoriting songs to get personalized recommendations!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="bg-white/70 backdrop-blur-sm rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {type === 'users' && (
                    <h3 className="text-lg font-semibold text-gray-800">
                      {rec.name || rec.username}
                    </h3>
                  )}
                  {type === 'songs' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{rec.name}</h3>
                      <p className="text-gray-600">{rec.artist}</p>
                    </div>
                  )}
                  {type === 'playlists' && (
                    <h3 className="text-lg font-semibold text-gray-800">{rec.name}</h3>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <FaStar className={`text-sm ${getConfidenceColor(rec.confidence_score)}`} />
                  <span className={`text-sm font-medium ${getConfidenceColor(rec.confidence_score)}`}>
                    {Math.round(rec.confidence_score * 100)}%
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                {type === 'songs' && rec.genre && (
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      {rec.genre}
                    </span>
                    {rec.duration && (
                      <span className="text-gray-500 text-sm">
                        {formatDuration(rec.duration)}
                      </span>
                    )}
                  </div>
                )}

                {type === 'playlists' && rec.description && (
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {rec.description}
                  </p>
                )}

                <div className="text-xs text-gray-500">
                  <p className="font-medium">Why recommended:</p>
                  <p>{rec.recommendation_reason}</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4">
                <button className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm">
                  {type === 'users' && 'View Profile'}
                  {type === 'songs' && 'Play Song'}
                  {type === 'playlists' && 'View Playlist'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations; 