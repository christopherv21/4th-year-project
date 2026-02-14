import React, { useEffect, useState } from "react";
import ExercisesList from "./components/ExercisesList";
import EvaluationResults from "./components/EvaluationResults";
import { apiFetch } from "./api";

function App() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const [exercises, setExercises] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [error, setError] = useState("");

  // Triggers EvaluationResults + Recommendations to refetch
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshSummary = () => setRefreshKey((prev) => prev + 1);

  // Recommendations
  const [recommended, setRecommended] = useState([]);
  const [loadingRec, setLoadingRec] = useState(false);

  const loadRecommendations = async () => {
    try {
      setLoadingRec(true);
      const data = await apiFetch("/api/recommendations/today");
      setRecommended(Array.isArray(data) ? data : []);
    } catch (e) {
      setRecommended([]);
    } finally {
      setLoadingRec(false);
    }
  };

  // Restore session on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Login failed");

      setToken(data.token);
      setUser(data.user);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken("");
    setExercises([]);
    setRecommended([]);
    setError("");
    setRefreshKey(0);

    setEmailOrUsername("");
    setPassword("");

    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // Fetch exercises when token changes
  useEffect(() => {
    const loadExercises = async () => {
      if (!token) return;

      setLoadingExercises(true);
      setError("");

      try {
        const data = await apiFetch("/api/exercises");
        setExercises(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Failed to fetch exercises");
        setExercises([]);
      } finally {
        setLoadingExercises(false);
      }
    };

    loadExercises();
  }, [token]);

  // ✅ Load recommendations on login AND after feedback refreshKey changes
  useEffect(() => {
    if (!token) return;
    loadRecommendations();
  }, [token, refreshKey]);

  // LOGIN SCREEN
  if (!user) {
    return (
      <div style={{ maxWidth: "420px", margin: "40px auto", fontFamily: "sans-serif" }}>
        <h1>Personalised Gym Workout System</h1>
        <h2>Login</h2>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Email or Username:
              <input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                style={{ display: "block", width: "100%", padding: "8px", marginTop: "4px" }}
              />
            </label>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label>
              Password:
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ display: "block", width: "100%", padding: "8px", marginTop: "4px" }}
              />
            </label>
          </div>

          <button type="submit" style={{ padding: "8px 16px" }}>
            Login
          </button>
        </form>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
          Use an account you created via Thunder Client (register endpoint).
        </p>
      </div>
    );
  }

  // MAIN SCREEN
  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Personalised Gym Workout System</h1>
        <div>
          <span style={{ marginRight: "1rem" }}>👤 {user.username}</span>
          <button onClick={handleLogout} style={{ padding: "6px 12px" }}>
            Logout
          </button>
        </div>
      </header>

      {/* ✅ Evaluation Results */}
      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <EvaluationResults refreshKey={refreshKey} />
      </div>

      {/* ✅ Personalised Recommendations */}
      <h2 style={{ marginTop: "2rem" }}>⭐ Personalised Recommendations</h2>
      {loadingRec && <p>Loading recommendations...</p>}
      {!loadingRec && recommended.length === 0 && (
        <p>No recommendations yet — submit a few ratings first ✅</p>
      )}
      {recommended.length > 0 && (
        <ExercisesList exercises={recommended} onFeedbackSaved={refreshSummary} />
      )}

      {/* ✅ Full database list */}
      <h2 style={{ marginTop: "2rem" }}>Exercises (from MongoDB)</h2>

      {loadingExercises && <p>Loading exercises...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loadingExercises && exercises.length === 0 && (
        <p>No exercises found in the database (or you’re not authorised).</p>
      )}

      <ExercisesList exercises={exercises} onFeedbackSaved={refreshSummary} />
    </div>
  );
}

export default App;
