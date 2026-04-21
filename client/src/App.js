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
      setPage("dashboard");
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
      <div className="auth-shell">
        <div className="auth-background"></div>

        <div className="auth-card">
          <div className="brand-mark">CV</div>
          <p className="eyebrow">Personalised Fitness Platform</p>
          <h1>CV Fitness</h1>
          <p className="auth-subtext">
            Log in to generate profile-aware lower-body workouts using goal-based
            logic, user constraints, and personalised recommendations.
          </p>

          <form onSubmit={handleLogin} className="auth-form">
            <label>Email or Username</label>
            <input
              type="text"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              placeholder="Enter your email or username"
            />

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />

            <button type="submit" className="btn btn-primary btn-full">
              Sign In
            </button>
          </form>

          {error && (
            <p className="status-error" style={{ marginTop: 14 }}>
              {error}
            </p>
          )}

          <p className="auth-subtext" style={{ marginTop: 18, marginBottom: 0 }}>
            Use an account created through Thunder Client or your register endpoint.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="sidebar-brand">
            <div className="brand-logo">CV</div>
            <div>
              <h2>CV Fitness</h2>
              <p>Personalised Workout Platform</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button
              className={page === "dashboard" ? "nav-link active" : "nav-link"}
              onClick={() => {
                setPage("dashboard");
                setEditingProfile(false);
              }}
            >
              Dashboard
            </button>

            <button
              className={page === "profile" ? "nav-link active" : "nav-link"}
              onClick={() => {
                setPage("profile");
                setEditingProfile(true);
              }}
            >
              Profile
            </button>

            <button
              className={page === "history" ? "nav-link active" : "nav-link"}
              onClick={() => {
                setPage("history");
                setEditingProfile(false);
              }}
            >
              Workout History
            </button>

            <button
              className={page === "progress" ? "nav-link active" : "nav-link"}
              onClick={() => {
                setPage("progress");
                setEditingProfile(false);
              }}
            >
              Evaluation
            </button>

            <button
              className={page === "library" ? "nav-link active" : "nav-link"}
              onClick={() => {
                setPage("library");
                setEditingProfile(false);
              }}
            >
              Exercise Library
            </button>
          </nav>
        </div>

        <div className="sidebar-footer">
          <div style={{ marginBottom: 12 }}>
            <span className="user-chip">👤 {user.username}</span>
          </div>

          <button className="btn btn-secondary btn-full" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Product Dashboard</p>
            <h1>Performance Workspace</h1>
          </div>

          <div className="topbar-pill">
            <span className="status-dot"></span>
            System Active
          </div>
        </header>

        <section className="hero-panel">
          <div>
            <p className="eyebrow">Smart Recommendation Engine</p>
            <h2>Personalised lower-body workouts with evaluation-driven comparison</h2>
            <p className="hero-text">
              Generate profile-aware workout options, select a personalised plan,
              log workout outcomes, and compare performance using completion,
              suitability, structure, enjoyment, and difficulty feedback.
            </p>
          </div>

          <div className="hero-stats">
            <div className="stat-card">
              <span>Current Profile</span>
              <strong>{heroProfileText}</strong>
            </div>
            <div className="stat-card">
              <span>Recommendation Mode</span>
              <strong>Rule-Based</strong>
            </div>
            <div className="stat-card">
              <span>Constraint Awareness</span>
              <strong>Age + Injury</strong>
            </div>
          </div>
        </section>

        {profileLoading ? (
          <section className="panel">
            <h3>Loading profile...</h3>
          </section>
        ) : profileMissing ? (
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="panel-kicker">Setup Required</p>
                <h3>Create Your Profile</h3>
              </div>
            </div>

            <ProfileSetup
              token={token}
              onSaved={async () => {
                await fetchProfile();
                refreshSummary();
                setPage("dashboard");
                setEditingProfile(false);
              }}
            />
          </section>
        ) : (
          <>
            {page === "dashboard" && (
              <>
                <div className="dashboard-grid">
                  <section className="panel panel-large">
                    <div className="panel-header">
                      <div>
                        <p className="panel-kicker">Main Overview</p>
                        <h3>Workout Dashboard</h3>
                      </div>
                    </div>

                    <WorkoutDashboard
                      workout={recommendedRec}
                      latestLog={latestLog}
                      evaluationSummary={evaluationSummary}
                      loading={loadingRec || selectingWorkout}
                      onGeneratePersonalised={generateRecommendation}
                    />
                  </section>

                  <section className="panel">
                    <div className="panel-header">
                      <div>
                        <p className="panel-kicker">User Profile</p>
                        <h3>Profile Snapshot</h3>
                      </div>
                    </div>
                    <ProfileSnapshot profile={profile} />
                  </section>

                  <section className="panel">
                    <div className="panel-header">
                      <div>
                        <p className="panel-kicker">Recent Activity</p>
                        <h3>Latest Interaction</h3>
                      </div>
                    </div>
                    <RecentActivity latestLog={latestLog} />
                  </section>
                </div>

                <section className="panel">
                  <div className="panel-header">
                    <div>
                      <p className="panel-kicker">Workout Generation</p>
                      <h3>Personalised Workout Options</h3>
                    </div>
                  </div>

                  <div className="card-soft" style={{ marginBottom: 18 }}>
                    <p style={{ margin: 0, fontSize: "14px", color: "#475569" }}>
                      Example of a generic online workout plan used for comparison:
                    </p>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
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
                    Generate personalised lower-body workout options tailored to
                    fitness level, goal, equipment, age, and injury status.
                  </p>

                  <div className="action-row">
                    <button
                      type="button"
                      disabled={loadingRec || selectingWorkout}
                      onClick={generateRecommendation}
                      className="btn btn-primary"
                    >
                      {loadingRec
                        ? "Generating..."
                        : "Generate Personalised Workout Options"}
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
                                  color: "#64748b",
                                  marginTop: "6px",
                                }}
                              >
                                {option.reason}
                              </p>

                              <div
                                style={{
                                  marginTop: "10px",
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
                              className="btn btn-primary"
                              disabled={selectingWorkout}
                              onClick={() => selectPersonalisedWorkout(option)}
                            >
                              {selectingWorkout
                                ? "Selecting..."
                                : "Select This Workout"}
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

                      <div className="card-soft" style={{ marginTop: 18 }}>
                        <h3 style={{ marginTop: 0 }}>Workout Evaluation Submission</h3>

                        <div className="feedback-grid">
                          <div className="completion-toggle-field">
                            <span className="completion-toggle-label">
                              <b>Completed:</b>
                            </span>

                            <button
                              type="button"
                              className={`completion-toggle-btn ${
                                completed ? "active" : ""
                              }`}
                              onClick={() => setCompleted((prev) => !prev)}
                              aria-pressed={completed}
                            >
                              <span className="completion-toggle-icon">
                                {completed ? "✓" : ""}
                              </span>

                              <span className="completion-toggle-content">
                                <span className="completion-toggle-title">
                                  {completed
                                    ? "Workout completed"
                                    : "Mark workout as completed"}
                                </span>
                                <span className="completion-toggle-subtitle">
                                  {completed
                                    ? "This session will be recorded as completed."
                                    : "Click to confirm that you finished this workout."}
                                </span>
                              </span>
                            </button>
                          </div>

                          <label className="inline-field">
                            <span>
                              <b>Suitability Rating (1–5):</b>
                            </span>
                            <input
                              type="number"
                              min={1}
                              max={5}
                              value={suitabilityRating}
                              onChange={(e) =>
                                setSuitabilityRating(Number(e.target.value))
                              }
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
                              onChange={(e) =>
                                setStructureRating(Number(e.target.value))
                              }
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
                              onChange={(e) =>
                                setEnjoymentRating(Number(e.target.value))
                              }
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
                          className="btn btn-primary"
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
                </section>
              </>
            )}

            {page === "profile" && (
              <section className="panel">
                <div className="panel-header">
                  <div>
                    <p className="panel-kicker">User Settings</p>
                    <h3>Profile Setup</h3>
                  </div>
                </div>

                <div className="card-soft" style={{ marginBottom: 18 }}>
                  <div>
                    <b>Current Profile:</b> {profile?.fitnessLevel} | {profile?.goal} |{" "}
                    {profile?.equipment}
                    {profile?.age ? ` | age ${profile.age}` : ""}
                    {profile?.injury ? ` | injury ${profile.injury}` : ""}
                  </div>
                </div>

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
              </section>
            )}

            {page === "history" && (
              <section className="panel">
                <div className="panel-header">
                  <div>
                    <p className="panel-kicker">Workout Tracking</p>
                    <h3>Workout History</h3>
                  </div>
                </div>

                <WorkoutHistory refreshKey={refreshKey} token={token} />
              </section>
            )}

            {page === "progress" && (
              <section className="panel">
                <div className="panel-header">
                  <div>
                    <p className="panel-kicker">Research Metrics</p>
                    <h3>Performance & Evaluation Insights</h3>
                  </div>
                </div>

                <p className="subtle-text" style={{ marginTop: 0 }}>
                  Review workout completion, ratings, and recommendation
                  performance across your recorded sessions.
                </p>

                <EvaluationResults refreshKey={refreshKey} token={token} />
              </section>
            )}

            {page === "library" && (
              <section className="panel">
                <div className="panel-header">
                  <div>
                    <p className="panel-kicker">Reference Data</p>
                    <h3>Exercise Knowledge Base</h3>
                  </div>
                </div>

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
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;