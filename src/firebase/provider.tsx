'use client';
import { createContext, useContext, useEffect } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { auth as initializedAuth, firestore as initializedFirestore } from '.';
import { firebaseApp } from './config';
import { browserLocalPersistence, setPersistence } from 'firebase/auth';

export interface FirebaseContext {
  firebaseApp?: FirebaseApp;
  auth?: Auth;
  firestore?: Firestore;
}

const FirebaseContext = createContext<FirebaseContext | null>(null);

export const FirebaseProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    if (initializedAuth) {
      setPersistence(initializedAuth, browserLocalPersistence);
    }
  }, []);

  return (
    <FirebaseContext.Provider value={{ firebaseApp, auth: initializedAuth, firestore: initializedFirestore }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === null) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const useFirebaseApp = () => {
  const context = useContext(FirebaseContext);
  if (context === null) {
    throw new Error('useFirebaseApp must be used within a FirebaseProvider');
  }
  return context.firebaseApp;
};

export const useAuth = () => {
  const context = useContext(FirebaseContext);
  if (context === null) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context;
};

export const useFirestore = () => {
  const context = useContext(FirebaseContext);
  if (context === null) {
    throw new Error('useFirestore must be used within a FirebaseProvider');
  }
  return context.firestore;
};
