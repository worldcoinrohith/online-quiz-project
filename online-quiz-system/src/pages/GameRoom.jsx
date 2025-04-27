import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, onSnapshot, arrayUnion } from "firebase/firestore";
import { auth } from "../../firebaseConfig";
import "../styles/gameroom.css";

const GameRoom = ({ db, user }) => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [roomData, setRoomData] = useState(null);
  const [players, setPlayers] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [scores, setScores] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!db) return;
    const roomRef = doc(db, "lobbies", roomId);

    const unsubscribe = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRoomData(data);
        setPlayers(data.players || []);
        setQuizStarted(data.quizStarted);
        setQuestions(data.questions || []);
        setScores(data.scores || {});
      } else {
        navigate("/lobby");
      }
    });

    return () => unsubscribe();
  }, [db, roomId, navigate]);

  useEffect(() => {
    if (!roomData || !user) return;
    const roomRef = doc(db, "lobbies", roomId);

    if (!players.some((p) => p.uid === user.uid)) {
      updateDoc(roomRef, {
        players: arrayUnion({ uid: user.uid, username: user.displayName, score: 0 }),
      });
    }
  }, [roomData, user, db, roomId, players]);

  useEffect(() => {
    if (!quizStarted || showResults) return;

    setTimeLeft(30);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          handleTimeout();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, quizStarted, showResults]);

  const startGame = async () => {
    if (!roomData || roomData.host !== user.uid) return;

    const fetchedQuestions = await fetchQuestions(roomData.category);
    const roomRef = doc(db, "lobbies", roomId);
    await updateDoc(roomRef, { quizStarted: true, questions: fetchedQuestions, scores: {} });
  };

  const fetchQuestions = async (category) => {
    const categoryId = category || 9;
    const url = `https://opentdb.com/api.php?amount=5&category=${categoryId}&difficulty=medium&type=multiple`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      return data.results.map((q) => ({
        question: q.question,
        options: shuffle([...q.incorrect_answers, q.correct_answer]),
        correctAnswer: q.correct_answer,
      }));
    } catch (error) {
      console.error("Error fetching quiz questions:", error);
      return [];
    }
  };

  const shuffle = (array) => array.sort(() => Math.random() - 0.5);

  const handleAnswer = async (answer) => {
    setSelectedAnswer(answer);
    const isCorrect = answer === questions[currentQuestionIndex].correctAnswer;
    setCorrectAnswer(questions[currentQuestionIndex].correctAnswer);

    if (isCorrect) {
      const newScore = (scores[user.uid] || 0) + 10;
      const updatedScores = { ...scores, [user.uid]: newScore };
      setScores(updatedScores);

      const roomRef = doc(db, "lobbies", roomId);
      await updateDoc(roomRef, { scores: updatedScores });
    }

    setTimeout(() => nextQuestion(), 2000);
  };

  const handleTimeout = () => {
    setCorrectAnswer(questions[currentQuestionIndex].correctAnswer);
    setTimeout(() => nextQuestion(), 2000);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setCorrectAnswer(null);
    } else {
      setShowResults(true);
    }
  };

  return (
    <div className="game-room">
      <h2>Game Room: {roomData?.name}</h2>

      <div className="players">
        <h3>Players:</h3>
        <ul>
          {players.map((p) => (
            <li key={p.uid}>
              {p.username} - {scores[p.uid] || 0} points
            </li>
          ))}
        </ul>
      </div>

      {!quizStarted && user?.uid === roomData?.host && (
        <button onClick={startGame} className="start-btn">Start Game</button>
      )}

      {quizStarted && !showResults && questions.length > 0 && (
        <div className="question-section">
          <h3 dangerouslySetInnerHTML={{ __html: questions[currentQuestionIndex].question }}></h3>

          <div className="timer">
            ⏳ Time Left: {timeLeft} sec
          </div>

          <div className="options">
            {questions[currentQuestionIndex].options.map((option) => (
              <button
                key={option}
                className={
                  selectedAnswer
                    ? option === correctAnswer
                      ? "correct"
                      : option === selectedAnswer
                      ? "incorrect"
                      : "disabled"
                    : ""
                }
                onClick={() => handleAnswer(option)}
                disabled={selectedAnswer !== null}
                dangerouslySetInnerHTML={{ __html: option }}
              />
            ))}
          </div>
        </div>
      )}

      {showResults && (
        <div className="results-popup">
          <h2>Game Over!</h2>
          <h3>Final Scores:</h3>
          <ul>
            {Object.entries(scores).map(([uid, score]) => (
              <li key={uid}>
                {players.find((p) => p.uid === uid)?.username}: {score} points
              </li>
            ))}
          </ul>
          <button onClick={() => navigate("/lobby")}>Back to Lobby</button>
        </div>
      )}
    </div>
  );
};

export default GameRoom;
