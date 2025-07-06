import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');
    const sid = searchParams.get('sid');

    if (!uid || !sid) {
      return NextResponse.json(
        { error: 'Missing required parameters: uid and sid' },
        { status: 400 }
      );
    }

    // Call the backend API to check if the song is favourite
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(
      `${backendUrl}/user-actions/${uid}/${sid}/is-favourite`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({is_favourite: data.is_favourite == 1});

  } catch (error) {
    console.error('Error checking favourite status:', error);
    return NextResponse.json(
      { error: 'Failed to check favourite status' },
      { status: 500 }
    );
  }
}

