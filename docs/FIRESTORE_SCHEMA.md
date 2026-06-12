# Finantrix Firestore Schema

All game-logic dates (streaks, league weeks) are WIB (`Asia/Jakarta`) date
strings `YYYY-MM-DD`. Authoritative types: `src/lib/types.ts`.

## Collections

### `users/{uid}`
| Field | Type | Notes |
|---|---|---|
| displayName, email, photoURL | string | from Google profile |
| locale | `"id"` | |
| xpTotal, xpWeekly | number | weekly reset by league cron |
| gems | number | in-app currency |
| hearts | `{ current, max, lastRegenAt }` | effective hearts derived client-side from elapsed time; VIP ignores |
| streak | `{ current, longest, lastActiveDate, freezes }` | |
| vip | `{ active, plan, expiresAt }` | written by Functions only |
| league | `{ tier, leagueId }` | denormalized for profile badge |
| badges | string[] | badge ids, e.g. `streak-7`, `league-gold` |
| reminderTime | `"HH:mm"` \| null | WIB daily reminder |
| fcmToken | string \| null | Web Push |
| soundOn | boolean | |
| createdAt | timestamp | |

Subcollections:
- `lessonProgress/{lessonId}`: `{ status, bestScorePct, attempts, completedAt }`
- `activity/{YYYY-MM-DD}`: `{ lessonsCompleted, xpEarned }` (profile heatmap)
- `drillResults/{autoId}`: `{ topicId, total, correct, accuracyPct, avgTimeMs, weakTags, at }`

### Content: `modules`, `topics`, `lessons`, `questions`
- `modules/{id}`: `{ title, description, icon, order, published, vipOnly }`
- `topics/{id}`: `{ moduleId, title, order, published, drillTimerSec }`
- `lessons/{id}`: `{ topicId, title, order, xpReward, questionIds[], published }`
- `questions/{id}`:
  `{ topicId, type: mc|tf|fill|match, prompt, options[], correctIndex,
     answerBool, answerText, pairs[{left,right}], explanation,
     difficulty: 1-5, tags[], stats: { attempts, wrong } }`
  Unused fields per type stay at zero values. `stats` is incremented by
  clients via `increment()` (rules allow only +1 deltas).

### `leagues/{leagueId}`
`{ tier, weekStart, capacity, memberCount, closed }`
- `members/{uid}`: `{ displayName, photoURL, weeklyXp, joinedAt }`
- Leaderboard = `onSnapshot(query(members, orderBy("weeklyXp", "desc")))`
- Weekly cron closes leagues, promotes/demotes top/bottom N, zeroes `xpWeekly`.

### `transactions/{txnId}`
`{ uid, kind: vip|gems|hearts|streak_freeze, provider: midtrans|stripe|gems,
   amountIDR, gemsSpent, status: pending|paid|failed, providerOrderId, createdAt }`
Money rows written by Functions; gem-spend rows written by client (rules-validated).

### `adminRoles/{uid}`
`{ role: superadmin|editor, grantedBy, grantedAt }`. Mirrored into custom
claims by the `setAdminRole` callable. Rules check the claim, not the doc.

### `config/app`
`{ heartRegenMinutes, heartsPerRewardedAd, gemPricePerHeart,
   gemPriceStreakFreeze, leaguePromoteN, leagueDemoteN }`

### `storyState/{uid}` (Story Mode scaffold, no UI)
`{ officeLevel, cash, staff, pendingEvents[{questionId, firedAt}] }`

## Composite indexes (`firestore.indexes.json`)
- `topics`: (moduleId asc, order asc)
- `lessons`: (topicId asc, order asc)
- `questions`: (topicId asc, difficulty asc)
- `transactions`: (uid asc, createdAt desc)
- `leagues`: (tier asc, closed asc, memberCount asc)

## Security model (firestore.rules)
- `users/{uid}` subtree: owner read/write; vip and gems fields guarded
  (gems may only decrease from the client or increase by small earn amounts;
  vip writable by Functions/Admin SDK only, which bypasses rules).
- Content: public read where `published == true` (questions readable to
  signed-in users); writes require `request.auth.token.admin == true`.
- `leagues`: signed-in read; member doc writable by its owner with capped
  `weeklyXp` increments; league docs writable by admin/Functions.
- `transactions`: owner read; client create only for `provider == "gems"`.
- `adminRoles`, `config`: admin write; config public read.
