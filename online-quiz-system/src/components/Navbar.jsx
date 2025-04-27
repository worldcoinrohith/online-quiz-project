import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import '../styles/navbar.css';

const Navbar = ({ user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [favoriteCategory, setFavoriteCategory] = useState('');
  const [username, setUsername] = useState('');
  const [highestScore, setHighestScore] = useState('None');
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribe;

    if (user) {
      const userRef = doc(db, "users", user.uid);

      const fetchUserData = async () => {
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUsername(userData.username || "None");
            setFavoriteCategory(userData.favoriteCategory || "None");
            setHighestScore(userData.highestScore || "None");
          } else {
            console.warn("User document not found in Firestore.");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };


      fetchUserData();


      unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const updatedData = docSnap.data();
          setUsername(updatedData.username || "None");
          setFavoriteCategory(updatedData.favoriteCategory || "None");
          setHighestScore(updatedData.highestScore || "None");
        }
      });
    }

    return () => unsubscribe && unsubscribe();
  }, [user]);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/quiz">Play Quiz</Link>
        <Link to="/leaderboard">Leaderboard</Link>
        <Link to="/lobby">Multiplayer</Link>

        <div className="profile-section">
          {user ? (
            <div className="profile-menu">
              <button className="profile-btn" onClick={toggleDropdown}>
                <img src={user.photoURL || '/default-avatar.png'} alt="Profile" className="profile-avatar" />
                <span className='profile-text'>Profile</span>
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <ul>
                    <li>Username: {username}</li>
                    <li onClick={handleLogout}>Logout</li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
