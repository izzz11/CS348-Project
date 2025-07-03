import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');
  const sid = searchParams.get('sid');

  if (!uid || !sid) {
    return NextResponse.json(
      { error: 'Missing required parameters: uid and sid' },
      { status: 400 }
    );
  }

  try {
    // Step 1: Fetch all playlists for the user
    const playlistsRes = await fetch(`http://localhost:8000/playlists/user/${uid}`);
    if (!playlistsRes.ok) {
      throw new Error('Failed to fetch user playlists');
    }
    
    const playlists = await playlistsRes.json();
    if (!playlists || playlists.length === 0) {
      return NextResponse.json({ inFavorites: false });
    }

    // Step 2: Get the first playlist (assumed to be "My Favourites")
    const favoritePlaylist = playlists[0];
    const pid = favoritePlaylist.pid;

    // Step 3: Get all songs in the favorite playlist
    const playlistSongsRes = await fetch(`http://localhost:8000/playlist-songs/${pid}`);
    if (!playlistSongsRes.ok) {
      throw new Error('Failed to fetch playlist songs');
    }

    const { songs: songIds } = await playlistSongsRes.json();
    
    // Step 4: Check if the song is in the favorite playlist
    const isSongInFavorites = songIds.includes(sid);

    return NextResponse.json({ 
      inFavorites: isSongInFavorites,
      favoritePlaylistId: pid
    });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return NextResponse.json(
      { error: 'Failed to check favorite status' },
      { status: 500 }
    );
  }
} 