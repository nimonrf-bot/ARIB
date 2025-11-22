"use client";

import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  setDoc,
  deleteDoc,
  type DocumentData,
  type Firestore,
} from "firebase/firestore";
import { useEffect, useState, useMemo } from "react";
import { useFirestore } from "@/firebase/provider";

export const useCollection = <T extends DocumentData>(collectionName: string) => {
  const firestore = useFirestore();
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const collectionRef = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, collectionName);
  }, [firestore, collectionName]);

  useEffect(() => {
    if (!collectionRef) {
      setLoading(false);
      return;
    };

    const unsubscribe = onSnapshot(
      collectionRef,
      (snapshot) => {
        const result: T[] = [];
        snapshot.forEach((doc) => {
          result.push({ id: doc.id, ...doc.data() } as T);
        });
        setData(result);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionRef]);

  const add = async (data: Omit<T, 'id'>) => {
    if (!collectionRef) return;
    return addDoc(collectionRef, data);
  };

  const update = async (id: string, data: Partial<T>) => {
    if (!firestore) return;
    const docRef = doc(firestore, collectionName, id);
    return setDoc(docRef, data, { merge: true });
  };

  const remove = async (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, collectionName, id);
    return deleteDoc(docRef);
  };

  return { data, loading, error, add, update, remove, setData };
};
