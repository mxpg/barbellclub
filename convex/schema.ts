import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  profiles: defineTable({
    userId: v.id("users"),
    age: v.number(),
    sex: v.union(v.literal("male"), v.literal("female")),
    heightInches: v.number(),
    weightLbs: v.number(),
    weightUnit: v.union(v.literal("lbs"), v.literal("kg")),
  }).index("by_user", ["userId"]),

  exercises: defineTable({
    userId: v.id("users"),
    date: v.string(), // YYYY-MM-DD
    name: v.string(),
    focus: v.optional(v.string()),
    type: v.union(v.literal("strength"), v.literal("aerobic")),
    // strength
    weightUnit: v.optional(v.string()),
    sets: v.optional(v.array(v.object({
      reps: v.number(),
      weight: v.number(),
      intensity: v.optional(v.string()),
      isDropset: v.optional(v.boolean()),
    }))),
    // aerobic
    duration: v.optional(v.number()),
    intensity: v.optional(v.string()),
    // computed at write time for fast queries
    supersetGroupId: v.optional(v.string()),
    totalVolume: v.number(),
    estimatedCalories: v.number(),
    createdAt: v.number(),
  })
    .index("by_user_date", ["userId", "date"])
    .index("by_user", ["userId"])
    .index("by_user_name", ["userId", "name"]),

  personalRecords: defineTable({
    userId: v.id("users"),
    exerciseName: v.string(),
    maxWeight: v.number(),
    maxVolume: v.number(),
    maxReps: v.number(),
    achievedDate: v.string(),
  }).index("by_user_exercise", ["userId", "exerciseName"]),
});
