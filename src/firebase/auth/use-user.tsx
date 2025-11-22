'use client';
import { useEffect, useState } from 'react';
import type { Auth, User } from 'firebase/auth';
import { useAuth as useFirebaseAuth } from '@/firebase/provider';

export const useAuth = () => {
  const { auth } = useFirebaseAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return { auth, user, loading };
};
