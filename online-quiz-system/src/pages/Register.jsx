import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

async function uploadAvatar(file) {
  if (!file) return ""; 

  try {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("key", "784a8f6817d3efd7f46b1a456d0a47d8"); 

    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    if (!data.success) throw new Error("Failed to upload image");
    
    return data.data.url; 
  } catch (error) {
    console.error("Image upload failed:", error);
    return ""; 
  }
}

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAvatarChange = (e) => {
    setAvatarFile(e.target.files[0]);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      setError("Username is required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
     
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const uid = user.uid;

     
      await setDoc(doc(db, "users", uid), {
        uid,
        email,
        username,
        photoURL: "", 
        createdAt: new Date()
      });

      console.log("✅ User registered, now uploading avatar...");

      // 
      const photoURL = await uploadAvatar(avatarFile);

      if (photoURL) {
        await updateProfile(user, { displayName: username, photoURL });
        await updateDoc(doc(db, "users", uid), { photoURL });
      }

      console.log("✅ Registration complete!");
      navigate("/quiz");
    } catch (err) {
      console.error("❌ Registration error:", err.message);
      setError("Registration failed: " + err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        <label>Choose Avatar:</label>
        <input type="file" accept="image/*" onChange={handleAvatarChange} />
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
};

export default Register;
