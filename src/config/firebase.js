import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDQOg7ekLpoWBwDCGIOacyMOMDMQ4vpAcU",
  authDomain: "aikombin-d835d.firebaseapp.com",
  projectId: "aikombin-d835d",
  storageBucket: "aikombin-d835d.firebasestorage.app",
  messagingSenderId: "959815540692",
  appId: "1:959815540692:web:3e5d424f2bc03549604041"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Firebase servislerini al
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export { auth };
export default app;
