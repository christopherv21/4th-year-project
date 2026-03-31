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
  const sourceUrl = recommendation?.sourceUrl || "";

  const completed =
    latestLog == null ? "-" : latestLog.completed ? "Completed" : "Not completed";

  const difficulty = latestLog?.difficultyFeedback || "-";
  const suitability = latestLog?.suitabilityRating ?? "-";
  const structure = latestLog?.structureRating ?? "-";
  const enjoyment = latestLog?.enjoymentRating ?? "-";
  const duration = latestLog?.durationActual ?? "-";

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
    <div>
      {!latestLog ? (
        <div className="empty-state">
          <p style={{ marginTop: 0, marginBottom: 6, fontWeight: 700 }}>
            No workout activity recorded yet.
          </p>
          <p style={{ margin: 0 }}>
            Complete and submit a workout to generate your first performance
            summary.
          </p>
        </div>
      ) : (
        <>
          <div className="activity-highlight">
            <div className="activity-highlight-top">
              <span className="activity-highlight-label">Latest Workout</span>
              <span className={workoutBadgeClass}>
                {formatWorkoutType(workoutType)}
              </span>
            </div>

            <h3 className="activity-highlight-title">{completed}</h3>

            <p className="activity-highlight-text">
              {completed === "Completed"
                ? "Your most recent session was completed and recorded successfully."
                : "Your most recent session was logged but not completed."}
            </p>
          </div>

          <div className="snapshot-grid" style={{ marginTop: 16 }}>
            <div className="snapshot-item">
              <span className="snapshot-label">Difficulty Feedback</span>
              <span className={difficultyBadgeClass}>
                {formatDifficultyLabel(difficulty)}
              </span>
            </div>

            <div className="snapshot-item">
              <span className="snapshot-label">Suitability</span>
              <span className="snapshot-value">{suitability} / 5</span>
            </div>

            <div className="snapshot-item">
              <span className="snapshot-label">Structure</span>
              <span className="snapshot-value">{structure} / 5</span>
            </div>

            <div className="snapshot-item">
              <span className="snapshot-label">Enjoyment</span>
              <span className="snapshot-value">{enjoyment} / 5</span>
            </div>

            <div className="snapshot-item">
              <span className="snapshot-label">Duration</span>
              <span className="snapshot-value">
                {duration === "-" ? "-" : `${duration} min`}
              </span>
            </div>

            <div className="snapshot-item snapshot-item-wide">
              <span className="snapshot-label">Workout Source</span>
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
              <span className="snapshot-label">Date & Time</span>
              <span className="snapshot-value">{date}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}