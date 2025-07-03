import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true });
  
  // Clear all auth cookies
  response.cookies.set({
    name: 'auth-token',
    value: '',
    expires: new Date(0),
    path: '/',
  });
  
  response.cookies.set({
    name: 'username',
    value: '',
    expires: new Date(0),
    path: '/',
  });
  
  return response;
} 