import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  User,
  createUserWithEmailAndPassword,
  updateProfile 
} from "firebase/auth";
import { auth } from "../../services/firebase"; 
import API_URL from "../../config/apiConfig"; 


interface UserData {
  email: string;
  firstName: string;
  lastName: string;
}
interface AuthContextType {
  user: User | null;
  userID: string | null;
  userToken: string | null;
  isAuthReady: boolean;
  loading: boolean;
  error: string | null;
  register: (userData: UserData, pass: string) => Promise<boolean>;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userID, setUserID] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  

  /**
   * 4. Hook นี้จะทำงานเมื่อแอปเปิด หรือเมื่อสถานะ Auth เปลี่ยนแปลง
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // ผู้ใช้ล็อกอินอยู่ (แต่เราจะยึด Token จาก MySQL เป็นหลัก)
          // ลองดึง Token ของ MySQL จาก AsyncStorage
          const apiToken = await AsyncStorage.getItem('authToken');

          if (apiToken) {
            setUser(user);
            setUserID(user.uid);
            setUserToken(apiToken); // ⭐️ ใช้ Token ของ MySQL ที่เก็บไว้
          } else {
            // มี user Firebase แต่ไม่มี apiToken (เช่น เพิ่งเปิดแอป)
            // เราควรจะบังคับให้ login/sync ใหม่
            await signOut(auth); // บังคับ logout
            setUser(null);
            setUserID(null);
            setUserToken(null);
          }
          
        } else {
          // ผู้ใช้ล็อกเอาต์
          await AsyncStorage.removeItem('authToken'); 
          setUser(null);
          setUserID(null);
          setUserToken(null);
        }
      } catch (e) {
        console.error("Auth state change error:", e);
        setUser(null);
        setUserID(null);
        setUserToken(null);
      } finally {
        setIsAuthReady(true);
      }
    });

    return () => unsubscribe(); // Cleanup
  }, []);

  /**
   * 5. ⭐️⭐️ ฟังก์ชัน Login (อัปเดตแล้ว) ⭐️⭐️
   */
  const login = async (email: string, pass: string): Promise<boolean> => {
    setLoading(true); 
    setError(null);
    try {
      // 1. ยืนยันตัวตนกับ Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const loggedInUser = userCredential.user;
      
      // 2. ⭐️ เอา Token (บัตรประชาชน) จาก Firebase
      const firebaseToken = await loggedInUser.getIdToken();
      
      // 3. ⭐️⭐️ SYNC ข้อมูลไปที่ MySQL Backend ⭐️⭐️
      // ❗️❗️ FIX: แก้ไข Endpoint URL ให้ถูกต้อง (เติม s)
      const syncResponse = await fetch(`${API_URL}/api/users/firebase-login`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firebaseToken}` // ส่ง Firebase Token
        },
        body: JSON.stringify({
          // ส่งข้อมูลเผื่อ Backend ต้องการอัปเดต (เช่น displayName)
          userId: loggedInUser.uid,
          email: loggedInUser.email,
          name: loggedInUser.displayName || '' 
        })
      });

      if (!syncResponse.ok) {
        const syncError = await syncResponse.json();
        throw new Error(syncError?.message || 'Failed to sync user on login.');
      }

      // 4. ⭐️ Backend จะคืน Token ของ MySQL (apiToken) มาให้
      const syncData = await syncResponse.json();
      const apiToken = syncData.token; // ❗️ นี่คือ Token ที่เราต้องการ

      if (!apiToken) {
        throw new Error('No API token received from backend.');
      }

      // 5. ⭐️ บันทึก Token ของ MySQL (apiToken) ลง ASYNCSTORAGE
      await AsyncStorage.setItem('authToken', apiToken);
      
      // 6. ⭐️ ตั้งค่า state (แอปจะสลับไปหน้าหลักอัตโนมัติ)
      setUser(loggedInUser); 
      setUserID(loggedInUser.uid); 
      setUserToken(apiToken); // ❗️❗️ เก็บ Token ของ MySQL (apiToken)
      
      setLoading(false); 
      return true; // สำเร็จ

    } catch (e: any) {
      console.error("Login failed:", e);
      setError(e.message || "An unknown error occurred");
      setLoading(false); 
      return false; // ล้มเหลว
    }
  };

  /**
   * 6. ฟังก์ชัน Logout (ที่ DrawerMenu เรียกใช้) - (ไม่เปลี่ยนแปลง)
   */
  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      // onAuthStateChanged (ใน useEffect) จะทำงานและเคลียร์ state ให้เอง
    } catch (e: any) {
      console.error("Logout failed:", e);
      setError(e.message || "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 7. ⭐️ ฟังก์ชัน Register (ที่ RegisterScreen เรียกใช้) - อัปเดตแล้ว
   */
  const register = async (userData: UserData, pass: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // 1. สร้างผู้ใช้ใน Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, pass);
      const registeredUser = userCredential.user;
      const displayName = `${userData.firstName} ${userData.lastName}`;

      // 2. อัปเดตโปรไฟล์ใน Firebase (ตั้งชื่อ)
      await updateProfile(registeredUser, { displayName: displayName });

      // 3. เอา Token (บัตรประชาชน)
      const firebaseToken = await registeredUser.getIdToken();
      
      // 4. ⭐️⭐️ SYNC ข้อมูลไปที่ MySQL Backend ⭐️⭐️
      // ❗️❗️ FIX: แก้ไข Endpoint URL ให้ถูกต้อง (เติม s)
      const syncResponse = await fetch(`${API_URL}/api/users/firebase-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firebaseToken}` // ส่ง Token เพื่อยืนยันตัวตน
        },
        body: JSON.stringify({
          userId: registeredUser.uid, // Firebase UID
          email: registeredUser.email,
          name: displayName, // ส่งชื่อไปด้วย
          first_name: userData.firstName, // ส่งชื่อ-สกุล แยกกัน
          last_name: userData.lastName
        })
      });

      if (!syncResponse.ok) {
        const syncError = await syncResponse.json();
        throw new Error(syncError?.message || 'Failed to sync user to database.');
      }
      
      // 5. ⭐️ Backend จะคืน Token ของ MySQL (apiToken) มาให้
      const syncData = await syncResponse.json();
      const apiToken = syncData.token;

      if (!apiToken) {
        throw new Error('No API token received from backend.');
      }

      // 6. บันทึก TOKEN ของ MySQL (apiToken) ลง ASYNCSTORAGE (สำคัญมาก)
      await AsyncStorage.setItem('authToken', apiToken);
      
      // 7. ตั้งค่า state (แอปจะสลับไปหน้าหลักอัตโนมัติ)
      setUser(registeredUser);
      setUserID(registeredUser.uid);
      setUserToken(apiToken); // ❗️❗️ เก็บ Token ของ MySQL (apiToken)
      
      setLoading(false); 
      return true; // สำเร็จ

    } catch (e: any) {
      console.error("Registration failed:", e);
      
      // ⭐️ (Optional) ถ้า Sync ล้มเหลว ควรลบ user ออกจาก Firebase ด้วย
      // แต่ตอนนี้แค่แสดง error ก่อน
      
      setError(e.message || "An unknown error occurred");
      setLoading(false); 
      return false; // ล้มเหลว
    }
  };

  /**
   * 8. ส่งค่าทั้งหมดนี้ไปยัง Components ลูก
   */
  const value = {
    user,
    userID,
    userToken,
    isAuthReady,
    loading,
    error,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * 9. สร้าง Hook `useAuth` (ที่คุณใช้อยู่)
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

