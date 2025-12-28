'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { DataProviderType } from './types';
import { MockDataService } from './services/mock-service';
import { FirebaseDataService } from './services/firebase-service';

const DataContext = createContext<DataProviderType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const service = useMemo(() => {
    const useFirebase = process.env.NEXT_PUBLIC_USE_FIREBASE === 'true';
    return useFirebase ? new FirebaseDataService() : new MockDataService();
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
