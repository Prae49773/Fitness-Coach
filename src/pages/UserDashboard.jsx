import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getActiveDashboardTab } from '../constants/dashboardTabs'
import PageHeader from '../components/ui/PageHeader'
import StatsCard from '../components/StatsCard'
import ClassCard from '../components/ClassCard'
import EventCard from '../components/EventCard'
import ChallengeCard from '../components/ChallengeCard'
import NutritionPlanCard from '../components/NutritionPlanCard'
import FoodLog from '../components/FoodLog'
import WorkoutHistory from '../components/WorkoutHistory'
import AIPlanCard from '../components/plans/AIPlanCard'
import WorkoutPlanDisplay from '../components/plans/WorkoutPlanDisplay'
import PlanQuestionnaireModal from '../components/plans/PlanQuestionnaireModal'
import UserActivityPanel from '../components/UserActivityPanel'
import ActiveMealPlanPanel from '../components/ActiveMealPlanPanel'
import UserProfilePanel from '../components/UserProfilePanel'
import Toast from '../components/ui/Toast'
import { mergeProfile, computeBmi, bmiCategory } from '../utils/profile'
import { WORKOUT_QUESTIONS } from '../constants/workoutQuestions'
import { NUTRITION_QUESTIONS } from '../constants/nutritionQuestions'

export default function UserDashboard() {
  const { user, updateUser } = useAuth()
  const [workoutPlan, setWorkoutPlan] = useState(null)
  const [nutritionPlan, setNutritionPlan] = useState(null)
  const [classes, setClasses] = useState([])
  const [events, setEvents] = useState([])
  const [challenges, setChallenges] = useState([])
  const [foodLogs, setFoodLogs] = useState([])
  const [exerciseLogs, setExerciseLogs] = useState([])
  const [bookings, setBookings] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [myChallenges, setMyChallenges] = useState([])
  const [mealPlans, setMealPlans] = useState([])
  const [myMealPlans, setMyMealPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [dataError, setDataError] = useState('')
  const [workoutModalOpen, setWorkoutModalOpen] = useState(false)
  const [nutritionModalOpen, setNutritionModalOpen] = useState(false)
  const [workoutGenerating, setWorkoutGenerating] = useState(false)
  const [nutritionGenerating, setNutritionGenerating] = useState(false)
  const [workoutLogging, setWorkoutLogging] = useState(false)
  const [dashboardStats, setDashboardStats] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionKey, setActionKey] = useState(null)
  const [toast, setToast] = useState(null)
  const [searchParams] = useSearchParams()
  const activeTab = getActiveDashboardTab(searchParams.toString())

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const safe = (promise, fallback) => promise.catch(() => fallback)

    setDataError('')
    try {
      const healthOk = await fetch('/api/health').then((r) => r.ok).catch(() => false)
      if (!healthOk) {
        setDataError('Backend is offline or outdated. Stop the terminal and run npm run dev again.')
      }

      const [
        profileData,
        statsData,
        classesData,
        eventsData,
        challengesData,
        foodData,
        exerciseData,
        bookingsData,
        registrationsData,
        myChallengesData,
        mealPlansData,
        myMealPlansData,
        latestWorkout,
        latestNutrition,
      ] = await Promise.all([
        safe(api.users.getProfile(), null),
        safe(api.users.getDashboardStats(), null),
        safe(api.classes.getAll(), []),
        safe(api.events.getAll(), []),
        safe(api.challenges.getAll(), []),
        safe(api.users.getFoodLogs(), []),
        safe(api.users.getExerciseLogs(), []),
        safe(api.classes.getMyBookings(), []),
        safe(api.events.getMyRegistrations(), []),
        safe(api.challenges.getMyChallenges(), []),
        safe(api.nutrition.getPlans(), []),
        safe(api.nutrition.getMyPlans(), []),
        safe(api.workout.getLatest(), null),
        safe(api.nutrition.getLatest(), null),
      ])

      if (profileData) {
        updateUser(profileData)
        setUserProfile(profileData)
      }
      setDashboardStats(statsData)
      setClasses(classesData)
      setEvents(eventsData)
      setChallenges(challengesData)
      setFoodLogs(foodData)
      setExerciseLogs(exerciseData)
      setBookings(bookingsData)
      setRegistrations(registrationsData)
      setMyChallenges(myChallengesData)
      setMealPlans(mealPlansData)
      setMyMealPlans(myMealPlansData)
      setWorkoutPlan(latestWorkout)
      setNutritionPlan(latestNutrition)
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleWorkoutQuestionnaire = async (answers) => {
    setWorkoutGenerating(true)
    try {
      const plan = await api.workout.generate({ answers })
      setWorkoutPlan(plan)
      setWorkoutModalOpen(false)
    } catch (err) {
      alert(err.message)
    } finally {
      setWorkoutGenerating(false)
    }
  }

  const handleNutritionQuestionnaire = async (answers) => {
    setNutritionGenerating(true)
    try {
      const plan = await api.nutrition.generate({ answers })
      setNutritionPlan(plan)
      setNutritionModalOpen(false)
    } catch (err) {
      alert(err.message)
    } finally {
      setNutritionGenerating(false)
    }
  }

  const handleLogWorkout = async (data) => {
    setWorkoutLogging(true)
    try {
      await api.users.addExerciseLog(data)
      await loadData()
      setToast({ type: 'success', message: 'Workout saved to History' })
    } catch (err) {
      setToast({ type: 'error', message: err.message })
    } finally {
      setWorkoutLogging(false)
    }
  }

  const runAction = async (key, action, successMessage) => {
    setActionLoading(true)
    setActionKey(key)
    try {
      await action()
      await loadData()
      setToast({ type: 'success', message: successMessage })
    } catch (err) {
      setToast({ type: 'error', message: err.message })
    } finally {
      setActionLoading(false)
      setActionKey(null)
    }
  }

  const handleBookClass = async (classItem) => {
    await runAction(
      `class-${classItem.id}`,
      () => api.classes.book(classItem.id),
      `Booked ${classItem.name}`
    )
  }

  const handleCancelBooking = async (classItem) => {
    await runAction(
      `class-${classItem.id}`,
      () => api.classes.cancel(classItem.id),
      'Booking cancelled'
    )
  }

  const handleRegisterEvent = async (event) => {
    await runAction(
      `event-${event.id}`,
      () => api.events.register(event.id),
      `Registered for ${event.name}`
    )
  }

  const handleCancelRegistration = async (event) => {
    await runAction(
      `event-${event.id}`,
      () => api.events.cancel(event.id),
      'Registration cancelled'
    )
  }

  const handleJoinChallenge = async (challenge) => {
    await runAction(
      `challenge-${challenge.id}`,
      () => api.challenges.join(challenge.id),
      `Joined ${challenge.name}`
    )
  }

  const handleLeaveChallenge = async (challenge) => {
    await runAction(
      `challenge-${challenge.id}`,
      () => api.challenges.leave(challenge.id),
      'Left challenge'
    )
  }

  const handleActivatePlan = async (plan) => {
    await runAction(
      `plan-${plan.id}`,
      () => api.nutrition.activatePlan(plan.id),
      `${plan.name} started — log today's meals below`
    )
  }

  const handleDeactivatePlan = async (plan) => {
    await runAction(
      `plan-${plan.id}`,
      () => api.nutrition.deactivatePlan(plan.id),
      'Meal plan deactivated'
    )
  }

  const handleLogMeal = async (plan, slot) => {
    setActionLoading(true)
    setActionKey(`meal-${plan.id}-${slot}`)
    try {
      const result = await api.nutrition.logMeal(plan.id, { slot })
      await loadData()
      setToast({
        type: 'success',
        message: `Logged ${slot} — ${result.calories_logged_today}/${result.daily_target} kcal today`,
      })
    } catch (err) {
      setToast({ type: 'error', message: err.message })
    } finally {
      setActionLoading(false)
      setActionKey(null)
    }
  }

  const handleLogChallengeProgress = async (challenge, amount) => {
    setActionLoading(true)
    setActionKey(`challenge-${challenge.id}-progress`)
    try {
      const result = await api.challenges.logProgress(challenge.id, { amount })
      await loadData()
      setToast({
        type: 'success',
        message: `Progress updated — ${result.progress_pct}% complete`,
      })
    } catch (err) {
      setToast({ type: 'error', message: err.message })
    } finally {
      setActionLoading(false)
      setActionKey(null)
    }
  }

  const handleAddFood = async (food) => {
    try {
      await api.users.addFoodLog(food)
      await loadData()
      setToast({ type: 'success', message: 'Food logged' })
    } catch (err) {
      setToast({ type: 'error', message: err.message })
    }
  }

  const profile = mergeProfile(user, userProfile, dashboardStats?.profile)

  const handleSaveProfile = async ({ weight, height, age }) => {
    try {
      setActionLoading(true)
      setActionKey('profile-save')
      const updated = await api.users.updateProfile({
        name: profile.name,
        weight,
        height,
        age,
        goal: profile.goal,
      })
      updateUser(updated)
      setUserProfile(updated)
      const statsData = await api.users.getDashboardStats()
      setDashboardStats(statsData)
      setToast({ type: 'success', message: 'Profile updated' })
    } catch (err) {
      setToast({ type: 'error', message: err.message })
    } finally {
      setActionLoading(false)
      setActionKey(null)
    }
  }

  const bmi = computeBmi(profile.weight, profile.height)
  const bmiLabel = bmiCategory(bmi)

  const weightChartData = dashboardStats?.weight_chart?.length
    ? dashboardStats.weight_chart
    : profile.weight
      ? [{ date: 'Now', weight: profile.weight }]
      : []

  const caloriesChartData = dashboardStats?.weekly_calories_chart?.length
    ? dashboardStats.weekly_calories_chart
    : [{ date: '—', calories: 0 }]

  const tabHeaders = {
    overview: { title: 'Dashboard', subtitle: 'Track your fitness journey' },
    classes: { title: 'Fitness Classes', subtitle: 'Book your next class' },
    events: { title: 'Fitness Events', subtitle: 'Register for upcoming events' },
    challenges: { title: 'Challenges', subtitle: 'Join challenges and push your limits' },
    nutrition: { title: 'Nutrition', subtitle: 'Choose a meal plan and track your daily food intake' },
    history: { title: 'History', subtitle: 'Your workout and exercise history' },
    profile: { title: 'Profile', subtitle: 'Your stats, body metrics, and memberships' },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg" style={{ color: 'rgba(0,0,0,0.5)' }}>Loading...</div>
      </div>
    )
  }

  const header = tabHeaders[activeTab]

  return (
    <div className="dashboard-page">
      <main className="page-container dashboard-main">
        <PageHeader title={header.title} subtitle={header.subtitle} />

        {dataError && (
          <div className="auth-glass-alert mb-6 text-center">
            {dataError}
          </div>
        )}

        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="dashboard-grid dashboard-grid--stats dashboard-section">
              <StatsCard title="BMI" value={bmi || 'N/A'} change={bmiLabel} />
              <StatsCard
                title="Current Weight"
                value={profile.weight ? `${profile.weight} kg` : 'N/A'}
                change={profile.goal ? `Goal: ${profile.goal}` : profile.height ? `${profile.height} cm tall` : ''}
              />
              <StatsCard
                title="Calories Burned"
                value={dashboardStats ? dashboardStats.calories_this_week.toLocaleString() : '0'}
                change="This week"
              />
              <StatsCard
                title="Workouts"
                value={String(dashboardStats?.workouts_this_month ?? exerciseLogs.length)}
                change="This month"
              />
            </div>

            <div className="dashboard-grid dashboard-grid--2 dashboard-section">
              <UserActivityPanel
                bookings={bookings}
                registrations={registrations}
                myChallenges={myChallenges}
                myMealPlans={myMealPlans}
                stats={dashboardStats}
              />

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="dashboard-card card-content">
                <h3 className="dashboard-card-title">Weight Progress</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={weightChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip />
                    <Line type="monotone" dataKey="weight" stroke="#000000" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            <div className="dashboard-section">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="dashboard-card card-content">
                <h3 className="dashboard-card-title">Calories Burned</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={caloriesChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="calories" stroke="#000000" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {workoutPlan ? (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="dashboard-card card-content"
                >
                  <WorkoutPlanDisplay
                    plan={workoutPlan}
                    onRetake={() => setWorkoutModalOpen(true)}
                    onLogWorkout={handleLogWorkout}
                    logging={workoutLogging}
                  />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <AIPlanCard
                    type="nutrition"
                    plan={nutritionPlan}
                    loading={nutritionGenerating}
                    onStart={() => setNutritionModalOpen(true)}
                  />
                </motion.div>
              </>
            ) : (
              <div className="dashboard-grid dashboard-grid--2">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <AIPlanCard
                    type="workout"
                    plan={workoutPlan}
                    loading={workoutGenerating}
                    onStart={() => setWorkoutModalOpen(true)}
                  />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <AIPlanCard
                    type="nutrition"
                    plan={nutritionPlan}
                    loading={nutritionGenerating}
                    onStart={() => setNutritionModalOpen(true)}
                  />
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'classes' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {classes.length === 0 ? (
              <p className="text-center" style={{ color: 'rgba(0,0,0,0.5)' }}>
                No classes loaded. {dataError || 'Check that the backend is running.'}
              </p>
            ) : (
            <div className="dashboard-grid dashboard-grid--3">
              {classes.map((cls) => (
                <ClassCard
                  key={cls.id}
                  fitnessClass={cls}
                  onBook={handleBookClass}
                  onCancel={handleCancelBooking}
                  loading={actionLoading}
                  actionKey={actionKey}
                />
              ))}
            </div>
            )}
            {bookings.length > 0 && (
              <div className="dashboard-section" style={{ marginTop: '3rem' }}>
                <h2 className="dashboard-section-title">My Bookings</h2>
                <div className="dashboard-grid dashboard-grid--3">
                  {bookings.map((booking) => (
                    <ClassCard
                      key={booking.id}
                      fitnessClass={booking}
                      booking
                      onCancel={handleCancelBooking}
                      loading={actionLoading}
                      actionKey={actionKey}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'events' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {events.length === 0 ? (
              <p className="text-center" style={{ color: 'rgba(0,0,0,0.5)' }}>
                No events loaded. {dataError || 'Check that the backend is running.'}
              </p>
            ) : (
            <>
            <div className="dashboard-grid dashboard-grid--3">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onRegister={handleRegisterEvent}
                  onCancel={handleCancelRegistration}
                  loading={actionLoading}
                  actionKey={actionKey}
                />
              ))}
            </div>
            {registrations.length > 0 && (
              <div className="dashboard-section" style={{ marginTop: '3rem' }}>
                <h2 className="dashboard-section-title">My Registrations</h2>
                <div className="dashboard-grid dashboard-grid--3">
                  {registrations.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      registered
                      onCancel={handleCancelRegistration}
                      loading={actionLoading}
                      actionKey={actionKey}
                    />
                  ))}
                </div>
              </div>
            )}
            </>
            )}
          </motion.div>
        )}

        {activeTab === 'challenges' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {challenges.length === 0 ? (
              <p className="text-center" style={{ color: 'rgba(0,0,0,0.5)' }}>
                No challenges loaded. {dataError || 'Check that the backend is running.'}
              </p>
            ) : (
            <>
            <div className="dashboard-grid dashboard-grid--3">
              {challenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onJoin={handleJoinChallenge}
                  onLeave={handleLeaveChallenge}
                  onLogProgress={handleLogChallengeProgress}
                  loading={actionLoading}
                  actionKey={actionKey}
                />
              ))}
            </div>
            {myChallenges.length > 0 && (
              <div className="dashboard-section" style={{ marginTop: '3rem' }}>
                <h2 className="dashboard-section-title">My Challenges</h2>
                <div className="dashboard-grid dashboard-grid--3">
                  {myChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      joined
                      onLeave={handleLeaveChallenge}
                      onLogProgress={handleLogChallengeProgress}
                      loading={actionLoading}
                      actionKey={actionKey}
                    />
                  ))}
                </div>
              </div>
            )}
            </>
            )}
          </motion.div>
        )}

        {activeTab === 'nutrition' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {myMealPlans.length > 0 && (
              <div className="dashboard-section">
                {myMealPlans.map((plan) => (
                  <ActiveMealPlanPanel
                    key={plan.id}
                    plan={plan}
                    onLogMeal={handleLogMeal}
                    logging={actionLoading}
                    actionKey={actionKey}
                  />
                ))}
              </div>
            )}

            {mealPlans.length === 0 ? (
              <p className="text-center dashboard-empty-message">
                No meal plans loaded. {dataError || 'Check that the backend is running.'}
              </p>
            ) : (
            <div className="dashboard-grid dashboard-grid--3 dashboard-section">
              {mealPlans.map((plan) => (
                <NutritionPlanCard
                  key={plan.id}
                  plan={plan}
                  onActivate={handleActivatePlan}
                  onDeactivate={handleDeactivatePlan}
                  loading={actionLoading}
                  actionKey={actionKey}
                />
              ))}
            </div>
            )}
            {myMealPlans.length > 0 && (
              <div className="dashboard-section">
                <h2 className="dashboard-section-title">Active Plans</h2>
                <div className="dashboard-grid dashboard-grid--3">
                  {myMealPlans.map((plan) => (
                    <NutritionPlanCard
                      key={plan.id}
                      plan={plan}
                      active
                      onDeactivate={handleDeactivatePlan}
                      loading={actionLoading}
                      actionKey={actionKey}
                    />
                  ))}
                </div>
              </div>
            )}
            <div className="dashboard-section">
              <FoodLog
                foods={foodLogs}
                onAdd={handleAddFood}
                dailyTarget={myMealPlans[0]?.daily_calories}
              />
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <WorkoutHistory workouts={exerciseLogs} />
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <UserProfilePanel
              profile={profile}
              bmi={bmi}
              bmiLabel={bmiLabel}
              stats={dashboardStats}
              bookings={bookings}
              registrations={registrations}
              myChallenges={myChallenges}
              myMealPlans={myMealPlans}
              workoutPlan={workoutPlan}
              nutritionPlan={nutritionPlan}
              exerciseLogs={exerciseLogs}
              foodLogs={foodLogs}
              onSaveProfile={handleSaveProfile}
              saving={actionLoading && actionKey === 'profile-save'}
            />
          </motion.div>
        )}
      </main>

      <PlanQuestionnaireModal
        open={workoutModalOpen}
        title="Workout Assessment"
        subtitle="Based on ACSM exercise prescription guidelines (FITT principles)"
        questions={WORKOUT_QUESTIONS}
        loading={workoutGenerating}
        onClose={() => setWorkoutModalOpen(false)}
        onSubmit={handleWorkoutQuestionnaire}
      />

      <PlanQuestionnaireModal
        open={nutritionModalOpen}
        title="Nutrition Assessment"
        subtitle="Based on Mifflin-St Jeor, DRI activity factors & AMDR macro ranges"
        questions={NUTRITION_QUESTIONS}
        loading={nutritionGenerating}
        onClose={() => setNutritionModalOpen(false)}
        onSubmit={handleNutritionQuestionnaire}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
