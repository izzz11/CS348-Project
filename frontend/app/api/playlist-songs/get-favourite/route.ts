import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');

  if (!uid) {
    return NextResponse.json({ error: 'Missing required parameter: uid' }, { status: 400 });
  }

  try {
    // Step 1: Fetch the user's favourite playlist
    const favPlaylistRes = await fetch(`http://localhost:8000/playlists/user/${uid}/favourite`);
    if (!favPlaylistRes.ok) {
      return NextResponse.json({ error: 'Favourite playlist not found' }, { status: 404 });
    }
    const favPlaylist = await favPlaylistRes.json();
    const pid = favPlaylist.pid;

    // Step 2: Fetch all song IDs in the favourite playlist
    const playlistSongsRes = await fetch(`http://localhost:8000/playlist-songs/${pid}`);
    if (!playlistSongsRes.ok) {
      throw new Error('Failed to fetch songs in favourite playlist');
    }
    const { songs: songIds } = await playlistSongsRes.json();

    // Step 3: Fetch details for each song
    const songDetailsPromises = songIds.map(async (sid: string) => {
      const songRes = await fetch(`http://localhost:8000/songs/fetch-song?sid=${sid}`);
      if (!songRes.ok) {
        console.error(`Failed to fetch song ${sid}`);
        return null;
      }
      return songRes.json();
    });
    const songs = (await Promise.all(songDetailsPromises)).filter(song => song !== null);

    return NextResponse.json({ songs });
  } catch (error) {
    console.error('Error fetching favourite songs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favourite songs' },
      { status: 500 }
    );
  }
}
