import React from "react";

const formatDifficultyLabel = (value) => {
  if (value === "just_right") return "Just right";
  if (value === "too_easy") return "Too easy";
  if (value === "too_hard") return "Too hard";
  return "-";
};

const formatMetric = (value, suffix = "") => {
  if (value === null || value === undefined) return "-";
  return `${value}${suffix}`;
};

export default function WorkoutDashboard({
  workout,
  latestLog,
  evaluationSummary,
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

  const personalised = evaluationSummary?.personalised || null;
  const baseline = evaluationSummary?.baseline || null;
  const totalLogs = evaluationSummary?.overall?.totalLogs || 0;

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

  const personalisedCompletion = personalised?.completionRate ?? 0;
  const baselineCompletion = baseline?.completionRate ?? 0;

  let recommendationText = "Not enough evaluation data yet.";
  if (totalLogs > 0) {
    if (personalisedCompletion > baselineCompletion) {
      recommendationText =
        "Personalised workouts are currently outperforming the baseline based on logged completion results.";
    } else if (baselineCompletion > personalisedCompletion) {
      recommendationText =
        "Baseline workouts are currently outperforming personalised workouts based on logged completion results.";
    } else {
      recommendationText =
        "Personalised and baseline workouts are currently performing at the same level.";
    }
  }

  return (
    <div className="page-card">
      <div className="dashboard-hero-panel">
        <div className="dashboard-hero-top">
          <div>
            <div className="hero-badge" style={{ marginBottom: 12 }}>
              Workout Control Centre
            </div>
            <h2 className="section-title" style={{ marginBottom: 8 }}>
              Lower-Body Training Dashboard
            </h2>
            <p className="subtle-text" style={{ marginTop: 0, marginBottom: 0 }}>
              Monitor your current workout, generate baseline and personalised plans,
              and track recommendation performance over time.
            </p>
          </div>

          <div className="dashboard-actions">
            <button
              type="button"
              className="primary-btn"
              onClick={handlePersonalisedClick}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Personalised"}
            </button>

            <button
              type="button"
              className="action-btn"
              onClick={handleBaselineClick}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Baseline"}
            </button>
          </div>
        </div>

        <div className="dashboard-stats-grid">
          <div className="dashboard-stat-card">
            <span className="dashboard-stat-label">Current Workout Type</span>
            <div className="dashboard-stat-row">
              <span className={badgeClass}>{displayWorkoutType}</span>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <span className="dashboard-stat-label">Exercise Count</span>
            <span className="dashboard-stat-value">{exerciseCount}</span>
          </div>

          <div className="dashboard-stat-card">
            <span className="dashboard-stat-label">Estimated Duration</span>
            <span className="dashboard-stat-value">{estimatedDuration}</span>
          </div>

          <div className="dashboard-stat-card">
            <span className="dashboard-stat-label">Latest Completion</span>
            <span className="dashboard-stat-value small">{completedText}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-main-grid" style={{ marginTop: 20 }}>
        <div className="dashboard-panel dashboard-primary-panel">
          <div className="dashboard-panel-top">
            <div>
              <h3>Current Workout Plan</h3>
              <p className="subtle-text" style={{ margin: "8px 0 0 0" }}>
                Active lower-body recommendation currently loaded in the system.
              </p>
            </div>
            <span className={badgeClass}>{displayWorkoutType}</span>
          </div>

          {!workout?.exercises?.length ? (
            <div className="empty-state">
              <p style={{ marginTop: 0, marginBottom: 6, fontWeight: 700 }}>
                No workout generated yet.
              </p>
              <p style={{ margin: 0 }}>
                Start by generating either a baseline workout or a personalised
                workout option.
              </p>
            </div>
          ) : (
            <>
              <div className="dashboard-plan-meta">
                <div className="dashboard-plan-meta-item">
                  <span className="dashboard-info-label">Exercises</span>
                  <span className="dashboard-info-value">{exerciseCount}</span>
                </div>

                <div className="dashboard-plan-meta-item">
                  <span className="dashboard-info-label">Estimated Time</span>
                  <span className="dashboard-info-value">{estimatedDuration}</span>
                </div>

                <div className="dashboard-plan-meta-item">
                  <span className="dashboard-info-label">Source</span>
                  <span className="dashboard-info-value">{sourceName}</span>
                </div>
              </div>

              {sourceUrl && (
                <p className="subtle-text" style={{ marginTop: 14 }}>
                  <a href={sourceUrl} target="_blank" rel="noreferrer">
                    View workout source
                  </a>
                </p>
              )}

              <div className="dashboard-exercise-preview">
                {workout.exercises.map((exercise, index) => (
                  <div
                    key={`${exercise.exerciseId || exercise._id || index}-${index}`}
                    className="dashboard-exercise-row"
                  >
                    <div>
                      <div className="dashboard-exercise-index">
                        Exercise {index + 1}
                      </div>
                      <span className="dashboard-exercise-name">
                        {exercise.name || "Exercise"}
                      </span>
                    </div>

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
            </>
          )}
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-top">
            <div>
              <h3>Session Insights</h3>
              <p className="subtle-text" style={{ margin: "8px 0 0 0" }}>
                Most recent workout feedback and user-response metrics.
              </p>
            </div>
          </div>

          <div className="dashboard-info-list">
            <div className="dashboard-info-item">
              <span className="dashboard-info-label">Last Difficulty</span>
              <span className={difficultyBadgeClass}>
                {formatDifficultyLabel(difficultyText)}
              </span>
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
              <span className="dashboard-info-label">Enjoyment Rating</span>
              <span className="dashboard-info-value">
                {latestLog?.enjoymentRating ?? "-"}
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
        </div>
      </div>

      <div className="dashboard-panel dashboard-eval-summary" style={{ marginTop: 20 }}>
        <div className="dashboard-panel-top">
          <div>
            <h3>Recommendation Evaluation Summary</h3>
            <p className="subtle-text" style={{ margin: "8px 0 0 0" }}>
              Comparative overview of baseline and personalised workout performance.
            </p>
          </div>
          <span className="badge badge-light">{totalLogs} logs</span>
        </div>

        {totalLogs === 0 ? (
          <div className="empty-state">
            <p style={{ marginTop: 0, marginBottom: 6, fontWeight: 700 }}>
              No evaluation data recorded yet.
            </p>
            <p style={{ margin: 0 }}>
              Submit workout evaluations to compare baseline and personalised
              recommendation performance.
            </p>
          </div>
        ) : (
          <>
            <div className="dashboard-stats-grid">
              <div className="dashboard-stat-card">
                <span className="dashboard-stat-label">Personalised Completion</span>
                <span className="dashboard-stat-value">
                  {formatMetric(personalisedCompletion, "%")}
                </span>
              </div>

              <div className="dashboard-stat-card">
                <span className="dashboard-stat-label">Baseline Completion</span>
                <span className="dashboard-stat-value">
                  {formatMetric(baselineCompletion, "%")}
                </span>
              </div>

              <div className="dashboard-stat-card">
                <span className="dashboard-stat-label">
                  Personalised Avg Suitability
                </span>
                <span className="dashboard-stat-value">
                  {formatMetric(personalised?.avgSuitability)}
                </span>
              </div>

              <div className="dashboard-stat-card">
                <span className="dashboard-stat-label">
                  Baseline Avg Suitability
                </span>
                <span className="dashboard-stat-value">
                  {formatMetric(baseline?.avgSuitability)}
                </span>
              </div>
            </div>

            <div className="dashboard-info-list" style={{ marginTop: 18 }}>
              <div className="insight-highlight">
                Current Insight: {recommendationText}
              </div>

              <div className="dashboard-info-item">
                <span className="dashboard-info-label">Personalised Logs</span>
                <span className="dashboard-info-value">
                  {personalised?.totalLogs ?? 0}
                </span>
              </div>

              <div className="dashboard-info-item">
                <span className="dashboard-info-label">Baseline Logs</span>
                <span className="dashboard-info-value">{baseline?.totalLogs ?? 0}</span>
              </div>

              <div className="dashboard-info-item">
                <span className="dashboard-info-label">
                  Difficulty Match (Personalised)
                </span>
                <span className="dashboard-info-value">
                  {formatMetric(personalised?.difficultyPercentages?.just_right, "%")}
                </span>
              </div>

              <div className="dashboard-info-item">
                <span className="dashboard-info-label">
                  Difficulty Match (Baseline)
                </span>
                <span className="dashboard-info-value">
                  {formatMetric(baseline?.difficultyPercentages?.just_right, "%")}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}