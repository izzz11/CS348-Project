import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Use environment variable with a fallback to localhost
    const apiUrl = 'http://localhost:8000';
    
    const response = await fetch(`${apiUrl}/dashboard/global/top-artists`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching top artists: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching top artists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top artists' },
      { status: 500 }
    );
  }
} 