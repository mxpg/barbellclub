import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ---------- helpers ----------
function bmrKcalPerMin(p: {
  age: number;
  sex: "male" | "female";
  heightInches: number;
  weightLbs: number;
}) {
  const wKg = p.weightLbs * 0.453592;
  const hCm = p.heightInches * 2.54;
  let bmr;
  if (p.sex === "male") {
    bmr = 10 * wKg + 6.25 * hCm - 5 * p.age + 5;
  } else {
    bmr = 10 * wKg + 6.25 * hCm - 5 * p.age - 161;
  }
  return bmr / 1440;
}

const STRENGTH_MET: Record<string, number> = {
  low: 3.5,
  moderate: 5.0,
  high: 6.0,
  max: 8.0,
};
const AEROBIC_MET: Record<string, number> = {
  low: 4.0,
  moderate: 7.0,
  high: 10.0,
  max: 12.5,
};

function calcVolume(sets: { reps: number; weight: number }[] | undefined) {
  if (!sets) return 0;
  return sets.reduce((s, x) => s + (x.reps || 0) * (x.weight || 0), 0);
}

// ---------- queries ----------
export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("exercises")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", date))
      .collect();
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("exercises")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// ---------- mutations ----------
export const addExercise = mutation({
  args: {
    date: v.string(),
    name: v.string(),
    focus: v.optional(v.string()),
    type: v.union(v.literal("strength"), v.literal("aerobic")),
    weightUnit: v.optional(v.string()),
    sets: v.optional(
      v.array(
        v.object({
          reps: v.number(),
          weight: v.number(),
          intensity: v.optional(v.string()),
        })
      )
    ),
    duration: v.optional(v.number()),
    intensity: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // calculate volume
    const totalVolume = args.type === "strength" ? calcVolume(args.sets) : 0;

    // calculate calories
    let estimatedCalories = 0;
    if (profile) {
      const kcalMin = bmrKcalPerMin(profile);
      if (args.type === "aerobic") {
        const met = AEROBIC_MET[args.intensity || "moderate"] || 6.0;
        estimatedCalories = Math.round(kcalMin * met * (args.duration || 0));
      } else {
        const sets = args.sets || [];
        const order = ["low", "moderate", "high", "max"];
        let topIdx = 0;
        sets.forEach((s) => {
          const idx = order.indexOf(s.intensity || "");
          if (idx > topIdx) topIdx = idx;
        });
        const met = STRENGTH_MET[order[topIdx]] || 5.0;
        estimatedCalories = Math.round(kcalMin * met * sets.length * 3);
      }
    }

    const exId = await ctx.db.insert("exercises", {
      userId,
      ...args,
      totalVolume,
      estimatedCalories,
      createdAt: Date.now(),
    });

    // update PRs if strength
    if (args.type === "strength" && args.sets && args.sets.length > 0) {
      const maxWeight = Math.max(...args.sets.map((s) => s.weight || 0));
      const maxReps = Math.max(...args.sets.map((s) => s.reps || 0));

      const existingPR = await ctx.db
        .query("personalRecords")
        .withIndex("by_user_exercise", (q) =>
          q.eq("userId", userId).eq("exerciseName", args.name)
        )
        .first();

      if (!existingPR) {
        await ctx.db.insert("personalRecords", {
          userId,
          exerciseName: args.name,
          maxWeight,
          maxVolume: totalVolume,
          maxReps,
          achievedDate: args.date,
        });
      } else {
        const updates: Record<string, unknown> = {};
        if (maxWeight > existingPR.maxWeight) {
          updates.maxWeight = maxWeight;
          updates.achievedDate = args.date;
        }
        if (totalVolume > existingPR.maxVolume) {
          updates.maxVolume = totalVolume;
        }
        if (maxReps > existingPR.maxReps) {
          updates.maxReps = maxReps;
        }
        if (Object.keys(updates).length > 0) {
          await ctx.db.patch(existingPR._id, updates);
        }
      }
    }

    return exId;
  },
});

export const deleteExercise = mutation({
  args: { id: v.id("exercises") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const ex = await ctx.db.get(id);
    if (!ex || ex.userId !== userId) throw new Error("Not allowed");
    await ctx.db.delete(id);
  },
});
