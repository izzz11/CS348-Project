import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/serverAuth';

export async function GET(
  request: Request,
  { params }: { params: { uid: string } }
) {
  try {
    // Get the user from the session
    const user = getServerSession();
    const uid = params.uid;
    
    if (!user?.uid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Call backend API to get user's total listening duration
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/users/${uid}/total_listen_duration`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.detail || 'Failed to fetch listening duration' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error fetching total listening duration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 