/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as challengeLeaderboard from "../challengeLeaderboard.js";
import type * as challengeSubmissions from "../challengeSubmissions.js";
import type * as challenges from "../challenges.js";
import type * as codeExecutions from "../codeExecutions.js";
import type * as http from "../http.js";
import type * as lemonSqueezy from "../lemonSqueezy.js";
import type * as seed_seedChallenges from "../seed/seedChallenges.js";
import type * as snippets from "../snippets.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  challengeLeaderboard: typeof challengeLeaderboard;
  challengeSubmissions: typeof challengeSubmissions;
  challenges: typeof challenges;
  codeExecutions: typeof codeExecutions;
  http: typeof http;
  lemonSqueezy: typeof lemonSqueezy;
  "seed/seedChallenges": typeof seed_seedChallenges;
  snippets: typeof snippets;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
