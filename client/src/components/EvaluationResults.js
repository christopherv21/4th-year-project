import { useEffect, useState } from "react";
import { apiFetch } from "../api";

function EvaluationResults({ refreshKey }) {
  const [summary, setSummary] = useState({ completionRate: 0, averageRating: 0, totalLogs: 0 });

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/api/feedback/summary");
        setSummary(data);
      } catch (e) {
        // if not logged in yet, ignore
      }
    })();
  }, [refreshKey]);

  return (
    <div className="card">
      <h2>📊 Evaluation Results</h2>
      <p><b>Completion Rate:</b> {summary.completionRate}%</p>
      <p><b>Average Rating:</b> {summary.averageRating}</p>
      <p><b>Total Logs:</b> {summary.totalLogs}</p>
    </div>
  );
}

export default EvaluationResults;
