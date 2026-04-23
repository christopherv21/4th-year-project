import React from "react";

const formatDifficultyLabel = (value) => {
  if (value === "just_right") return "Just right";
  if (value === "too_easy") return "Too easy";
  if (value === "too_hard") return "Too hard";
  return "-";
};

export default function WorkoutDashboard({
  workout,
  latestLog,
  onGeneratePersonalised,
  loading = false,
}) {
  const exercises = Array.isArray(workout?.exercises) ? workout.exercises : [];
  const exerciseCount = exercises.length;

  const estimatedDuration =
    exerciseCount > 0 ? `${exerciseCount * 8}-${exerciseCount * 10} min` : "-";

  const workoutType = workout?.workoutType || "none";
  const sourceName = workout?.sourceName || "Rule-Based Recommendation Engine";
  const workoutTitle = workout?.title || "No active workout selected";

  const difficultyText = latestLog?.difficultyFeedback || "-";

  const badgeClass =
    workoutType === "personalised" ? "badge badge-dark" : "badge badge-light";

  const difficultyBadgeClass =
    difficultyText === "just_right"
      ? "badge badge-success"
      : difficultyText === "too_easy"
      ? "badge badge-warning"
      : difficultyText === "too_hard"
      ? "badge badge-danger"
      : "badge badge-light";

  const displayWorkoutType =
    workoutType === "personalised" ? "Personalised" : "No active plan";

  const handlePersonalisedClick = () => {
    if (typeof onGeneratePersonalised === "function") {
      onGeneratePersonalised();
    }
  };

  return (
    <div className="dashboard-workspace">
      <div className="dashboard-quick-actions" style={{ marginBottom: 22 }}>
        <button
          type="button"
          className="btn btn-primary dashboard-generate-btn"
          onClick={handlePersonalisedClick}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Personalised Workout"}
        </button>
      </div>

      <div className="dashboard-main-grid">
        <section className="dashboard-feature-card">
          <div className="dashboard-feature-icon">🏋️</div>

          <div className="dashboard-feature-header">
            <div>
              <h3>Current Workout</h3>
              <p className="subtle-text">
                Your currently selected lower-body workout.
              </p>
            </div>

            <span className={badgeClass}>{displayWorkoutType}</span>
          </div>

          {!exercises.length ? (
            <div className="empty-state">
              <p style={{ marginTop: 0, marginBottom: 6, fontWeight: 700 }}>
                No workout selected yet.
              </p>
              <p style={{ margin: 0 }}>
                Generate personalised workout options and choose one to load it here.
              </p>
            </div>
          ) : (
            <>
              <div className="dashboard-summary-source" style={{ marginBottom: 12 }}>
                <span className="dashboard-summary-label">Workout</span>
                <strong>{workoutTitle}</strong>
              </div>

              <div className="dashboard-summary-row">
                <div className="dashboard-summary-stat">
                  <span className="dashboard-summary-label">Exercises</span>
                  <strong>{exerciseCount}</strong>
                </div>

                <div className="dashboard-summary-stat">
                  <span className="dashboard-summary-label">Est. Duration</span>
                  <strong>{estimatedDuration}</strong>
                </div>
              </div>

              <div className="dashboard-summary-source">
                <span className="dashboard-summary-label">Source</span>
                <strong>{sourceName}</strong>
              </div>

              <div className="dashboard-highlight-note">
                This workout is personalised using your goal, equipment, and profile
                constraints.
              </div>
            </>
          )}
        </section>

        <section className="dashboard-feature-card">
          <div className="dashboard-feature-icon">📈</div>

          <div className="dashboard-feature-header">
            <div>
              <h3>Latest Session</h3>
              <p className="subtle-text">
                Summary of your most recent workout feedback.
              </p>
            </div>
          </div>

          {!latestLog ? (
            <div className="empty-state">
              <p style={{ marginTop: 0, marginBottom: 6, fontWeight: 700 }}>
                No session feedback yet.
              </p>
              <p style={{ margin: 0 }}>
                Submit workout feedback after a session to populate this area.
              </p>
            </div>
          ) : (
            <div className="dashboard-session-list">
              <div className="dashboard-session-row">
                <span>Completed</span>
                <strong>{latestLog?.completed ? "Yes" : "No"}</strong>
              </div>

              <div className="dashboard-session-row">
                <span>Difficulty</span>
                <span className={difficultyBadgeClass}>
                  {formatDifficultyLabel(difficultyText)}
                </span>
              </div>

              <div className="dashboard-session-row">
                <span>Suitability</span>
                <strong>{latestLog?.suitabilityRating ?? "-"} / 5</strong>
              </div>

              <div className="dashboard-session-row">
                <span>Enjoyment</span>
                <strong>{latestLog?.enjoymentRating ?? "-"} / 5</strong>
              </div>

              <div className="dashboard-session-row">
                <span>Duration</span>
                <strong>
                  {latestLog?.durationActual != null
                    ? `${latestLog.durationActual} min`
                    : "-"}
                </strong>
              </div>

              <div className="dashboard-session-row">
                <span>Date</span>
                <strong>
                  {latestLog?.createdAt
                    ? new Date(latestLog.createdAt).toLocaleDateString()
                    : "-"}
                </strong>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}