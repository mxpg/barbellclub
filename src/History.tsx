import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function fmtDateShort(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function History() {
  const all = useQuery(api.workouts.getAll) || [];
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  })();

  const grouped: Record<string, typeof all> = {};
  all.forEach((ex) => {
    if (ex.date === today) return;
    if (!grouped[ex.date]) grouped[ex.date] = [];
    grouped[ex.date].push(ex);
  });
  const dates = Object.keys(grouped).sort().reverse();

  return (
    <>
      <div className="section-title">
        <span className="section-num">03</span> HISTORY
      </div>

      {dates.length === 0 ? (
        <div className="empty">No previous workouts yet.</div>
      ) : (
        dates.map((date) => {
          const items = grouped[date];
          const vol = items.reduce((s, x) => s + x.totalVolume, 0);
          const cals = items.reduce((s, x) => s + x.estimatedCalories, 0);
          const focuses = [...new Set(items.map((x) => x.focus).filter(Boolean))].join(" · ");

          return (
            <div className="history-day" key={date}>
              <div
                className="history-head"
                onClick={() => setOpen((o) => ({ ...o, [date]: !o[date] }))}
              >
                <div className="history-date">{fmtDateShort(date)}</div>
                <div className="ex-meta" style={{ marginTop: 0 }}>{focuses || "—"}</div>
                <div className="history-totals">
                  <strong>{vol.toLocaleString()}</strong> lbs<br/>
                  {cals.toLocaleString()} kcal · {items.length} ex
                </div>
              </div>
              <div className={`history-body ${open[date] ? "open" : ""}`}>
                {items.map((ex) => (
                  <div className="exercise-item" key={ex._id}>
                    <div>
                      <div className="ex-head">{ex.name}</div>
                      <div className="ex-meta">
                        {ex.type === "strength" ? "STRENGTH" : "AEROBIC"} · {ex.focus || "No focus"}
                      </div>
                      <div className="ex-detail">
                        {ex.type === "strength" && ex.sets
                          ? ex.sets.map((s, i) => (
                              <span key={i} className="pill">
                                SET {i+1}: {s.reps}× {s.weight}{ex.weightUnit || "lbs"}
                              </span>
                            ))
                          : (<><span className="pill">{ex.duration} min</span><span className="pill">{(ex.intensity || "").toUpperCase()}</span></>)
                        }
                      </div>
                    </div>
                    <div className="ex-stats">
                      {ex.type === "strength" && (
                        <>
                          <div className="big">{ex.totalVolume.toLocaleString()}</div>
                          <div className="lbl">lbs moved</div>
                        </>
                      )}
                      {ex.estimatedCalories > 0 && (
                        <>
                          <div className="big" style={{ marginTop: ex.type === "strength" ? 12 : 0 }}>
                            {ex.estimatedCalories}
                          </div>
                          <div className="lbl">kcal</div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </>
  );
}
