import { ReactNode } from "react";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  points: number;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  dateUnlocked?: Date;
}

export type AchievementCategory =
  | "care"
  | "milestones"
  | "social"
  | "library"
  | "podcast"
  | "special";

export interface Challenge {
  requirements: any;
  status: string;
  rewards: any;
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  points: number;
  progress: number;
  maxProgress: number;
  startDate: Date;
  endDate: Date;
  completed: boolean;
  icon: string;
}

export type ChallengeType = "daily" | "weekly" | "special" | "group";

export interface Streak {
  id: any;
  streakId: any;
  activity: string;
  count: number;
  lastUpdated: Date;
}

export interface UserStats {
  challengesCompleted: ReactNode;
  totalPoints: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  achievements: Achievement[];
  activeChallenges: Challenge[];
  completedChallenges: Challenge[];
  streaks: Streak[];
  pointsHistory: PointsTransaction[];
}

export interface PointsTransaction {
  id: string;
  activityType: string;
  points: number;
  description: string;
  timestamp: Date;
}

export interface ActivityPoints {
  // Standard Activities
  feeding: number;
  diaperChange: number;
  napTime: number;
  bathTime: number;
  playtime: number;
  medicalAppointment: number;
  vaccination: number;

  // Bonuses
  photoAttachment: number;
  highQualityPhoto: number;
  rainyDayBonus: number;
  sunnyDayBonus: number;
  snowDayBonus: number;
  severeWeatherBonus: number;
  earlyBirdBonus: number;
  nightOwlBonus: number;
  consistentTimingBonus: number;

  // Streaks
  threeDayStreak: number;
  sevenDayStreak: number;
  thirtyDayStreak: number;
  feedingStreak: number;
}

export const DEFAULT_ACTIVITY_POINTS: ActivityPoints = {
  // Standard Activities
  feeding: 5,
  diaperChange: 5,
  napTime: 5,
  bathTime: 10,
  playtime: 5,
  medicalAppointment: 15,
  vaccination: 20,

  // Bonuses
  photoAttachment: 5,
  highQualityPhoto: 2,
  rainyDayBonus: 10,
  sunnyDayBonus: 5,
  snowDayBonus: 15,
  severeWeatherBonus: 20,
  earlyBirdBonus: 5,
  nightOwlBonus: 5,
  consistentTimingBonus: 10,

  // Streaks
  threeDayStreak: 15,
  sevenDayStreak: 50,
  thirtyDayStreak: 250,
  feedingStreak: 30,
};
