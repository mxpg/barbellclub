import React, { useState, useEffect } from "react";
import type { FormEvent } from "react";
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

type ExerciseDoc = {
  _id: Id<"exercises">;
  name: string;
  focus?: string;
  type: "strength" | "aerobic";
  weightUnit?: string;
  sets?: { reps: number; weight: number; intensity?: string; isDropset?: boolean }[];
  duration?: number;
  intensity?: string;
  totalVolume: number;
  estimatedCalories: number;
  supersetGroupId?: string;
};

export default function Dashboard() {
  const date = todayKey();
  const exercises = useQuery(api.workouts.getByDate, { date }) || [];
  const addExercise = useMutation(api.workouts.addExercise);
  const updateExercise = useMutation(api.workouts.updateExercise);
  const deleteExercise = useMutation(api.workouts.deleteExercise);
  const removeFromSuperset = useMutation(api.workouts.removeFromSuperset);

  const [editingId, setEditingId] = useState<Id<"exercises"> | null>(null);
  const [type, setType] = useState<"strength" | "aerobic">("strength");
  const [numSets, setNumSets] = useState(0);
  const [weightUnit, setWeightUnit] = useState<"lbs" | "kg">("lbs");
  const [toast, setToast] = useState<string | null>(null);
  const [activeSuperset, setActiveSuperset] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [focus, setFocus] = useState("");
  const [duration, setDuration] = useState<string>("");
  const [aerobicIntensity, setAerobicIntensity] = useState("");
  const [setsData, setSetsData] = useState<{ reps: string; weight: string; intensity: string; isDropset: boolean }[]>([]);

  useEffect(() => {
    if (!editingId) return;
    const ex = exercises.find((e) => e._id === editingId);
    if (!ex) return;
    setName(ex.name);
    setFocus(ex.focus || "");
    setType(ex.type);
    if (ex.type === "aerobic") {
      setDuration(String(ex.duration || ""));
      setAerobicIntensity(ex.intensity || "");
    } else {
      setWeightUnit((ex.weightUnit as "lbs" | "kg") || "lbs");
      setNumSets(ex.sets?.length || 0);
      setSetsData(
        (ex.sets || []).map((s) => ({
          reps: String(s.reps || ""),
          weight: String(s.weight || ""),
          intensity: s.intensity || "",
          isDropset: !!s.isDropset,
        }))
      );
    }
    setTimeout(() => {
      document.getElementById("exercise-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, [editingId, exercises]);

  function handleNumSetsChange(n: number) {
    setNumSets(n);
    setSetsData((prev) => {
      const next = [...prev];
      while (next.length < n) next.push({ reps: "", weight: "", intensity: "", isDropset: false });
      next.length = n;
      return next;
    });
  }

  function updateSet(idx: number, field: "reps" | "weight" | "intensity", val: string) {
    setSetsData((prev) => {
      const next = [...prev];
      if (!next[idx]) next[idx] = { reps: "", weight: "", intensity: "", isDropset: false };
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  }

  function toggleDropset(idx: number) {
    setSetsData((prev) => {
      const next = [...prev];
      if (!next[idx]) next[idx] = { reps: "", weight: "", intensity: "", isDropset: false };
      next[idx] = { ...next[idx], isDropset: !next[idx].isDropset };
      return next;
    });
  }

  function showToast(m: string) {
    setToast(m);
    setTimeout(() => setToast(null), 2200);
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setFocus("");
    setType("strength");
    setNumSets(0);
    setSetsData([]);
    setDuration("");
    setAerobicIntensity("");
    setWeightUnit("lbs");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return showToast("Enter exercise name");

    try {
      if (type === "strength") {
        if (numSets === 0) return showToast("Select number of sets");
        const sets = setsData.slice(0, numSets).map((s) => ({
          reps: Number(s.reps) || 0,
          weight: Number(s.weight) || 0,
          intensity: s.intensity || undefined,
          isDropset: s.isDropset || undefined,
        }));
        if (editingId) {
          await updateExercise({
            id: editingId,
            name: name.trim(),
            focus: focus || undefined,
            type: "strength",
            weightUnit,
            sets,
          });
          showToast("Changes saved");
        } else {
          await addExercise({
            date,
            name: name.trim(),
            focus: focus || undefined,
            type: "strength",
            weightUnit,
            sets,
            supersetGroupId: activeSuperset || undefined,
          });
          showToast(activeSuperset ? "Added to superset" : "Exercise logged");
        }
      } else {
        const dur = Number(duration) || 0;
        if (!dur) return showToast("Enter duration");
        if (!aerobicIntensity) return showToast("Select intensity");
        if (editingId) {
          await updateExercise({
            id: editingId,
            name: name.trim(),
            focus: focus || undefined,
            type: "aerobic",
            duration: dur,
            intensity: aerobicIntensity,
          });
          showToast("Changes saved");
        } else {
          await addExercise({
            date,
            name: name.trim(),
            focus: focus || undefined,
            type: "aerobic",
            duration: dur,
            intensity: aerobicIntensity,
            supersetGroupId: activeSuperset || undefined,
          });
          showToast(activeSuperset ? "Added to superset" : "Exercise logged");
        }
      }
      resetForm();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error");
    }
  }

  const totalVolume = exercises.reduce((s, e) => s + e.totalVolume, 0);
  const totalCals = exercises.reduce((s, e) => s + e.estimatedCalories, 0);

  // Build superset group order for A/B/C labeling
  const groupOrder: string[] = [];
  exercises.forEach((ex) => {
    if (ex.supersetGroupId && !groupOrder.includes(ex.supersetGroupId)) {
      groupOrder.push(ex.supersetGroupId);
    }
  });
  const supersetLabel = (gid: string) => String.fromCharCode(65 + groupOrder.indexOf(gid));

  const renderedItems: React.ReactNode[] = [];
  let i = 0;
  while (i < exercises.length) {
    const ex = exercises[i];
    if (ex.supersetGroupId) {
      const group = [ex];
      let j = i + 1;
      while (j < exercises.length && exercises[j].supersetGroupId === ex.supersetGroupId) {
        group.push(exercises[j]);
        j++;
      }
      renderedItems.push(
        <div
          key={ex.supersetGroupId}
          style={{
            border: "2px solid var(--accent)",
            padding: 14,
            marginBottom: 14,
            background: "rgba(255,69,0,0.04)",
          }}
        >
          <div className="ex-meta" style={{ marginBottom: 10, color: "var(--accent)", letterSpacing: "0.18em" }}>
            SUPERSET {supersetLabel(ex.supersetGroupId)} - {group.length} EXERCISES
          </div>
          {group.map((g) => (
            <ExerciseRow
              key={g._id}
              ex={g}
              isEditing={editingId === g._id}
              inSuperset
              onEdit={() => setEditingId(g._id)}
              onRemoveFromSuperset={async () => {
                await removeFromSuperset({ id: g._id });
                showToast("Removed from superset");
              }}
              onDelete={async () => {
                if (confirm("Remove this exercise?")) {
                  if (editingId === g._id) resetForm();
                  await deleteExercise({ id: g._id });
                  showToast("Removed");
                }
              }}
            />
          ))}
        </div>
      );
      i = j;
    } else {
      renderedItems.push(
        <ExerciseRow
          key={ex._id}
          ex={ex}
          isEditing={editingId === ex._id}
          onEdit={() => setEditingId(ex._id)}
          onDelete={async () => {
            if (confirm("Remove this exercise?")) {
              if (editingId === ex._id) resetForm();
              await deleteExercise({ id: ex._id });
              showToast("Removed");
            }
          }}
        />
      );
      i++;
    }
  }

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
        {renderedItems}
      </div>

      <div className="section-title" style={{ marginTop: 48 }} id="exercise-form">
        <span className="section-num">02</span>
        {editingId ? " EDIT EXERCISE" : " LOG NEW EXERCISE"}
      </div>

      <form className="card" onSubmit={handleSubmit}>
        {editingId && (
          <div className="ex-meta" style={{ marginBottom: 16, color: "var(--accent)" }}>
            EDITING - CHANGES WILL OVERWRITE THIS EXERCISE
          </div>
        )}

        <div className="row cols-2">
          <div>
            <label>Daily Focus</label>
            <select value={focus} onChange={(e) => setFocus(e.target.value)}>
              <option value="">- Select focus -</option>
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
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bench Press, Treadmill"
            />
          </div>
        </div>

        {type === "strength" ? (
          <>
            <div className="row cols-2">
              <div>
                <label>Number of Sets</label>
                <select
                  value={numSets}
                  onChange={(e) => handleNumSetsChange(Number(e.target.value))}
                >
                  <option value={0}>- Select -</option>
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
                    <th>Drop</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: numSets }, (_, i) => i).map((i) => (
                    <tr key={i}>
                      <td className="set-num">{i+1}</td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          placeholder="reps"
                          value={setsData[i]?.reps || ""}
                          onChange={(e) => updateSet(i, "reps", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          step={2.5}
                          placeholder="weight"
                          value={setsData[i]?.weight || ""}
                          onChange={(e) => updateSet(i, "weight", e.target.value)}
                        />
                      </td>
                      <td>
                        <select
                          value={setsData[i]?.intensity || ""}
                          onChange={(e) => updateSet(i, "intensity", e.target.value)}
                        >
                          <option value="">-</option>
                          <option value="low">Low</option>
                          <option value="moderate">Moderate</option>
                          <option value="high">High</option>
                          <option value="max">Max</option>
                        </select>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={!!setsData[i]?.isDropset}
                          onChange={() => toggleDropset(i)}
                          style={{ width: 22, height: 22, accentColor: "var(--accent)", cursor: "pointer" }}
                        />
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
              <input
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="30"
              />
            </div>
            <div>
              <label>Intensity</label>
              <select
                value={aerobicIntensity}
                onChange={(e) => setAerobicIntensity(e.target.value)}
              >
                <option value="">- Select -</option>
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
                <option value="max">Max</option>
              </select>
            </div>
          </div>
        )}

        {!editingId && activeSuperset && (
          <div className="ex-meta" style={{ marginTop: 16, color: "var(--accent)" }}>
            NEXT EXERCISE WILL BE ADDED TO CURRENT SUPERSET
          </div>
        )}

        <div style={{ marginTop: 24, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button type="submit" className="btn-primary" style={{ flex: 1, minWidth: 200 }}>
            {editingId
              ? "SAVE CHANGES"
              : activeSuperset
              ? "+ ADD TO SUPERSET"
              : "+ ADD EXERCISE"}
          </button>
          {editingId && (
            <button type="button" className="btn-ghost" onClick={resetForm}>
              Cancel
            </button>
          )}
          {!editingId && !activeSuperset && (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setActiveSuperset(crypto.randomUUID())}
            >
              Start Superset
            </button>
          )}
          {!editingId && activeSuperset && (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setActiveSuperset(null);
                showToast("Superset closed");
              }}
            >
              End Superset
            </button>
          )}
        </div>
      </form>

      {toast && <div className="toast show">{toast}</div>}
    </>
  );
}


function ExerciseRow({
  ex,
  isEditing,
  inSuperset,
  onEdit,
  onDelete,
  onRemoveFromSuperset,
}: {
  ex: ExerciseDoc;
  isEditing: boolean;
  inSuperset?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onRemoveFromSuperset?: () => void;
}) {
  return (
    <div
      className="exercise-item"
      style={isEditing ? { borderLeftColor: "var(--accent-2)", background: "rgba(212,255,0,0.05)" } : undefined}
    >
      <div>
        <div className="ex-head">
          {ex.name}
          {isEditing && (
            <span style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 10,
              color: "var(--accent-2)",
              marginLeft: 10,
              letterSpacing: "0.15em",
              verticalAlign: "middle",
            }}>
              EDITING
            </span>
          )}
        </div>
        <div className="ex-meta">
          {ex.type === "strength" ? "STRENGTH" : "AEROBIC"} - {ex.focus || "No focus"}
        </div>
        <div className="ex-detail">
          {ex.type === "strength" && ex.sets ? (
            ex.sets.map((s, i) => (
              <span key={i} className="pill" style={s.isDropset ? { borderColor: "var(--accent)", color: "var(--accent)" } : undefined}>
                SET {i + 1}: {s.reps}x {s.weight}{ex.weightUnit || "lbs"}
                {s.intensity ? ` - ${s.intensity}` : ""}
                {s.isDropset ? " - DROPSET" : ""}
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
        <div style={{ display: "flex", gap: 8, marginTop: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button
            onClick={onEdit}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--accent-2)",
              cursor: "pointer",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              padding: "4px 8px",
            }}
          >
            Edit
          </button>
          {inSuperset && onRemoveFromSuperset && (
            <button
              onClick={onRemoveFromSuperset}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--muted)",
                cursor: "pointer",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                padding: "4px 8px",
              }}
            >
              Unlink
            </button>
          )}
          <button
            className="ex-delete"
            onClick={onDelete}
            style={{ marginTop: 0 }}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

