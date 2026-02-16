import React, { useEffect, useState } from "react";
import ExercisesList from "./components/ExercisesList";
import EvaluationResults from "./components/EvaluationResults";
import ProfileSetup from "./components/ProfileSetup";
import { apiFetch } from "./api";

function App() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const [exercises, setExercises] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);


  // general UI error (mainly for exercises)
  const [error, setError] = useState("");

  // recommendation-specific error
  const [recError, setRecError] = useState("");

  // ✅ Profile state
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMissing, setProfileMissing] = useState(false);

  // Triggers EvaluationResults + recommendation refresh
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshSummary = () => setRefreshKey((prev) => prev + 1);

  // Current recommendation event
  const [recommended, setRecommended] = useState([]);
  const [loadingRec, setLoadingRec] = useState(false);
  const [currentRecId, setCurrentRecId] = useState("");
  const [currentCondition, setCurrentCondition] = useState("");

  // Restore session on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  // ✅ Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setRecError("");

    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ emailOrUsername, password }),
      });

      setToken(data.token);
      setUser(data.user);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken("");
    setExercises([]);
    setRecommended([]);
    setCurrentRecId("");
    setCurrentCondition("");
    setError("");
    setRecError("");
    setRefreshKey(0);

    setProfile(null);
    setProfileMissing(false);
    setProfileLoading(false);

    setEmailOrUsername("");
    setPassword("");

    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // ✅ Fetch profile (this is the key)
  const fetchProfile = async () => {
    if (!token) return;

    setProfileLoading(true);
    setProfileMissing(false);

    try {
      const res = await fetch("http://localhost:5000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 404) {
        setProfile(null);
        setProfileMissing(true);
        return;
      }

      if (!res.ok) {
        // If your API returns a JSON error message
        let data = {};
        try {
          data = await res.json();
        } catch {}
        setError(data.message || "Failed to load profile");
        setProfile(null);
        setProfileMissing(true);
        return;
      }

      const data = await res.json();
      setProfile(data.profile || data);
      setProfileMissing(false);
    } catch (err) {
      setProfile(null);
      setProfileMissing(true);
    } finally {
      setProfileLoading(false);
    }
  };

  // ✅ When token changes, fetch profile
  useEffect(() => {
    if (!token) return;
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ✅ Fetch exercises list
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

  // ✅ Generate recommendation
  const generateRecommendation = async (condition = "personalised") => {
  try {
    setLoadingRec(true);
    setRecError("");

    const rec = await apiFetch("/api/recommendations/generate", {
      method: "POST",
      body: JSON.stringify({ condition }),
    });

    setCurrentRecId(rec?._id || "");
    setCurrentCondition(rec?.condition || condition);

    const workoutExercises = rec?.workout?.exercises || [];
    setRecommended(Array.isArray(workoutExercises) ? workoutExercises : []);
  } catch (err) {
    setRecommended([]);
    setCurrentRecId("");
    setCurrentCondition("");
    setRecError(err.message || "Failed to generate recommendation");
  } finally {
    setLoadingRec(false);
  }
};

  // ✅ Auto-generate ONLY if profile exists
  useEffect(() => {
  if (!token) return;
  if (profileMissing) return;
  if (!profile) return;

  // Only auto-generate after feedback refresh
  if (refreshKey > 0) {
    generateRecommendation(currentCondition || "personalised");
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [refreshKey]);


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

      {/* ✅ If profile missing, show ProfileSetup instead of errors */}
      {profileLoading ? (
        <p>Loading profile...</p>
      ) : profileMissing ? (
        <ProfileSetup
          token={token}
          onSaved={async () => {
            await fetchProfile();     // refresh profile state
            refreshSummary();         // refresh evaluation + triggers auto-generate
          }}
        />
      ) : (
        <>

        {/* ✅ Profile summary bar */}
    <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <div>
      👤 <b>Profile:</b>{" "}
      {profile?.fitnessLevel} | {profile?.goal} | {profile?.equipment} | {profile?.daysPerWeek} days/week
    </div>

    <button onClick={() => setEditingProfile((v) => !v)} style={{ padding: "6px 10px" }}>
      {editingProfile ? "Close" : "Edit Profile"}
    </button>
    </div>

  {editingProfile && (
    <ProfileSetup
      token={token}
      mode="edit"
      existingProfile={profile}
      onSaved={async () => {
        setEditingProfile(false);
        await fetchProfile();   // refresh profile line
        refreshSummary();       // refresh evaluation + rec
      }}
    />
  )}
</div>

          {/* ✅ Evaluation Results */}
          <div style={{ marginTop: 20, marginBottom: 20 }}>
            <EvaluationResults refreshKey={refreshKey} />
          </div>

          {/* ✅ Recommendation */}
          <h2 style={{ marginTop: "2rem" }}>
            ⭐ Recommendation{" "}
            {currentCondition ? (
              <span style={{ fontSize: "0.9rem", fontWeight: "normal" }}>
                (condition: <b>{currentCondition}</b>)
              </span>
            ) : null}
          </h2>

          <div style={{ marginBottom: 12 }}>
  <button
    onClick={() => generateRecommendation("baseline")}
    style={{ padding: "8px 12px", marginRight: 8 }}
  >
    Generate baseline
  </button>

  <button
    onClick={() => generateRecommendation("personalised")}
    style={{ padding: "8px 12px" }}
  >
    Generate personalised
  </button>
  </div>


          {loadingRec && <p>Generating recommendation...</p>}
          {recError && <p style={{ color: "red" }}>{recError}</p>}

          {!loadingRec && recommended.length === 0 && !recError && (
            <p>No recommendation loaded yet — click “Generate next recommendation”.</p>
          )}

          {recommended.length > 0 && (
            <ExercisesList
              exercises={recommended}
              recommendationId={currentRecId}
              onFeedbackSaved={refreshSummary}
            />
          )}

          {/* ✅ Full database list */}
          <h2 style={{ marginTop: "2rem" }}>Exercises (from MongoDB)</h2>

          {loadingExercises && <p>Loading exercises...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {!loadingExercises && exercises.length === 0 && (
            <p>No exercises found in the database (or you’re not authorised).</p>
          )}

          <ExercisesList exercises={exercises} onFeedbackSaved={refreshSummary} />
        </>
      )}
    </div>
  );
}

export default App;
