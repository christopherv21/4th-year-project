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
  const [evaluationSummary, setEvaluationSummary] = useState(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const refreshSummary = () => setRefreshKey((prev) => prev + 1);

  const [error, setError] = useState("");
  const [recError, setRecError] = useState("");

  const [recommendedRec, setRecommendedRec] = useState(null);
  const [recommendedExercises, setRecommendedExercises] = useState([]);
  const [recommendedOptions, setRecommendedOptions] = useState([]);

  const [loadingRec, setLoadingRec] = useState(false);
  const [selectingWorkout, setSelectingWorkout] = useState(false);

  const [completed, setCompleted] = useState(false);
  const [suitabilityRating, setSuitabilityRating] = useState(5);
  const [structureRating, setStructureRating] = useState(5);
  const [enjoymentRating, setEnjoymentRating] = useState(5);
  const [difficultyFeedback, setDifficultyFeedback] = useState("just_right");
  const [durationActual, setDurationActual] = useState("");
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
    setRecommendedOptions([]);

    setLogs([]);
    setLoadingLogs(false);
    setEvaluationSummary(null);

    setError("");
    setRecError("");
    setRefreshKey(0);

    setProfile(null);
    setProfileMissing(false);
    setProfileLoading(false);

    setCompleted(false);
    setSuitabilityRating(5);
    setStructureRating(5);
    setEnjoymentRating(5);
    setDifficultyFeedback("just_right");
    setDurationActual("");
    setNotes("");
    setSubmitMsg("");
    setSubmitErr("");
    setSubmitting(false);
    setSelectingWorkout(false);

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

  useEffect(() => {
    const loadEvaluationSummary = async () => {
      if (!token) return;

      try {
        const data = await apiFetch("/api/workout-logs/evaluation-summary", {
          token,
        });
        setEvaluationSummary(data);
      } catch (err) {
        setEvaluationSummary(null);
      }
    };

    loadEvaluationSummary();
  }, [token, refreshKey]);

  useEffect(() => {
    const loadLatestRecommendation = async () => {
      if (!token) return;

      try {
        const data = await apiFetch("/api/recommendations", { token });

        if (Array.isArray(data) && data.length > 0) {
          const latest = data[0];
          setRecommendedRec(latest);
          setRecommendedExercises(
            Array.isArray(latest.exercises) ? latest.exercises : []
          );
        }
      } catch (err) {
        console.error("Failed to load latest recommendation", err);
      }
    };

    loadLatestRecommendation();
  }, [token, refreshKey]);

  const resetRecommendationUi = () => {
    setRecommendedRec(null);
    setRecommendedExercises([]);
    setRecommendedOptions([]);
    setSubmitMsg("");
    setSubmitErr("");
    setRecError("");
  };

  const generateRecommendation = async () => {
    try {
      setLoadingRec(true);
      resetRecommendationUi();

      const rec = await apiFetch("/api/recommendations/personalised-options", {
        method: "POST",
        token,
      });

      setRecommendedOptions(Array.isArray(rec?.options) ? rec.options : []);
    } catch (err) {
      resetRecommendationUi();
      setRecError(err.message || "Failed to generate recommendation");
    } finally {
      setLoadingRec(false);
    }
  };

  const selectPersonalisedWorkout = async (selectedWorkout) => {
    try {
      setSelectingWorkout(true);
      setRecError("");
      setSubmitMsg("");
      setSubmitErr("");

      const savedRecommendation = await apiFetch(
        "/api/recommendations/personalised-select",
        {
          method: "POST",
          body: JSON.stringify({ selectedWorkout }),
          token,
        }
      );

      setRecommendedRec(savedRecommendation);
      setRecommendedExercises(
        Array.isArray(savedRecommendation?.exercises)
          ? savedRecommendation.exercises
          : []
      );
      setRecommendedOptions([]);
    } catch (err) {
      setRecError(err.message || "Failed to select personalised workout");
    } finally {
      setSelectingWorkout(false);
    }
  };

  useEffect(() => {
    if (!recommendedRec?._id) return;

    setCompleted(false);
    setSuitabilityRating(5);
    setStructureRating(5);
    setEnjoymentRating(5);
    setDifficultyFeedback("just_right");
    setDurationActual("");
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
      const response = await apiFetch("/api/workout-logs", {
        method: "POST",
        body: JSON.stringify({
          recommendationId: recommendedRec._id,
          completed,
          suitabilityRating: Number(suitabilityRating),
          structureRating: Number(structureRating),
          enjoymentRating: Number(enjoymentRating),
          difficultyFeedback,
          durationActual: durationActual === "" ? null : Number(durationActual),
          notes,
        }),
        token,
      });

      setSubmitMsg(response.message || "Feedback saved successfully.");
      refreshSummary();
      setPage("progress");
    } catch (err) {
      setSubmitErr(err.message || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  const latestLog =
    Array.isArray(logs) && logs.length > 0
      ? [...logs].sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt) -
            new Date(a.updatedAt || a.createdAt)
        )[0]
      : null;

  const heroProfileText = profile
    ? `${profile.fitnessLevel} • ${profile.goal} • ${profile.equipment}`
    : "Profile loading";

  if (!user) {
    return (
      <div className="login-shell">
        <div className="login-panel">
          <div className="hero-badge">CV Fitness Recommendation Engine</div>
          <h1 className="login-title">Adaptive Lower-Body Workout System</h1>
          <p className="subtle-text">
            Log in to generate profile-aware workouts based on fitness level,
            training goal, equipment, age, and injury status.
          </p>

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
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-hero">
        <div className="hero-left">
          <div className="hero-badge">Adaptive Lower-Body Training Platform</div>

          <h1 className="app-title">CV Fitness Recommendation System</h1>

          <p className="hero-subtitle">
            A personalised workout system that generates lower-body training
            recommendations using user profile data, goal-based logic, and
            constraint-aware adaptation.
          </p>

          <div className="hero-stats">
            <div className="hero-stat-card">
              <span className="hero-stat-label">Current Profile</span>
              <strong>{heroProfileText}</strong>
            </div>

            <div className="hero-stat-card">
              <span className="hero-stat-label">Recommendation Mode</span>
              <strong>Rule-Based</strong>
            </div>

            <div className="hero-stat-card">
              <span className="hero-stat-label">Constraint Awareness</span>
              <strong>Age + Injury</strong>
            </div>
          </div>

          <div className="nav-tabs hero-tabs">
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
              onClick={() => setPage("progress")}
              className={`tab-btn ${page === "progress" ? "active" : ""}`}
            >
              Progress
            </button>
          </div>
        </div>

        <div className="hero-right">
          <div className="user-panel">
            <span className="user-chip">👤 {user.username}</span>

            <button
              type="button"
              onClick={() => {
                setPage("dashboard");
                setEditingProfile((prev) => !prev);
              }}
              className="secondary-btn"
            >
              {editingProfile ? "Close Profile" : "Edit Profile"}
            </button>

            <button type="button" onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
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
              setPage("dashboard");
              setEditingProfile(false);
            }}
          />
        </div>
      ) : page === "history" ? (
        <div className="page-card">
          <WorkoutHistory refreshKey={refreshKey} token={token} />
        </div>
      ) : page === "progress" ? (
        <div className="page-card">
          <h2 className="section-title">Performance & Evaluation Insights</h2>
          <p className="subtle-text" style={{ marginTop: 0 }}>
            Review workout completion, ratings, and recommendation performance
            across your recorded sessions.
          </p>
          <EvaluationResults refreshKey={refreshKey} token={token} />
        </div>
      ) : (
        <>
          {editingProfile && (
            <div className="page-card">
              <div className="profile-edit-top">
                <div>
                  👤 <b>Current Profile:</b> {profile?.fitnessLevel} | {profile?.goal} |{" "}
                  {profile?.equipment}
                  {profile?.age ? ` | age ${profile.age}` : ""}
                  {profile?.injury ? ` | injury ${profile.injury}` : ""}
                </div>

                <button
                  type="button"
                  onClick={() => setEditingProfile(false)}
                  className="secondary-btn"
                >
                  Close
                </button>
              </div>

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
            </div>
          )}

          <WorkoutDashboard
            workout={recommendedRec}
            latestLog={latestLog}
            evaluationSummary={evaluationSummary}
            loading={loadingRec || selectingWorkout}
            onGeneratePersonalised={generateRecommendation}
          />

          <div className="dashboard-two-col">
            <ProfileSnapshot profile={profile} />
            <RecentActivity latestLog={latestLog} />
          </div>

          <div className="page-card">
            <h2 className="section-title">Personalised Workout Generation</h2>

            <div style={{ marginBottom: "12px", fontSize: "13px", color: "#666" }}>
              Example of a generic online workout plan used for comparison:
              <ul style={{ marginTop: "6px", paddingLeft: "18px" }}>
                <li>
                  <a
                    href="https://www.verywellfit.com/beginner-leg-day-workout-5323162"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Verywell Fit – Beginner Leg Day Workout
                  </a>
                </li>
              </ul>
            </div>

            <p className="subtle-text" style={{ marginTop: 0 }}>
              Generate personalised lower-body workout options tailored to your
              profile, training goal, equipment, age, and injury status.
            </p>

            <div className="action-row">
              <button
                type="button"
                disabled={loadingRec || selectingWorkout}
                onClick={generateRecommendation}
                className="action-btn active"
              >
                {loadingRec ? "Generating..." : "Generate Personalised Workout Options"}
              </button>
            </div>

            {loadingRec && <p>Generating recommendation...</p>}
            {selectingWorkout && <p>Saving selected workout...</p>}
            {recError && <p className="status-error">{recError}</p>}

            {!loadingRec &&
              !selectingWorkout &&
              recommendedExercises.length === 0 &&
              recommendedOptions.length === 0 &&
              !recError && (
                <div className="empty-state">
                  No workout recommendation loaded yet. Generate personalised
                  workout options to begin.
                </div>
              )}

            {recommendedOptions.length > 0 && (
              <div className="personalised-options-grid">
                {recommendedOptions.map((option, index) => (
                  <div
                    key={`${option.goal || option.template}-${index}`}
                    className="personalised-option-card"
                  >
                    <div className="personalised-option-top">
                      <div>
                        <h3>{option.label}</h3>
                        <p className="option-description">{option.description}</p>

                        <p
                          style={{
                            fontSize: "13px",
                            color: "#666",
                            marginTop: "6px",
                          }}
                        >
                          {option.reason}
                        </p>

                        <div
                          style={{
                            marginTop: "6px",
                            display: "flex",
                            gap: "6px",
                            flexWrap: "wrap",
                          }}
                        >
                          {profile?.age >= 50 && (
                            <span className="badge badge-warning">
                              Age-aware adjustment applied
                            </span>
                          )}

                          {profile?.injury && profile.injury !== "none" && (
                            <span className="badge badge-danger">
                              Injury-aware filtering applied
                            </span>
                          )}

                          <span className="badge badge-light">
                            Goal-based structure
                          </span>
                        </div>

                        <div className="option-prescription">
                          <span className="option-prescription-label">
                            Prescription:
                          </span>
                          <span>
                            {option.prescription?.sets ?? "-"} sets ×{" "}
                            {option.prescription?.reps ?? "-"} reps
                          </span>
                        </div>
                      </div>

                      <span className="badge badge-dark">personalised</span>
                    </div>

                    <hr className="option-divider" />

                    <h4 className="option-exercises-title">Exercises</h4>

                    <ExercisesList exercises={option.exercises} />

                    <div className="option-footer">
                      <button
                        type="button"
                        className="primary-btn"
                        disabled={selectingWorkout}
                        onClick={() => selectPersonalisedWorkout(option)}
                      >
                        {selectingWorkout ? "Selecting..." : "Select This Workout"}
                      </button>
                    </div>
                  </div>
                ))}
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
                  <h3 style={{ marginTop: 0 }}>Workout Evaluation Submission</h3>

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
                        <b>Enjoyment Rating (1–5):</b>
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={enjoymentRating}
                        onChange={(e) => setEnjoymentRating(Number(e.target.value))}
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

                    <label className="inline-field">
                      <span>
                        <b>Workout Duration (minutes):</b>
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={durationActual}
                        onChange={(e) => setDurationActual(e.target.value)}
                      />
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

                  <button
                    type="button"
                    onClick={submitFeedback}
                    disabled={submitting}
                    className="primary-btn"
                  >
                    {submitting ? "Saving..." : "Submit Evaluation"}
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
            <h2 className="section-title">Exercise Knowledge Base</h2>
            <p className="subtle-text" style={{ marginTop: 0 }}>
              Exercise records currently stored in the system and used by the
              recommendation engine.
            </p>

            {loadingExercises && <p>Loading exercises...</p>}
            {error && <p className="status-error">{error}</p>}

            {!loadingExercises && exercises.length === 0 && (
              <div className="empty-state">No exercises found in the dataset.</div>
            )}

            <ExercisesList exercises={exercises} />
          </div>
        </>
      )}
    </div>
  );
}

export default App;