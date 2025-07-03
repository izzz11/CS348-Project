'use client';

// Client-side function to get user info from cookies
export async function getUserInfo() {
  try {
    const res = await fetch('/api/users/me', {
      method: 'GET',
      credentials: 'include', // Important for cookies
    });
    
    if (!res.ok) {
      return null;
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
}

// Client-side function to logout
export async function logout() {
  try {
    await fetch('/api/users/logout', {
      method: 'POST',
      credentials: 'include',
    });
    
    window.location.href = '/';
  } catch (error) {
    console.error('Error during logout:', error);
  }
}

// Function to notify all tabs/windows of auth state changes
export function notifyAuthChange() {
  // This uses localStorage to communicate between tabs
  // The actual value doesn't matter, just the timestamp
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_state_change', Date.now().toString());
    // Remove it immediately to ensure future changes trigger events
    localStorage.removeItem('auth_state_change');
  }
} 