'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DataProviderType } from './types';
import { MockDataService } from './services/mock-service';
import { FirebaseDataService } from './services/firebase-service';
import { useAuth } from './auth-context';

const DataContext = createContext<DataProviderType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [service, setService] = useState<DataProviderType | null>(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Determine if we should force mock mode based on auth state
    // If authenticated but no Firebase user, it means we used "Mock Login"
    const isMockAuth = isAuthenticated && !user;

    // Default to Firebase Service as requested, but fall back to Mock if explicitly disabled, config missing, or using Mock Login
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || isMockAuth;
    const hasFirebaseConfig = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (useMock || !hasFirebaseConfig) {
        if (!useMock && !hasFirebaseConfig) {
            console.warn("Firebase config missing. Falling back to MockDataService.");
        }
        // If we are switching modes, we instantiate a new service
        // Ideally we should cache instances, but they are lightweight.
        setService(new MockDataService());
    } else {
        setService(new FirebaseDataService());
    }
  }, [isAuthenticated, user]);

  return (
    <DataContext.Provider value={service}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
