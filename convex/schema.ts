import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ========== EXISTING TABLES ==========
  users: defineTable({
    userId: v.string(), // clerkId
    email: v.string(),
    name: v.string(),
    isPro: v.boolean(),
    isCheater: v.optional(v.boolean()),
    proSince: v.optional(v.number()),
    lemonSqueezyCustomerId: v.optional(v.string()),
    lemonSqueezyOrderId: v.optional(v.string()),
  }).index("by_user_id", ["userId"]),

  codeExecutions: defineTable({
    userId: v.string(),
    language: v.string(),
    code: v.string(),
    output: v.optional(v.string()),
    error: v.optional(v.string()),
  }).index("by_user_id", ["userId"]),

  snippets: defineTable({
    userId: v.string(),
    title: v.string(),
    language: v.string(),
    code: v.string(),
    userName: v.string(), // store user's name for easy access
  }).index("by_user_id", ["userId"]),

  snippetComments: defineTable({
    snippetId: v.id("snippets"),
    userId: v.string(),
    userName: v.string(),
    content: v.string(), // This will store HTML content
  }).index("by_snippet_id", ["snippetId"]),

  stars: defineTable({
    userId: v.string(),
    snippetId: v.id("snippets"),
  })
    .index("by_user_id", ["userId"])
    .index("by_snippet_id", ["snippetId"])
    .index("by_user_id_and_snippet_id", ["userId", "snippetId"]),

  // ========== CHALLENGE TABLES ==========

  challenges: defineTable({
    title: v.string(),
    slug: v.string(),
    difficulty: v.union(v.literal("Easy"), v.literal("Medium"), v.literal("Hard")),
    category: v.string(),
    subcategory: v.string(),
    tags: v.array(v.string()),
    description: v.string(),
    examples: v.array(
      v.object({
        input: v.string(),
        output: v.string(),
        explanation: v.optional(v.string()),
      })
    ),
    constraints: v.array(v.string()),
    starterCode: v.object({
      python: v.string(),
      javascript: v.string(),
      typescript: v.optional(v.string()),
      java: v.optional(v.string()),
      cpp: v.optional(v.string()),
    }),
    testCases: v.array(
      v.object({
        id: v.string(),
        input: v.string(),
        expectedOutput: v.string(),
        isHidden: v.boolean(),
      })
    ),
    hints: v.array(v.string()),
    editorial: v.optional(v.string()),
    timeLimit: v.number(),
    memoryLimit: v.number(),
    acceptanceRate: v.number(),
    totalSubmissions: v.number(),
    totalAccepted: v.number(),
    likes: v.number(),
    dislikes: v.number(),
    order: v.number(),
    isPremium: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category", "difficulty"])
    .index("by_difficulty", ["difficulty"])
    .index("by_order", ["order"]),

  challengeSubmissions: defineTable({
    userId: v.string(),
    challengeId: v.id("challenges"),
    code: v.string(),
    language: v.string(),
    status: v.union(
      v.literal("Accepted"),
      v.literal("Wrong Answer"),
      v.literal("Runtime Error"),
      v.literal("Time Limit Exceeded"),
      v.literal("Compilation Error"),
      v.literal("Pending")
    ),
    runtime: v.number(),
    memory: v.number(),
    testCasesPassed: v.number(),
    totalTestCases: v.number(),
    output: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    testResults: v.optional(
      v.array(
        v.object({
          id: v.string(),
          passed: v.boolean(),
          input: v.string(),
          expected: v.string(),
          actual: v.string(),
          runtime: v.number(),
          isHidden: v.boolean(),
        })
      )
    ),
  })
    .index("by_user", ["userId"])
    .index("by_challenge", ["challengeId"])
    .index("by_user_challenge", ["userId", "challengeId"]),

  challengeProgress: defineTable({
    userId: v.string(),
    challengeId: v.id("challenges"),
    status: v.union(
      v.literal("solved"),
      v.literal("attempted"),
      v.literal("bookmarked")
    ),
    bestRuntime: v.optional(v.number()),
    bestMemory: v.optional(v.number()),
    solvedAt: v.optional(v.number()),
    language: v.optional(v.string()),
    lastCode: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_challenge", ["userId", "challengeId"]),

  challengeUserStats: defineTable({
    userId: v.string(),
    totalSolved: v.number(),
    easySolved: v.number(),
    mediumSolved: v.number(),
    hardSolved: v.number(),
    totalSubmissions: v.number(),
    acceptedSubmissions: v.number(),
    points: v.number(),
    rank: v.string(),
    currentStreak: v.number(),
    maxStreak: v.number(),
    lastSolvedDate: v.optional(v.string()),
    dsaSolved: v.number(),
    aimlSolved: v.number(),
  }).index("by_user", ["userId"]),
});
