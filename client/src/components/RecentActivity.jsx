import React from "react";

const formatDifficultyLabel = (value) => {
  if (value === "just_right") return "Just right";
  if (value === "too_easy") return "Too easy";
  if (value === "too_hard") return "Too hard";
  return "-";
};

const formatWorkoutType = (value) => {
  if (!value) return "-";
  if (value === "personalised") return "Personalised";
  if (value === "baseline") return "Online Workout";
  return value;
};

export default function RecentActivity({ latestLog }) {
  const recommendation = latestLog?.recommendationId;

  const workoutType = recommendation?.workoutType || "-";
  const sourceName = recommendation?.sourceName || "-";
  const completed =
    latestLog == null ? "-" : latestLog.completed ? "Completed" : "Not completed";

  const difficulty = latestLog?.difficultyFeedback || "-";
  const duration = latestLog?.durationActual ?? "-";

  const date = latestLog?.createdAt
    ? new Date(latestLog.createdAt).toLocaleDateString()
    : "-";

  const difficultyBadgeClass =
    difficulty === "just_right"
      ? "badge badge-success"
      : difficulty === "too_easy"
      ? "badge badge-warning"
      : difficulty === "too_hard"
      ? "badge badge-danger"
      : "badge badge-light";

  const workoutBadgeClass =
    workoutType === "personalised"
      ? "badge badge-dark"
      : workoutType === "baseline"
      ? "badge badge-outline"
      : "badge badge-light";

  return (
    <div>
      {!latestLog ? (
        <div className="empty-state">
          <p style={{ marginTop: 0, marginBottom: 6, fontWeight: 700 }}>
            No recent activity yet.
          </p>
          <p style={{ margin: 0 }}>
            Submit a workout evaluation to show your latest activity here.
          </p>
        </div>
      ) : (
        <>
          <div className="activity-highlight">
            <div className="activity-highlight-top">
              <span className="activity-highlight-label">Recent Activity</span>
              <span className={workoutBadgeClass}>
                {formatWorkoutType(workoutType)}
              </span>
            </div>

            <h3 className="activity-highlight-title">{completed}</h3>

            <p className="activity-highlight-text">
              {date} • {sourceName}
            </p>
          </div>

          <div className="snapshot-grid" style={{ marginTop: 16 }}>
            <div className="snapshot-item">
              <span className="snapshot-label">Difficulty</span>
              <span className={difficultyBadgeClass}>
                {formatDifficultyLabel(difficulty)}
              </span>
            </div>

            <div className="snapshot-item">
              <span className="snapshot-label">Duration</span>
              <span className="snapshot-value">
                {duration === "-" ? "-" : `${duration} min`}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}