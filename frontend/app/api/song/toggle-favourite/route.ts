import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
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

    // Call the backend API to toggle the favourite status
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(
      `${backendUrl}/user-actions/${uid}/${sid}/toggle-favourite`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error toggling favourite status:', error);
    return NextResponse.json(
      { error: 'Failed to toggle favourite status' },
      { status: 500 }
    );
  }
}
