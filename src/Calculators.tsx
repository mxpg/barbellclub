import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

type CalcMode = "1rm" | "recomp";

export default function Calculators() {
  const [mode, setMode] = useState<CalcMode>("1rm");

  return (
    <>
      <div className="section-title">
        <span className="section-num">07</span> CALCULATORS
      </div>

      <div className="type-toggle" style={{ marginBottom: 24 }}>
        <button
          className={mode === "1rm" ? "active" : ""}
          onClick={() => setMode("1rm")}
        >
          1RM Calculator
        </button>
        <button
          className={mode === "recomp" ? "active" : ""}
          onClick={() => setMode("recomp")}
        >
          Body Recomp
        </button>
      </div>

      {mode === "1rm" ? <OneRepMaxCalc /> : <RecompCalc />}
    </>
  );
}

// ============================================
// 1RM CALCULATOR
// ============================================
function OneRepMaxCalc() {
  const [weight, setWeight] = useState<number>(0);
  const [reps, setReps] = useState<number>(0);

  // Three standard formulas, average them for best estimate
  const epley = weight > 0 && reps > 0 ? weight * (1 + reps / 30) : 0;
  const brzycki = weight > 0 && reps > 0 && reps < 37 ? weight * 36 / (37 - reps) : 0;
  const lombardi = weight > 0 && reps > 0 ? weight * Math.pow(reps, 0.10) : 0;
  const validFormulas = [epley, brzycki, lombardi].filter((v) => v > 0 && isFinite(v));
  const avg = validFormulas.length > 0
    ? validFormulas.reduce((s, x) => s + x, 0) / validFormulas.length
    : 0;

  const percentages = [100, 95, 90, 85, 80, 75, 70, 65, 60];
  const repTargets: Record<number, string> = {
    100: "1 rep max",
    95: "2 reps",
    90: "3-4 reps",
    85: "5-6 reps",
    80: "7-8 reps",
    75: "9-10 reps",
    70: "11-12 reps",
    65: "13-15 reps",
    60: "15+ reps",
  };

  return (
    <>
      <div className="card">
        <div className="row cols-2">
          <div>
            <label>Weight Lifted</label>
            <input
              type="number"
              min={0}
              step={2.5}
              value={weight || ""}
              onChange={(e) => setWeight(Number(e.target.value))}
              placeholder="225"
            />
          </div>
          <div>
            <label>Reps Performed</label>
            <input
              type="number"
              min={1}
              max={20}
              value={reps || ""}
              onChange={(e) => setReps(Number(e.target.value))}
              placeholder="5"
            />
          </div>
        </div>

        <div className="ex-meta" style={{ marginTop: 8, color: "var(--muted)" }}>
          Most accurate at 1-10 reps. Above 10 reps the estimate gets unreliable.
        </div>
      </div>

      {avg > 0 && (
        <>
          <div className="summary-grid" style={{ marginTop: 24 }}>
            <div className="stat">
              <div className="lbl">Estimated 1RM</div>
              <div className="val">{Math.round(avg)}</div>
              <div className="unit">lbs (avg)</div>
            </div>
            <div className="stat">
              <div className="lbl">Conservative</div>
              <div className="val" style={{ color: "var(--paper)" }}>
                {Math.round(Math.min(...validFormulas))}
              </div>
              <div className="unit">lbs (lowest)</div>
            </div>
            <div className="stat">
              <div className="lbl">Aggressive</div>
              <div className="val">{Math.round(Math.max(...validFormulas))}</div>
              <div className="unit">lbs (highest)</div>
            </div>
          </div>

          <div className="card">
            <div className="ex-meta" style={{ marginBottom: 14 }}>
              FORMULA BREAKDOWN
            </div>
            <table className="sets-table">
              <thead>
                <tr>
                  <th>Formula</th>
                  <th>Estimate</th>
                  <th>Best for</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 18, color: "var(--accent)" }}>EPLEY</td>
                  <td>{epley > 0 ? Math.round(epley) + " lbs" : "—"}</td>
                  <td className="ex-meta" style={{ marginTop: 0 }}>Most popular, mid-rep ranges</td>
                </tr>
                <tr>
                  <td style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 18, color: "var(--accent)" }}>BRZYCKI</td>
                  <td>{brzycki > 0 ? Math.round(brzycki) + " lbs" : "—"}</td>
                  <td className="ex-meta" style={{ marginTop: 0 }}>Low-rep work, more conservative</td>
                </tr>
                <tr>
                  <td style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 18, color: "var(--accent)" }}>LOMBARDI</td>
                  <td>{lombardi > 0 ? Math.round(lombardi) + " lbs" : "—"}</td>
                  <td className="ex-meta" style={{ marginTop: 0 }}>Higher rep ranges</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="ex-meta" style={{ marginBottom: 14 }}>
              TRAINING PERCENTAGES (based on {Math.round(avg)} lbs)
            </div>
            <table className="sets-table">
              <thead>
                <tr>
                  <th>%</th>
                  <th>Weight</th>
                  <th>Typical use</th>
                </tr>
              </thead>
              <tbody>
                {percentages.map((pct) => (
                  <tr key={pct}>
                    <td style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 22, color: "var(--accent-2)" }}>{pct}%</td>
                    <td style={{ fontFamily: "JetBrains Mono, monospace" }}>
                      {Math.round(avg * pct / 100 / 2.5) * 2.5} lbs
                    </td>
                    <td className="ex-meta" style={{ marginTop: 0 }}>{repTargets[pct]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="ex-meta" style={{ marginTop: 12, color: "var(--muted)" }}>
              Weights rounded to nearest 2.5 lbs.
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ============================================
// BODY RECOMP CALCULATOR
// ============================================
function RecompCalc() {
  const profile = useQuery(api.profiles.getMyProfile);
  const [activity, setActivity] = useState<number>(1.55);
  const [goal, setGoal] = useState<"cut" | "maintain" | "bulk">("maintain");

  if (profile === undefined) return <div className="empty">Loading...</div>;
  if (profile === null) return <div className="empty">Set up your profile first to use this calculator.</div>;

  // Mifflin-St Jeor BMR
  const wKg = profile.weightLbs * 0.453592;
  const hCm = profile.heightInches * 2.54;
  const bmr = profile.sex === "male"
    ? 10 * wKg + 6.25 * hCm - 5 * profile.age + 5
    : 10 * wKg + 6.25 * hCm - 5 * profile.age - 161;

  const tdee = bmr * activity;

  // Goal calorie targets
  const targetCals =
    goal === "cut" ? tdee - 500 :
    goal === "bulk" ? tdee + 300 :
    tdee;

  // Macro splits — protein first by bodyweight, then balance carbs/fat
  // Cut: 1.0g/lb protein, 30% fat, rest carbs
  // Maintain: 0.9g/lb protein, 25% fat, rest carbs
  // Bulk: 0.8g/lb protein, 25% fat, rest carbs
  const proteinPerLb = goal === "cut" ? 1.0 : goal === "bulk" ? 0.8 : 0.9;
  const fatPctOfCals = goal === "cut" ? 0.30 : 0.25;

  const proteinG = Math.round(profile.weightLbs * proteinPerLb);
  const proteinCals = proteinG * 4;
  const fatCals = targetCals * fatPctOfCals;
  const fatG = Math.round(fatCals / 9);
  const carbCals = targetCals - proteinCals - fatCals;
  const carbG = Math.round(carbCals / 4);

  return (
    <>
      <div className="card">
        <div className="ex-meta" style={{ marginBottom: 14, color: "var(--accent-2)" }}>
          USING YOUR PROFILE
        </div>
        <div className="bc-mono" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: "var(--paper)", lineHeight: 1.8 }}>
          {profile.age} years · {profile.sex} · {profile.heightInches}" · {profile.weightLbs} lbs
        </div>
      </div>

      <div className="card">
        <div className="row">
          <div>
            <label>Activity Level</label>
            <select value={activity} onChange={(e) => setActivity(Number(e.target.value))}>
              <option value={1.2}>Sedentary - desk job, minimal exercise</option>
              <option value={1.375}>Light - 1-3 sessions/week</option>
              <option value={1.55}>Moderate - 3-5 sessions/week</option>
              <option value={1.725}>Heavy - 6-7 sessions/week</option>
              <option value={1.9}>Athlete - 2x/day or physical job + training</option>
            </select>
          </div>
        </div>

        <div className="row">
          <div>
            <label>Goal</label>
            <div className="type-toggle" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
              <button
                type="button"
                className={goal === "cut" ? "active" : ""}
                onClick={() => setGoal("cut")}
              >
                Cut
              </button>
              <button
                type="button"
                className={goal === "maintain" ? "active" : ""}
                onClick={() => setGoal("maintain")}
              >
                Maintain
              </button>
              <button
                type="button"
                className={goal === "bulk" ? "active" : ""}
                onClick={() => setGoal("bulk")}
              >
                Bulk
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="summary-grid">
        <div className="stat">
          <div className="lbl">BMR</div>
          <div className="val" style={{ color: "var(--paper)" }}>{Math.round(bmr)}</div>
          <div className="unit">resting kcal</div>
        </div>
        <div className="stat">
          <div className="lbl">TDEE</div>
          <div className="val">{Math.round(tdee)}</div>
          <div className="unit">total daily kcal</div>
        </div>
        <div className="stat">
          <div className="lbl">Target</div>
          <div className="val">{Math.round(targetCals)}</div>
          <div className="unit">kcal goal</div>
        </div>
      </div>

      <div className="card">
        <div className="ex-meta" style={{ marginBottom: 14 }}>
          DAILY MACRO TARGETS
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, border: "1px solid var(--line)" }}>
          <div style={{ padding: 20, borderRight: "1px solid var(--line)" }}>
            <div className="ex-meta" style={{ marginBottom: 8 }}>PROTEIN</div>
            <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 40, color: "var(--accent-2)", lineHeight: 0.9 }}>
              {proteinG}g
            </div>
            <div className="ex-meta" style={{ marginTop: 6 }}>{proteinCals} kcal</div>
          </div>
          <div style={{ padding: 20, borderRight: "1px solid var(--line)" }}>
            <div className="ex-meta" style={{ marginBottom: 8 }}>CARBS</div>
            <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 40, color: "var(--paper)", lineHeight: 0.9 }}>
              {carbG}g
            </div>
            <div className="ex-meta" style={{ marginTop: 6 }}>{Math.round(carbCals)} kcal</div>
          </div>
          <div style={{ padding: 20 }}>
            <div className="ex-meta" style={{ marginBottom: 8 }}>FAT</div>
            <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 40, color: "var(--accent)", lineHeight: 0.9 }}>
              {fatG}g
            </div>
            <div className="ex-meta" style={{ marginTop: 6 }}>{Math.round(fatCals)} kcal</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="ex-meta" style={{ marginBottom: 14 }}>
          NOTES
        </div>
        <p style={{ lineHeight: 1.7, fontSize: 14, color: "var(--paper)", marginBottom: 12 }}>
          BMR calculated via Mifflin-St Jeor (most accurate equation for adults). TDEE multiplies BMR by activity factor.
          Cut deficit is -500 kcal/day (~1 lb fat loss/week). Bulk surplus is +300 kcal/day (lean gain pace, minimizes fat).
        </p>
        <p style={{ lineHeight: 1.7, fontSize: 14, color: "var(--muted)" }}>
          These are starting points, not gospel. Track for 2-3 weeks and adjust based on actual scale and performance trends.
          Hit protein every day. Carbs and fat are interchangeable to fit your appetite and training.
        </p>
      </div>
    </>
  );
}
