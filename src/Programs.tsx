import { useState } from "react";
import ProgramDetail from "./ProgramDetail";

const EXTERNAL_PROGRAMS = [
  {
    title: "NSW Physical Training Guide",
    subtitle: "26-week official program",
    source: "Naval Special Warfare",
    desc: "The official government-issued prep guide from Naval Special Warfare. Covers running, swimming, calisthenics, and strength training over 26 progressive weeks. Designed to take someone with average fitness and prepare them to pass the PST and survive BUDS Alpha Phase.",
    bestFor: "Candidates with 6+ months runway. Most comprehensive option for general candidates.",
    url: "https://www.sealswcc.com/pdf/physical-training-guide-2020.pdf",
    label: "View PDF",
  },
  {
    title: "Stew Smith - One Month PST Challenge",
    subtitle: "4-week free PST prep",
    source: "Stew Smith Fitness (free article)",
    desc: "Free 4-week template by Stew Smith - a former SEAL, CSCS, and the Naval Academy's Special Ops team coach. Split-routine focused on bringing PST scores from minimum into competitive range.",
    bestFor: "Candidates already at PST minimums looking to push into competitive scores.",
    url: "https://www.stewsmithfitness.com/blogs/news/one-month-pst-challenge-kill-the-pst-in-four-weeks",
    label: "Read article",
  },
];

export default function Programs() {
  const [view, setView] = useState<"list" | "detail">("list");

  if (view === "detail") {
    return <ProgramDetail onBack={() => setView("list")} />;
  }

  return (
    <>
      <div className="section-title">
        <span className="section-num">06</span> PROGRAMS
      </div>

      <div className="card" style={{ borderLeft: "3px solid var(--accent)" }}>
        <div className="ex-meta" style={{ marginBottom: 14, color: "var(--accent)" }}>
          A NOTE FROM MAX - FORMER NAVY SEAL, CSCS
        </div>
        <p style={{ lineHeight: 1.7, marginBottom: 14, fontSize: 15 }}>
          Most candidates show up to BUDS having only done bodyweight work and get hammered.
          Log PT, boat carries, surf torture - none of it cares how many pushups you can do.
          You need a real strength base before you start the high-volume calisthenics grind.
        </p>
        <p style={{ lineHeight: 1.7, fontSize: 15 }}>
          The featured program below is for candidates already in the pipeline. The two external
          programs are for general PST prep at all levels. Use the tracker on this site to log
          everything.
        </p>
      </div>

      <div className="ex-meta" style={{ margin: "12px 0 18px" }}>
        DISCLAIMER - These are training programs, not medical advice. Consult a physician before starting any program.
        BARBELLCLUB does not accept liability for injuries arising from training. Train smart. Stop if something hurts.
      </div>

      {/* FEATURED PROGRAM */}
      <div className="card" style={{ borderTop: "3px solid var(--accent-2)", borderBottom: "1px solid var(--accent-2)" }}>
        <div className="ex-meta" style={{ color: "var(--accent-2)", marginBottom: 8 }}>
          FEATURED &middot; AUTHORED BY MAX
        </div>
        <div className="ex-head" style={{ fontSize: 32 }}>
          Tactical Conditioning: 16-Week Pipeline Program
        </div>
        <div className="ex-meta" style={{ marginTop: 6, color: "var(--accent)" }}>
          FOR PIPELINE CANDIDATES ONLY &middot; ADVANCED
        </div>
        <p style={{ lineHeight: 1.6, marginTop: 14, marginBottom: 14, fontSize: 15 }}>
          A 16-week tactical conditioning program for candidates already in the SEAL/SWCC pipeline
          with a ship date - already passing the PST competitively, already running multiple miles,
          already swimming distance. NOT a beginner program.
        </p>
        <div className="ex-meta" style={{ marginBottom: 14 }}>
          5 PHASES &middot; RUN, SWIM, STRENGTH, BODYWEIGHT, GRINDER &middot; BENCHMARKS AT WEEKS 1, 8, 16
        </div>
        <button
          className="btn-primary"
          onClick={() => setView("detail")}
          style={{ width: "auto", padding: "12px 24px", fontSize: 18 }}
        >
          VIEW PROGRAM
        </button>
      </div>

      <div className="ex-meta" style={{ margin: "32px 0 16px" }}>
        EXTERNAL PROGRAMS &middot; FOR ALL OTHER CANDIDATES
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {EXTERNAL_PROGRAMS.map((p) => (
          <div key={p.title} className="card" style={{ marginBottom: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
              <div className="ex-head" style={{ fontSize: 28 }}>{p.title}</div>
              <div className="ex-meta" style={{ marginTop: 0 }}>{p.subtitle}</div>
            </div>
            <div className="ex-meta" style={{ marginTop: 4, color: "var(--accent-2)" }}>
              SOURCE: {p.source}
            </div>
            <p style={{ lineHeight: 1.6, marginTop: 14, marginBottom: 14 }}>{p.desc}</p>
            <div className="ex-meta" style={{ marginBottom: 14 }}>
              BEST FOR: {p.bestFor}
            </div>
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
              style={{ textDecoration: "none", display: "inline-block" }}
            >
              {p.label} &rarr;
            </a>
          </div>
        ))}
      </div>
    </>
  );
}
