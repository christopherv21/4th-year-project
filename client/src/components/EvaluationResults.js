import { useEffect, useState } from "react";
import { apiFetch } from "../api";

function EvaluationResults({ refreshKey, token }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      if (!token) return;

      setLoading(true);
      setErrMsg("");

      try {
        const data = await apiFetch("/api/workout-logs/evaluation-summary", { token });
        setSummary(data || null);
      } catch (e) {
        setErrMsg(e?.message || "Failed to load evaluation results");
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [refreshKey, token]);

  const fmt = (value, suffix = "") => {
    if (value === null || value === undefined) return "-";
    return `${value}${suffix}`;
  };

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

  const totalLogs = summary?.overall?.totalLogs || 0;
  const personalised = summary?.personalised || null;
  const baseline = summary?.baseline || null;

  const overallCompletionRate =
    totalLogs > 0 && personalised && baseline
      ? Math.round(
          (((personalised.completedCount || 0) + (baseline.completedCount || 0)) / totalLogs) *
            100
        )
      : 0;

  return (
    <div className="card">
      <div className="section-header">
        <h2>📊 Detailed Evaluation Results</h2>
      </div>

      {loading && <p className="status-text">Loading...</p>}
      {errMsg && <p className="status-text error-text">{errMsg}</p>}

      {!loading && !errMsg && totalLogs === 0 && (
        <div className="empty-state">
          <p>No metrics yet — submit workout feedback to generate evaluation results.</p>
        </div>
      )}

      {!loading && !errMsg && totalLogs > 0 && (
        <div className="evaluation-layout">
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Total Logs</span>
              <span className="stat-value">{totalLogs}</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Overall Completion</span>
              <span className="stat-value">{overallCompletionRate}%</span>
            </div>
          </div>

          <div className="comparison-grid">
            <div className="summary-card">
              <div className="summary-card-top">
                <h3>Personalised Workouts</h3>
                <span className="badge badge-dark">personalised</span>
              </div>

              <div className="summary-lines">
                <p><strong>Total Logs:</strong> {personalised?.totalLogs ?? 0}</p>
                <p><strong>Completion Rate:</strong> {fmt(personalised?.completionRate, "%")}</p>
                <p><strong>Average Suitability:</strong> {fmt(personalised?.avgSuitability)}</p>
                <p><strong>Average Structure:</strong> {fmt(personalised?.avgStructure)}</p>
                <p><strong>Average Enjoyment:</strong> {fmt(personalised?.avgEnjoyment)}</p>
                <p><strong>Average Duration:</strong> {fmt(personalised?.avgDurationActual, " min")}</p>
              </div>

              <div className="difficulty-box">
                <h4>Difficulty Breakdown</h4>
                {difficultyBadge(
                  "Too Easy",
                  `${personalised?.difficultyCounts?.too_easy ?? 0} (${personalised?.difficultyPercentages?.too_easy ?? 0}%)`,
                  "warning"
                )}
                {difficultyBadge(
                  "Just Right",
                  `${personalised?.difficultyCounts?.just_right ?? 0} (${personalised?.difficultyPercentages?.just_right ?? 0}%)`,
                  "success"
                )}
                {difficultyBadge(
                  "Too Hard",
                  `${personalised?.difficultyCounts?.too_hard ?? 0} (${personalised?.difficultyPercentages?.too_hard ?? 0}%)`,
                  "danger"
                )}
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-card-top">
                <h3>Baseline Workouts</h3>
                <span className="badge badge-outline">baseline</span>
              </div>

              <div className="summary-lines">
                <p><strong>Total Logs:</strong> {baseline?.totalLogs ?? 0}</p>
                <p><strong>Completion Rate:</strong> {fmt(baseline?.completionRate, "%")}</p>
                <p><strong>Average Suitability:</strong> {fmt(baseline?.avgSuitability)}</p>
                <p><strong>Average Structure:</strong> {fmt(baseline?.avgStructure)}</p>
                <p><strong>Average Enjoyment:</strong> {fmt(baseline?.avgEnjoyment)}</p>
                <p><strong>Average Duration:</strong> {fmt(baseline?.avgDurationActual, " min")}</p>
              </div>

              <div className="difficulty-box">
                <h4>Difficulty Breakdown</h4>
                {difficultyBadge(
                  "Too Easy",
                  `${baseline?.difficultyCounts?.too_easy ?? 0} (${baseline?.difficultyPercentages?.too_easy ?? 0}%)`,
                  "warning"
                )}
                {difficultyBadge(
                  "Just Right",
                  `${baseline?.difficultyCounts?.just_right ?? 0} (${baseline?.difficultyPercentages?.just_right ?? 0}%)`,
                  "success"
                )}
                {difficultyBadge(
                  "Too Hard",
                  `${baseline?.difficultyCounts?.too_hard ?? 0} (${baseline?.difficultyPercentages?.too_hard ?? 0}%)`,
                  "danger"
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EvaluationResults;