import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

export default function Charts() {
  const all = useQuery(api.workouts.getAll) || [];

  // group by date
  const byDate: Record<string, { volume: number; calories: number }> = {};
  all.forEach((ex) => {
    if (!byDate[ex.date]) byDate[ex.date] = { volume: 0, calories: 0 };
    byDate[ex.date].volume += ex.totalVolume;
    byDate[ex.date].calories += ex.estimatedCalories;
  });

  const data = Object.keys(byDate)
    .sort()
    .map((date) => {
      const [, m, d] = date.split("-");
      return {
        date: `${m}/${d}`,
        volume: byDate[date].volume,
        calories: byDate[date].calories,
      };
    });

  return (
    <>
      <div className="section-title">
        <span className="section-num">05</span> PROGRESS
      </div>
      {data.length < 2 ? (
        <div className="empty">Log at least 2 days to see progress charts.</div>
      ) : (
        <>
          <div className="card">
            <div className="ex-meta" style={{ marginBottom: 16 }}>
              VOLUME OVER TIME (LBS)
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data}>
                <CartesianGrid stroke="#2a2820" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#8a8675" style={{ fontSize: 11 }} />
                <YAxis stroke="#8a8675" style={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "#16160f",
                    border: "1px solid #2a2820",
                    color: "#f4ede0",
                    fontFamily: "monospace",
                  }}
                />
                <Line type="monotone" dataKey="volume" stroke="#d4ff00" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="ex-meta" style={{ marginBottom: 16 }}>
              CALORIES BURNED OVER TIME
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data}>
                <CartesianGrid stroke="#2a2820" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#8a8675" style={{ fontSize: 11 }} />
                <YAxis stroke="#8a8675" style={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "#16160f",
                    border: "1px solid #2a2820",
                    color: "#f4ede0",
                    fontFamily: "monospace",
                  }}
                />
                <Line type="monotone" dataKey="calories" stroke="#ff4500" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </>
  );
}
