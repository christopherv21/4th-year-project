import React, { useEffect, useState } from "react";
import ExercisesList from "./components/ExercisesList";
import EvaluationResults from "./components/EvaluationResults";
import ProfileSetup from "./components/ProfileSetup";
import WorkoutHistory from "./components/WorkoutHistory";
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
  const [generatedProfile, setGeneratedProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMissing, setProfileMissing] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

  const [logs, setLogs] = useState([]);

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
    setError("");
    setRecError("");
    setRefreshKey(0);

    setProfile(null);
    setGeneratedProfile(null);
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
      const data = await apiFetch("/api/profile/me");
      setProfile(data);
      setProfileMissing(false);
    } catch (err) {
      if (err.status === 404) {
        setProfile(null);
        setProfileMissing(true);
      } else {
        setError(err.message || "Failed to load profile");
        setProfile(null);
        setProfileMissing(true);
      }
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

  useEffect(() => {
    const loadLogs = async () => {
      if (!token) return;

      try {
        const data = await apiFetch("/api/workout-logs");
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        setLogs([]);
      }
    };

    loadLogs();
  }, [token, refreshKey]);

  useEffect(() => {
    const loadLatestRecommendation = async () => {
      if (!token) return;

      try {
        const data = await apiFetch("/api/recommendations");

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

      const profileAtGeneration = profile ? { ...profile } : null;
      setGeneratedProfile(profileAtGeneration);

      const rec = await apiFetch("/api/recommendations/personalised-options", {
        method: "POST",
      });

      const optionsWithContext = Array.isArray(rec?.options)
        ? rec.options.map((option) => ({
            ...option,
            equipment: option.equipment || profileAtGeneration?.equipment,
            goal: option.goal || profileAtGeneration?.goal,
            profileSnapshot: profileAtGeneration,
          }))
        : [];

      setRecommendedOptions(optionsWithContext);
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
        }
      );

      const recommendationWithContext = {
        ...savedRecommendation,
        equipment: selectedWorkout?.equipment || savedRecommendation?.equipment,
        goal: selectedWorkout?.goal || savedRecommendation?.goal,
        profileSnapshot: selectedWorkout?.profileSnapshot || generatedProfile,
      };

      setRecommendedRec(recommendationWithContext);
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

  const getWarmupItems = (goal, equipment) => {
    const normalisedGoal = (goal || "").toLowerCase();
    const normalisedEquipment = (equipment || "").toLowerCase();

    const baseWarmup = ["3–5 min light cardio", "Leg swings x10 each leg"];

    if (normalisedEquipment === "gym") {
      if (normalisedGoal === "strength") {
        return [
          ...baseWarmup,
          "Bodyweight squats x10",
          "1–2 lighter warm-up sets on first machine/barbell exercise",
        ];
      }

      if (normalisedGoal === "hypertrophy") {
        return [
          ...baseWarmup,
          "Walking lunges x10 each leg",
          "Glute bridges x12",
        ];
      }

      if (normalisedGoal === "endurance") {
        return [
          "5 min treadmill walk or bike",
          "Bodyweight squats x15",
          "Step-ups x10 each leg",
        ];
      }
    }

    if (normalisedEquipment === "dumbbells") {
      if (normalisedGoal === "strength") {
        return [
          "3–5 min brisk walk",
          "Bodyweight squats x10",
          "Dumbbell Romanian deadlift with light weight x10",
        ];
      }

      if (normalisedGoal === "hypertrophy") {
        return [
          "3–5 min light cardio",
          "Goblet squat with light dumbbell x10",
          "Glute bridges x12",
        ];
      }

      if (normalisedGoal === "endurance") {
        return [
          "5 min brisk walk",
          "Air squats x15",
          "Alternating reverse lunges x10 each leg",
        ];
      }
    }

    if (normalisedEquipment === "bodyweight") {
      if (normalisedGoal === "strength") {
        return [
          "3–5 min marching in place",
          "Slow tempo squats x10",
          "Glute bridges x12",
        ];
      }

      if (normalisedGoal === "hypertrophy") {
        return [
          "3–5 min brisk walk or marching",
          "Bodyweight lunges x10 each leg",
          "Glute bridges x15",
        ];
      }

      if (normalisedGoal === "endurance") {
        return ["5 min brisk walk", "Jumping jacks x20", "Air squats x15"];
      }
    }

    return [
      "3–5 min light cardio",
      "Bodyweight squats x10",
      "Leg swings x10 each leg",
    ];
  };

  const getExerciseName = (exercise) => {
    return exercise?.name || exercise?.exerciseName || "Exercise";
  };

  const getExerciseSets = (exercise, fallbackSets) => {
    return exercise?.sets ?? exercise?.prescribedSets ?? fallbackSets ?? "-";
  };

  const getExerciseReps = (exercise, fallbackReps) => {
    return exercise?.reps ?? exercise?.prescribedReps ?? fallbackReps ?? "-";
  };

  const getExerciseRest = (exercise, fallbackRest, goal) => {
    if (exercise?.restSeconds) return exercise.restSeconds;
    if (exercise?.rest) return exercise.rest;
    if (exercise?.prescribedRest) return exercise.prescribedRest;
    if (fallbackRest) return fallbackRest;

    const normalisedGoal = (goal || "").toLowerCase();

    if (normalisedGoal === "strength") return 120;
    if (normalisedGoal === "hypertrophy") return 90;
    if (normalisedGoal === "endurance") return 45;

    return 60;
  };

  const getGoalLabel = (goal) => {
    if (!goal) return "Goal-based";
    if (goal === "hypertrophy") return "Muscle-building";
    return `${goal.charAt(0).toUpperCase()}${goal.slice(1)} focused`;
  };

  const currentPageTitle =
    page === "dashboard"
      ? "Dashboard"
      : page === "profile"
      ? "Profile"
      : page === "history"
      ? "Workout History"
      : page === "progress"
      ? "Evaluation"
      : "Exercise Library";

  if (!user) {
    return (
      <div className="auth-shell">
        <div className="auth-background"></div>

        <div className="auth-card">
          <div className="brand-mark">RS</div>
          <p className="eyebrow">Knowledge-Based Workout System</p>
          <h1>Lower-Body Recommender</h1>
          <p className="auth-subtext">
            Log in to generate personalised lower-body workouts using goal-based,
            equipment-aware, age-aware, and injury-aware recommendation logic.
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
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="sidebar-brand">
            <div className="brand-logo">RS</div>
            <div>
              <h2>Recommender System</h2>
              <p>Lower-Body Workout Platform</p>
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
  {page === "dashboard" && (
    <header className="topbar compact-topbar">
      <div className="topbar-main">
        <p className="eyebrow">Knowledge-Based Workout System</p>
        <h1>{currentPageTitle}</h1>
        <p className="topbar-description">
          A knowledge-based lower-body workout recommendation system designed
          to improve upon generic online workout plans.
        </p>

        {profile && (
          <div className="topbar-chips">
            <span className="topbar-chip">{profile.fitnessLevel}</span>
            <span className="topbar-chip">{profile.equipment}</span>
            {profile.age && (
              <span className="topbar-chip">Age {profile.age}</span>
            )}
            {profile.injury && profile.injury !== "none" && (
              <span className="topbar-chip">Injury: {profile.injury}</span>
            )}
          </div>
        )}
      </div>

      <div className="topbar-pill">
        <span className="status-dot"></span>
        Active
      </div>
    </header>
  )}

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
                <section className="panel dashboard-intro-panel">
                  <div className="panel-header">
                    <div>
                      <p className="panel-kicker">Product Overview</p>
                      <h3>
                        Personalised lower-body training, built around the user
                      </h3>
                    </div>
                  </div>

                  <div className="dashboard-actions-summary">
                    <div className="mini-action-card">
                      <strong>Personalised plans</strong>
                      <p>
                        Uses goal, equipment, age, injury status, and history.
                      </p>
                    </div>

                    <div className="mini-action-card">
                      <strong>Warm-up included</strong>
                      <p>Each option includes a goal-aware warm-up section.</p>
                    </div>

                    <div className="mini-action-card">
                      <strong>Online comparison</strong>
                      <p>
                        Compare against a generic Verywell Fit beginner leg plan.
                      </p>
                    </div>

                    <div className="mini-action-card">
                      <strong>Evaluation data</strong>
                      <p>
                        Feedback supports the project evaluation and final report.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="panel">
                  <div className="panel-header">
                    <div>
                      <p className="panel-kicker">Workout Generation</p>
                      <h3>Personalised Workout Options</h3>
                    </div>
                  </div>

                  <div className="comparison-card compact-comparison-card">
                    <div className="comparison-header">
                      <div>
                        <p className="panel-kicker">System Comparison</p>
                        <h3>Why this system adds value</h3>
                      </div>
                    </div>

                    <p className="comparison-conclusion" style={{ marginTop: 0 }}>
                      This system personalises lower-body workouts using fitness
                      level, goal, equipment, age, injury status, and previous
                      workout history. A generic online workout gives the same
                      plan to every user.
                    </p>

                    <div className="comparison-badges">
                      <span className="feature-badge feature-yes">
                        Personalised
                      </span>
                      <span className="feature-badge feature-yes">
                        Injury-aware
                      </span>
                      <span className="feature-badge feature-yes">
                        Age-aware
                      </span>
                      <span className="feature-badge feature-yes">
                        History-aware
                      </span>
                    </div>

                    <p
                      className="subtle-text"
                      style={{ marginTop: 12, marginBottom: 0 }}
                    >
                      Compare with:{" "}
                      <a
                        href="https://www.verywellfit.com/beginner-leg-day-workout-5323162"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="comparison-link"
                      >
                        Verywell Fit – Beginner Leg Day Workout
                      </a>
                    </p>
                  </div>

                  <div className="card-soft" style={{ marginBottom: 18 }}>
                    <p className="panel-kicker">Example Proof Case</p>
                    <h3 style={{ marginTop: 0 }}>
                      How the system improves on a generic online workout
                    </h3>

                    <div className="dashboard-actions-summary">
                      <div className="mini-action-card">
                        <strong>Example User</strong>
                        <p>
                          Beginner • Strength goal • Gym equipment • Age 55 •
                          Knee injury
                        </p>
                      </div>

                      <div className="mini-action-card">
                        <strong>Generic Online Workout</strong>
                        <p>
                          Squats, lunges, leg press, calf raises. This plan is
                          fixed and does not adapt to knee injury or age.
                        </p>
                      </div>

                      <div className="mini-action-card">
                        <strong>Your System Output</strong>
                        <p>
                          Safer lower-body options such as leg press, hamstring
                          curl, glute bridge, and calf raises.
                        </p>
                      </div>

                      <div className="mini-action-card">
                        <strong>Why It Is Better</strong>
                        <p>
                          Removes risky movements, applies age/injury logic, and
                          matches the workout to the user’s goal.
                        </p>
                      </div>
                    </div>
                  </div>

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
                        No workout recommendation loaded yet. Generate
                        personalised workout options to begin.
                      </div>
                    )}

                  {recommendedOptions.length > 0 && (
                    <div className="pro-options-section">
                      <div className="pro-options-header">
                        <div>
                          <p className="panel-kicker">Choose Your Plan</p>
                          <h3>Personalised workout options</h3>
                          <p>
                            Each card shows the warm-up, main exercises and
                            recommendation logic in a cleaner product-style
                            format.
                          </p>
                        </div>
                      </div>

                      <div className="pro-workout-grid">
                        {recommendedOptions.map((option, index) => {
                          const optionProfile =
                            option.profileSnapshot || generatedProfile || {};
                          const optionWarmup = getWarmupItems(
                            option.goal,
                            option.equipment
                          );
                          const optionExercises = Array.isArray(option.exercises)
                            ? option.exercises
                            : [];

                          return (
                            <article
                              key={`${option.goal || option.template}-${index}`}
                              className="pro-workout-card"
                            >
                              <div className="pro-workout-hero">
                                <div>
                                  <span className="pro-plan-number">
                                    PLAN {String(index + 1).padStart(2, "0")}
                                  </span>

                                  <h3>{option.label}</h3>

                                  <p>
                                    {option.description ||
                                      "A personalised lower-body workout generated from your profile."}
                                  </p>
                                </div>

                                <div className="pro-hero-footer">
                                  <span className="pro-status-pill">
                                    Personalised
                                  </span>
                                  <span className="pro-status-pill muted">
                                    {getGoalLabel(option.goal)}
                                  </span>
                                </div>
                              </div>

                              <div className="pro-stats-row">
                                <div>
                                  <strong>
                                    {option.prescription?.sets ?? "-"}
                                  </strong>
                                  <span>Sets</span>
                                </div>

                                <div>
                                  <strong>
                                    {option.prescription?.reps ?? "-"}
                                  </strong>
                                  <span>Reps</span>
                                </div>

                                <div>
                                  <strong>
                                    {getExerciseRest(
                                      null,
                                      option.prescription?.restSeconds,
                                      option.goal
                                    )}
                                  </strong>
                                  <span>Sec Rest</span>
                                </div>

                                <div>
                                  <strong>{optionExercises.length}</strong>
                                  <span>Exercises</span>
                                </div>
                              </div>

                              <div className="pro-reason-box">
                                <div className="pro-reason-header">
                                  <span>✓</span>
                                  <h4>Why this plan?</h4>
                                </div>

                                <ul className="pro-reason-list">
                                  <li>
                                    Matches your {option.goal || "selected"} goal
                                  </li>

                                  {optionProfile?.injury &&
                                    optionProfile.injury !== "none" && (
                                      <li>
                                        Adjusted for {optionProfile.injury} injury
                                      </li>
                                    )}

                                  <li>
                                    Uses {option.equipment || "available"}{" "}
                                    equipment
                                  </li>
                                  <li>Balanced lower-body structure</li>
                                </ul>

                                <div className="pro-badge-row">
                                  {Number(optionProfile?.age) >= 50 && (
                                    <span className="pro-badge warning">
                                      Age-aware
                                    </span>
                                  )}

                                  {optionProfile?.injury &&
                                    optionProfile.injury !== "none" && (
                                      <span className="pro-badge danger">
                                        Injury-aware
                                      </span>
                                    )}

                                  <span className="pro-badge blue">
                                    Goal-based
                                  </span>

                                  <span className="pro-badge dark">
                                    {option.equipment || "Equipment matched"}
                                  </span>
                                </div>
                              </div>

                              <div className="pro-section-card">
                                <div className="pro-section-title">
                                  <span>01</span>
                                  <h4>Warm-up</h4>
                                </div>

                                <div className="pro-list">
                                  {optionWarmup.map((item, warmupIndex) => (
                                    <div
                                      className="pro-list-item"
                                      key={`${item}-${warmupIndex}`}
                                    >
                                      <span className="pro-dot"></span>
                                      <p>{item}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="pro-section-card">
                                <div className="pro-section-title">
                                  <span>02</span>
                                  <h4>Main workout</h4>
                                </div>

                                <div className="pro-exercise-stack">
                                  {optionExercises.map((ex, exIndex) => (
                                    <div
                                      className="pro-exercise-row"
                                      key={ex.exerciseId || ex._id || exIndex}
                                    >
                                      <div className="pro-exercise-index">
                                        {String(exIndex + 1).padStart(2, "0")}
                                      </div>

                                      <div className="pro-exercise-main">
                                        <strong>{getExerciseName(ex)}</strong>
                                        <span>
                                          {getExerciseSets(
                                            ex,
                                            option.prescription?.sets
                                          )}{" "}
                                          sets •{" "}
                                          {getExerciseReps(
                                            ex,
                                            option.prescription?.reps
                                          )}{" "}
                                          reps •{" "}
                                          {getExerciseRest(
                                            ex,
                                            option.prescription?.restSeconds,
                                            option.goal
                                          )}{" "}
                                          sec rest
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <button
                                type="button"
                                className="pro-select-btn"
                                disabled={selectingWorkout}
                                onClick={() => selectPersonalisedWorkout(option)}
                              >
                                {selectingWorkout
                                  ? "Selecting..."
                                  : "Select This Workout"}
                              </button>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {recommendedExercises.length > 0 && (
                    <>
                      <div className="selected-workout-pro">
                        <div className="selected-workout-header">
                          <div>
                            <p className="panel-kicker">Selected Workout</p>
                            <h3>
                              {recommendedRec?.title ||
                                `${
                                  recommendedRec?.workoutType || "Personalised"
                                } Lower-Body Workout`}
                            </h3>
                            <p>
                              This is the saved workout plan selected from your
                              personalised recommendation options.
                            </p>
                          </div>

                          <span className="selected-workout-pill">
                            Ready to log
                          </span>
                        </div>

                        <div className="selected-workout-grid">
                          <div className="pro-section-card">
                            <div className="pro-section-title">
                              <span>01</span>
                              <h4>Warm-up</h4>
                            </div>

                            <div className="pro-list">
                              {getWarmupItems(
                                recommendedRec?.goal,
                                recommendedRec?.equipment
                              ).map((item, index) => (
                                <div
                                  className="pro-list-item"
                                  key={`${item}-${index}`}
                                >
                                  <span className="pro-dot"></span>
                                  <p>{item}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="pro-section-card">
                            <div className="pro-section-title">
                              <span>02</span>
                              <h4>Main workout</h4>
                            </div>

                            <ExercisesList exercises={recommendedExercises} />
                          </div>
                        </div>
                      </div>

                      <div className="card-soft" style={{ marginTop: 18 }}>
                        <h3 style={{ marginTop: 0 }}>Workout Feedback</h3>

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
                              onChange={(e) =>
                                setDifficultyFeedback(e.target.value)
                              }
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
                              onChange={(e) =>
                                setDurationActual(e.target.value)
                              }
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
                          {submitting ? "Saving..." : "Submit Feedback"}
                        </button>

                        {submitMsg && (
                          <p
                            className="status-success"
                            style={{ marginTop: 14 }}
                          >
                            {submitMsg}
                          </p>
                        )}
                        {submitErr && (
                          <p
                            className="status-error"
                            style={{ marginTop: 14 }}
                          >
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
                    <b>Current Profile:</b> {profile?.fitnessLevel} |{" "}
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
                  <div className="empty-state">
                    No exercises found in the dataset.
                  </div>
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