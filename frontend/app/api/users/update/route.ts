import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/serverAuth';

export async function PUT(req: NextRequest) {
  try {
    // Get the user from the session
    const user = getServerSession();
    const body = await req.json();
    
    // Use uid from request body if provided, otherwise use from session
    const uid = body.uid || (user?.uid);
    
    if (!uid) {
      return NextResponse.json(
        { error: 'Unauthorized - User ID is required' },
        { status: 401 }
      );
    }
    
    // Call the backend API
    const res = await fetch(`http://localhost:8000/users/${uid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: body.username,
        email: body.email,
        age: body.age ? parseInt(body.age) : null,
        country: body.country
      }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || 'Failed to update profile' },
        { status: res.status }
      );
    }
    
    // If username was updated, update the cookie
    if (body.username && user && body.username !== user.username) {
      const response = NextResponse.json(data, { status: 200 });
      
      // Update username cookie
      response.cookies.set({
        name: 'username',
        value: body.username,
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });
      
      return response;
    }
    
    return NextResponse.json(data, { status: 200 });
    
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 