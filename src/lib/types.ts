import type { Timestamp } from "firebase/firestore";

export type LeagueTier = "bronze" | "silver" | "gold" | "platinum" | "diamond";

export interface UserDoc {
  displayName: string;
  email: string;
  photoURL: string;
  locale: "id";
  xpTotal: number;
  xpWeekly: number;
  gems: number;
  hearts: { current: number; max: number; lastRegenAt: Timestamp | null };
  streak: {
    current: number;
    longest: number;
    lastActiveDate: string; // YYYY-MM-DD in WIB
    freezes: number;
  };
  vip: { active: boolean; plan: "monthly" | "yearly" | null; expiresAt: Timestamp | null };
  league: { tier: LeagueTier; leagueId: string | null };
  badges: string[];
  reminderTime: string | null; // "HH:mm" WIB
  fcmToken: string | null;
  soundOn: boolean;
  createdAt: Timestamp;
}

export interface LessonProgressDoc {
  status: "completed";
  bestScorePct: number;
  attempts: number;
  completedAt: Timestamp;
}

export interface ActivityDoc {
  lessonsCompleted: number;
  xpEarned: number;
}

export interface DrillResultDoc {
  topicId: string;
  total: number;
  correct: number;
  accuracyPct: number;
  avgTimeMs: number;
  weakTags: string[];
  at: Timestamp;
}

export interface ModuleDoc {
  title: string;
  description: string;
  icon: string; // phosphor icon name key, see MODULE_ICONS
  order: number;
  published: boolean;
  vipOnly: boolean;
}

export interface TopicDoc {
  moduleId: string;
  title: string;
  order: number;
  published: boolean;
  drillTimerSec: number;
}

export interface LessonDoc {
  topicId: string;
  title: string;
  order: number;
  xpReward: number;
  questionIds: string[];
  published: boolean;
}

export type QuestionType = "mc" | "tf" | "fill" | "match";

export interface QuestionDoc {
  topicId: string;
  type: QuestionType;
  prompt: string;
  options: string[]; // mc only
  correctIndex: number; // mc only
  answerBool: boolean; // tf only
  answerText: string; // fill only (case-insensitive match)
  pairs: { left: string; right: string }[]; // match only
  explanation: string;
  difficulty: number; // 1-5
  tags: string[];
  stats: { attempts: number; wrong: number };
}

export interface LeagueDoc {
  tier: LeagueTier;
  weekStart: string; // YYYY-MM-DD WIB Monday
  capacity: number;
  memberCount: number;
  closed: boolean;
}

export interface LeagueMemberDoc {
  displayName: string;
  photoURL: string;
  weeklyXp: number;
  joinedAt: Timestamp;
}

export interface TransactionDoc {
  uid: string;
  kind: "vip" | "gems" | "hearts" | "streak_freeze";
  provider: "midtrans" | "stripe" | "gems";
  amountIDR: number;
  gemsSpent: number;
  status: "pending" | "paid" | "failed";
  providerOrderId: string | null;
  createdAt: Timestamp;
}

export interface AdminRoleDoc {
  role: "superadmin" | "editor";
  grantedBy: string;
  grantedAt: Timestamp;
}

export interface AppConfigDoc {
  heartRegenMinutes: number;
  heartsPerRewardedAd: number;
  gemPricePerHeart: number;
  gemPriceStreakFreeze: number;
  leaguePromoteN: number;
  leagueDemoteN: number;
}

/** Story mode (scaffold only, no UI yet) */
export interface StoryStateDoc {
  officeLevel: number;
  cash: number;
  staff: number;
  pendingEvents: { questionId: string; firedAt: Timestamp }[];
}
