import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    signOut, 
    User,
    sendSignInLinkToEmail, 
    signInWithEmailLink,
} from "firebase/auth";
import { auth } from "../../services/firebase"; 
import API_URL from "../../config/apiConfig"; 
import * as Linking from 'expo-linking';
import { Alert } from 'react-native';
import { generateAuthHeaders } from '../../utils/AuthHelper';

// Define the type for user data during registration
interface UserData {
 email: string;
 firstName: string;
 lastName: string;
 sid: string;
}

// ⚠️ ต้องมี Helper นี้ใน utils/AuthHelper.js
const getBackendHost = () => { /* Logic to return backend URL */ return API_URL; }; 

interface AuthContextType {
 // ... (AuthContextType definition from previous context)
}

// -------------------------------------------------------------
// ⭐️ AuthProvider Component
// -------------------------------------------------------------
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userID, setUserID] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // 1. 🎯 Function Login (Fixed)
  // ใน AuthContext.js (ภายใน AuthProvider)

const login = async (email: string, pass: string): Promise<boolean> => {
    setLoading(true); 
    setError(null);
    try {
      // 1. Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const loggedInUser = userCredential.user;
      
      const firebaseToken = await loggedInUser.getIdToken();
      
      // 2. SYNC & STATUS CHECK: ส่ง Firebase Token ไป Backend เพื่อรับ Local JWT
      const syncResponse = await fetch(`${getBackendHost()}/api/users/firebase-login`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firebaseToken}`
        },
        body: JSON.stringify({
          userId: loggedInUser.uid,
          email: loggedInUser.email,
          name: loggedInUser.displayName || '' 
        })
      });

      if (!syncResponse.ok) {
        // 🚨 บล็อกที่จับสถานะบัญชี (เช่น 403 Forbidden - Not Active)
        const syncError = await syncResponse.json();
        
        // ⭐️ FIX 1: Log out จาก Firebase หาก Backend ปฏิเสธ (ป้องกันการเข้าสู่ระบบแบบครึ่งๆ กลางๆ)
        await signOut(auth); 
        
        // ⭐️ FIX 2: โยน Error ที่ชัดเจนจาก Backend
        throw new Error(syncError?.error || 'Failed to verify account status or sync user.');
      }

      // 3. Success: Backend คืน Local JWT
      const syncData = await syncResponse.json();
      const apiToken = syncData.token; 

      if (!apiToken) {
        await signOut(auth); // Log out Firebase
        throw new Error('No API token received from backend.');
      }

      // 4. อัปเดต State
      await AsyncStorage.setItem('authToken', apiToken);
      setUser(loggedInUser); 
      setUserID(syncData.user.id); // ใช้ MySQL ID จาก Backend
      setUserToken(apiToken); 
      
      return true;

    } catch (e: any) {
      console.error("Login failed:", e);
      // ⭐️ FIX 3: แสดงข้อความ Error จาก Backend/Firebase
      setError(e.message || "An unknown error occurred");
      return false; 
    } finally {
        setLoading(false); 
    }
  };

  // 2. 🎯 Function Logout (Fixed)
  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut(auth);
      
      // ⭐️ FIX: เคลียร์ State ด้วยตัวเอง
      await AsyncStorage.removeItem('authToken');
      setUser(null);
      setUserID(null);
      setUserToken(null); 

    } catch (e: any) {
      console.error("Logout failed:", e);
      setError(e.message || "An unknown error occurred");
      
      // ⭐️ FIX: บังคับเคลียร์ State แม้จะมี Error
      await AsyncStorage.removeItem('authToken');
      setUser(null);
      setUserID(null);
      setUserToken(null);
    } finally {
      setLoading(false);
    }
  };

  // 3. 🎯 Function Register (Fixed)
  const registerFunc = async (userData: UserData, password: string): Promise<boolean> => {
    const { email, firstName, lastName, sid } = userData;
    const backend = getBackendHost();
    setLoading(true);

    try {
        // 1. 🎯 FIX: เปลี่ยนไปใช้ Domain ของ Firebase เป็น Base URL ใน Action Code Settings
        const actionCodeSettings = {
            // ⭐️ FIX 1: ใช้ Domain ของ Firebase เป็น Base URL (เพื่อให้ Firebase รู้ว่าต้อง Redirect ไปที่ไหน)
            url: `https://lendmelibrary.firebaseapp.com/finishSignUp?email=${encodeURIComponent(email)}`, 
            handleCodeInApp: true,
            // ⭐️ FIX 2: ตั้งค่า Deep Link Scheme ของแอปฯ ที่จะใช้เปิด
            iOS: { bundleId: 'com.lendme.library', customScheme: 'lendme' }, 
            android: { packageName: 'com.lendme.library', installApp: true, minimumVersion: '12', customScheme: 'lendme' }, 
        };
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);

        const response = await fetch(`${backend}/api/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName, sid }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Registration failed at server.');
        }

        await AsyncStorage.setItem('emailForSignIn', email);
        return true; 

    } catch (error) {
        console.error('Registration/Link Send Error:', error);
        throw error;
    } finally {
        setLoading(false);
    }
  };
  
  // 4. 🎯 Function Deep Link Handler (Fixed State Update)
  const handleDeepLink = useCallback(async (url:any) => {
    if (!url || !url.includes('mode=signIn')) return; 
    
    let email = await AsyncStorage.getItem('emailForSignIn');
    if (!email) { return; }

    try {
        const userCredential = await signInWithEmailLink(auth, email, url);
        const firebaseUser = userCredential.user;

        if (firebaseUser.emailVerified) {
            const idToken = await firebaseUser.getIdToken(); 
            const response = await fetch(`${getBackendHost()}/api/users/activate-account`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            });
            
            const data = await response.json();
            if (!response.ok) { throw new Error(data.message || 'Account activation failed.'); }
            
            // ⭐️ FIX: อัปเดต State ที่ถูกต้อง
            await AsyncStorage.removeItem('emailForSignIn');
            await AsyncStorage.setItem('authToken', data.token);
            setUser(firebaseUser);
            setUserID(data.user.id); 
            setUserToken(data.token); 
            
            Alert.alert('ยืนยันสำเร็จ', 'บัญชีของคุณถูกเปิดใช้งานแล้ว!');
        }
    } catch (error) {
        console.error('Email Link Sign In Error:', error);
        Alert.alert('ผิดพลาด', 'ลิงก์ยืนยันไม่ถูกต้องหรือหมดอายุแล้ว');
    }
  }, []); // useCallback เพื่อให้ handleDeepLink มีความเสถียร


  // 5. 🎯 useEffect สำหรับจัดการ Linking (Fixed Dependencies)
  useEffect(() => {
    // จัดการลิงก์เมื่อแอปถูกเปิดขณะปิดอยู่
    Linking.getInitialURL().then(handleDeepLink);

    // จัดการลิงก์เมื่อแอปกำลังรันอยู่
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
        handleDeepLink(url);
    });

    return () => {
        linkingSubscription.remove();
    };
  }, [handleDeepLink]); // ⭐️ ต้องใส่ handleDeepLink ใน Dependency Array

  // 6. 🎯 useEffect สำหรับ OnAuthStateChanged (Fixed)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Logic นี้ยังคงไว้
      // ... (เดิม) ...
      try {
        if (user) {
          const apiToken = await AsyncStorage.getItem('authToken');

          if (apiToken) {
            setUser(user);
            // ⚠️ เราไม่ใช้ user.uid ใน userID อีกแล้ว แต่ใช้ token เพื่อให้ Backend ดึง MySQL ID มา
            // เนื่องจากโค้ดนี้รันตอนเปิดแอป เราจึงถือว่าถ้ามี authToken, userID ต้องมีค่า
            // ถ้าคุณมี API สำหรับดึง UserID จาก Token ได้ จะดีกว่า
            setUserID(user.uid); // Fallback to Firebase UID
            setUserToken(apiToken); 
          } else {
            // ... (Handle no apiToken) ...
            setUser(null);
            setUserID(null);
            setUserToken(null);
          }
          
        } else {
          // ... (Handle logout) ...
          await AsyncStorage.removeItem('authToken'); 
          setUser(null);
          setUserID(null); 
          setUserToken(null);
        }
      } catch (e) {
        // ... (Error handling) ...
      } finally {
        setIsAuthReady(true);
      }
    });

    return () => unsubscribe(); // Cleanup
  }, []);


  const value = {
    user,
    userID,
    userToken,
    isAuthReady,
    loading,
    error,
    login,
    logout,
    register: registerFunc // ⭐️ ส่งออกฟังก์ชันที่ถูกต้อง
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Define the AuthContextType interface
interface AuthContextType {
 user: User | null;
 userID: string | null;
 userToken: string | null;
 isAuthReady: boolean;
 loading: boolean;
 error: string | null;
 login: (email: string, pass: string) => Promise<boolean>;
 logout: () => Promise<void>;
 register: (userData: UserData, password: string) => Promise<boolean>;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);