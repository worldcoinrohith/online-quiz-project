import axios from 'axios';

const BASE_URL = 'https://opentdb.com/api.php';

/**
 * Delay execution to throttle API calls (debounce)
 * @param {number} ms - Delay in milliseconds
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch quiz questions with retries & caching.
 * @param {number} amount Number of questions
 * @param {string} category Category ID (optional)
 */
export const fetchQuizQuestions = async (amount = 10, category = '') => {
  const cacheKey = `quiz-${amount}-${category}`;
  const cachedData = sessionStorage.getItem(cacheKey);

  if (cachedData) {
    console.log("✅ Using cached quiz data");
    return JSON.parse(cachedData);
  }

  let retries = 3;
  let delayTime = 1000;

  while (retries > 0) {
    try {
      console.log(`🔄 Fetching quiz data... (Retries left: ${retries})`);
      const response = await axios.get(`${BASE_URL}?amount=${amount}&type=multiple${category ? `&category=${category}` : ''}`);
      
      if (response.status === 200) {
        sessionStorage.setItem(cacheKey, JSON.stringify(response.data.results));
        return response.data.results;
      }
      
      throw new Error(`HTTP Error ${response.status}`);
    } catch (error) {
      if (error.response?.status === 429) {
        console.warn("⚠️ Too many requests, retrying...");
        await delay(delayTime);
        delayTime *= 2; // Exponential backoff
      } else {
        console.error("❌ Error fetching quiz questions:", error);
        return [];
      }
    }
    retries--;
  }

  console.error("🚫 Max retries reached, unable to fetch quiz questions.");
  return [];
};
