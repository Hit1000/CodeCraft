import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ========== SESSION TABLES ==========
  sessions: defineTable({
    sessionToken: v.string(),
    userId: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
  }).index("by_session_token", ["sessionToken"])
    .index("by_user_id", ["userId"]),

  // ========== USER TABLES ==========
  users: defineTable({
    userId: v.string(), // clerkId
    email: v.string(),
    name: v.string(),
    isPro: v.boolean(),
    proSince: v.optional(v.number()),
    lemonSqueezyCustomerId: v.optional(v.string()),
    lemonSqueezyOrderId: v.optional(v.string()),
    role: v.optional(v.union(v.literal("user"), v.literal("moderator"), v.literal("admin"))),
    isCheater: v.optional(v.boolean()),
  }).index("by_user_id", ["userId"])
    .index("by_email", ["email"]),

  // ========== PLATFORM ADMIN TABLES ==========
  platformAdmins: defineTable({
    userId: v.string(),
    role: v.union(v.literal("admin"), v.literal("moderator")),
    grantedBy: v.string(),
    grantedAt: v.number(),
  }).index("by_user_id", ["userId"]),

  // ========== SNIPPET TABLES ==========
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

    // Rich description with markdown + image references
    description: v.string(),
    descriptionImages: v.optional(v.array(v.id("_storage"))),

    examples: v.array(
      v.object({
        input: v.string(),
        output: v.string(),
        explanation: v.optional(v.string()),
      })
    ),
    constraints: v.array(v.string()),

    // What the user sees and edits
    starterCode: v.object({
      python: v.optional(v.string()),
      javascript: v.optional(v.string()),
      typescript: v.optional(v.string()),
      java: v.optional(v.string()),
      cpp: v.optional(v.string()),
    }),

    // Hidden boilerplate/driver code that wraps user's code for execution
    driverCode: v.optional(v.object({
      python: v.optional(v.string()),
      javascript: v.optional(v.string()),
      typescript: v.optional(v.string()),
      java: v.optional(v.string()),
      cpp: v.optional(v.string()),
    })),

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
    editorialImages: v.optional(v.array(v.id("_storage"))),

    timeLimit: v.number(),
    memoryLimit: v.number(),
    acceptanceRate: v.number(),
    totalSubmissions: v.number(),
    totalAccepted: v.number(),
    likes: v.number(),
    dislikes: v.number(),
    order: v.number(),
    isPremium: v.boolean(),

    // Admin tracking
    createdBy: v.optional(v.string()),
    updatedBy: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
    lastUpdated: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category", "difficulty"])
    .index("by_difficulty", ["difficulty"])
    .index("by_order", ["order"])
    .index("by_published", ["isPublished"]),

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
    .index("by_user_challenge", ["userId", "challengeId"])
    .index("by_challenge", ["challengeId"]),

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
  }).index("by_user", ["userId"])
    .index("by_points", ["points"]),

  // Admin roles for challenges
  challengeAdmins: defineTable({
    userId: v.string(),
    role: v.union(v.literal("admin"), v.literal("moderator")),
    grantedBy: v.string(),
    grantedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Community challenge proposals
  challengeProposals: defineTable({
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
      python: v.optional(v.string()),
      javascript: v.optional(v.string()),
      typescript: v.optional(v.string()),
      java: v.optional(v.string()),
      cpp: v.optional(v.string()),
    }),
    driverCode: v.optional(
      v.object({
        python: v.optional(v.string()),
        javascript: v.optional(v.string()),
        typescript: v.optional(v.string()),
        java: v.optional(v.string()),
        cpp: v.optional(v.string()),
      })
    ),
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
    order: v.optional(v.number()),
    isPremium: v.optional(v.boolean()),

    // Proposal workflow
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    proposedBy: v.string(),
    proposerName: v.string(),
    proposedAt: v.number(),
    reviewedBy: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
    reviewNote: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_user", ["proposedBy"])
    .index("by_slug", ["slug"]),

  codeExecutions: defineTable({
    userId: v.string(),
    language: v.string(),
    code: v.string(),
    output: v.optional(v.string()),
    error: v.optional(v.string()),
  }).index("by_user_id", ["userId"]),
});
