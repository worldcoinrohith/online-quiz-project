import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ✅ Import Firestore
import { AuthProvider } from "./context/authContext"; 
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Quiz from "./pages/Quiz";
import Leaderboard from "./pages/Leaderboard";
import Lobby from "./pages/Lobby";
import GameRoom from "./pages/GameRoom"; 
import "./styles/global.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const db = getFirestore(); // ✅ Initialize Firestore here

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <AuthProvider>
      <Router>
        <Navbar user={user} />
        <Routes>
          <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
          <Route path="/quiz" element={user ? <Quiz db={db} user={user} /> : <Navigate to="/login" />} />
          <Route path="/leaderboard" element={<Leaderboard db={db}/>} />
          <Route path="/lobby" element={user ? <Lobby db={db} user={user} /> : <Navigate to="/login" />} />
          <Route path="/gameroom/:roomId" element={user ? <GameRoom db={db} user={user} /> : <Navigate to="/login" />} />

          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
} 

export default App;
