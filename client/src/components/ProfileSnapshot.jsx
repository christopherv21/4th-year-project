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

const formatLabel = (value) => {
  if (!value) return "-";
  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function ProfileSnapshot({ profile }) {
  const hasProfile = Boolean(profile);

  const systemInterpretation =
    profile?.injury && profile.injury !== "none"
      ? "Constraint-aware recommendation enabled"
      : "Standard personalised recommendation enabled";

  const profileSummary = hasProfile
    ? `${formatLabel(profile.fitnessLevel)} • ${formatLabel(profile.goal)}`
    : "Profile not set";

  return (
    <div>
      {!hasProfile ? (
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

            <h3 className="snapshot-highlight-title">{profileSummary}</h3>

            <p className="snapshot-highlight-text">
              Your profile is actively shaping workout volume, exercise count,
              training focus, and recommendation suitability.
            </p>
          </div>

          <div className="snapshot-grid" style={{ marginTop: 16 }}>
            <div className="snapshot-item">
              <span className="snapshot-label">Fitness Level</span>
              <span className="badge badge-dark">
                {formatLabel(profile.fitnessLevel)}
              </span>
            </div>

            <div className="snapshot-item">
              <span className="snapshot-label">Goal</span>
              <span className="badge badge-light">
                {formatLabel(profile.goal)}
              </span>
            </div>

            <div className="snapshot-item">
              <span className="snapshot-label">Equipment</span>
              <span className="badge badge-outline">
                {formatLabel(profile.equipment)}
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
              <span className="snapshot-value">{systemInterpretation}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}