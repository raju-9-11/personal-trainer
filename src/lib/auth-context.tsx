'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFirebase } from './firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  login: (emailOrPassword: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { auth } = getFirebase();
    if (!auth) {
      // If firebase auth is not available (e.g. config missing), fall back to session mock check
      const sessionAuth = sessionStorage.getItem('admin_auth');
      if (sessionAuth === 'true') {
        setIsAuthenticated(true);
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (emailOrPassword: string, password?: string) => {
    // Check if it's the mock password flow
    if (!password) {
       // Legacy/Mock login
       if (emailOrPassword === 'admin123') {
         setIsAuthenticated(true);
         sessionStorage.setItem('admin_auth', 'true');
         return true;
       }
       return false;
    }

    // Firebase Auth flow
    const { auth } = getFirebase();
    if (!auth) {
      console.error("Firebase Auth not initialized");
      return false;
    }

    try {
      await signInWithEmailAndPassword(auth, emailOrPassword, password);
      return true;
    } catch (error) {
      console.error("Login failed", error);
      return false;
    }
  };

  const logout = async () => {
    const { auth } = getFirebase();
    if (auth) {
      await signOut(auth);
    }
    setIsAuthenticated(false);
    setUser(null);
    sessionStorage.removeItem('admin_auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {!loading && children}
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
