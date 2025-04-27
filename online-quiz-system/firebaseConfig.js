
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCQpYfsnHmfwj6tCqje4H3EhNM-o6KhKHk",
  authDomain: "online-quiz-system-49ced.firebaseapp.com",
  databaseURL: "https://online-quiz-system-49ced-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "online-quiz-system-49ced",
  storageBucket: "online-quiz-system-49ced.firebasestorage.app",
  messagingSenderId: "30703893706",
  appId: "1:30703893706:web:65ffbec486311345718833",
  measurementId: "G-DC39MW55DC"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const storage = getStorage(app)

export { auth, db, analytics, storage  };