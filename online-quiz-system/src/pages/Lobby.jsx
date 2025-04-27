import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore"; // ✅ Import Firestore functions
import { useNavigate } from "react-router-dom";
import "../styles/lobby.css";

const Lobby = ({ db, user }) => {
  const [lobbies, setLobbies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!db) {
      console.error("❌ Firestore instance (db) is undefined.");
      return;
    }

    const fetchLobbies = async () => {
      try {
        const lobbyRef = collection(db, "lobbies");
        const snapshot = await getDocs(lobbyRef);
        const lobbyList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setLobbies(lobbyList);
        console.log("✅ Fetched Lobbies:", lobbyList);
      } catch (error) {
        console.error("🔥 Error fetching lobbies:", error);
      }
    };

    fetchLobbies();
  }, [db]);

  
  const handleCreateGame = async () => {
    if (!db || !user) return;

    try {
      const newLobby = {
        name: `${user.username}'s Game`,
        host: user.uid,
        players: 1,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "lobbies"), newLobby); // ✅ Add new lobby to Firestore
      console.log("🚀 Created new lobby:", docRef.id);

      setLobbies([...lobbies, { id: docRef.id, ...newLobby }]); // ✅ Update UI
    } catch (error) {
      console.error("🔥 Error creating lobby:", error);
    }
  };

  const handleJoinGame = (roomId) => {
    navigate(`/gameroom/${roomId}`);
  };

  return (
    <div className="lobby-container">
      <h2>Multiplayer Lobby</h2>
      <button onClick={handleCreateGame}>Create Game</button> {/* ✅ Now works! */}
      {lobbies.length > 0 ? (
        lobbies.map((room) => (
          <div key={room.id} className="lobby-item">
            <strong>{room.name}</strong> - {room.players} players
            <button onClick={() => handleJoinGame(room.id)}>Join</button>
          </div>
        ))
      ) : (
        <p>No lobbies available.</p>
      )}
    </div>
  );
};

export default Lobby;
