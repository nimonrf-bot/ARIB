import { getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';

const firebaseConfigStr = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;

if (!firebaseConfigStr) {
  throw new Error("Missing Firebase config. Please check your .env.local file.");
}

const firebaseConfig: FirebaseOptions = JSON.parse(firebaseConfigStr);


// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const firebaseApp = app;
