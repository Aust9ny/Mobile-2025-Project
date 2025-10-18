// hooks/useAuth.ts
import { useEffect, useState } from 'react';
// import { auth } from '../services/firebase'; // ยังไม่ใช้งานตอนนี้
import type { User, ConfirmationResult } from 'firebase/auth';

let auth: any; // ให้เป็น any ชั่วคราวก่อนใส่ firebase ของจริง

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Monitor user state (ถ้า auth ไม่มีค่า จะไม่ทำอะไร)
  useEffect(() => {
    if (!auth || !auth.onAuthStateChanged) {
      console.warn('Firebase auth ยังไม่ได้ initialize');
      setIsAuthReady(true);
      return;
    }

    const unsub = auth.onAuthStateChanged((user: User | null) => {
      setUser(user);
      setUserId(user ? user.uid : null);
      setIsAuthReady(true);
    });

    return unsub;
  }, []);

  // Initialize reCAPTCHA (สำหรับ web)
  const initRecaptcha = () => {
    if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
      console.log('initRecaptcha() จะทำงานเมื่อใส่ Firebase จริง');
    }
  };

  const sendOtp = async (phoneNumber: string) => {
    try {
      setLoading(true);
      setError(null);
      initRecaptcha();
      console.log('sendOtp() จะทำงานเมื่อใส่ Firebase จริง');
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const confirmOtp = async (code: string) => {
    try {
      if (!confirmation) throw new Error('No confirmation result available');
      setLoading(true);
      console.log('confirmOtp() จะทำงานเมื่อใส่ Firebase จริง');
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!auth || !auth.signOut) {
      console.warn('Firebase auth ยังไม่ได้ initialize');
      setUser(null);
      setUserId(null);
      return;
    }
    await auth.signOut();
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
    error,
  };
}
