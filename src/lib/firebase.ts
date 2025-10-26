import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCmrjyT6S4fYfQSPQu7BZRPKCdu4d63dbU",
  authDomain: "votacao-online-bcec9.firebaseapp.com",
  databaseURL: "https://votacao-online-bcec9-default-rtdb.firebaseio.com",
  projectId: "votacao-online-bcec9",
  storageBucket: "votacao-online-bcec9.firebasestorage.app",
  messagingSenderId: "1055298610339",
  appId: "1:1055298610339:web:3f3942703e716b9bbbcb16"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
