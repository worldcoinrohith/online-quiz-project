import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig"; // Adjust path if needed
import "../styles/leaderboard.css";

const Leaderboard = () => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const leaderboardRef = collection(db, "scores");
        const q = query(leaderboardRef, orderBy("score", "desc"), limit(5));
        const snapshot = await getDocs(q);

        const leaderboardData = await Promise.all(
          snapshot.docs.map(async (scoreDoc) => {
            const scoreData = scoreDoc.data();
            const userRef = doc(db, "users", scoreDoc.id);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.exists() ? userSnap.data() : {};

            return {
              id: scoreDoc.id,
              username: scoreData.username || "Unknown",
              score: scoreData.score,
              gamesPlayed: scoreData.gamesPlayed,
              photoURL: userData.photoURL || "/default-avatar.png", // 🔥 Fetch dynamically
            };
          })
        );

        setPlayers(leaderboardData);
        console.log("✅ Fetched Leaderboard:", leaderboardData);
      } catch (error) {
        console.error("🔥 Error fetching leaderboard:", error);
      }
    };

    fetchLeaderboard();
  }, []);

  // ✅ Function to submit score (without storing `photoURL` in scores)
  const submitScore = async (score, gamesPlayed) => {
    if (!auth.currentUser) return;

    const userRef = doc(db, "users", auth.currentUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.error("User data not found in Firestore.");
      return;
    }

    const userData = userSnap.data();

    const scoreRef = doc(db, "scores", auth.currentUser.uid); // Unique per user
    await setDoc(scoreRef, {
      username: userData.username || "Unknown",
      score: score,
      gamesPlayed: gamesPlayed,
    });

    console.log("🎯 Score submitted!");
  };

  return (
    <div className="leaderboard-container">
      <h2>🏆 Leaderboard</h2>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Score</th>
            <th>Games Played</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr key={player.id}>
              <td>#{index + 1}</td>
              <td className="player-info">
                <img 
                  src={player.photoURL} 
                  alt="Profile" 
                  className="leaderboard-avatar"
                />
                {player.username}
              </td>
              <td>{player.score}</td>
              <td>{player.gamesPlayed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
