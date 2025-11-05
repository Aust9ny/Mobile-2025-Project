// authService.ts
import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { logAuthEvent } from "./LoggingService";
import { syncUserToBackend } from "./UserService";

export const register = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    const token = await user.getIdToken();

    // Log the successful registration
    logAuthEvent("info", "Registration Success", {
      userId: user.uid,
      email: user.email!,
      token: token,
    });

    // Sync user data to your MySQL backend
    await syncUserToBackend({
      userId: user.uid,
      email: user.email,
      name: user.displayName,
      firebaseToken: token,
    });

    return userCredential;
  } catch (error: any) {
    logAuthEvent("error", "Registration Failure", { email, error });
    throw error;
  }
};

export const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    const token = await user.getIdToken();

    // Log the successful login
    logAuthEvent("info", "Login Success", {
      userId: user.uid,
      email: user.email!,
      name: user.displayName!,
      token: token,
    });

    // Sync user data to your MySQL backend
    await syncUserToBackend({
      userId: user.uid,
      email: user.email,
      name: user.displayName,
      firebaseToken: token,
    });

    return userCredential;
  } catch (error: any) {
    logAuthEvent("error", "Login Failure", { email, error });
    throw error;
  }
};

export const logout = () => {
  return signOut(auth);
};
