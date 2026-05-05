import { useAuthActions } from "@convex-dev/auth/react";
import { useState, FormEvent } from "react";

export default function SignIn() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("flow", flow);
    try {
      await signIn("password", formData);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Something went wrong";
      if (msg.toLowerCase().includes("invalid")) {
        setError(
          flow === "signIn"
            ? "Wrong email or password."
            : "Could not create account. Email may already be in use."
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="brand">
          BARBELL<span className="accent">CLUB</span>
        </div>
        <div className="tagline">
          {flow === "signIn" ? "Welcome back" : "Create your account"}
        </div>

        {error && <div className="err">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div>
              <label>Email</label>
              <input name="email" type="email" required autoComplete="email" />
            </div>
          </div>
          <div className="row">
            <div>
              <label>Password</label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete={
                  flow === "signIn" ? "current-password" : "new-password"
                }
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading
              ? "..."
              : flow === "signIn"
              ? "SIGN IN"
              : "CREATE ACCOUNT"}
          </button>
        </form>

        <div className="switch">
          {flow === "signIn" ? (
            <>
              No account?{" "}
              <a onClick={() => setFlow("signUp")}>Sign up</a>
            </>
          ) : (
            <>
              Already have one?{" "}
              <a onClick={() => setFlow("signIn")}>Sign in</a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
