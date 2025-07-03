import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const songId = searchParams.get('songId');

  if (!songId) {
    return NextResponse.json({ error: 'Missing songId parameter' }, { status: 400 });
  }

  try {
    const res = await fetch(`http://localhost:8000/songs/fetch-song?sid=${songId}`);
  
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch song' }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}