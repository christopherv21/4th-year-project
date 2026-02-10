import React, { useEffect, useState } from "react";

function App() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState(null); // { id, username, email }
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const [exercises, setExercises] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [error, setError] = useState("");

  // Try to restore session on refresh (optional)
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Save token + user
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

    setEmailOrUsername("");
    setPassword("");

    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  useEffect(() => {
    const fetchExercises = async () => {
      if (!token) return;

      setLoadingExercises(true);
      setError("");

      try {
        // If your /api/exercises is NOT protected yet, you can remove the headers below.
        const res = await fetch("/api/exercises", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch exercises");
        }

        setExercises(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingExercises(false);
      }
    };

    fetchExercises();
  }, [token]);

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

  // MAIN SCREEN – list exercises
  return (
    <div style={{ maxWidth: "700px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Personalised Gym Workout System</h1>
        <div>
          <span style={{ marginRight: "1rem" }}>👤 {user.username}</span>
          <button onClick={handleLogout} style={{ padding: "6px 12px" }}>
            Logout
          </button>
        </div>
      </header>

      <h2 style={{ marginTop: "2rem" }}>Exercises (from MongoDB)</h2>

      {loadingExercises && <p>Loading exercises...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loadingExercises && exercises.length === 0 && (
        <p>No exercises found in the database (or you’re not authorised).</p>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {exercises.map((ex) => (
          <li
            key={ex._id}
            style={{
              border: "1px solid #ddd",
              padding: "10px",
              marginBottom: "8px",
              borderRadius: "4px",
            }}
          >
            <strong>{ex.name}</strong>
            <div>🔥 {ex.kcalPerMinute} kcal / min</div>
            <div style={{ fontSize: "0.8rem", color: "#666" }}>ID: {ex._id}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
