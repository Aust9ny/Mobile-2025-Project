// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, ConfirmationResult } from 'firebase/auth';

const API_URL = 'http://localhost:4000/api'; // Update with your backend URL

type AuthUser = {
  id: string;
  email: string;
  name: string;
  firebase_uid?: string;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  authType: 'jwt' | 'firebase' | null;
};

let auth: any; // Firebase auth instance (optional)

export default function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    authType: null
  });
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load saved auth state on startup
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const userStr = await AsyncStorage.getItem('authUser');
        const authType = await AsyncStorage.getItem('authType') as 'jwt' | 'firebase' | null;
        
        if (token && userStr && authType) {
          const user = JSON.parse(userStr);
          
          // Verify token is still valid
          const response = await fetch(`${API_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
            const { user: currentUser } = await response.json();
            setAuthState({ user: currentUser, token, authType });
          } else {
            // Token expired or invalid
            await clearAuthState();
          }
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
      } finally {
        setIsAuthReady(true);
      }
    };

    loadAuthState();
  }, []);

  const saveAuthState = async (user: AuthUser, token: string, authType: 'jwt' | 'firebase') => {
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('authUser', JSON.stringify(user));
    await AsyncStorage.setItem('authType', authType);
    setAuthState({ user, token, authType });
  };

  const clearAuthState = async () => {
    await AsyncStorage.multiRemove(['authToken', 'authUser', 'authType']);
    setAuthState({ user: null, token: null, authType: null });
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      await saveAuthState(data.user, data.token, 'jwt');
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      await saveAuthState(data.user, data.token, 'jwt');
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginWithFirebase = async (firebaseToken: string, name?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/users/firebase-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firebaseToken}`
        },
        body: JSON.stringify({ name })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Firebase login failed');
      }
      
      await saveAuthState(data.user, firebaseToken, 'firebase');
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Sign out from Firebase if using Firebase auth
      if (authState.authType === 'firebase' && auth?.signOut) {
        await auth.signOut();
      }
      
      await clearAuthState();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    user: authState.user,
    userId: authState.user?.id || null,
    token: authState.token,
    authType: authState.authType,
    isAuthReady,
    loginWithEmail,
    register,
    loginWithFirebase,
    logout,
    loading,
    error,
  };
}
