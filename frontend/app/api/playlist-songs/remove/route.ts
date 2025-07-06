import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pid = searchParams.get('pid');
    const sid = searchParams.get('sid');

    if (!pid || !sid) {
      return NextResponse.json(
        { error: 'Missing playlist ID or song ID' },
        { status: 400 }
      );
    }

    // Make request to backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/playlist-songs/${pid}/${sid}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.detail || 'Failed to remove song from playlist' },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: 'Song removed from playlist successfully' });
  } catch (error) {
    console.error('Error removing song from playlist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
