import { useEffect, useState } from "react";
import { apiFetch } from "../api";

function EvaluationResults({ refreshKey, token }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!token) return;

      setLoading(true);
      setErrMsg("");

      try {
        const data = await apiFetch("/api/workouts/metrics", { token }); // ✅ pass token
        setMetrics(data);
      } catch (e) {
        console.error("Failed to load metrics", e);
        setErrMsg(e?.message || "Failed to load metrics");
        setMetrics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [refreshKey, token]);

  return (
    <div className="card">
      <h2>📊 Evaluation Results</h2>

      {loading && <p>Loading...</p>}
      {errMsg && <p style={{ color: "red" }}>{errMsg}</p>}

      {!loading && !metrics && !errMsg && <p>No metrics yet — submit feedback once to create your first log.</p>}

      {!loading && metrics && (
        (() => {
          const personalised = metrics?.personalised || {};
          const baseline = metrics?.baseline || {};
          const totals = metrics?.totals || {};

          const pct = (x) => `${Math.round((x || 0) * 100)}%`;
          const fmt = (n) =>
            n === 0 ? "0.00" : n != null ? Number(n).toFixed(2) : "-";

          return (
            <>
              {/* -------- Overall -------- */}
              <h3>Overall</h3>
              <p>
                <b>Completion Rate:</b> {pct(totals.completionRate)}
              </p>
              <p>
                <b>Total Logs:</b> {totals.totalLogs ?? 0}
              </p>

              {/* -------- Personalised -------- */}
              <h3>Personalised Recommendation</h3>
              <p>
                <b>Completion Rate:</b> {pct(personalised.completionRate)}
              </p>
              <p>
                <b>Average Rating:</b> {fmt(personalised.avgRating)}
              </p>
              <p>
                <b>Total Logs:</b> {personalised.totalLogs ?? 0}
              </p>

              {/* -------- Baseline -------- */}
              <h3>Baseline Recommendation</h3>
              <p>
                <b>Completion Rate:</b> {pct(baseline.completionRate)}
              </p>
              <p>
                <b>Average Rating:</b> {fmt(baseline.avgRating)}
              </p>
              <p>
                <b>Total Logs:</b> {baseline.totalLogs ?? 0}
              </p>
            </>
          );
        })()
      )}
    </div>
  );
}

export default EvaluationResults;