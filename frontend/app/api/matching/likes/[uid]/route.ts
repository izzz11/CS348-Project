import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const { uid } = params;
    if (!uid) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    const response = await fetch(`${API_BASE_URL}/matching/likes/${uid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`${API_BASE_URL}/matching/likes/${uid}`)

    
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching liked users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch liked users' },
      { status: 500 }
    );
  }
} 