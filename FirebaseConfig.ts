// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN } from '@env';
import { getFirestore } from 'firebase/firestore';
// import firestore from '@react-native-firebase/firestore';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  databaseURL: "https://parkapp-93d79-default-rtdb.firebaseio.com",
  projectId: "parkapp-93d79",
  storageBucket: "parkapp-93d79.firebasestorage.app",
  messagingSenderId: "337793830879",
  appId: "1:337793830879:web:90a6ba5db96a099e93be6a",
  measurementId: "G-8DQ92YPE7F"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
//const analytics = getAnalytics(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const db = getFirestore(app);
//export const db = getFirestore(app);
//export const storage = getStorage(app);
