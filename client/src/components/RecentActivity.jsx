import React from "react";

export default function RecentActivity({ latestLog }) {
  const recommendation = latestLog?.recommendationId;
  const workoutType = recommendation?.workoutType || "-";
  const sourceName = recommendation?.sourceName || "-";
  const sourceUrl = recommendation?.sourceUrl || "";
  const completed = latestLog == null ? "-" : latestLog.completed ? "Yes" : "No";
  const difficulty = latestLog?.difficultyFeedback || "-";
  const suitability = latestLog?.suitabilityRating ?? "-";
  const structure = latestLog?.structureRating ?? "-";
  const date = latestLog?.createdAt
    ? new Date(latestLog.createdAt).toLocaleString()
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
    <div className="page-card">
      <div className="section-header">
        <h2>🕒 Recent Activity</h2>
      </div>

      {!latestLog ? (
        <div className="empty-state">
          <p>No workout activity yet.</p>
        </div>
      ) : (
        <div className="snapshot-grid">
          <div className="snapshot-item">
            <span className="snapshot-label">Workout Type</span>
            <span className={workoutBadgeClass}>{workoutType}</span>
          </div>

          <div className="snapshot-item">
            <span className="snapshot-label">Completed</span>
            <span className={completed === "Yes" ? "badge badge-success" : "badge badge-danger"}>
              {completed}
            </span>
          </div>

          <div className="snapshot-item">
            <span className="snapshot-label">Difficulty</span>
            <span className={difficultyBadgeClass}>{difficulty}</span>
          </div>

          <div className="snapshot-item">
            <span className="snapshot-label">Suitability</span>
            <span className="snapshot-value">{suitability}</span>
          </div>

          <div className="snapshot-item">
            <span className="snapshot-label">Structure</span>
            <span className="snapshot-value">{structure}</span>
          </div>

          <div className="snapshot-item snapshot-item-wide">
            <span className="snapshot-label">Source</span>
            <span className="snapshot-value">
              {sourceName}
              {sourceUrl && (
                <>
                  {" "}
                  •{" "}
                  <a href={sourceUrl} target="_blank" rel="noreferrer">
                    View source
                  </a>
                </>
              )}
            </span>
          </div>

          <div className="snapshot-item snapshot-item-wide">
            <span className="snapshot-label">Last Workout Date</span>
            <span className="snapshot-value">{date}</span>
          </div>
        </div>
      )}
    </div>
  );
}