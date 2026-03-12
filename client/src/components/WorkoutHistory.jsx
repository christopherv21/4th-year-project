import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function WorkoutHistory({ refreshKey, token }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!token) return;

      setLoading(true);
      setErrMsg("");

      try {
        const data = await apiFetch("/api/workout-logs", { token });
        setLogs(Array.isArray(data) ? data : []);
      } catch (e) {
        setErrMsg(e?.message || "Failed to load history");
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [refreshKey, token]);

  const getWorkoutTypeBadgeClass = (type) => {
    if (type === "personalised") return "badge badge-dark";
    if (type === "baseline") return "badge badge-outline";
    return "badge badge-light";
  };

  const getDifficultyBadgeClass = (difficulty) => {
    if (difficulty === "just_right") return "badge badge-success";
    if (difficulty === "too_easy") return "badge badge-warning";
    if (difficulty === "too_hard") return "badge badge-danger";
    return "badge badge-light";
  };

  return (
    <div className="card">
      <div className="section-header">
        <h2>🗓️ Workout History</h2>
      </div>

      {loading && <p className="status-text">Loading...</p>}
      {errMsg && <p className="status-text error-text">{errMsg}</p>}

      {!loading && !errMsg && logs.length === 0 && (
        <div className="empty-state">
          <p>No workout logs yet — submit feedback to create your first entry.</p>
        </div>
      )}

      <div className="history-list">
        {logs.map((log) => {
          const recommendation = log.recommendationId;
          const workoutType = recommendation?.workoutType || "-";
          const sourceName = recommendation?.sourceName || "-";
          const sourceUrl = recommendation?.sourceUrl || "";
          const title = recommendation?.title || "Workout";

          return (
            <div key={log._id} className="history-item">
              <div className="history-item-top">
                <div>
                  <p className="history-date">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                  <h3 style={{ marginTop: 6 }}>{title}</h3>
                </div>

                <span className={getWorkoutTypeBadgeClass(workoutType)}>
                  {workoutType}
                </span>
              </div>

              <div className="history-metrics">
                <div className="metric-pill">
                  <span className="metric-label">Completed</span>
                  <span className={log.completed ? "badge badge-success" : "badge badge-danger"}>
                    {log.completed ? "Yes" : "No"}
                  </span>
                </div>

                <div className="metric-pill">
                  <span className="metric-label">Suitability</span>
                  <span className="metric-value">{log.suitabilityRating ?? "-"}</span>
                </div>

                <div className="metric-pill">
                  <span className="metric-label">Structure</span>
                  <span className="metric-value">{log.structureRating ?? "-"}</span>
                </div>

                <div className="metric-pill">
                  <span className="metric-label">Difficulty</span>
                  <span className={getDifficultyBadgeClass(log.difficultyFeedback)}>
                    {log.difficultyFeedback || "-"}
                  </span>
                </div>
              </div>

              <div className="notes-box" style={{ marginTop: 12 }}>
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
              </div>

              {recommendation?.exercises?.length > 0 && (
                <div className="history-exercises">
                  <h4>Exercises</h4>
                  <div className="exercise-list compact">
                    {recommendation.exercises.map((exercise, index) => (
                      <div
                        key={`${exercise.exerciseId || exercise._id || index}-${index}`}
                        className="exercise-item"
                      >
                        <div className="exercise-item-top">
                          <h3>{exercise.name}</h3>
                          <div className="exercise-badges">
                            <span className="badge badge-dark">{exercise.sets} sets</span>
                            <span className="badge badge-light">{exercise.reps} reps</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {log.notes && (
                <div className="notes-box">
                  <strong>Notes:</strong> {log.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}