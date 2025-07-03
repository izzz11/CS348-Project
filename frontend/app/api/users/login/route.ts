import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch('http://localhost:8000/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  
  const data = await res.json();
  
  // If login successful, set cookies
  if (res.status === 200) {
    const response = NextResponse.json({ 
      success: true,
      user: {
        uid: data.uid,
        username: data.username
      }
    }, { status: 200 });
    
    // Set secure cookies with user data
    // Max age: 7 days in seconds
    const maxAge = 7 * 24 * 60 * 60;
    
    response.cookies.set({
      name: 'auth-token',
      value: data.uid,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge,
      path: '/',
    });
    
    response.cookies.set({
      name: 'username',
      value: data.username,
      httpOnly: false, // Allow JavaScript access for UI display
      secure: process.env.NODE_ENV === 'production',
      maxAge,
      path: '/',
    });
    
    return response;
  }
  
  return NextResponse.json(data, { status: res.status });
} 