import test from 'node:test'
import assert from 'node:assert/strict'

import { buildRewardSummary, buildPassportSummary } from '../src/utils/rewardSystem.js'

test('buildRewardSummary includes reward categories and seasonal badges', () => {
  const summary = buildRewardSummary({
    points: 420,
    xp: 1750,
    level: 4,
    streak: 12,
    badges: [
      { id: 1, title: 'Spring Sprint', seasonal: true, season_name: 'Spring 2026' },
      { id: 2, title: 'Consistency Club', seasonal: false },
    ],
    challengeCount: 3,
    transactions: [{ status: 'completed' }, { status: 'pending' }],
  })

  assert.equal(summary.points, 420)
  assert.equal(summary.level, 4)
  assert.equal(summary.seasonalBadgeCount, 1)
  assert.equal(summary.surpriseRewards.length >= 1, true)
  assert.equal(summary.rewardCategories.includes('partner-discounts'), true)
  assert.equal(summary.rewardCategories.includes('premium-features'), true)
  assert.equal(summary.streakReward.unlocked, true)
})

test('buildPassportSummary keeps public card data concise and shareable', () => {
  const summary = buildPassportSummary({
    user: { name: 'Ava Stone' },
    points: { points: 420, xp: 1750, level: 4 },
    badges: [{ id: 1, title: 'Spring Sprint', verified: true }],
    challenges: [{ id: 1, title: '5K Challenge' }, { id: 2, title: 'Monthly Burn' }],
    records: [{ id: 1, weight: 68, recorded_at: '2026-09-01T00:00:00Z' }],
    programs: [{ id: 1, title: 'Strength Builder' }],
  })

  assert.equal(summary.userName, 'Ava Stone')
  assert.equal(summary.badgeCount, 1)
  assert.equal(summary.challengeCount, 2)
  assert.equal(summary.publicCard.includes('Ava Stone'), true)
  assert.equal(summary.publicCard.includes('Level 4'), true)
  assert.equal(summary.publicCard.includes('Verified'), true)
})
