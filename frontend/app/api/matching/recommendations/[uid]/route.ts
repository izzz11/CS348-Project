import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const { uid } = params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'users'; // users, songs, playlists, matched
    const limit = searchParams.get('limit') || '10';

    if (!uid) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    let url;
    if (type === 'matched') {
      url = `${API_BASE_URL}/matching/matches/${uid}`;
    } else {
      url = `${API_BASE_URL}/matching/recommendations/${type}/${uid}?limit=${limit}`;
    }
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
} 