import { SEAL_PIPELINE_PROGRAM } from "./programs/seal-pipeline-16wk";
import { useState } from "react";

export default function ProgramDetail({ onBack }: { onBack: () => void }) {
  const p = SEAL_PIPELINE_PROGRAM;
  const [openWeeks, setOpenWeeks] = useState<Record<number, boolean>>({ 1: true });

  return (
    <>
      <button className="btn-ghost" onClick={onBack} style={{ marginBottom: 20 }}>
        &larr; Back to Programs
      </button>

      <div className="section-title">
        <span className="section-num">P</span> {p.title.toUpperCase()}
      </div>

      <div className="card" style={{ borderLeft: "3px solid var(--accent)", background: "rgba(255,69,0,0.08)" }}>
        <div className="ex-meta" style={{ color: "var(--accent)", marginBottom: 10, fontSize: 13 }}>
          {p.audience}
        </div>
        <p style={{ lineHeight: 1.7, fontSize: 15 }}>{p.audienceDetail}</p>
      </div>

      <div className="card">
        <div className="ex-meta" style={{ marginBottom: 10, color: "var(--accent-2)" }}>AUTHOR</div>
        <p style={{ marginBottom: 18, fontSize: 15 }}>{p.author}</p>

        <div className="ex-meta" style={{ marginBottom: 10 }}>GOAL</div>
        <p style={{ marginBottom: 18, fontSize: 15, lineHeight: 1.6 }}>{p.goal}</p>

        <div className="ex-meta" style={{ marginBottom: 10 }}>DISCLAIMER</div>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted)" }}>{p.disclaimer}</p>
      </div>

      <div className="card">
        <div className="ex-meta" style={{ marginBottom: 14 }}>PHASES</div>
        {p.phases.map((ph) => (
          <div key={ph.weeks} style={{ display: "flex", gap: 16, marginBottom: 8, fontFamily: "JetBrains Mono, monospace", fontSize: 13 }}>
            <span style={{ color: "var(--accent)", minWidth: 90 }}>WK {ph.weeks}</span>
            <span>{ph.name}</span>
          </div>
        ))}

        <div className="ex-meta" style={{ marginTop: 22, marginBottom: 14 }}>WEEKLY SCHEDULE</div>
        {p.schedule.map((s) => (
          <div key={s.day} style={{ display: "flex", gap: 16, marginBottom: 8, fontFamily: "JetBrains Mono, monospace", fontSize: 13 }}>
            <span style={{ color: "var(--accent-2)", minWidth: 90 }}>{s.day.toUpperCase()}</span>
            <span>{s.focus}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="ex-meta" style={{ marginBottom: 14 }}>SCALING</div>
        <p style={{ marginBottom: 12, fontSize: 14, lineHeight: 1.6 }}><strong style={{ color: "var(--accent-2)" }}>BEGINNER:</strong> {p.scaling.beginner}</p>
        <p style={{ marginBottom: 12, fontSize: 14, lineHeight: 1.6 }}><strong style={{ color: "var(--accent-2)" }}>INTERMEDIATE:</strong> {p.scaling.intermediate}</p>
        <p style={{ fontSize: 14, lineHeight: 1.6 }}><strong style={{ color: "var(--accent-2)" }}>ADVANCED:</strong> {p.scaling.advanced}</p>
      </div>

      <div className="card">
        <div className="ex-meta" style={{ marginBottom: 14 }}>BENCHMARK TESTS ({p.benchmarks.when})</div>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {p.benchmarks.tests.map((t, i) => (
            <li key={i} style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, marginBottom: 6 }}>&middot; {t}</li>
          ))}
        </ul>
      </div>

      <div className="card">
        <div className="ex-meta" style={{ marginBottom: 14 }}>STANDARD WARM-UP</div>
        <ul style={{ listStyle: "none", padding: 0, marginBottom: 22 }}>
          {p.warmup.map((w, i) => (
            <li key={i} style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, marginBottom: 6 }}>&middot; {w}</li>
          ))}
        </ul>

        <div className="ex-meta" style={{ marginBottom: 14 }}>STANDARD COOLDOWN</div>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {p.cooldown.map((c, i) => (
            <li key={i} style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, marginBottom: 6 }}>&middot; {c}</li>
          ))}
        </ul>
      </div>

      <div className="section-title" style={{ marginTop: 40 }}>
        <span className="section-num">W</span> 16-WEEK PLAN
      </div>

      {p.weeks.map((w) => (
        <div key={w.number} className="history-day">
          <div
            className="history-head"
            onClick={() => setOpenWeeks((o) => ({ ...o, [w.number]: !o[w.number] }))}
          >
            <div className="history-date">WEEK {w.number}</div>
            <div className="ex-meta" style={{ marginTop: 0 }}>
              {w.title} &middot; {w.goal}
            </div>
            <div className="history-totals">
              RUN <strong>{w.runVolume}</strong><br/>
              SWIM <strong>{w.swimVolume}</strong>
            </div>
          </div>
          <div className={`history-body ${openWeeks[w.number] ? "open" : ""}`}>
            {w.days.map((d) => (
              <div className="exercise-item" key={d.day} style={{ display: "block" }}>
                <div className="ex-head" style={{ fontSize: 22 }}>
                  DAY {d.day} &middot; {d.title}
                </div>
                {(d as { duration?: string }).duration && (
                  <div className="ex-meta">DURATION: {(d as { duration?: string }).duration}</div>
                )}
                <ul style={{ listStyle: "none", padding: 0, marginTop: 12 }}>
                  {d.blocks.map((b, i) => (
                    <li key={i} style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, marginBottom: 6, color: "var(--paper)" }}>
                      &middot; {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="card" style={{ marginTop: 40 }}>
        <div className="ex-meta" style={{ marginBottom: 14 }}>RECOVERY RULES</div>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {p.recoveryRules.map((r, i) => (
            <li key={i} style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, marginBottom: 8, lineHeight: 1.5 }}>&middot; {r}</li>
          ))}
        </ul>
      </div>

      <div className="card">
        <div className="ex-meta" style={{ marginBottom: 14 }}>PERFORMANCE TARGETS</div>
        <p style={{ marginBottom: 8 }}><strong style={{ color: "var(--accent-2)" }}>BEGINNER COMPLETION:</strong></p>
        <ul style={{ listStyle: "none", padding: 0, marginBottom: 18 }}>
          {p.performanceTargets.beginner.map((t, i) => (
            <li key={i} style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, marginBottom: 4 }}>&middot; {t}</li>
          ))}
        </ul>
        <p style={{ marginBottom: 8 }}><strong style={{ color: "var(--accent-2)" }}>INTERMEDIATE:</strong></p>
        <ul style={{ listStyle: "none", padding: 0, marginBottom: 18 }}>
          {p.performanceTargets.intermediate.map((t, i) => (
            <li key={i} style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, marginBottom: 4 }}>&middot; {t}</li>
          ))}
        </ul>
        <p style={{ marginBottom: 8 }}><strong style={{ color: "var(--accent-2)" }}>ADVANCED:</strong></p>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {p.performanceTargets.advanced.map((t, i) => (
            <li key={i} style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, marginBottom: 4 }}>&middot; {t}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
