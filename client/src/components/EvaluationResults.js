import { useEffect, useState } from "react";
import { apiFetch } from "../api";

function EvaluationResults({ refreshKey, token }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      if (!token) return;

      setLoading(true);
      setErrMsg("");

      try {
        const data = await apiFetch("/api/workout-logs", { token });
        setLogs(Array.isArray(data) ? data : []);
      } catch (e) {
        setErrMsg(e?.message || "Failed to load evaluation results");
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [refreshKey, token]);

  const calculateMetrics = () => {
    if (!logs.length) return null;

    const personalisedLogs = logs.filter(
      (log) => log.recommendationId?.workoutType === "personalised"
    );

    const baselineLogs = logs.filter(
      (log) => log.recommendationId?.workoutType === "baseline"
    );

    const average = (arr, field) => {
      const values = arr
        .map((item) => item[field])
        .filter((value) => typeof value === "number");

      if (!values.length) return null;

      const total = values.reduce((sum, value) => sum + value, 0);
      return total / values.length;
    };

    const completionRate = (arr) => {
      if (!arr.length) return 0;
      const completedCount = arr.filter((item) => item.completed).length;
      return completedCount / arr.length;
    };

    const difficultyBreakdown = (arr) => {
      const counts = {
        too_easy: 0,
        just_right: 0,
        too_hard: 0,
      };

      arr.forEach((item) => {
        if (item.difficultyFeedback && counts[item.difficultyFeedback] !== undefined) {
          counts[item.difficultyFeedback] += 1;
        }
      });

      return counts;
    };

    return {
      totals: {
        totalLogs: logs.length,
        completionRate: completionRate(logs),
      },
      personalised: {
        totalLogs: personalisedLogs.length,
        completionRate: completionRate(personalisedLogs),
        avgSuitability: average(personalisedLogs, "suitabilityRating"),
        avgStructure: average(personalisedLogs, "structureRating"),
        difficulty: difficultyBreakdown(personalisedLogs),
      },
      baseline: {
        totalLogs: baselineLogs.length,
        completionRate: completionRate(baselineLogs),
        avgSuitability: average(baselineLogs, "suitabilityRating"),
        avgStructure: average(baselineLogs, "structureRating"),
        difficulty: difficultyBreakdown(baselineLogs),
      },
    };
  };

  const metrics = calculateMetrics();

  const pct = (x) => `${Math.round((x || 0) * 100)}%`;
  const fmt = (n) => (n != null ? Number(n).toFixed(2) : "-");

  const difficultyBadge = (label, value, type) => {
    let className = "badge badge-light";

    if (type === "success") className = "badge badge-success";
    if (type === "warning") className = "badge badge-warning";
    if (type === "danger") className = "badge badge-danger";

    return (
      <div className="difficulty-row">
        <span>{label}</span>
        <span className={className}>{value}</span>
      </div>
    );
  };

  return (
    <div className="card">
      <div className="section-header">
        <h2>📊 Evaluation Results</h2>
      </div>

      {loading && <p className="status-text">Loading...</p>}
      {errMsg && <p className="status-text error-text">{errMsg}</p>}

      {!loading && !metrics && !errMsg && (
        <div className="empty-state">
          <p>No metrics yet — submit workout feedback to generate evaluation results.</p>
        </div>
      )}

      {!loading && metrics && (
        <div className="evaluation-layout">
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Total Logs</span>
              <span className="stat-value">{metrics.totals.totalLogs}</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Overall Completion</span>
              <span className="stat-value">{pct(metrics.totals.completionRate)}</span>
            </div>
          </div>

          <div className="comparison-grid">
            <div className="summary-card">
              <div className="summary-card-top">
                <h3>Personalised Workouts</h3>
                <span className="badge badge-dark">personalised</span>
              </div>

              <div className="summary-lines">
                <p><strong>Total Logs:</strong> {metrics.personalised.totalLogs}</p>
                <p><strong>Completion Rate:</strong> {pct(metrics.personalised.completionRate)}</p>
                <p><strong>Average Suitability:</strong> {fmt(metrics.personalised.avgSuitability)}</p>
                <p><strong>Average Structure:</strong> {fmt(metrics.personalised.avgStructure)}</p>
              </div>

              <div className="difficulty-box">
                <h4>Difficulty Breakdown</h4>
                {difficultyBadge("Too Easy", metrics.personalised.difficulty.too_easy, "warning")}
                {difficultyBadge("Just Right", metrics.personalised.difficulty.just_right, "success")}
                {difficultyBadge("Too Hard", metrics.personalised.difficulty.too_hard, "danger")}
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-card-top">
                <h3>Baseline Workouts</h3>
                <span className="badge badge-outline">baseline</span>
              </div>

              <div className="summary-lines">
                <p><strong>Total Logs:</strong> {metrics.baseline.totalLogs}</p>
                <p><strong>Completion Rate:</strong> {pct(metrics.baseline.completionRate)}</p>
                <p><strong>Average Suitability:</strong> {fmt(metrics.baseline.avgSuitability)}</p>
                <p><strong>Average Structure:</strong> {fmt(metrics.baseline.avgStructure)}</p>
              </div>

              <div className="difficulty-box">
                <h4>Difficulty Breakdown</h4>
                {difficultyBadge("Too Easy", metrics.baseline.difficulty.too_easy, "warning")}
                {difficultyBadge("Just Right", metrics.baseline.difficulty.just_right, "success")}
                {difficultyBadge("Too Hard", metrics.baseline.difficulty.too_hard, "danger")}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EvaluationResults;