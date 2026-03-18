# Convex Backend Development Skill

## When to Use
Use this skill when working with the Convex backend — writing queries, mutations, actions, schema changes, or debugging Convex functions.

## Key Context
- Convex functions live in `convex/` directory
- Schema is in `convex/schema.ts` with 11 tables
- Use `npx convex dev` in a separate terminal (never run it via Claude Code — it's long-running)
- Convex has its own TypeScript types — always use `query`, `mutation`, `action` from `convex/server`
- Auth is handled via Clerk — access `ctx.auth.getUserIdentity()` for user info

## Schema Tables (Quick Reference)
| Table | Purpose |
|-------|---------|
| `users` | User accounts, pro status, Clerk integration |
| `codeExecutions` | Track code run history |
| `snippets` | Shared code snippets |
| `snippetComments` | Comments on snippets |
| `stars` | Snippet stars/likes |
| `challenges` | Coding problems with multi-language support |
| `challengeSubmissions` | User submissions with test results |
| `challengeProgress` | Per-user solved/attempted/bookmarked status |
| `challengeUserStats` | Aggregated user statistics |
| `challengeAdmins` | Admin/moderator roles |
| `challengeProposals` | Community-submitted challenges |

## Patterns

### Query pattern
```ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getSomething = query({
  args: { id: v.id("tableName") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
```

### Mutation pattern
```ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createSomething = mutation({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("tableName", {
      userId: identity.subject,
      ...args,
    });
  },
});
```

### Index usage
Always use indexes for queries with filters. Check `schema.ts` for available indexes. Example: `ctx.db.query("challengeSubmissions").withIndex("by_user", q => q.eq("userId", userId))`

## Common Gotchas
- Convex functions are reactive — don't use `useEffect` to fetch, use `useQuery`
- Mutations must be serializable — no external API calls (use `action` for that)
- `v.id("tableName")` is the correct validator for document IDs
- Always validate auth in mutations that modify data
- Use `ctx.db.patch()` for partial updates, `ctx.db.replace()` for full replacement
