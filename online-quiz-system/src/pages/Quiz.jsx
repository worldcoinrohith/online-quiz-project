import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchQuizQuestions } from '../api/quizAPI';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import '../styles/quiz.css';

const decodeEntities = (html) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const Quiz = ({ db, user }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false); // 🔹 State for the modal
  const [searchParams] = useSearchParams();
  const navigate = useNavigate(); // 🔹 Used for navigation

  const category = searchParams.get('category') || 'Random';

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      const quizData = await fetchQuizQuestions(10, category);
      if (quizData.length > 0) {
        const formattedQuestions = quizData.map(q => ({
          question: decodeEntities(q.question),
          answers: shuffleArray([...q.incorrect_answers, q.correct_answer].map(decodeEntities)),
          correctAnswer: decodeEntities(q.correct_answer)
        }));
        setQuestions(formattedQuestions);
      }
      setLoading(false);
    };

    loadQuestions();
  }, [category]);

  const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

  const handleAnswer = (selectedAnswer) => {
    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleQuizCompletion();
    }
  };

  const handleQuizCompletion = async () => {
    setShowPopup(true); // Show modal

    if (user) {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      let username = "Anonymous"; // Default name

      if (userSnap.exists()) {
        const userData = userSnap.data();
        username = userData.username || "Anonymous"; // Get username from Firestore
      }

      const scoreRef = doc(db, "scores", user.uid);
      const scoreSnap = await getDoc(scoreRef);

      if (scoreSnap.exists()) {
        const scoreData = scoreSnap.data();
        await updateDoc(scoreRef, {
          score: scoreData.score + score, // 🔥 Add latest score to total
          gamesPlayed: (scoreData.gamesPlayed || 0) + 1,
          username, // Ensure correct username is stored
        });
      } else {
        await setDoc(scoreRef, {
          username,
          score: score,
          gamesPlayed: 1,
        });
      }
    }
  };


  // 🔹 Restart Quiz
  const restartQuiz = () => {
    setScore(0);
    setCurrentQuestion(0);
    setShowPopup(false);
  };

  // 🔹 Return to Home
  const returnHome = () => {
    navigate('/'); // Redirects to home page
  };

  return (
    <div className="quiz-container">
      {loading ? (
        <p>⏳ Loading questions...</p>
      ) : questions.length > 0 ? (
        <div>
          <h1>Quiz - {category}</h1>
          <h2>{questions[currentQuestion].question}</h2>
          <div className="answers">
            {questions[currentQuestion].answers.map((answer, index) => (
              <button key={index} className="answer" onClick={() => handleAnswer(answer)}>
                {answer}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p>⚠️ No questions available. Try again later.</p>
      )}

      {/* 🔹 Pop-up Modal */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Quiz Completed 🎉</h2>
            <p>Your Score: {score} / 10</p>
            <button className="btn-restart" onClick={restartQuiz}>Restart</button>
            <button className="btn-home" onClick={returnHome}>Return Home</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;
