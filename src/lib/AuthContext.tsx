"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  loginWithGoogle: async () => {},
  logout: async () => {},
});

async function saveUserToFirestore(firebaseUser: User) {
  if (!firebaseUser.email) return false;
  try {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      await setDoc(userRef, { lastLogin: new Date().toISOString() }, { merge: true });
      return userDoc.data()?.isAdmin === true;
    } else {
      await setDoc(userRef, {
        name: firebaseUser.displayName || "",
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL || "",
        isAdmin: false,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      });
      return false;
    }
  } catch (e) {
    console.error("Firestore user save error:", e);
    return false;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const admin = await saveUserToFirestore(firebaseUser);
        setIsAdmin(admin);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        const admin = await saveUserToFirestore(result.user);
        setIsAdmin(admin);
        setUser(result.user);
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
