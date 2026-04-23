import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api";

const formatWorkoutType = (type) => {
  if (type === "personalised") return "Personalised";
  if (type === "baseline") return "Baseline";
  return "-";
};

const formatDifficulty = (difficulty) => {
  if (difficulty === "just_right") return "Just right";
  if (difficulty === "too_easy") return "Too easy";
  if (difficulty === "too_hard") return "Too hard";
  return "-";
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString();
};

export default function WorkoutHistory({ refreshKey, token }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [openLogId, setOpenLogId] = useState(null);
  const [filter, setFilter] = useState("all");

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

  const filteredLogs = useMemo(() => {
    const meaningfulLogs = logs.filter((log) => {
      const recommendation = log?.recommendationId;
      const hasTitle = Boolean(recommendation?.title);
      const hasExercises =
        Array.isArray(recommendation?.exercises) &&
        recommendation.exercises.length > 0;

      const hasAnyMeaningfulFeedback =
        log?.completed === true ||
        log?.suitabilityRating != null ||
        log?.structureRating != null ||
        log?.enjoymentRating != null ||
        log?.difficultyFeedback ||
        log?.durationActual != null ||
        (log?.notes && String(log.notes).trim() !== "");

      return hasTitle || hasExercises || hasAnyMeaningfulFeedback;
    });

    const byStatus = meaningfulLogs.filter((log) => {
      if (filter === "completed") return log?.completed === true;
      if (filter === "incomplete") return log?.completed !== true;
      return true;
    });

    return [...byStatus].sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
    );
  }, [logs, filter]);

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

  const toggleLog = (id) => {
    setOpenLogId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="card">
      <div className="section-header">
        <p className="panel-kicker" style={{ margin: 0 }}>
          Session Logs
        </p>
      </div>

      <div className="action-row" style={{ marginTop: 0, marginBottom: 18 }}>
        <button
          type="button"
          className={filter === "all" ? "action-btn active" : "action-btn"}
          onClick={() => setFilter("all")}
        >
          All
        </button>

        <button
          type="button"
          className={filter === "completed" ? "action-btn active" : "action-btn"}
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>

        <button
          type="button"
          className={filter === "incomplete" ? "action-btn active" : "action-btn"}
          onClick={() => setFilter("incomplete")}
        >
          Incomplete
        </button>
      </div>

      {loading && <p className="status-text">Loading...</p>}
      {errMsg && <p className="status-text error-text">{errMsg}</p>}

      {!loading && !errMsg && filteredLogs.length === 0 && (
        <div className="empty-state">
          <p>No workout history to show for this filter.</p>
        </div>
      )}

      <div className="history-list">
        {filteredLogs.map((log) => {
          const recommendation = log?.recommendationId;
          const workoutType = recommendation?.workoutType || "-";
          const title = recommendation?.title || "Workout";
          const exerciseCount = recommendation?.exercises?.length || 0;
          const isOpen = openLogId === log._id;

          return (
            <div key={log._id} className="history-item">
              <div className="history-item-top compact-history-top">
                <div>
                  <p className="history-date">{formatDate(log.createdAt)}</p>
                  <h3 style={{ marginTop: 6, marginBottom: 0 }}>{title}</h3>
                </div>

                <div className="history-summary-actions">
                  <span className={getWorkoutTypeBadgeClass(workoutType)}>
                    {formatWorkoutType(workoutType)}
                  </span>

                  <button
                    type="button"
                    className="exercise-toggle-btn"
                    onClick={() => toggleLog(log._id)}
                  >
                    {isOpen ? "Hide details" : "Show details"}
                  </button>
                </div>
              </div>

              <div className="history-metrics compact-history-metrics">
                <div className="metric-pill">
                  <span className="metric-label">Completed</span>
                  <span className={log.completed ? "badge badge-success" : "badge badge-danger"}>
                    {log.completed ? "Yes" : "No"}
                  </span>
                </div>

                <div className="metric-pill">
                  <span className="metric-label">Difficulty</span>
                  <span className={getDifficultyBadgeClass(log.difficultyFeedback)}>
                    {formatDifficulty(log.difficultyFeedback)}
                  </span>
                </div>

                <div className="metric-pill">
                  <span className="metric-label">Exercises</span>
                  <span className="metric-value">{exerciseCount}</span>
                </div>

                <div className="metric-pill">
                  <span className="metric-label">Duration</span>
                  <span className="metric-value">
                    {log.durationActual != null ? `${log.durationActual} min` : "-"}
                  </span>
                </div>
              </div>

              {isOpen && (
                <div className="history-details">
                  <div className="history-metrics" style={{ marginTop: 12 }}>
                    <div className="metric-pill">
                      <span className="metric-label">Suitability</span>
                      <span className="metric-value">
                        {log.suitabilityRating != null ? `${log.suitabilityRating} / 5` : "-"}
                      </span>
                    </div>

                    <div className="metric-pill">
                      <span className="metric-label">Structure</span>
                      <span className="metric-value">
                        {log.structureRating != null ? `${log.structureRating} / 5` : "-"}
                      </span>
                    </div>

                    <div className="metric-pill">
                      <span className="metric-label">Enjoyment</span>
                      <span className="metric-value">
                        {log.enjoymentRating != null ? `${log.enjoymentRating} / 5` : "-"}
                      </span>
                    </div>

                    <div className="metric-pill">
                      <span className="metric-label">Updated</span>
                      <span className="metric-value">
                        {formatDate(log.updatedAt || log.createdAt)}
                      </span>
                    </div>
                  </div>

                  {recommendation?.sourceName && (
                    <div className="notes-box" style={{ marginTop: 12 }}>
                      <strong>Source:</strong> {recommendation.sourceName}
                    </div>
                  )}

                  {Array.isArray(recommendation?.exercises) &&
                    recommendation.exercises.length > 0 && (
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
                                  <span className="badge badge-dark">
                                    {exercise.sets} sets
                                  </span>
                                  <span className="badge badge-light">
                                    {exercise.reps} reps
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {log.notes && String(log.notes).trim() !== "" && (
                    <div className="notes-box">
                      <strong>Notes:</strong> {log.notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}