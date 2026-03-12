import React from "react";

export default function WorkoutDashboard({
  workout,
  latestLog,
  onGenerateBaseline,
  onGeneratePersonalised,
  loading = false,
}) {
  const exerciseCount = workout?.exercises?.length || 0;

  const estimatedDuration =
    workout?.exercises?.length > 0
      ? `${workout.exercises.length * 8}-${workout.exercises.length * 10} min`
      : "-";

  const workoutType = workout?.workoutType || "none";
  const sourceName = workout?.sourceName || "-";
  const sourceUrl = workout?.sourceUrl || "";

  const completedText =
    latestLog == null ? "No logs yet" : latestLog.completed ? "Completed" : "Not completed";

  const difficultyText = latestLog?.difficultyFeedback || "-";

  const badgeClass =
    workoutType === "personalised"
      ? "badge badge-dark"
      : workoutType === "baseline"
      ? "badge badge-outline"
      : "badge badge-light";

  const difficultyBadgeClass =
    difficultyText === "just_right"
      ? "badge badge-success"
      : difficultyText === "too_easy"
      ? "badge badge-warning"
      : difficultyText === "too_hard"
      ? "badge badge-danger"
      : "badge badge-light";

  const displayWorkoutType =
    workoutType === "personalised"
      ? "Personalised"
      : workoutType === "baseline"
      ? "Baseline"
      : "None";

  const handleBaselineClick = () => {
    if (typeof onGenerateBaseline === "function") {
      onGenerateBaseline();
    }
  };

  const handlePersonalisedClick = () => {
    if (typeof onGeneratePersonalised === "function") {
      onGeneratePersonalised();
    }
  };

  return (
    <div className="page-card">
      <div className="section-header">
        <h2>🏋️ Workout Dashboard</h2>
      </div>

      <div className="dashboard-stats-grid">
        <div className="dashboard-stat-card">
          <span className="dashboard-stat-label">Today's Workout</span>
          <div className="dashboard-stat-row">
            <span className={badgeClass}>{displayWorkoutType}</span>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <span className="dashboard-stat-label">Exercises</span>
          <span className="dashboard-stat-value">{exerciseCount}</span>
        </div>

        <div className="dashboard-stat-card">
          <span className="dashboard-stat-label">Estimated Duration</span>
          <span className="dashboard-stat-value">{estimatedDuration}</span>
        </div>

        <div className="dashboard-stat-card">
          <span className="dashboard-stat-label">Last Completion</span>
          <span className="dashboard-stat-value small">{completedText}</span>
        </div>
      </div>

      <div className="dashboard-main-grid">
        <div className="dashboard-panel">
          <div className="dashboard-panel-top">
            <h3>Today's Plan</h3>
            <span className={badgeClass}>{displayWorkoutType}</span>
          </div>

          {!workout?.exercises?.length ? (
            <div className="empty-state">
              <p>No workout generated yet.</p>
            </div>
          ) : (
            <>
              <p className="subtle-text">
                Your current workout contains <strong>{exerciseCount}</strong> exercises.
              </p>

              <p className="subtle-text" style={{ marginTop: 8 }}>
                <strong>Source:</strong> {sourceName}
                {sourceUrl && (
                  <>
                    {" "}
                    •{" "}
                    <a href={sourceUrl} target="_blank" rel="noreferrer">
                      View source
                    </a>
                  </>
                )}
              </p>

              <div className="dashboard-exercise-preview">
                {workout.exercises.slice(0, 4).map((exercise, index) => (
                  <div
                    key={`${exercise.exerciseId || exercise._id || index}-${index}`}
                    className="dashboard-exercise-row"
                  >
                    <span className="dashboard-exercise-name">
                      {exercise.name || "Exercise"}
                    </span>
                    <div className="exercise-badges">
                      <span className="badge badge-dark">
                        {exercise.sets ?? "-"} sets
                      </span>
                      <span className="badge badge-light">
                        {exercise.reps ?? "-"} reps
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {workout.exercises.length > 4 && (
                <p className="subtle-text" style={{ marginTop: 12 }}>
                  + {workout.exercises.length - 4} more exercises in this workout
                </p>
              )}
            </>
          )}
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-top">
            <h3>Quick Insights</h3>
          </div>

          <div className="dashboard-info-list">
            <div className="dashboard-info-item">
              <span className="dashboard-info-label">Last Difficulty</span>
              <span className={difficultyBadgeClass}>{difficultyText}</span>
            </div>

            <div className="dashboard-info-item">
              <span className="dashboard-info-label">Suitability Rating</span>
              <span className="dashboard-info-value">
                {latestLog?.suitabilityRating ?? "-"}
              </span>
            </div>

            <div className="dashboard-info-item">
              <span className="dashboard-info-label">Structure Rating</span>
              <span className="dashboard-info-value">
                {latestLog?.structureRating ?? "-"}
              </span>
            </div>

            <div className="dashboard-info-item">
              <span className="dashboard-info-label">Last Workout Date</span>
              <span className="dashboard-info-value">
                {latestLog?.createdAt
                  ? new Date(latestLog.createdAt).toLocaleDateString()
                  : "-"}
              </span>
            </div>
          </div>

          <div className="dashboard-actions">
            <button
              type="button"
              className="action-btn active"
              onClick={handleBaselineClick}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Baseline"}
            </button>

            <button
              type="button"
              className="action-btn"
              onClick={handlePersonalisedClick}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Personalised"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}