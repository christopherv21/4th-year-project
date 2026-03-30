import React from "react";

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  return value;
};

const formatInjury = (injury) => {
  if (!injury || injury === "none") return "None";
  if (injury === "knee") return "Knee";
  if (injury === "back") return "Back";
  return injury;
};

export default function ProfileSnapshot({ profile }) {
  return (
    <div className="page-card">
      <div className="section-header">
        <div>
          <h2>👤 Athlete Profile</h2>
          <p className="subtle-text" style={{ margin: "8px 0 0 0" }}>
            Current user attributes used by the recommendation engine.
          </p>
        </div>
      </div>

      {!profile ? (
        <div className="empty-state">
          <p style={{ marginTop: 0, marginBottom: 6, fontWeight: 700 }}>
            No profile data available yet.
          </p>
          <p style={{ margin: 0 }}>
            Complete your profile setup so the system can generate personalised
            lower-body workouts.
          </p>
        </div>
      ) : (
        <>
          <div className="snapshot-highlight">
            <div className="snapshot-highlight-top">
              <span className="snapshot-highlight-label">Recommendation Status</span>
              <span className="badge badge-success">Profile Active</span>
            </div>

            <h3 className="snapshot-highlight-title">
              {formatValue(profile.fitnessLevel)} / {formatValue(profile.goal)}
            </h3>

            <p className="snapshot-highlight-text">
              The recommendation engine is currently using your selected profile
              attributes to shape workout difficulty, structure, and suitability.
            </p>
          </div>

          <div className="snapshot-grid" style={{ marginTop: 16 }}>
            <div className="snapshot-item">
              <span className="snapshot-label">Fitness Level</span>
              <span className="badge badge-dark">
                {formatValue(profile.fitnessLevel)}
              </span>
            </div>

            <div className="snapshot-item">
              <span className="snapshot-label">Goal</span>
              <span className="badge badge-light">{formatValue(profile.goal)}</span>
            </div>

            <div className="snapshot-item">
              <span className="snapshot-label">Equipment</span>
              <span className="badge badge-outline">
                {formatValue(profile.equipment)}
              </span>
            </div>

            <div className="snapshot-item">
              <span className="snapshot-label">Age</span>
              <span className="snapshot-value">{formatValue(profile.age)}</span>
            </div>

            <div className="snapshot-item">
              <span className="snapshot-label">Injury Status</span>
              <span className="snapshot-value">{formatInjury(profile.injury)}</span>
            </div>

            <div className="snapshot-item snapshot-item-wide">
              <span className="snapshot-label">System Interpretation</span>
              <span className="snapshot-value">
                {profile.injury && profile.injury !== "none"
                  ? "Constraint-aware recommendation enabled"
                  : "Standard personalised recommendation enabled"}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}