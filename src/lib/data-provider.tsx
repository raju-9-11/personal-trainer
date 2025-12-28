'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DataProviderType } from './types';
import { MockDataService } from './services/mock-service';
import { FirebaseDataService } from './services/firebase-service';

const DataContext = createContext<DataProviderType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [service, setService] = useState<DataProviderType | null>(null);

  useEffect(() => {
    // Default to Firebase Service as requested, but fall back to Mock if explicitly disabled or if config is missing (e.g. build time)
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
    const hasFirebaseConfig = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (useMock || !hasFirebaseConfig) {
        if (!useMock && !hasFirebaseConfig) {
            console.warn("Firebase config missing. Falling back to MockDataService.");
        }
        setService(new MockDataService());
    } else {
        setService(new FirebaseDataService());
    }
  }, []);

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
