import { getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';

const firebaseConfig: FirebaseOptions = {
  "projectId": "studio-7312804639-a23ef",
  "appId": "1:1000253232900:web:24771e4427287986886251",
  "apiKey": "AIzaSyA1eMgASl2hL0DKkW5jpo48otR_Og9iZZA",
  "authDomain": "studio-7312804639-a23ef.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1000253232900"
};


// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const firebaseApp = app;
