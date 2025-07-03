"use client";

import MusicInterface from "@/components/songs/PlaySong";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from '../../../lib/AuthContext';

export default function PlaySongPage() {
  const params = useParams();
  const slug = params?.song as string;
  const { user } = useAuth();
  const userId = user?.uid || '';
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Now Playing</h1>
          <Link href="/songs">
            <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-full transition-colors shadow-sm hover:shadow-md">
              Back to Songs
            </button>
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <MusicInterface songId={slug} userId={userId}/>
        </div>
      </div>
    </div>
  );
}