export type Achievement = {
  id: string
  title: string
  description: string
  points: number
  icon: string
  category: 'care' | 'community' | 'research' | 'milestone'
  criteria: {
    type: 'count' | 'streak' | 'quality' | 'engagement'
    target: number
    current: number
  }
}

export type PointsActivity = {
  id: string
  timestamp: number
  category: string
  points: number
  description: string
}

export type UserProgress = {
  totalPoints: number
  level: number
  achievements: Achievement[]
  pointsHistory: PointsActivity[]
  streaks: {
    currentStreak: number
    longestStreak: number
    lastActivityDate: string
  }
}

export const POINTS_CONFIG = {
  careLog: {
    basic: 10,
    detailed: 25,
    withPhoto: 35,
    withMood: 15,
    withNotes: 20,
  },
  milestones: {
    record: 50,
    withPhoto: 75,
    withStory: 100,
  },
  community: {
    post: 20,
    comment: 10,
    helpful: 30,
    share: 15,
  },
  research: {
    surveyComplete: 100,
    dataContribution: 50,
    studyParticipation: 200,
  }
}

export const calculatePoints = (activity: string, details: Record<string, any>): number => {
  let points = 0
  const config = POINTS_CONFIG[activity as keyof typeof POINTS_CONFIG]
  
  if (!config) return 0
  
  Object.entries(details).forEach(([key, value]) => {
    if (value && config[key as keyof typeof config]) {
      points += config[key as keyof typeof config]
    }
  })
  
  return points
}

export const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  300,    // Level 3
  600,    // Level 4
  1000,   // Level 5
  1500,   // Level 6
  2200,   // Level 7
  3000,   // Level 8
  4000,   // Level 9
  5000,   // Level 10
]

export const calculateLevel = (points: number): number => {
  return LEVEL_THRESHOLDS.findIndex(threshold => points < threshold) || LEVEL_THRESHOLDS.length
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-log',
    title: 'First Steps',
    description: 'Record your first care log entry',
    points: 50,
    icon: '📝',
    category: 'care',
    criteria: { type: 'count', target: 1, current: 0 }
  },
  {
    id: 'streak-week',
    title: 'Consistency Champion',
    description: 'Maintain a 7-day logging streak',
    points: 100,
    icon: '🔥',
    category: 'care',
    criteria: { type: 'streak', target: 7, current: 0 }
  },
  {
    id: 'photo-collector',
    title: 'Memory Keeper',
    description: 'Add 10 photos to your logs',
    points: 150,
    icon: '📸',
    category: 'care',
    criteria: { type: 'count', target: 10, current: 0 }
  },
  {
    id: 'research-contributor',
    title: 'Science Supporter',
    description: 'Contribute to 3 research studies',
    points: 300,
    icon: '🔬',
    category: 'research',
    criteria: { type: 'count', target: 3, current: 0 }
  },
  {
    id: 'community-helper',
    title: 'Community Guide',
    description: 'Help 5 other parents with your comments',
    points: 200,
    icon: '🤝',
    category: 'community',
    criteria: { type: 'quality', target: 5, current: 0 }
  },
]

export const checkAchievements = (
  userProgress: UserProgress,
  activity: string,
  details: Record<string, any>
): Achievement[] => {
  const newAchievements: Achievement[] = []
  
  ACHIEVEMENTS.forEach(achievement => {
    const hasAchievement = userProgress.achievements.find(a => a.id === achievement.id)
    if (hasAchievement) return
    
    let qualified = false
    switch (achievement.criteria.type) {
      case 'count':
        qualified = details.count >= achievement.criteria.target
        break
      case 'streak':
        qualified = userProgress.streaks.currentStreak >= achievement.criteria.target
        break
      case 'quality':
        qualified = details.qualityCount >= achievement.criteria.target
        break
      case 'engagement':
        qualified = details.engagementScore >= achievement.criteria.target
        break
    }
    
    if (qualified) {
      newAchievements.push(achievement)
    }
  })
  
  return newAchievements
}

export const formatPoints = (points: number): string => {
  return points.toLocaleString()
}
