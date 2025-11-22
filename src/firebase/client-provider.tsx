'use client';

import { useEffect, useState }from 'react';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseApp } from 'firebase/app';
import { FirebaseProvider, FirebaseContext } from './provider';

export const FirebaseClientProvider = ({
  children,
  ...props
}: {
  children: React.ReactNode;
  firebaseApp?: FirebaseApp;
  firestore?: Firestore;
  auth?: Auth;
}) => {
  const [firebase, setFirebase] = useState<FirebaseContext | null>(null);

  useEffect(() => {
    setFirebase(props);
  }, [props]);

  if (!firebase) {
    return null;
  }
  return <FirebaseProvider {...firebase}>{children}</FirebaseProvider>;
};
