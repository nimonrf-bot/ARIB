"use client";

import {
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  type DocumentData,
  type Firestore,
} from "firebase/firestore";
import { useEffect, useState, useMemo } from "react";
import { useFirestore } from "@/firebase/provider";

export const useDoc = <T extends DocumentData>(collectionName: string, docId: string) => {
  const firestore = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const docRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, collectionName, docId);
  }, [firestore, collectionName, docId]);

  useEffect(() => {
    if (!docRef) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      docRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setData({ id: docSnapshot.id, ...docSnapshot.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docRef]);

  const update = async (data: Partial<T>) => {
    if (!docRef) return;
    return setDoc(docRef, data, { merge: true });
  };
  
  const remove = async () => {
    if (!docRef) return;
    return deleteDoc(docRef);
  };

  return { data, loading, error, update, remove, setData };
};
