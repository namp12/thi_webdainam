// Base API configuration
const BASE_URL = "https://692aefda7615a15ff24e2a04.mockapi.io/travel-booking";

const API = {
  // Theo endpoint bạn cung cấp: /user và /tours
  users: `${BASE_URL}/user`,
  tours: `${BASE_URL}/tours`,
};

// Expose to other scripts
window.APP_CONFIG = { BASE_URL, API };