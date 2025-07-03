'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserInfo, logout, notifyAuthChange } from './auth';

// Define the shape of our authentication context
type User = {
  uid: string;
  username: string;
} | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  logout: (router?: any) => Promise<void>;
  refreshUser: () => Promise<void>;
};

// Create a custom event for auth state changes
export const AUTH_STATE_CHANGE_EVENT = 'auth_state_changed';

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  refreshUser: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  // Function to refresh user data
  const refreshUser = async () => {
    setLoading(true);
    try {
      const userData = await getUserInfo();
      setUser(userData);
      
      // Dispatch a custom event when auth state changes
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(AUTH_STATE_CHANGE_EVENT, { 
          detail: { user: userData } 
        }));
      }
    } catch (error) {
      setUser(null);
      
      // Dispatch event for logout as well
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(AUTH_STATE_CHANGE_EVENT, { 
          detail: { user: null } 
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async (router?: any) => {
    await logout();
    setUser(null);
    // Dispatch event for logout
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(AUTH_STATE_CHANGE_EVENT, { 
        detail: { user: null } 
      }));
      notifyAuthChange();
    }
    // If router is provided, navigate to home
    if (router) {
      router.push('/');
    }
  };

  // Listen for auth state changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // If auth related storage item changed, refresh the user
      if (e.key === 'auth_state_change') {
        refreshUser();
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, []);

  // Load user on initial mount
  useEffect(() => {
    refreshUser();
  }, []);

  const value = {
    user,
    loading,
    logout: handleLogout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 