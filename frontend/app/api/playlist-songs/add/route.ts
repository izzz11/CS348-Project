import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const response = await fetch('http://localhost:8000/playlist-songs/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error('Failed to add song to playlist');
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    return NextResponse.json(
      { error: 'Failed to add song to playlist' },
      { status: 500 }
    );
  }
} 