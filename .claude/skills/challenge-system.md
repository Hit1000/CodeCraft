# Coding Challenges System Skill

## When to Use
Use this skill when working on the challenges feature — challenge pages, submission logic, test evaluation, leaderboard, or admin panel.

## Key Files
- **Store**: `src/store/useChallengeStore.ts` — filters, solving state, test results
- **Code Builder**: `src/lib/buildExecutableCode.ts` — wraps user code with driver/test templates
- **Challenge Pages**: `src/app/challenges/`
- **Challenge Components**: Components in `src/app/challenges/[slug]/`
- **Convex Functions**: `convex/challenges.ts`, `convex/challengeSubmissions.ts`

## Code Execution Flow for Challenges
1. User writes code in Monaco Editor (challenge page)
2. `buildExecutableCode()` wraps user code with a language-specific driver template
3. Template variables injected: `{{USER_CODE}}`, `{{TEST_INPUT}}`, `{{EXPECTED_OUTPUT}}`, `{{TEST_ID}}`, `{{TEST_INDEX}}`
4. Wrapped code sent to Piston via `/api/execute/` proxy route
5. Output parsed by `parseExecutionResults()` — looks for standardized output lines:
   - `PASS:<id>:<runtime>`
   - `FAIL:<id>:expected=<val>:actual=<val>:<runtime>`
   - `ERROR:<id>:<msg>`
   - `__TOTAL_RUNTIME__:<ms>`
6. Results stored in `challengeSubmissions` with detailed test case breakdowns

## Challenge Statuses
- `Accepted` — all test cases passed
- `Wrong Answer` — output mismatch
- `Runtime Error` — code crashed
- `Time Limit Exceeded` — too slow
- `Compilation Error` — code didn't compile

## Patterns

### Adding a new language to challenges
1. Add language config to `src/app/(root)/_constants/index.ts`
2. Add driver template in `src/lib/buildExecutableCode.ts` for that language
3. Add starter code in the challenge's `starterCode` map

### Challenge difficulty levels
`Easy` | `Medium` | `Hard`

### Categories
`DSA` (Data Structures & Algorithms) | `AI/ML` (Artificial Intelligence & Machine Learning)

## Zustand Store (useChallengeStore)
Key state: `search`, `difficulty`, `category`, `subcategory`, `status`, `tag`, `activeLanguage`, `code`, `testResults`, `isSubmitting`, `submissionStatus`

## Admin System
- Admins stored in `challengeAdmins` table with roles: `admin` | `moderator`
- Admin panel at `/challenges/admin`
- Protected by `AdminGuard.tsx` component
