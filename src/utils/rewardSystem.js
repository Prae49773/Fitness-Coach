export function buildRewardSummary({
  points = 0,
  xp = 0,
  level = 1,
  streak = 0,
  badges = [],
  challengeCount = 0,
  transactions = [],
} = {}) {
  const seasonalBadges = (badges || []).filter((badge) => badge?.seasonal || badge?.season_name)
  const rewardCategories = [
    'partner-discounts',
    'gym-benefits',
    'merchandise',
    'premium-features',
  ]

  const surpriseRewards = []
  if (streak >= 7) surpriseRewards.push('Consistency streak bonus')
  if (challengeCount >= 2) surpriseRewards.push('Team challenge boost')
  if ((points || 0) >= 200) surpriseRewards.push('Personal improvement reward')
  if ((transactions || []).length >= 2) surpriseRewards.push('Loyalty milestone trophy')

  const streakReward = {
    unlocked: streak >= 7,
    label: streak >= 7 ? 'Streak reward unlocked' : 'Protect your streak for a bonus',
    pointsBonus: streak >= 7 ? 75 : 0,
  }

  return {
    points: Number(points) || 0,
    xp: Number(xp) || 0,
    level: Number(level) || 1,
    streak: Number(streak) || 0,
    seasonalBadgeCount: seasonalBadges.length,
    rewardCategories,
    surpriseRewards,
    streakReward,
  }
}

export function buildPassportSummary({
  user = {},
  points = {},
  badges = [],
  challenges = [],
  records = [],
  programs = [],
} = {}) {
  const userName = user?.name || 'Fitness Member'
  const level = Number(points?.level || 1)
  const badgeCount = Array.isArray(badges) ? badges.length : 0
  const verifiedBadges = (badges || []).filter((badge) => badge?.verified).length
  const challengeCount = Array.isArray(challenges) ? challenges.length : 0
  const programCount = Array.isArray(programs) ? programs.length : 0
  const recordCount = Array.isArray(records) ? records.length : 0
  const skillLevel = `Level ${level}`

  const publicCard = [
    `Fitness Passport`,
    userName,
    `Level ${level} • ${points?.points ?? 0} points • ${points?.xp ?? 0} XP`,
    `Verified: ${verifiedBadges} badge${verifiedBadges === 1 ? '' : 's'}`,
    `Challenges: ${challengeCount} • Programs: ${programCount} • Records: ${recordCount}`,
    `Achievement summary: ${badgeCount} earned badge${badgeCount === 1 ? '' : 's'} and a ${skillLevel.toLowerCase()} profile.`,
  ].join('\n')

  return {
    userName,
    badgeCount,
    verifiedBadges,
    challengeCount,
    programCount,
    recordCount,
    skillLevel,
    publicCard,
  }
}
