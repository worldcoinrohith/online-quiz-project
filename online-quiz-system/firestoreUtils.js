import { doc, setDoc, getDoc, updateDoc, increment } from "firebase/firestore";

/**
 * Updates or creates a player's score in Firestore.
 * @param {Firestore} db - Firestore instance
 * @param {Object} user - The user object (must contain `uid` and `username`)
 * @param {number} points - The score to be added
 * @param {string} category - The category the user played
 */
export const updatePlayerScore = async (db, user, points, category) => {
  if (!db) {
    console.error("🔥 Firestore instance (db) is undefined.");
    return;
  }
  if (!user || !user.uid) {
    console.error("🚨 User is not authenticated.");
    return;
  }

  try {
    const scoreRef = doc(db, "scores", user.uid);
    const scoreDoc = await getDoc(scoreRef);

    if (scoreDoc.exists()) {
      // ✅ Player exists, update score & games played
      await updateDoc(scoreRef, {
        score: increment(points), // 🔼 Adds new points
        gamesPlayed: increment(1),
        lastUpdated: new Date(),
        favoriteCategory: category, // (Optional: Update logic later)
      });
    } else {
      // 🆕 New player, create a record
      await setDoc(scoreRef, {
        uid: user.uid,
        username: user.username,
        score: points,
        favoriteCategory: category,
        gamesPlayed: 1,
        lastUpdated: new Date(),
      });
    }

    console.log(`✅ Score updated for ${user.username}`);
  } catch (error) {
    console.error("🔥 Error updating score:", error);
  }
};
