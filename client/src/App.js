import React, { useEffect, useState } from "react";
import ExercisesList from "./components/ExercisesList";
import EvaluationResults from "./components/EvaluationResults";
import ProfileSetup from "./components/ProfileSetup";
import WorkoutHistory from "./components/WorkoutHistory";
import { apiFetch } from "./api";

function App() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const [exercises, setExercises] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(false);

  // ✅ Pages / tabs
  const [page, setPage] = useState("dashboard"); // "dashboard" | "history" | "profile"

  // Profile state
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMissing, setProfileMissing] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

  // Evaluation refresh (used for EvaluationResults + history refresh)
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshSummary = () => setRefreshKey((prev) => prev + 1);

  // Errors
  const [error, setError] = useState("");
  const [recError, setRecError] = useState("");

  // Recommendation state
  const [recommendedRec, setRecommendedRec] = useState(null);
  const [recommendedExercises, setRecommendedExercises] = useState([]);
  const [loadingRec, setLoadingRec] = useState(false);
  const [currentCondition, setCurrentCondition] = useState("");

  // Feedback state
  const [completed, setCompleted] = useState(false);
  const [rating, setRating] = useState(5);
  const [difficultyFeedback, setDifficultyFeedback] = useState("appropriate");
  const [notes, setNotes] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");

  const [submitMsg, setSubmitMsg] = useState("");
  const [submitErr, setSubmitErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Restore session
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

  // Logout
  const handleLogout = () => {
    setUser(null);
    setToken("");

    setExercises([]);
    setRecommendedRec(null);
    setRecommendedExercises([]);
    setCurrentCondition("");

    setError("");
    setRecError("");
    setRefreshKey(0);

    setProfile(null);
    setProfileMissing(false);
    setProfileLoading(false);

    // reset feedback UI
    setCompleted(false);
    setRating(5);
    setDifficultyFeedback("appropriate");
    setNotes("");
    setDurationMinutes("");
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

  // Fetch profile
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
    } catch {
      setProfile(null);
      setProfileMissing(true);
    } finally {
      setProfileLoading(false);
    }
  };

  // On token -> load profile
  useEffect(() => {
    if (!token) return;
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Fetch exercises
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

  // Generate recommendation
  const generateRecommendation = async (condition = "personalised") => {
    try {
      setCurrentCondition(condition);
      setLoadingRec(true);
      setRecError("");
      setSubmitMsg("");
      setSubmitErr("");

      setRecommendedRec(null);
      setRecommendedExercises([]);

      const rec = await apiFetch("/api/recommendations/generate", {
        method: "POST",
        body: JSON.stringify({ condition }),
        token,
      });

      setRecommendedRec(rec);

      const workoutExercises = rec?.workout?.exercises || [];
      setRecommendedExercises(Array.isArray(workoutExercises) ? workoutExercises : []);
    } catch (err) {
      setRecommendedRec(null);
      setRecommendedExercises([]);
      setRecError(err.message || "Failed to generate recommendation");
    } finally {
      setLoadingRec(false);
    }
  };

  // Reset feedback for new recommendation
  useEffect(() => {
    if (!recommendedRec?._id) return;

    setCompleted(false);
    setRating(5);
    setDifficultyFeedback("appropriate");
    setNotes("");
    setDurationMinutes("");
    setSubmitMsg("");
    setSubmitErr("");
  }, [recommendedRec?._id]);

  // Submit feedback
  const submitFeedback = async () => {
    setSubmitMsg("");
    setSubmitErr("");

    if (!recommendedRec?._id) {
      setSubmitErr("No recommendation loaded yet.");
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch("/api/workouts/log", {
        method: "POST",
        body: JSON.stringify({
          recommendationId: recommendedRec._id,
          completed,
          rating: Number(rating),
          difficultyFeedback,
          notes,
          durationMinutes:
            durationMinutes === "" || durationMinutes === null
              ? undefined
              : Number(durationMinutes),
        }),
        token,
      });

      setSubmitMsg("Feedback saved ✅");
      refreshSummary();

      // ✅ Keep user on dashboard (EvaluationResults updates there)
      setPage("dashboard");
    } catch (err) {
      const status = err?.status;
      const msg = err?.message || "Failed to submit feedback.";

      if (status === 409 || msg.toLowerCase().includes("already")) {
        setSubmitErr("You already submitted feedback for this recommendation (409).");
      } else {
        setSubmitErr(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

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

  // Shared styles
  const tabStyle = (active) => ({
    padding: "6px 10px",
    marginRight: 8,
    fontWeight: active ? "bold" : "normal",
    border: active ? "2px solid #000" : "1px solid #ddd",
    cursor: "pointer",
    background: "white",
  });

  const activeBtnStyle = {
    border: "2px solid #000",
    fontWeight: "bold",
  };

  // MAIN SCREEN
  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0 }}>Personalised Gym Workout System</h1>

          <div style={{ marginTop: 10 }}>
            <button type="button" onClick={() => setPage("dashboard")} style={tabStyle(page === "dashboard")}>
              Dashboard
            </button>

            <button type="button" onClick={() => setPage("history")} style={tabStyle(page === "history")}>
              Workout History
            </button>

            <button type="button" onClick={() => setPage("profile")} style={tabStyle(page === "profile")}>
              Workout Profile
            </button>
          </div>
        </div>

        <div>
          <span style={{ marginRight: "1rem" }}>👤 {user.username}</span>
          <button onClick={handleLogout} style={{ padding: "6px 12px" }}>
            Logout
          </button>
        </div>
      </header>

      {/* PROFILE LOADING / MISSING */}
      {profileLoading ? (
        <p>Loading profile...</p>
      ) : profileMissing ? (
        <ProfileSetup
          token={token}
          onSaved={async () => {
            await fetchProfile();
            refreshSummary();
            setPage("profile");
            setEditingProfile(true);
          }}
        />
      ) : page === "history" ? (
        // ✅ HISTORY PAGE (NO EvaluationResults here)
        <div style={{ marginTop: 20 }}>
          <WorkoutHistory refreshKey={refreshKey} token={token} />
        </div>
      ) : page === "profile" ? (
        // ✅ PROFILE PAGE
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              👤 <b>Profile:</b> {profile?.fitnessLevel} | {profile?.goal} | {profile?.equipment} |{" "}
              {profile?.daysPerWeek} days/week
            </div>

            <button onClick={() => setEditingProfile((v) => !v)} style={{ padding: "6px 10px" }}>
              {editingProfile ? "Close" : "Edit Profile"}
            </button>
          </div>

          {editingProfile ? (
            <div style={{ marginTop: 12 }}>
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
            <p style={{ marginTop: 12, color: "#444" }}>
              Tip: Click <b>Edit Profile</b> to update your preferences.
            </p>
          )}
        </div>
      ) : (
        // ✅ DASHBOARD PAGE (EvaluationResults only here)
        <>
          <div style={{ marginTop: 20, marginBottom: 20 }}>
            <EvaluationResults refreshKey={refreshKey} token={token} />
          </div>

          {/* Recommendation */}
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
              type="button"
              disabled={loadingRec}
              aria-pressed={currentCondition === "baseline"}
              onClick={() => generateRecommendation("baseline")}
              style={{
                padding: "8px 12px",
                marginRight: 8,
                ...(currentCondition === "baseline" ? activeBtnStyle : null),
                opacity: loadingRec ? 0.6 : 1,
                cursor: loadingRec ? "not-allowed" : "pointer",
              }}
            >
              {loadingRec && currentCondition === "baseline" ? "Generating..." : "Generate baseline"}
            </button>

            <button
              type="button"
              disabled={loadingRec}
              aria-pressed={currentCondition === "personalised"}
              onClick={() => generateRecommendation("personalised")}
              style={{
                padding: "8px 12px",
                ...(currentCondition === "personalised" ? activeBtnStyle : null),
                opacity: loadingRec ? 0.6 : 1,
                cursor: loadingRec ? "not-allowed" : "pointer",
              }}
            >
              {loadingRec && currentCondition === "personalised"
                ? "Generating..."
                : "Generate personalised"}
            </button>
          </div>

          {loadingRec && <p>Generating recommendation...</p>}
          {recError && <p style={{ color: "red" }}>{recError}</p>}

          {!loadingRec && recommendedExercises.length === 0 && !recError && (
            <p>No recommendation loaded yet — click “Generate baseline/personalised”.</p>
          )}

          {recommendedExercises.length > 0 && (
            <>
              <ExercisesList exercises={recommendedExercises} />

              {/* ONE feedback form per recommendation */}
              <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd" }}>
                <h3>Workout Feedback</h3>

                <label style={{ display: "block", marginBottom: 8 }}>
                  Completed:
                  <input
                    type="checkbox"
                    checked={completed}
                    onChange={(e) => setCompleted(e.target.checked)}
                    style={{ marginLeft: 8 }}
                  />
                </label>

                <label style={{ display: "block", marginBottom: 8 }}>
                  Rating (1–5):
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    style={{ marginLeft: 8, width: 60 }}
                  />
                </label>

                <label style={{ display: "block", marginBottom: 8 }}>
                  Difficulty:
                  <select
                    value={difficultyFeedback}
                    onChange={(e) => setDifficultyFeedback(e.target.value)}
                    style={{ marginLeft: 8 }}
                  >
                    <option value="easy">easy</option>
                    <option value="appropriate">appropriate</option>
                    <option value="hard">hard</option>
                  </select>
                </label>

                <label style={{ display: "block", marginBottom: 8 }}>
                  Duration (minutes):
                  <input
                    type="number"
                    min={0}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    style={{ marginLeft: 8, width: 80 }}
                  />
                </label>

                <label style={{ display: "block", marginBottom: 8 }}>
                  Notes:
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    style={{ display: "block", width: "100%", marginTop: 6 }}
                  />
                </label>

                <button onClick={submitFeedback} disabled={submitting} style={{ padding: "8px 12px" }}>
                  {submitting ? "Saving..." : "Submit Feedback"}
                </button>

                {submitMsg && <p style={{ color: "green" }}>{submitMsg}</p>}
                {submitErr && <p style={{ color: "red" }}>{submitErr}</p>}
              </div>
            </>
          )}

          {/* Full database list */}
          <h2 style={{ marginTop: "2rem" }}>Exercises</h2>

          {loadingExercises && <p>Loading exercises...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {!loadingExercises && exercises.length === 0 && (
            <p>No exercises found in the database (or you’re not authorised).</p>
          )}

          <ExercisesList exercises={exercises} />
        </>
      )}
    </div>
  );
}

export default App;