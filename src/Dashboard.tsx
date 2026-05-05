import { useState, FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

const FOCUS_OPTIONS = [
  "Arms", "Legs", "Upper Body", "Lower Body", "Back", "Chest",
  "Shoulders", "Core", "Push", "Pull", "Full Body", "Cardio", "Mobility",
];

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function fmtDateLong(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m-1, d).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric"
  });
}

export default function Dashboard() {
  const date = todayKey();
  const exercises = useQuery(api.workouts.getByDate, { date }) || [];
  const addExercise = useMutation(api.workouts.addExercise);
  const deleteExercise = useMutation(api.workouts.deleteExercise);

  const [type, setType] = useState<"strength" | "aerobic">("strength");
  const [numSets, setNumSets] = useState(0);
  const [weightUnit, setWeightUnit] = useState<"lbs" | "kg">("lbs");
  const [toast, setToast] = useState<string | null>(null);

  function showToast(m: string) {
    setToast(m);
    setTimeout(() => setToast(null), 2200);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    const focus = String(fd.get("focus") || "");

    if (!name) return showToast("Enter exercise name");

    try {
      if (type === "strength") {
        if (numSets === 0) return showToast("Select number of sets");
        const sets = [];
        for (let i = 1; i <= numSets; i++) {
          sets.push({
            reps: Number(fd.get(`reps_${i}`)) || 0,
            weight: Number(fd.get(`weight_${i}`)) || 0,
            intensity: String(fd.get(`intensity_${i}`) || "") || undefined,
          });
        }
        await addExercise({
          date, name, focus: focus || undefined, type: "strength",
          weightUnit, sets,
        });
      } else {
        const duration = Number(fd.get("duration")) || 0;
        const intensity = String(fd.get("intensity") || "");
        if (!duration) return showToast("Enter duration");
        if (!intensity) return showToast("Select intensity");
        await addExercise({
          date, name, focus: focus || undefined, type: "aerobic",
          duration, intensity,
        });
      }

      e.currentTarget.reset();
      setNumSets(0);
      showToast("Exercise logged");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error");
    }
  }

  const totalVolume = exercises.reduce((s, e) => s + e.totalVolume, 0);
  const totalCals = exercises.reduce((s, e) => s + e.estimatedCalories, 0);

  return (
    <>
      <div className="section-title">
        <span className="section-num">01</span> {fmtDateLong(date).toUpperCase()}
      </div>

      <div className="summary-grid">
        <div className="stat">
          <div className="lbl">Total Volume</div>
          <div className="val">{totalVolume.toLocaleString()}</div>
          <div className="unit">lbs moved</div>
        </div>
        <div className="stat">
          <div className="lbl">Exercises</div>
          <div className="val" style={{ color: "var(--paper)" }}>
            {exercises.length}
          </div>
          <div className="unit">logged today</div>
        </div>
        <div className="stat">
          <div className="lbl">Calories</div>
          <div className="val">{totalCals.toLocaleString()}</div>
          <div className="unit">est. burned</div>
        </div>
      </div>

      <div className="exercise-list">
        {exercises.length === 0 && (
          <div className="empty">No exercises logged today. Add one below.</div>
        )}
        {exercises.map((ex) => (
          <ExerciseRow
            key={ex._id}
            ex={ex}
            onDelete={async () => {
              if (confirm("Remove this exercise?")) {
                await deleteExercise({ id: ex._id });
                showToast("Removed");
              }
            }}
          />
        ))}
      </div>

      <div className="section-title" style={{ marginTop: 48 }}>
        <span className="section-num">02</span> LOG NEW EXERCISE
      </div>

      <form className="card" onSubmit={handleSubmit}>
        <div className="row cols-2">
          <div>
            <label>Daily Focus</label>
            <select name="focus">
              <option value="">— Select focus —</option>
              {FOCUS_OPTIONS.map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label>Exercise Type</label>
            <div className="type-toggle">
              <button
                type="button"
                className={type === "strength" ? "active" : ""}
                onClick={() => setType("strength")}
              >Strength</button>
              <button
                type="button"
                className={type === "aerobic" ? "active" : ""}
                onClick={() => setType("aerobic")}
              >Aerobic</button>
            </div>
          </div>
        </div>

        <div className="row">
          <div>
            <label>Exercise Name</label>
            <input name="name" type="text" placeholder="e.g. Bench Press, Treadmill" />
          </div>
        </div>

        {type === "strength" ? (
          <>
            <div className="row cols-2">
              <div>
                <label>Number of Sets</label>
                <select
                  value={numSets}
                  onChange={(e) => setNumSets(Number(e.target.value))}
                >
                  <option value={0}>— Select —</option>
                  {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Weight Unit</label>
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value as "lbs" | "kg")}
                >
                  <option value="lbs">lbs</option>
                  <option value="kg">kg</option>
                </select>
              </div>
            </div>

            {numSets > 0 && (
              <table className="sets-table">
                <thead>
                  <tr>
                    <th>Set</th>
                    <th>Reps</th>
                    <th>Weight ({weightUnit})</th>
                    <th>Intensity</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: numSets }, (_, i) => i + 1).map((i) => (
                    <tr key={i}>
                      <td className="set-num">{i}</td>
                      <td><input name={`reps_${i}`} type="number" min={0} placeholder="reps" /></td>
                      <td><input name={`weight_${i}`} type="number" min={0} step={2.5} placeholder="weight" /></td>
                      <td>
                        <select name={`intensity_${i}`}>
                          <option value="">—</option>
                          <option value="low">Low</option>
                          <option value="moderate">Moderate</option>
                          <option value="high">High</option>
                          <option value="max">Max</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        ) : (
          <div className="row cols-2">
            <div>
              <label>Duration (minutes)</label>
              <input name="duration" type="number" min={1} placeholder="30" />
            </div>
            <div>
              <label>Intensity</label>
              <select name="intensity">
                <option value="">— Select —</option>
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
                <option value="max">Max</option>
              </select>
            </div>
          </div>
        )}

        <div style={{ marginTop: 24 }}>
          <button type="submit" className="btn-primary">＋ ADD EXERCISE</button>
        </div>
      </form>

      {toast && <div className="toast show">{toast}</div>}
    </>
  );
}

function ExerciseRow({
  ex,
  onDelete,
}: {
  ex: {
    _id: Id<"exercises">;
    name: string;
    focus?: string;
    type: "strength" | "aerobic";
    weightUnit?: string;
    sets?: { reps: number; weight: number; intensity?: string }[];
    duration?: number;
    intensity?: string;
    totalVolume: number;
    estimatedCalories: number;
  };
  onDelete: () => void;
}) {
  return (
    <div className="exercise-item">
      <div>
        <div className="ex-head">{ex.name}</div>
        <div className="ex-meta">
          {ex.type === "strength" ? "STRENGTH" : "AEROBIC"} · {ex.focus || "No focus"}
        </div>
        <div className="ex-detail">
          {ex.type === "strength" && ex.sets ? (
            ex.sets.map((s, i) => (
              <span key={i} className="pill">
                SET {i + 1}: {s.reps}× {s.weight}{ex.weightUnit || "lbs"}
                {s.intensity ? ` · ${s.intensity}` : ""}
              </span>
            ))
          ) : (
            <>
              <span className="pill">{ex.duration} min</span>
              <span className="pill">{(ex.intensity || "").toUpperCase()}</span>
            </>
          )}
        </div>
      </div>
      <div className="ex-stats">
        {ex.type === "strength" && (
          <>
            <div className="big">{ex.totalVolume.toLocaleString()}</div>
            <div className="lbl">{ex.weightUnit || "lbs"} moved</div>
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
        <button className="ex-delete" onClick={onDelete}>Remove</button>
      </div>
    </div>
  );
}
