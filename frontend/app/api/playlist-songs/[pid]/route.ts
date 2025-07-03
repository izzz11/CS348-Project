import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { pid: string } }
) {
  const pid = params.pid;
  console.log(pid);

  if (!pid) {
    return NextResponse.json({ error: 'Missing playlist ID' }, { status: 400 });
  }

  try {
    // First get all song IDs in the playlist
    const playlistSongsRes = await fetch(`http://localhost:8000/playlist-songs/${pid}`);
    if (!playlistSongsRes.ok) {
      throw new Error('Failed to fetch playlist songs');
    }
    const { songs: songIds } = await playlistSongsRes.json();

    // Then fetch details for each song
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
    console.error('Error fetching playlist songs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlist songs' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { pid: string } }
) {
  const pid = params.pid;
  const { searchParams } = new URL(request.url);
  const sid = searchParams.get('sid');

  if (!pid || !sid) {
    return NextResponse.json({ error: 'Missing playlist ID or song ID' }, { status: 400 });
  }

  try {
    const res = await fetch(`http://localhost:8000/playlist-songs/${pid}/${sid}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error('Failed to remove song from playlist');
    }
    return NextResponse.json({ message: 'Song removed from playlist successfully' });
  } catch (error) {
    console.error('Error removing song from playlist:', error);
    return NextResponse.json(
      { error: 'Failed to remove song from playlist' },
      { status: 500 }
    );
  }
} 