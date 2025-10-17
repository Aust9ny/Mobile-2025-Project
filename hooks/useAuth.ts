// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { auth } from '../services/firebase';
import {
  onAuthStateChanged,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut,
  ConfirmationResult,
  User
} from 'firebase/auth';

// Custom hook to manage authentication via OTP (Phone Number)
export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Monitor user state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setUserId(user ? user.uid : null);
      setIsAuthReady(true);
    });
    return unsub;
  }, []);

  // Initialize reCAPTCHA for web (Expo Web or React Native Web only)
  const initRecaptcha = () => {
    if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
      // Invisible reCAPTCHA works well for Firebase phone auth
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: () => console.log('Recaptcha verified'),
          'expired-callback': () => console.log('Recaptcha expired')
        }
      );
    }
  };

  // Send OTP to phone number
  const sendOtp = async (phoneNumber: string) => {
    try {
      setLoading(true);
      setError(null);
      initRecaptcha();

      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmation(result);
      setVerificationId(result.verificationId);
      return true;
    } catch (err: any) {
      console.error('OTP send error:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Confirm OTP
  const confirmOtp = async (code: string) => {
    try {
      if (!confirmation) throw new Error('No confirmation result available');
      setLoading(true);
      const result = await confirmation.confirm(code);
      setUser(result.user);
      setUserId(result.user.uid);
      return true;
    } catch (err: any) {
      console.error('OTP verification failed:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserId(null);
  };

  return {
    user,
    userId,
    isAuthReady,
    verificationId,
    sendOtp,
    confirmOtp,
    logout,
    loading,
    error
  };
}
