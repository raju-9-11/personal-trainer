'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User, signInWithEmailLink, isSignInWithEmailLink, sendSignInLinkToEmail, signOut } from 'firebase/auth';
import { getFirebase } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  trainerSlug: string | null; // The slug associated with the logged-in user
  sendLoginLink: (email: string) => Promise<void>;
  finishLogin: (email: string, href: string) => Promise<void>;
  logout: () => Promise<void>;
  // Fallback for Mock Mode
  loginWithPassword: (password: string) => boolean;
  loginAsTrainer: (slug: string) => void; // Mock mode helper
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [trainerSlug, setTrainerSlug] = useState<string | null>(null);
  const [isMockAuth, setIsMockAuth] = useState(false);

  useEffect(() => {
    // Check if Firebase is available
    const { auth } = getFirebase();
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setUser(user);

        if (user) {
          // In a real scenario, we'd fetch the slug from Firestore here
          // For now, we rely on the DataProvider to find it or use a default if strict mapping fails
          // For Firebase Service, it does the lookup internally for writes.
          // But for UI "Welcome back trainer1", we might want it here.
          // Let's defer strict fetching to the consumer or lazy load it.
          // Or we can try to guess/map it.
          // Simplification: We don't strictly set `trainerSlug` here for Firebase mode
          // unless we do a query. Let's assume the DataProvider handles the mapping for writes.
          // But for the Admin Dashboard to know WHICH data to show (if it reads), it needs the slug.
          // Let's default to null and let the Admin dashboard fetch "My Profile" to resolve it?
          // No, cleaner if Auth resolves it.

          // NOTE: Resolving slug requires Firestore. To avoid circular deps or complex logic here,
          // we might just let the user be authenticated and the Admin page resolves the identity.
          // However, for MOCK mode, we need it.
        }

        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Mock Mode
      // Check session storage
      const stored = sessionStorage.getItem('mock_auth_user');
      if (stored) {
        setTrainerSlug(stored);
        setIsMockAuth(true);
      }
      setLoading(false);
    }
  }, []);

  const sendLoginLink = async (email: string) => {
    const { auth } = getFirebase();
    if (!auth) throw new Error("Firebase not configured");

    const actionCodeSettings = {
      // URL you want to redirect back to. The domain (www.example.com) for this
      // URL must be in the authorized domains list in the Firebase Console.
      url: window.location.origin + '/admin/verify',
      handleCodeInApp: true,
    };

    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);
  };

  const finishLogin = async (email: string, href: string) => {
    const { auth } = getFirebase();
    if (!auth) throw new Error("Firebase not configured");

    if (isSignInWithEmailLink(auth, href)) {
      await signInWithEmailLink(auth, email, href);
      window.localStorage.removeItem('emailForSignIn');
    }
  };

  const logout = async () => {
    const { auth } = getFirebase();
    if (auth) {
      await signOut(auth);
    } else {
      sessionStorage.removeItem('mock_auth_user');
      setTrainerSlug(null);
      setIsMockAuth(false);
    }
  };

  // Mock Mode Helpers
  const loginWithPassword = (password: string) => {
    // Legacy mock support or specific simple mock login
    if (password === 'admin123') {
       loginAsTrainer('trainer1'); // Default
       return true;
    }
    return false;
  };

  const loginAsTrainer = (slug: string) => {
    sessionStorage.setItem('mock_auth_user', slug);
    setTrainerSlug(slug);
    setIsMockAuth(true);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user || isMockAuth,
      trainerSlug,
      sendLoginLink,
      finishLogin,
      logout,
      loginWithPassword,
      loginAsTrainer
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
}
