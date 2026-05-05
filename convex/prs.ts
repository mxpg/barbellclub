import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyPRs = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("personalRecords")
      .withIndex("by_user_exercise", (q) => q.eq("userId", userId))
      .collect();
  },
});
