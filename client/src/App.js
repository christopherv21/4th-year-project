import React, { useEffect, useState } from "react";
import ExercisesList from "./components/ExercisesList";
import EvaluationResults from "./components/EvaluationResults";
import ProfileSetup from "./components/ProfileSetup";
import WorkoutHistory from "./components/WorkoutHistory";
import WorkoutDashboard from "./components/WorkoutDashboard";
import ProfileSnapshot from "./components/ProfileSnapshot";
import RecentActivity from "./components/RecentActivity";
import { apiFetch } from "./api";
import "./App.css";

function App() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const [exercises, setExercises] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(false);

  const [page, setPage] = useState("dashboard");

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMissing, setProfileMissing] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);
  const refreshSummary = () => setRefreshKey((prev) => prev + 1);

  const [error, setError] = useState("");
  const [recError, setRecError] = useState("");

  const [recommendedRec, setRecommendedRec] = useState(null);
  const [recommendedExercises, setRecommendedExercises] = useState([]);
  const [loadingRec, setLoadingRec] = useState(false);
  const [currentCondition, setCurrentCondition] = useState("");

  const [completed, setCompleted] = useState(false);
  const [suitabilityRating, setSuitabilityRating] = useState(5);
  const [structureRating, setStructureRating] = useState(5);
  const [difficultyFeedback, setDifficultyFeedback] = useState("just_right");
  const [notes, setNotes] = useState("");

  const [submitMsg, setSubmitMsg] = useState("");
  const [submitErr, setSubmitErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

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
    setRecommendedRec(null);
    setRecommendedExercises([]);
    setCurrentCondition("");

    setLogs([]);
    setLoadingLogs(false);

    setError("");
    setRecError("");
    setRefreshKey(0);

    setProfile(null);
    setProfileMissing(false);
    setProfileLoading(false);

    setCompleted(false);
    setSuitabilityRating(5);
    setStructureRating(5);
    setDifficultyFeedback("just_right");
    setNotes("");
    setSubmitMsg("");
    setSubmitErr("");
    setSubmitting(false);

    setEditingProfile(false);
    setPage("dashboard");

    setEmailOrUsername("");
    setPassword("");

    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const fetchProfile = async () => {
    if (!token) return;

    setProfileLoading(true);
    setProfileMissing(false);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/profile/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 404) {
        setProfile(null);
        setProfileMissing(true);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to load profile");
        setProfile(null);
        setProfileMissing(true);
        return;
      }

      setProfile(data);
      setProfileMissing(false);
    } catch (err) {
      setError("Failed to load profile");
      setProfile(null);
      setProfileMissing(true);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchProfile();
  }, [token]);

  useEffect(() => {
    const loadExercises = async () => {
      if (!token) return;

      setLoadingExercises(true);
      setError("");

      try {
        const data = await apiFetch("/api/exercises", { token });
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

  useEffect(() => {
    const loadLogs = async () => {
      if (!token) return;

      setLoadingLogs(true);

      try {
        const data = await apiFetch("/api/workout-logs", { token });
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        setLogs([]);
      } finally {
        setLoadingLogs(false);
      }
    };

    loadLogs();
  }, [token, refreshKey]);

  const generateRecommendation = async (condition = "personalised") => {
    try {
      setCurrentCondition(condition);
      setLoadingRec(true);
      setRecError("");
      setSubmitMsg("");
      setSubmitErr("");

      setRecommendedRec(null);
      setRecommendedExercises([]);

      const endpoint =
        condition === "baseline"
          ? "/api/recommendations/baseline"
          : "/api/recommendations/personalised";

      const rec = await apiFetch(endpoint, {
        method: "POST",
        token,
      });

      setRecommendedRec(rec);
      setRecommendedExercises(Array.isArray(rec?.exercises) ? rec.exercises : []);
    } catch (err) {
      setRecommendedRec(null);
      setRecommendedExercises([]);
      setRecError(err.message || "Failed to generate recommendation");
    } finally {
      setLoadingRec(false);
    }
  };

  useEffect(() => {
    if (!recommendedRec?._id) return;

    setCompleted(false);
    setSuitabilityRating(5);
    setStructureRating(5);
    setDifficultyFeedback("just_right");
    setNotes("");
    setSubmitMsg("");
    setSubmitErr("");
  }, [recommendedRec?._id]);

  const submitFeedback = async () => {
    setSubmitMsg("");
    setSubmitErr("");

    if (!recommendedRec?._id) {
      setSubmitErr("No recommendation loaded yet.");
      return;
    }

    setSubmitting(true);

    try {
      await apiFetch("/api/workout-logs", {
        method: "POST",
        body: JSON.stringify({
          recommendationId: recommendedRec._id,
          completed,
          suitabilityRating: Number(suitabilityRating),
          structureRating: Number(structureRating),
          difficultyFeedback,
          notes,
        }),
        token,
      });

      setSubmitMsg("Feedback saved successfully.");
      refreshSummary();
      setPage("dashboard");
    } catch (err) {
      setSubmitErr(err.message || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  const latestLog =
    Array.isArray(logs) && logs.length > 0
      ? [...logs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
      : null;

  if (!user) {
    return (
      <div className="login-shell">
        <h1 className="login-title">Personalised Gym Workout System</h1>
        <p className="subtle-text">Log in to generate and evaluate lower-body workouts.</p>

        <form onSubmit={handleLogin} className="form-grid" style={{ marginTop: 20 }}>
          <div className="form-group">
            <label>Email or Username</label>
            <input
              type="text"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="primary-btn">
            Login
          </button>
        </form>

        {error && (
          <p className="status-error" style={{ marginTop: 14 }}>
            {error}
          </p>
        )}

        <p className="subtle-text" style={{ marginTop: 18 }}>
          Use an account created through Thunder Client or your register endpoint.
        </p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1 className="app-title">Personalised Gym Workout System</h1>

          <div className="nav-tabs">
            <button
              type="button"
              onClick={() => setPage("dashboard")}
              className={`tab-btn ${page === "dashboard" ? "active" : ""}`}
            >
              Dashboard
            </button>

            <button
              type="button"
              onClick={() => setPage("history")}
              className={`tab-btn ${page === "history" ? "active" : ""}`}
            >
              Workout History
            </button>

            <button
              type="button"
              onClick={() => setPage("profile")}
              className={`tab-btn ${page === "profile" ? "active" : ""}`}
            >
              Workout Profile
            </button>
          </div>
        </div>

        <div className="top-right">
          <span className="user-chip">👤 {user.username}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      {profileLoading ? (
        <div className="page-card">
          <p>Loading profile...</p>
        </div>
      ) : profileMissing ? (
        <div className="page-card">
          <ProfileSetup
            token={token}
            onSaved={async () => {
              await fetchProfile();
              refreshSummary();
              setPage("profile");
              setEditingProfile(true);
            }}
          />
        </div>
      ) : page === "history" ? (
        <div className="page-card">
          <WorkoutHistory refreshKey={refreshKey} token={token} />
        </div>
      ) : page === "profile" ? (
        <div className="page-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              👤 <b>Profile:</b> {profile?.fitnessLevel} | {profile?.goal} |{" "}
              {profile?.equipment}
            </div>

            <button
              onClick={() => setEditingProfile((v) => !v)}
              className="secondary-btn"
            >
              {editingProfile ? "Close" : "Edit Profile"}
            </button>
          </div>

          {editingProfile ? (
            <div style={{ marginTop: 16 }}>
              <ProfileSetup
                token={token}
                mode="edit"
                existingProfile={profile}
                onSaved={async () => {
                  setEditingProfile(false);
                  await fetchProfile();
                  refreshSummary();
                }}
              />
            </div>
          ) : (
            <p className="subtle-text" style={{ marginTop: 14 }}>
              Tip: Click <b>Edit Profile</b> to update your workout preferences.
            </p>
          )}
        </div>
      ) : (
        <>
          <WorkoutDashboard
            workout={recommendedRec}
            latestLog={latestLog}
            onGenerateBaseline={() => generateRecommendation("baseline")}
            onGeneratePersonalised={() => generateRecommendation("personalised")}
          />

          <div className="dashboard-two-col">
            <ProfileSnapshot profile={profile} />
            <RecentActivity latestLog={latestLog} />
          </div>

          <div className="page-card">
            <EvaluationResults refreshKey={refreshKey} token={token} />
          </div>

          <div className="page-card">
            <h2 className="section-title">
              Workout Generator{" "}
              {currentCondition ? (
                <span style={{ fontSize: "1rem", fontWeight: 500 }}>
                  (type: <b>{currentCondition}</b>)
                </span>
              ) : null}
            </h2>

            <div className="action-row">
              <button
                type="button"
                disabled={loadingRec}
                aria-pressed={currentCondition === "baseline"}
                onClick={() => generateRecommendation("baseline")}
                className={`action-btn ${currentCondition === "baseline" ? "active" : ""}`}
              >
                {loadingRec && currentCondition === "baseline"
                  ? "Generating..."
                  : "Generate Baseline Workout"}
              </button>

              <button
                type="button"
                disabled={loadingRec}
                aria-pressed={currentCondition === "personalised"}
                onClick={() => generateRecommendation("personalised")}
                className={`action-btn ${currentCondition === "personalised" ? "active" : ""}`}
              >
                {loadingRec && currentCondition === "personalised"
                  ? "Generating..."
                  : "Generate Personalised Workout"}
              </button>
            </div>

            {loadingRec && <p>Generating recommendation...</p>}
            {recError && <p className="status-error">{recError}</p>}

            {!loadingRec && recommendedExercises.length === 0 && !recError && (
              <div className="empty-state">
                No recommendation loaded yet — click one of the buttons above.
              </div>
            )}

            {recommendedExercises.length > 0 && (
              <>
                <div className="workout-box">
                  <h3 style={{ textTransform: "capitalize", marginTop: 0 }}>
                    {recommendedRec?.workoutType} Lower-Body Workout
                  </h3>

                  <ExercisesList exercises={recommendedExercises} />
                </div>

                <div className="page-card" style={{ marginTop: 18, marginBottom: 0 }}>
                  <h3 style={{ marginTop: 0 }}>Workout Feedback</h3>

                  <div className="feedback-grid">
                    <label className="inline-field">
                      <span>
                        <b>Completed:</b>
                      </span>
                      <input
                        type="checkbox"
                        checked={completed}
                        onChange={(e) => setCompleted(e.target.checked)}
                      />
                    </label>

                    <label className="inline-field">
                      <span>
                        <b>Suitability Rating (1–5):</b>
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={suitabilityRating}
                        onChange={(e) => setSuitabilityRating(Number(e.target.value))}
                      />
                    </label>

                    <label className="inline-field">
                      <span>
                        <b>Structure Rating (1–5):</b>
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={structureRating}
                        onChange={(e) => setStructureRating(Number(e.target.value))}
                      />
                    </label>

                    <label className="inline-field">
                      <span>
                        <b>Difficulty:</b>
                      </span>
                      <select
                        value={difficultyFeedback}
                        onChange={(e) => setDifficultyFeedback(e.target.value)}
                      >
                        <option value="too_easy">Too Easy</option>
                        <option value="just_right">Just Right</option>
                        <option value="too_hard">Too Hard</option>
                      </select>
                    </label>

                    <div className="form-group">
                      <label>Notes</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>

                  <button onClick={submitFeedback} disabled={submitting} className="primary-btn">
                    {submitting ? "Saving..." : "Submit Feedback"}
                  </button>

                  {submitMsg && (
                    <p className="status-success" style={{ marginTop: 14 }}>
                      {submitMsg}
                    </p>
                  )}
                  {submitErr && (
                    <p className="status-error" style={{ marginTop: 14 }}>
                      {submitErr}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="page-card">
            <h2 className="section-title">Exercise Database</h2>

            {loadingExercises && <p>Loading exercises...</p>}
            {error && <p className="status-error">{error}</p>}

            {!loadingExercises && exercises.length === 0 && (
              <div className="empty-state">No exercises found in the database.</div>
            )}

            <ExercisesList exercises={exercises} />
          </div>
        </>
      )}
    </div>
  );
}

export default App;