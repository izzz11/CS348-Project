import { cookies } from 'next/headers';

// Function to get current user info from cookies on server components
export function getServerSession() {
  const cookieStore = cookies();
  const authToken = cookieStore.get('auth-token')?.value;
  const username = cookieStore.get('username')?.value;
  
  if (!authToken) {
    return null;
  }
  
  return {
    uid: authToken,
    username: username || '',
  };
} 