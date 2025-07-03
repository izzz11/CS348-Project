import { NextResponse } from 'next/server';
import axios from 'axios';

// Get user's playlists
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');

  if (!uid) {
    return NextResponse.json({ error: 'Missing uid parameter' }, { status: 400 });
  }

  try {
    const response = await axios.get(`http://localhost:8000/playlists/user/${uid}`);
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
  }
}

// Create new playlist
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');
    
    if (!uid) {
      return NextResponse.json({ error: 'Missing uid parameter' }, { status: 400 });
    }

    const body = await request.json();
    const response = await axios.post(`http://localhost:8000/playlists/?uid=${uid}`, body);
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 });
  }
}

// Delete playlist
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const pid = searchParams.get('pid');

  if (!pid) {
    return NextResponse.json({ error: 'Missing pid parameter' }, { status: 400 });
  }

  try {
    await axios.delete(`http://localhost:8000/playlists/${pid}`);
    return NextResponse.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete playlist' }, { status: 500 });
  }
} 