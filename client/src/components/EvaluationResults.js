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
        const data = await apiFetch("/api/workout-logs/evaluation-summary", {
          token,
        });
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

  let systemInsight = "Not enough data yet to assess recommendation quality.";
  let performanceLabel = "Limited evidence";

  if (totalLogs > 0) {
    const completion = personalised?.completionRate ?? 0;
    const suitability = personalised?.avgSuitability ?? null;
    const enjoyment = personalised?.avgEnjoyment ?? null;
    const justRight = personalised?.difficultyPercentages?.just_right ?? 0;

    if (completion >= 80 && justRight >= 60) {
      performanceLabel = "Strong performance";
      systemInsight =
        "The recommendation rules are currently producing strong completion and difficulty-match results.";
    } else if (completion >= 60) {
      performanceLabel = "Promising performance";
      systemInsight =
        "The recommendation rules are producing promising results, although more user feedback would help refine workout fit further.";
    } else {
      performanceLabel = "Needs refinement";
      systemInsight =
        "The recorded sessions suggest the recommendation rules may need further tuning to improve workout suitability.";
    }

    if (suitability !== null && suitability >= 4) {
      systemInsight += " Suitability ratings are also trending positively.";
    }

    if (enjoyment !== null && enjoyment >= 4) {
      systemInsight += " Enjoyment scores indicate a positive user response.";
    }
  }

  return (
    <div>
      {loading && <p className="status-text">Loading evaluation results...</p>}

      {errMsg && <p className="status-text error-text">{errMsg}</p>}

      {!loading && !errMsg && totalLogs === 0 && (
        <div className="empty-state">
          <p style={{ marginTop: 0, marginBottom: 6, fontWeight: 700 }}>
            No evaluation data recorded yet.
          </p>
          <p style={{ margin: 0 }}>
            Submit workout feedback to generate recommendation performance
            results.
          </p>
        </div>
      )}

      {!loading && !errMsg && totalLogs > 0 && (
        <div className="evaluation-layout">
          <div className="activity-highlight">
            <div className="activity-highlight-top">
              <span className="activity-highlight-label">
                Recommendation Performance
              </span>
              <span className="badge badge-success">{performanceLabel}</span>
            </div>

            <h3 className="activity-highlight-title">Evaluation Summary</h3>

            <p className="activity-highlight-text">
              {systemInsight}
            </p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Total Logs</span>
              <span className="stat-value">{totalLogs}</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Completion Rate</span>
              <span className="stat-value">
                {fmt(personalised?.completionRate, "%")}
              </span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Avg Suitability</span>
              <span className="stat-value">
                {fmt(personalised?.avgSuitability)}
              </span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Difficulty Match</span>
              <span className="stat-value">
                {fmt(personalised?.difficultyPercentages?.just_right, "%")}
              </span>
            </div>
          </div>

          <div className="comparison-grid">
            <div className="summary-card">
              <div className="summary-card-top">
                <h3>Personalised Workout Performance</h3>
                <span className="badge badge-dark">Personalised</span>
              </div>

              <div className="summary-lines">
                <p>
                  <strong>Total Logs:</strong> {personalised?.totalLogs ?? 0}
                </p>
                <p>
                  <strong>Completed Sessions:</strong>{" "}
                  {personalised?.completedCount ?? 0}
                </p>
                <p>
                  <strong>Completion Rate:</strong>{" "}
                  {fmt(personalised?.completionRate, "%")}
                </p>
                <p>
                  <strong>Average Suitability:</strong>{" "}
                  {fmt(personalised?.avgSuitability)}
                </p>
                <p>
                  <strong>Average Structure:</strong>{" "}
                  {fmt(personalised?.avgStructure)}
                </p>
                <p>
                  <strong>Average Enjoyment:</strong>{" "}
                  {fmt(personalised?.avgEnjoyment)}
                </p>
                <p>
                  <strong>Average Duration:</strong>{" "}
                  {fmt(personalised?.avgDurationActual, " min")}
                </p>
              </div>

              <div className="difficulty-box">
                <h4>Difficulty Breakdown</h4>

                {difficultyBadge(
                  "Too Easy",
                  `${personalised?.difficultyCounts?.too_easy ?? 0} (${
                    personalised?.difficultyPercentages?.too_easy ?? 0
                  }%)`,
                  "warning"
                )}

                {difficultyBadge(
                  "Just Right",
                  `${personalised?.difficultyCounts?.just_right ?? 0} (${
                    personalised?.difficultyPercentages?.just_right ?? 0
                  }%)`,
                  "success"
                )}

                {difficultyBadge(
                  "Too Hard",
                  `${personalised?.difficultyCounts?.too_hard ?? 0} (${
                    personalised?.difficultyPercentages?.too_hard ?? 0
                  }%)`,
                  "danger"
                )}
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-card-top">
                <h3>System Interpretation</h3>
                <span className="badge badge-light">Rule-Based</span>
              </div>

              <div className="summary-lines">
                <p>
                  <strong>Main Insight:</strong> {systemInsight}
                </p>
                <p>
                  <strong>Interpretation:</strong> These results summarise how
                  well the personalised recommendation logic is matching user
                  needs based on completion, suitability, enjoyment, structure,
                  and perceived difficulty.
                </p>
                <p>
                  <strong>Research Value:</strong> This supports the evaluation
                  of whether the personalised system is producing workouts that
                  are practical, appropriate, and positively received by users.
                </p>
              </div>

              <div className="difficulty-box">
                <h4>Key Signals</h4>
                <div className="difficulty-row">
                  <span>Completion</span>
                  <span className="badge badge-light">
                    {fmt(personalised?.completionRate, "%")}
                  </span>
                </div>
                <div className="difficulty-row">
                  <span>Suitability</span>
                  <span className="badge badge-light">
                    {fmt(personalised?.avgSuitability)}
                  </span>
                </div>
                <div className="difficulty-row">
                  <span>Enjoyment</span>
                  <span className="badge badge-light">
                    {fmt(personalised?.avgEnjoyment)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EvaluationResults;