import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function PRs() {
  const prs = useQuery(api.prs.getMyPRs) || [];

  return (
    <>
      <div className="section-title">
        <span className="section-num">04</span> PERSONAL RECORDS
      </div>
      {prs.length === 0 ? (
        <div className="empty">Log strength workouts to start building your PR board.</div>
      ) : (
        <div className="pr-grid">
          {prs.map((pr) => (
            <div key={pr._id} className="pr-card">
              <div className="pr-name">{pr.exerciseName}</div>
              <div className="pr-stats">
                <div className="pr-stat">
                  <div className="num">{pr.maxWeight}</div>
                  <div className="lbl">Max Weight</div>
                </div>
                <div className="pr-stat">
                  <div className="num">{pr.maxReps}</div>
                  <div className="lbl">Max Reps</div>
                </div>
                <div className="pr-stat">
                  <div className="num">{pr.maxVolume.toLocaleString()}</div>
                  <div className="lbl">Max Volume</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
