'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import PlaylistSongs from '@/components/playlists/PlaylistSongs';
import { ArrowLeft, Share2, Lock, LockOpen } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

interface Playlist {
  pid: string;
  name: string;
  description: string;
  private: boolean;
}

interface Song {
  sid: string;
  name: string;
  genre: string;
  artist: string;
  duration: number;
  audio_path: string;
  audio_download_path: string;
}

interface MatchUser {
  uid: string;
  username: string;
  name: string;
}

interface SharedRow {
  uid: string;
  shared_at: string;
}

export default function PlaylistPage({ params }: { params: { playlist: string } }) {
  const { user } = useAuth();
  const currentUid = user?.uid;

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // —— share UI state —— 
  const [showShare, setShowShare] = useState(false);
  const [matches, setMatches]     = useState<MatchUser[]>([]);
  const [selectedUid, setSelected] = useState<string>('');
  const [shareStatus, setShareStatus] = useState<string>('');
  const [sharedWith, setSharedWith]   = useState<SharedRow[]>([]);

  // Fetch playlist, songs, & matches on mount
  useEffect(() => {
    async function loadAll() {
      try {
        // 1️⃣ Playlist
        const resP = await fetch(`/api/playlists/${params.playlist}`);
        if (!resP.ok) throw new Error('Failed to fetch playlist');
        const pData = await resP.json();
        setPlaylist(pData.playlist ?? pData); // depending on your wrapper

        // 2️⃣ Songs
        const resS = await fetch(`/api/playlist-songs/${params.playlist}`);
        if (!resS.ok) throw new Error('Failed to fetch songs');
        const sData = await resS.json();
        setSongs(sData.songs ?? sData);

        // 3️⃣ Matches (if logged in)
        if (currentUid) {
          const resM = await fetch(`/api/matching/matches/${currentUid}`);
          if (resM.ok) {
            setMatches(await resM.json());
          }
        }
      } catch (e) {
        console.error(e);
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [params.playlist, currentUid]);

  // Fetch who you’ve already shared with
  async function fetchShared() {
    try {
      const res = await fetch(`/api/playlists/${params.playlist}/users`);
      if (res.ok) {
        setSharedWith(await res.json());
      }
    } catch {
      // ignore
    }
  }

  // Handle the actual share
  async function handleShare() {
    if (!selectedUid) {
      setShareStatus('Please pick someone first.');
      return;
    }
    setShareStatus('Sharing…');
    try {
      const res = await fetch(
        `/api/playlists/${params.playlist}/share?target_uid=${selectedUid}`,
        { method: 'POST' }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Share failed');
      }
      setShareStatus('Shared! ✅');
      fetchShared();
    } catch (e) {
      setShareStatus((e as Error).message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C5CE7] mx-auto"/>
            <p className="mt-4 text-gray-600">Loading playlist...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center py-8 text-red-500 bg-white rounded-xl shadow-lg p-6">
            {error || 'Playlist not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <div className="container mx-auto px-6 py-8">
        {/* Navigation & Share */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/playlists"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} /><span>Back to Playlists</span>
          </Link>

          <div className="flex items-center gap-4">
            {playlist.private ? (
              <div className="flex items-center gap-2 text-gray-600">
                <Lock size={18}/><span>Private</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-600">
                <LockOpen size={18}/><span>Public</span>
              </div>
            )}

            {!playlist.private && (
              <div>
                <button
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={() => {
                    setShowShare(v => !v);
                    if (!showShare) fetchShared();
                  }}
                >
                  <Share2 size={18}/><span>Share</span>
                </button>

                {showShare && (
                  <div className="mt-4 p-4 bg-white rounded shadow">
                    <h4 className="font-medium mb-2">Share with a match:</h4>
                    <select
                      className="border px-2 py-1 w-full mb-2"
                      value={selectedUid}
                      onChange={e => setSelected(e.target.value)}
                    >
                      <option value="">— select user —</option>
                      {matches.map(u => (
                        <option key={u.uid} value={u.uid}>
                          {u.name} ({u.username})
                        </option>
                      ))}
                    </select>
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded mb-2"
                      onClick={handleShare}
                    >
                      Confirm Share
                    </button>
                    {shareStatus && (
                      <p className="text-sm">{shareStatus}</p>
                    )}

                    <div className="mt-4">
                      <h5 className="font-medium">Already shared with:</h5>
                      <ul className="list-disc pl-5">
                        {sharedWith.length
                          ? sharedWith.map(r => (
                              <li key={r.uid}>
                                {r.uid} — {new Date(r.shared_at).toLocaleString()}
                              </li>
                            ))
                          : <li><em>No one yet</em></li>}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Playlist Content */}
        <PlaylistSongs
          pid={playlist.pid}
          playlistName={playlist.name}
          description={playlist.description}
          songs={songs}
        />
      </div>
    </div>
  );
}
