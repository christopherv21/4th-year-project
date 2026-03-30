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
  onGeneratePersonalised,
  loading = false,
}) {
  const exerciseCount = workout?.exercises?.length || 0;

  const estimatedDuration =
    workout?.exercises?.length > 0
      ? `${workout.exercises.length * 8}-${workout.exercises.length * 10} min`
      : "-";

  const workoutType = workout?.workoutType || "none";
  const sourceName = workout?.sourceName || "Rule-Based Recommendation Engine";

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
    workoutType === "personalised" ? "Personalised" : "None";

  const personalised = evaluationSummary?.personalised || null;
  const totalLogs = evaluationSummary?.overall?.totalLogs || 0;

  const handlePersonalisedClick = () => {
    if (typeof onGeneratePersonalised === "function") {
      onGeneratePersonalised();
    }
  };

  let recommendationText = "Not enough workout feedback has been recorded yet.";

  if (totalLogs > 0) {
    const completion = personalised?.completionRate ?? 0;
    const suitability = personalised?.avgSuitability ?? null;
    const justRight = personalised?.difficultyPercentages?.just_right ?? 0;

    if (completion >= 80 && justRight >= 60) {
      recommendationText =
        "The personalised recommendation logic is currently producing strong completion and difficulty-match results.";
    } else if (completion >= 60) {
      recommendationText =
        "The personalised workouts are showing promising results, with room for further tuning based on user feedback.";
    } else {
      recommendationText =
        "The logged feedback suggests the recommendation rules may need refinement to improve workout fit.";
    }

    if (suitability !== null && suitability >= 4.0) {
      recommendationText += " Suitability ratings are also trending positively.";
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
              Monitor your current workout, generate personalised lower-body plans,
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
                Start by generating and selecting a personalised lower-body workout
                plan.
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

              <p className="subtle-text" style={{ marginTop: 14, marginBottom: 0 }}>
                This workout was generated using rule-based logic based on user
                profile data and lower-body training goals.
              </p>

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
              Overview of personalised workout performance based on recorded feedback.
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
              Submit workout evaluations to track how well the recommendation
              rules are performing over time.
            </p>
          </div>
        ) : (
          <>
            <div className="dashboard-stats-grid">
              <div className="dashboard-stat-card">
                <span className="dashboard-stat-label">Completion Rate</span>
                <span className="dashboard-stat-value">
                  {formatMetric(personalised?.completionRate, "%")}
                </span>
              </div>

              <div className="dashboard-stat-card">
                <span className="dashboard-stat-label">Avg Suitability</span>
                <span className="dashboard-stat-value">
                  {formatMetric(personalised?.avgSuitability)}
                </span>
              </div>

              <div className="dashboard-stat-card">
                <span className="dashboard-stat-label">Avg Structure</span>
                <span className="dashboard-stat-value">
                  {formatMetric(personalised?.avgStructure)}
                </span>
              </div>

              <div className="dashboard-stat-card">
                <span className="dashboard-stat-label">Avg Enjoyment</span>
                <span className="dashboard-stat-value">
                  {formatMetric(personalised?.avgEnjoyment)}
                </span>
              </div>
            </div>

            <div className="dashboard-info-list" style={{ marginTop: 18 }}>
              <div className="insight-highlight">
                Current Insight: {recommendationText}
              </div>

              <div className="dashboard-info-item">
                <span className="dashboard-info-label">Total Logged Sessions</span>
                <span className="dashboard-info-value">
                  {personalised?.totalLogs ?? 0}
                </span>
              </div>

              <div className="dashboard-info-item">
                <span className="dashboard-info-label">Completed Sessions</span>
                <span className="dashboard-info-value">
                  {personalised?.completedCount ?? 0}
                </span>
              </div>

              <div className="dashboard-info-item">
                <span className="dashboard-info-label">Difficulty Match</span>
                <span className="dashboard-info-value">
                  {formatMetric(personalised?.difficultyPercentages?.just_right, "%")}
                </span>
              </div>

              <div className="dashboard-info-item">
                <span className="dashboard-info-label">Average Duration</span>
                <span className="dashboard-info-value">
                  {formatMetric(personalised?.avgDurationActual, " min")}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}