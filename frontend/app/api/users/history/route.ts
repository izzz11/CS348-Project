// frontend/app/api/users/history/route.ts
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
    
    // Call the backend API to get user's recent plays
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    
    const res = await fetch(`${backendUrl}/user-actions/${uid}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 0 }
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(
        { error: errorData.detail || 'Failed to fetch listening history' },
        { status: res.status }
      );
    }
    
    const historyData = await res.json();
    // Now fetch song details for each action
    const recentPlays = historyData.actions || [];
    if (recentPlays.length === 0) {
      return NextResponse.json({ history: [] });
    }
    
    // Get unique song IDs to avoid duplicate requests
    const uniqueSongIds = [...new Set(recentPlays.map((action: any) => action.sid))];
    
    // Create a map to store song details
    const songDetailsMap: Record<string, any> = {};
    
    // Fetch song details for unique songs in batches
    const batchSize = 5;
    for (let i = 0; i < uniqueSongIds.length; i += batchSize) {
      const batchIds = uniqueSongIds.slice(i, i + batchSize);
      const batchPromises = batchIds.map(async (sid) => {
        try {
          const songRes = await fetch(`${backendUrl}/songs/fetch-song?sid=${sid}`);
          if (!songRes.ok) return [sid, null];
          const songData = await songRes.json();
          return [sid, songData];
        } catch (error) {
          return [sid, null];
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(([sid, data]) => {
        songDetailsMap[sid as string] = data;
      });
    }
    
    // Map song details to history items
    const historyWithSongDetails = recentPlays.map((action: any) => ({
      ...action,
      songDetails: songDetailsMap[action.sid] || null
    }));
    
    // Limit the results if needed
    const limitedHistory = historyWithSongDetails;
    
    return NextResponse.json({ history: limitedHistory }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching user listening history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}