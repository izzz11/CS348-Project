import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');
    const sid = searchParams.get('sid');
    // Get the increment parameter - if not provided, default to false
    const shouldIncrement = searchParams.get('increment') === 'true';

    if (!uid || !sid) {
      return NextResponse.json(
        { error: 'Missing required parameters: uid and sid' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    
    try {
      // First try to get the user track action
      const getResponse = await fetch(
        `${backendUrl}/user-actions/${uid}/${sid}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Format date in MySQL compatible format (YYYY-MM-DD HH:MM:SS)
      const now = new Date();
      const currentTimestamp = now.toISOString().slice(0, 19).replace('T', ' ');
      
      // If the action doesn't exist, create it
      if (getResponse.status === 404) {
        // Create new user track action
        const createResponse = await fetch(
          `${backendUrl}/user-actions/create`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uid,
              sid,
              last_listened: currentTimestamp,
              total_plays: 1,
              favourite: false,
              rating: 0
            }),
          }
        );

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          console.error('Create error response:', errorText);
          throw new Error(`Backend API error: ${createResponse.status}`);
        }

        const data = await createResponse.json();
        return NextResponse.json({ 
          message: 'User track action created', 
          action: 'created',
          data 
        });
      } 
      // If the action exists, update it only if increment is true
      else if (getResponse.ok) {
        // If we should increment the play count, use the play endpoint
        if (shouldIncrement) {
          const playResponse = await fetch(
            `${backendUrl}/user-actions/${uid}/${sid}/play`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (!playResponse.ok) {
            const errorText = await playResponse.text();
            console.error('Play error response:', errorText);
            throw new Error(`Backend API error: ${playResponse.status}`);
          }

          return NextResponse.json({ 
            message: 'Play recorded successfully', 
            action: 'updated'
          });
        } 
        // Otherwise just return the existing action
        else {
          const existingAction = await getResponse.json();
          return NextResponse.json({ 
            message: 'User track action found', 
            action: 'found',
            data: existingAction
          });
        }
      } else {
        const errorText = await getResponse.text();
        console.error('Get error response:', errorText);
        throw new Error(`Unexpected response from backend: ${getResponse.status}`);
      }
    } catch (backendError: any) {
      console.error('Backend API error:', backendError);
      return NextResponse.json(
        { error: `Backend API error: ${backendError.message || 'Unknown error'}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error tracking song action:', error);
    return NextResponse.json(
      { error: `Failed to track song action: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
} 