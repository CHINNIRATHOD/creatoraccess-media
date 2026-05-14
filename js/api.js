const API_BASE_URL = window.CREATORACCESS_API_URL ||
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://creatoraccess-media.onrender.com");

function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}
