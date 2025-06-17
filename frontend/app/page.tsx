'use client';
import { useState } from 'react';
import Head from 'next/head';
import { FaPlay, FaMusic, FaHeadphones } from 'react-icons/fa';
import Link from 'next/link';
import "../globals.css";

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-x-hidden my-16">
      <Head>
        <title>Music App - Your Ultimate Music Experience</title>
        <meta name="description" content="Discover and enjoy your favorite music" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      

      {/* Decorative Background Circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-700 opacity-30 rounded-full blur-3xl -z-10 animate-pulse" style={{ top: '-6rem', left: '-6rem' }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500 opacity-20 rounded-full blur-3xl -z-10 animate-pulse" style={{ bottom: '-6rem', right: '-6rem' }} />

      <main className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center min-h-[70vh] text-center pt-20">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-lg">
            Your Music, Your Way
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl">
            Discover, stream, and share your favorite music with our revolutionary platform
          </p>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white px-10 py-4 rounded-full text-lg font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-pink-400"
          >
            <FaPlay className={isPlaying ? 'hidden' : 'block'} />
            <span>{isPlaying ? 'Pause' : 'Start Listening'}</span>
          </button>
        </section>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-16">
          <div className="bg-gray-800/80 p-8 rounded-2xl hover:bg-gray-700/90 transition-all duration-300 flex flex-col items-center shadow-lg cursor-pointer">
            <Link href="/songs" className="flex flex-col items-center">
              <FaMusic className="text-5xl text-purple-400 mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Discover Music</h3>
              <p className="text-gray-300 mb-4">Explore millions of tracks and find your next favorite song</p>
              <button className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition-colors">
                Browse Songs
              </button>
            </Link>
          </div>
          <div className="bg-gray-800/80 p-8 rounded-2xl hover:bg-gray-700/90 transition-all duration-300 flex flex-col items-center shadow-lg">
            <FaHeadphones className="text-5xl text-purple-400 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">High Quality Audio</h3>
            <p className="text-gray-300">Experience crystal clear sound with our premium audio quality</p>
          </div>
          <div className="bg-gray-800/80 p-8 rounded-2xl hover:bg-gray-700/90 transition-all duration-300 flex flex-col items-center shadow-lg">
            <FaPlay className="text-5xl text-purple-400 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Create Playlists</h3>
            <p className="text-gray-300 mb-4">Build and share your perfect playlists with friends</p>
            <Link href="/playlists">
              <button className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition-colors">
                My Playlists
              </button>
            </Link>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center py-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Musical Journey?</h2>
          <p className="text-gray-300 mb-8">Join thousands of music lovers today</p>
          <Link href="/signin">
            <button className="bg-white text-gray-900 px-10 py-3 rounded-full font-semibold hover:bg-gray-100 shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-300">
              Sign Up Now
            </button>
          </Link>
        </section>
      </main>
    </div>
  );
} 