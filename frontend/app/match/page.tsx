"use client";
import Navbar from '../components/Navbar';
import { FaUserFriends, FaHeart, FaSearch } from 'react-icons/fa';
import Link from 'next/link';
import React from 'react';

const BackgroundDecoration = () => (
  <>
    <div 
      className="fixed top-0 left-0 w-[900px] h-[900px] bg-indigo-100/30 rounded-full blur-[150px] -z-10" 
      style={{ top: '-20%', left: '-20%' }} 
    />
    <div 
      className="fixed bottom-0 right-0 w-[700px] h-[700px] bg-purple-100/20 rounded-full blur-[120px] -z-10" 
      style={{ bottom: '-15%', right: '-15%' }} 
    />
  </>
);

export default function MatchPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <BackgroundDecoration />
      <main className="flex flex-col items-center justify-center min-h-[85vh] pt-24 px-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-800 tracking-tight text-center">
          Find Your Music Match
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl text-center">
          Swipe through users, explore their music tastes, and connect with those who vibe with your style. Start matching and discover new friends through music!
        </p>
        {/* Swipe Card Placeholder */}
        <div className="w-full max-w-md bg-white/70 backdrop-blur-sm rounded-3xl shadow-md p-8 flex flex-col items-center mb-8 border border-gray-100">
          <div className="flex items-center space-x-4 mb-4">
            <FaUserFriends className="text-4xl text-indigo-400" />
            <span className="text-2xl font-semibold text-gray-800">User Name</span>
          </div>
          <div className="mb-4 text-gray-600 text-center">
            <span>Favorite Genres: Pop, Rock, Jazz</span><br/>
            <span>Top Artists: Artist A, Artist B, Artist C</span>
          </div>
          <div className="flex space-x-8 mt-6">
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-full p-4 text-2xl transition-colors" title="Pass">
              <FaSearch />
            </button>
            <button className="bg-pink-500 hover:bg-pink-600 text-white rounded-full p-4 text-2xl transition-colors" title="Like">
              <FaHeart />
            </button>
          </div>
        </div>
        <span className="text-gray-400 text-sm">More users coming soon...</span>
      </main>
    </div>
  );
} 