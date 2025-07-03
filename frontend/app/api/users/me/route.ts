import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  const authToken = cookieStore.get('auth-token')?.value;
  const username = cookieStore.get('username')?.value;
  
  if (!authToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  return NextResponse.json({
    uid: authToken,
    username: username || '',
  });
} 