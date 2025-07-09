import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const uid = params.uid;
    
    // Call the backend API to get user's favorites
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const url = backendUrl + '/user-actions/' + uid + '/favourites';
    
    const response = await fetch(url, {
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
        { error: errorData.detail || 'Failed to fetch favorite songs' },
        { status: response.status }
      );
    }
    
    // Return the favorites data from the backend
    const favoritesData = await response.json();
    
    return NextResponse.json(favoritesData);
    
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 