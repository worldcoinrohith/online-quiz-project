import { Link, useNavigate } from 'react-router-dom';
import '../styles/home.css';

const categories = [
  { id: 9, name: 'General Knowledge' },
  { id: 21, name: 'Sports' },
  { id: 23, name: 'History' },
  { id: 17, name: 'Science & Nature' },
  { id: 11, name: 'Movies' },
];

const Home = () => {
    const navigate = useNavigate();

    const handleCategorySelect = (categoryId) => {
        navigate(`/quiz?category=${categoryId}`);
    };

    return (
      <div className="home-container">
        <h1>Welcome to the Online Quiz System</h1>
        <p>Test your knowledge and compete with others!</p>

        {/* Category Selection Buttons */}
        <div className="category-buttons">
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => handleCategorySelect(cat.id)} className="category-btn">
              {cat.name}
            </button>
          ))}
        </div>

        <Link to="/leaderboard" className="leaderboard-btn">View Leaderboard</Link>
      </div>
    );
};

export default Home;
