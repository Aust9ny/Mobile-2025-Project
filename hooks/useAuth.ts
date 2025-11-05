// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../services/config';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPhoneNumber, ConfirmationResult, updateProfile } from 'firebase/auth';

type AuthUser = {
  id: string;
  email?: string | null;
  username?: string | null;
  first_name?: string;
  last_name?: string;
  name?: string;
  firebase_uid?: string;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  refresh_token: string | null;
  authType: 'jwt' | 'firebase' | null;
};

let phoneConfirmation: ConfirmationResult | null = null;

export default function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    refresh_token: null,
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
        const refresh_token = await AsyncStorage.getItem('refreshToken');
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
            setAuthState({ user: currentUser, token, refresh_token, authType });
          } else if (refresh_token) {
            // Try refresh token
            const refreshRes = await fetch(`${API_URL}/users/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh_token })
            });
            if (refreshRes.ok) {
              const { token: newToken } = await refreshRes.json();
              await AsyncStorage.setItem('authToken', newToken);
              setAuthState({ user, token: newToken, refresh_token, authType });
            } else {
              await clearAuthState();
            }
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

  const saveAuthState = async (user: AuthUser, token: string, refresh_token?: string | null, authType: 'jwt' | 'firebase' = 'jwt') => {
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('authUser', JSON.stringify(user));
    await AsyncStorage.setItem('authType', authType);
    if (refresh_token) {
      await AsyncStorage.setItem('refreshToken', refresh_token);
    }
    setAuthState({ user, token, refresh_token, authType });
  };

  const clearAuthState = async () => {
    await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'authUser', 'authType']);
    setAuthState({ user: null, token: null, refresh_token: null, authType: null });
  };

  const loginWithIdentifier = async (identifier: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      await saveAuthState(data.user, data.token, data.refresh_token, 'jwt');
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (options: { email?: string; username?: string; phone_number?: string; password: string; name?: string; first_name?: string; last_name?: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      await saveAuthState(data.user, data.token, data.refresh_token, 'jwt');
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginWithFirebase = async (firebaseToken: string, first_name?: string, last_name?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/users/firebase-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firebaseToken}`
        },
        body: JSON.stringify({ first_name, last_name })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Firebase login failed');
      }
      
      await saveAuthState(data.user, firebaseToken, null, 'firebase');
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Firebase email/password
  const loginWithEmailFirebase = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No token');
      // Sync user
      await fetch(`${API_URL}/users/firebase-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({})
      });
      const me = await fetch(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
      const meData = await me.json();
      await saveAuthState(meData.user, token, null, 'firebase');
      return true;
    } catch (e: any) {
      setError(e.message);
      return false;
    } finally { setLoading(false); }
  };

  const registerWithEmailFirebase = async (email: string, password: string, first_name?: string, last_name?: string) => {
    try {
      setLoading(true);
      setError(null);
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (first_name || last_name) {
        await updateProfile(cred.user, { displayName: `${first_name || ''} ${last_name || ''}`.trim() });
      }
      const token = await cred.user.getIdToken();
      await fetch(`${API_URL}/users/firebase-login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ first_name, last_name })
      });
      const me = await fetch(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
      const meData = await me.json();
      await saveAuthState(meData.user, token, null, 'firebase');
      return true;
    } catch (e: any) { setError(e.message); return false; } finally { setLoading(false); }
  };

  // Firebase phone
  const startPhoneOtp = async (phoneNumber: string, verifier: any) => {
    try { setLoading(true); setError(null);
      phoneConfirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      return true;
    } catch (e: any) { setError(e.message); return false; } finally { setLoading(false); }
  };

  const confirmPhoneOtp = async (code: string, first_name?: string, last_name?: string) => {
    try { setLoading(true); setError(null);
      if (!phoneConfirmation) throw new Error('No OTP session');
      const cred = await phoneConfirmation.confirm(code);
      const token = await cred.user.getIdToken();
      await fetch(`${API_URL}/users/firebase-login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ first_name, last_name })
      });
      const me = await fetch(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
      const meData = await me.json();
      await saveAuthState(meData.user, token, null, 'firebase');
      return true;
    } catch (e: any) { setError(e.message); return false; } finally { setLoading(false); }
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

  // OTP helpers
  const isEmail = (v: string) => /.+@.+\..+/.test(v);
  const isPhone = (v: string) => /^\+?\d{7,15}$/.test(v.replace(/\s|-/g, ''));

  const requestOtpLogin = async (identifier: string) => {
    try {
      setLoading(true);
      setError(null);
      const body: any = { purpose: 'login' };
      if (isEmail(identifier)) body.email = identifier.trim();
      else if (isPhone(identifier)) body.phone_number = identifier.replace(/\s|-/g, '');
      else throw new Error('กรุณากรอกอีเมลหรือเบอร์โทรศัพท์สำหรับ OTP');
      const res = await fetch(`${API_URL}/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request OTP');
      return data;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpLogin = async (identifier: string, code: string) => {
    try {
      setLoading(true);
      setError(null);
      const body: any = { purpose: 'login', code };
      if (isEmail(identifier)) body.email = identifier.trim();
      else if (isPhone(identifier)) body.phone_number = identifier.replace(/\s|-/g, '');
      else throw new Error('กรุณากรอกอีเมลหรือเบอร์โทรศัพท์สำหรับ OTP');
      const res = await fetch(`${API_URL}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to verify OTP');
      if (data?.token && data?.user) {
        await saveAuthState(data.user, data.token, data.refresh_token, 'jwt');
        return true;
      }
      return false;
    } catch (e: any) {
      setError(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const requestOtpRegister = async (identifier: string) => {
    try {
      setLoading(true);
      setError(null);
      const body: any = { purpose: 'register' };
      if (isEmail(identifier)) body.email = identifier.trim();
      else if (isPhone(identifier)) body.phone_number = identifier.replace(/\s|-/g, '');
      else throw new Error('กรุณากรอกอีเมลหรือเบอร์โทรศัพท์สำหรับ OTP');
      const res = await fetch(`${API_URL}/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request OTP');
      return data;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpRegister = async (identifier: string, code: string) => {
    try {
      setLoading(true);
      setError(null);
      const body: any = { purpose: 'register', code };
      if (isEmail(identifier)) body.email = identifier.trim();
      else if (isPhone(identifier)) body.phone_number = identifier.replace(/\s|-/g, '');
      else throw new Error('กรุณากรอกอีเมลหรือเบอร์โทรศัพท์สำหรับ OTP');
      const res = await fetch(`${API_URL}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to verify OTP');
      return !!data?.success;
    } catch (e: any) {
      setError(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    user: authState.user,
    userId: authState.user?.id || null,
    token: authState.token,
    refresh_token: authState.refresh_token,
    authType: authState.authType,
    isAuthReady,
    loginWithIdentifier,
    register,
    loginWithFirebase,
    loginWithEmailFirebase,
    registerWithEmailFirebase,
    startPhoneOtp,
    confirmPhoneOtp,
    logout,
    requestOtpLogin,
    verifyOtpLogin,
    requestOtpRegister,
    verifyOtpRegister,
    loading,
    error,
  };
}
