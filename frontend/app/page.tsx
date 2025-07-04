'use client';
import { useState } from 'react';
import { FaPlay, FaMusic, FaHeadphones } from 'react-icons/fa';
import Link from 'next/link';
import "../globals.css";
import Navbar from './components/Navbar';

// Feature card interface
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
}

// Feature Card Component
const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, buttonText, buttonLink }) => (
  <div className="bg-white/50 backdrop-blur-sm p-12 rounded-3xl hover:bg-white/60 transition-all duration-500 flex flex-col items-center text-center shadow-sm hover:shadow-md border border-gray-100">
    <div className="text-indigo-500 mb-8 transform hover:scale-110 transition-transform duration-300 text-5xl">
      {icon}
    </div>
    <h3 className="text-2xl font-semibold mb-4 text-gray-800">{title}</h3>
    <p className="text-lg text-gray-600 mb-8 leading-relaxed">{description}</p>
    {buttonText && buttonLink && (
      <Link href={buttonLink}>
        <button className="bg-indigo-500 text-white hover:bg-indigo-600 px-8 py-3 rounded-full transition-all duration-300 text-base font-medium shadow-sm hover:shadow-md">
          {buttonText}
        </button>
      </Link>
    )}
  </div>
);

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
  <section className="flex flex-col items-center justify-center min-h-[85vh] text-center max-w-6xl mx-auto px-4 pt-20">
    <h1 className="text-6xl md:text-7xl font-bold mb-8 text-gray-800 tracking-tight">
      Your Music, Your Way
    </h1>
    <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-2xl">
      Discover, stream, and share your favorite music with our revolutionary platform
    </p>
    <button
      onClick={() => setIsPlaying(!isPlaying)}
      className="group flex items-center space-x-3 bg-indigo-500 hover:bg-indigo-600 text-white px-10 py-4 rounded-full text-lg font-medium shadow-sm hover:shadow-md transition-all duration-300"
    >
      <FaPlay className={`${isPlaying ? 'hidden' : 'block'} group-hover:scale-110 transition-transform`} />
      <span>{isPlaying ? 'Pause' : 'Start Listening'}</span>
    </button>
  </section>
);

// Features Section Component
const FeaturesSection = () => {
  const features: FeatureCardProps[] = [
    {
      icon: <FaMusic />,
      title: "Discover Music",
      description: "Explore millions of tracks and find your next favorite song",
      buttonText: "Browse Songs",
      buttonLink: "/songs"
    },
    {
      icon: <FaHeadphones />,
      title: "High Quality Audio",
      description: "Experience crystal clear sound with our premium audio quality"
    },
    {
      icon: <FaPlay />,
      title: "Create Playlists",
      description: "Build and share your perfect playlists with friends",
      buttonText: "My Playlists",
      buttonLink: "/playlists"
    }
  ];

  return (
    <section className="max-w-full mx-auto px-4 py-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </section>
  );
};

// Main Component
export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <BackgroundDecoration />
      <main>
        <HeroSection isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
        <FeaturesSection />
      </main>
    </div>
  );
} 