import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { pid: string } }
) {
  const pid = params.pid;

  if (!pid) {
    return NextResponse.json({ error: 'Missing playlist ID' }, { status: 400 });
  }

  try {
    // Fetch playlist details
    const playlistRes = await fetch(`http://localhost:8000/playlists/${pid}`);
    if (!playlistRes.ok) {
      throw new Error('Failed to fetch playlist details');
    }
    const playlist = await playlistRes.json();

    // Fetch song IDs in the playlist
    const playlistSongsRes = await fetch(`http://localhost:8000/playlist-songs/${pid}`);
    if (!playlistSongsRes.ok) {
      throw new Error('Failed to fetch playlist songs');
    }
    const { songs: songIds } = await playlistSongsRes.json();

    // Fetch details for each song
    const songDetailsPromises = songIds.map(async (sid: string) => {
      const songRes = await fetch(`http://localhost:8000/songs/fetch-song?sid=${sid}`);
      if (!songRes.ok) {
        console.error(`Failed to fetch song ${sid}`);
        return null;
      }
      return songRes.json();
    });
    const songs = (await Promise.all(songDetailsPromises)).filter(song => song !== null);

    return NextResponse.json({ playlist, songs });
  } catch (error) {
    console.error('Error fetching playlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlist' },
      { status: 500 }
    );
  }
} 