import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseApp } from './config';
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';
import { useAuth } from './auth/use-user';
import { useFirebase, useFirebaseApp, useFirestore, useAuth as useFirebaseAuth } from './provider';

const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

export {
  auth,
  firestore,
  useCollection,
  useDoc,
  useAuth,
  useFirebase,
  useFirebaseApp,
  useFirestore,
  useFirebaseAuth,
};
