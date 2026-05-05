const PROGRAMS = [
  {
    title: "NSW Physical Training Guide",
    subtitle: "26-week official program",
    source: "Naval Special Warfare",
    desc: "The official government-issued prep guide from Naval Special Warfare. Covers running, swimming, calisthenics, and strength training over 26 progressive weeks. Designed to take someone with average fitness and prepare them to pass the PST and survive BUDS Alpha Phase.",
    bestFor: "Candidates with 6+ months runway. Most comprehensive option.",
    url: "https://www.sealswcc.com/pdf/physical-training-guide-2020.pdf",
    label: "View PDF",
  },
  {
    title: "Stew Smith - One Month PST Challenge",
    subtitle: "4-week free PST prep",
    source: "Stew Smith Fitness (free article)",
    desc: "Free 4-week template by Stew Smith - a former SEAL, CSCS, and the Naval Academy's Special Ops team coach. Split-routine focused on bringing PST scores from minimum into competitive range. Solid starter if you're 4-8 weeks out from a PST.",
    bestFor: "Candidates already at PST minimums looking to push into competitive scores.",
    url: "https://www.stewsmithfitness.com/blogs/news/one-month-pst-challenge-kill-the-pst-in-four-weeks",
    label: "Read article",
  },
];

export default function Programs() {
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
        <p style={{ lineHeight: 1.7, marginBottom: 14, fontSize: 15 }}>
          My take: pair one of the PST programs below with <strong>2-3 days a week of compound
          lifting</strong> - squats, deadlifts, overhead press, weighted pullups, rows. Heavy enough
          to build real strength (3-6 reps), not exhausting enough to wreck your conditioning sessions.
          Drop the lifting in the final 4-6 weeks before your PST so you can taper into competitive
          run/swim scores.
        </p>
        <p style={{ lineHeight: 1.7, fontSize: 15, color: "var(--muted)" }}>
          Use the tracker on this site to log everything. The programs below are the prescriptions -
          your job is to do the work and record it honestly.
        </p>
      </div>

      <div className="ex-meta" style={{ margin: "12px 0 18px" }}>
        DISCLAIMER - These are external programs published by their respective authors.
        BARBELLCLUB does not author, endorse the specific prescriptions in, or accept liability for any program.
        Consult a physician before starting any training program. Train smart. Stop if something hurts.
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {PROGRAMS.map((p) => (
          <div key={p.title} className="card" style={{ marginBottom: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
              <div className="ex-head" style={{ fontSize: 30 }}>{p.title}</div>
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
