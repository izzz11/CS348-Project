import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/serverAuth';

export async function GET(req: NextRequest) {
  try {
    // Get uid from query parameter or session
    const searchParams = req.nextUrl.searchParams;
    const uidFromQuery = searchParams.get('uid');
    
    // Get the user from the session if no uid provided in query
    const user = getServerSession();
    const uid = uidFromQuery || user?.uid;
    
    if (!uid) {
      return NextResponse.json(
        { error: 'Unauthorized - User ID is required' },
        { status: 401 }
      );
    }
    
    // Call the backend API
    const res = await fetch(`http://localhost:8000/users/${uid}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || 'Failed to fetch profile' },
        { status: res.status }
      );
    }
    
    return NextResponse.json(data, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 