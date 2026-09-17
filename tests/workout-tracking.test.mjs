import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const apiSource = readFileSync(path.join(rootDir, 'src', 'services', 'api.js'), 'utf8')
const userRoutesSource = readFileSync(path.join(rootDir, 'server', 'routes', 'users.js'), 'utf8')

assert.match(apiSource, /getWorkoutProgress|addWorkoutProgress|getWorkoutSchedules|addWorkoutSchedule|getWorkoutReviews|addWorkoutReview/)
assert.match(userRoutesSource, /workout-progress|workout-schedule|workout-reviews/)

console.log('Workout tracking API contract is present.')
