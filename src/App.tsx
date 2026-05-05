import { useState } from "react";
import { Authenticated, Unauthenticated, AuthLoading, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../convex/_generated/api";
import SignIn from "./SignIn";
import Dashboard from "./Dashboard";
import History from "./History";
import PRs from "./PRs";
import Charts from "./Charts";
import Profile from "./Profile";

type Tab = "today" | "history" | "prs" | "charts" | "profile";

export default function App() {
  return (
    <>
      <AuthLoading>
        <div className="auth-wrap">
          <div className="empty">Loading…</div>
        </div>
      </AuthLoading>
      <Unauthenticated>
        <SignIn />
      </Unauthenticated>
      <Authenticated>
        <Main />
      </Authenticated>
    </>
  );
}

function Main() {
  const { signOut } = useAuthActions();
  const profile = useQuery(api.profiles.getMyProfile);
  const [tab, setTab] = useState<Tab>("today");

  // Force profile setup if missing
  if (profile === null) {
    return (
      <div className="wrap">
        <header className="app-header">
          <div className="brand">BARBELL<span className="accent">CLUB</span></div>
          <div className="tagline">
            Welcome
            <span className="date">Set up profile</span>
          </div>
        </header>
        <Profile />
      </div>
    );
  }

  return (
    <div className="wrap">
      <header className="app-header">
        <div className="brand">BARBELL<span className="accent">CLUB</span></div>
        <div className="tagline">
          Personal Training Journal
          <span className="date">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long", month: "long", day: "numeric"
            })}
          </span>
        </div>
      </header>

      <nav className="nav-tabs">
        <button className={tab === "today" ? "active" : ""} onClick={() => setTab("today")}>Today</button>
        <button className={tab === "history" ? "active" : ""} onClick={() => setTab("history")}>History</button>
        <button className={tab === "prs" ? "active" : ""} onClick={() => setTab("prs")}>PRs</button>
        <button className={tab === "charts" ? "active" : ""} onClick={() => setTab("charts")}>Progress</button>
        <button className={tab === "profile" ? "active" : ""} onClick={() => setTab("profile")}>Profile</button>
        <div className="spacer"></div>
        <button className="signout" onClick={() => void signOut()}>Sign out</button>
      </nav>

      {tab === "today" && <Dashboard />}
      {tab === "history" && <History />}
      {tab === "prs" && <PRs />}
      {tab === "charts" && <Charts />}
      {tab === "profile" && <Profile />}
    </div>
  );
}
