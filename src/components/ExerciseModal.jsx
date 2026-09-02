import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Button from './ui/Button'
import { calculateCalories, getRecommendation } from '../utils/exerciseRecommendations'

export default function ExerciseModal({ exercise, onClose }) {
  const [showVideo, setShowVideo] = useState(false)
  const [weight, setWeight] = useState('')
  const [duration, setDuration] = useState('')
  const [calculatedCalories, setCalculatedCalories] = useState(null)
  const [recommendation, setRecommendation] = useState('')

  useEffect(() => {
    if (!exercise) return
    setShowVideo(false)
    setWeight('')
    setDuration('')
    setCalculatedCalories(null)
    setRecommendation('')
  }, [exercise])

  if (!exercise) return null

  const handleCalculate = () => {
    if (!weight || !duration) return
    const weightNum = parseFloat(weight)
    const durationNum = parseFloat(duration)
    if (weightNum <= 0 || durationNum <= 0) return

    const calories = calculateCalories(exercise, weightNum, durationNum)
    const rec = getRecommendation(exercise, weightNum, durationNum, calories)
    setCalculatedCalories(calories)
    setRecommendation(rec)
  }

  const handleClose = () => {
    setShowVideo(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6"
      onClick={handleClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="modal-content bg-surface rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-72 overflow-hidden rounded-t-3xl">
          {showVideo ? (
            <iframe
              src={`https://www.youtube.com/embed/${exercise.videoId}?rel=0`}
              title={exercise.name}
              frameBorder="0"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <img
              src={exercise.image}
              alt={exercise.name}
              className="w-full h-full object-cover object-center"
            />
          )}
        </div>

        <div className="exercise-modal-inner card-content">
          <h3 className="text-3xl font-bold text-text mb-2 text-center">{exercise.name}</h3>
          <div className="text-center mb-6">
            <span className="text-sm font-medium text-yellow-700 bg-yellow-100 px-3 py-1.5 rounded-full">
              {exercise.level}
            </span>
          </div>
          <p className="text-text-secondary mb-8 leading-relaxed">{exercise.description}</p>

          <div className="exercise-modal-calculator">
            <h4 className="text-xl font-bold text-text mb-5 text-center">Calorie Calculator</h4>
            <div className="exercise-modal-fields mb-5">
              <div>
                <label className="block text-sm font-medium text-text mb-2">Your Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-surface border border-border text-text focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition focus-ring"
                  placeholder="e.g., 70"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-surface border border-border text-text focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition focus-ring"
                  placeholder="e.g., 30"
                />
              </div>
            </div>
            <Button onClick={handleCalculate} fullWidth size="md">
              Calculate Calories
            </Button>

            {calculatedCalories !== null && (
              <div className="mt-6 text-center">
                <div className="text-5xl font-bold text-text mb-2">{calculatedCalories}</div>
                <div className="text-text-secondary">calories burned</div>
              </div>
            )}
          </div>

          {recommendation && (
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 mb-2">
              <h4 className="text-lg font-bold text-text mb-2 text-center">Personalized Recommendation</h4>
              <p className="text-text-secondary leading-relaxed">{recommendation}</p>
            </div>
          )}

          <div className="exercise-modal-actions">
            <Button variant="secondary" size="md" fullWidth onClick={handleClose}>
              Close
            </Button>
            <Button size="md" fullWidth onClick={() => setShowVideo(true)}>
              Start Exercise
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
