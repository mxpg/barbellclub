import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function Profile({ onSaved }: { onSaved?: () => void }) {
  const profile = useQuery(api.profiles.getMyProfile);
  const upsert = useMutation(api.profiles.upsertProfile);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (profile === undefined) {
    return <div className="empty">Loading…</div>;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    try {
      await upsert({
        age: Number(fd.get("age")),
        sex: fd.get("sex") as "male" | "female",
        heightInches: Number(fd.get("heightInches")),
        weightLbs: Number(fd.get("weightLbs")),
        weightUnit: (fd.get("weightUnit") as "lbs" | "kg") || "lbs",
      });
      setMsg("Saved.");
      onSaved?.();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card">
      <div className="section-title">
        <span className="section-num">P</span> PROFILE
      </div>

      {msg && <div className="ex-meta" style={{ marginBottom: 12 }}>{msg}</div>}

      <form onSubmit={handleSubmit}>
        <div className="row cols-2">
          <div>
            <label>Age</label>
            <input
              name="age"
              type="number"
              min={10}
              max={100}
              defaultValue={profile?.age || ""}
              required
            />
          </div>
          <div>
            <label>Sex</label>
            <select name="sex" defaultValue={profile?.sex || "male"} required>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div className="row cols-2">
          <div>
            <label>Height (inches)</label>
            <input
              name="heightInches"
              type="number"
              min={36}
              max={96}
              defaultValue={profile?.heightInches || ""}
              required
            />
          </div>
          <div>
            <label>Weight (lbs)</label>
            <input
              name="weightLbs"
              type="number"
              min={60}
              max={600}
              defaultValue={profile?.weightLbs || ""}
              required
            />
          </div>
        </div>

        <div className="row cols-2">
          <div>
            <label>Weight Unit Default</label>
            <select name="weightUnit" defaultValue={profile?.weightUnit || "lbs"}>
              <option value="lbs">lbs</option>
              <option value="kg">kg</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "..." : profile ? "UPDATE PROFILE" : "SAVE PROFILE"}
        </button>
      </form>
    </div>
  );
}
