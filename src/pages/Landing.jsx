import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import Footer from '../components/Footer'
import Button from '../components/ui/Button'
import ExerciseModal from '../components/ExerciseModal'
import { exercises } from '../data/exercises'

export default function Landing() {
  const [selectedExercise, setSelectedExercise] = useState(null)
  const { user } = useAuth()

  return (
    <div className="flex flex-1 flex-col bg-background">
      <main className="flex-1 w-full">
        <section className="page-container pt-20 pb-20 md:pt-24 md:pb-24">
          <div className="hero-landing px-2 sm:px-4 min-h-[280px] gap-6">
            <h1 className="w-full text-center text-4xl md:text-6xl lg:text-7xl font-bold text-text leading-tight md:leading-[1.06] lg:leading-[1.04] tracking-tight">
              Your Personal AI Fitness Coach
            </h1>

            <div className="flex w-full max-w-md flex-col items-center justify-center gap-4 sm:max-w-none sm:flex-row">
              {user ? (
                <Button to="/dashboard" size="lg" fullWidth className="sm:w-auto sm:min-w-[11rem]">
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button to="/login" size="lg" fullWidth className="sm:w-auto sm:min-w-[11rem]">
                    Get Started
                  </Button>
                  <Button to="/register" size="lg" variant="secondary" fullWidth className="sm:w-auto sm:min-w-[11rem]">
                    Register
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="pb-24 section-stack">
          <div className="page-container">
            <div className="page-header">
              <h2 className="text-2xl md:text-3xl font-bold text-text">Choose Your Workout</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 place-items-stretch">
              {exercises.map((exercise, index) => (
                <motion.div
                  key={exercise.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  onClick={() => setSelectedExercise(exercise)}
                  className="bg-surface rounded-3xl overflow-hidden cursor-pointer hover:bg-surface-light transition-all group border border-border/30 flex flex-col h-full w-full"
                >
                  <div className="h-56 overflow-hidden flex-shrink-0">
                    <img
                      src={exercise.image}
                      alt={exercise.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="px-6 pt-6 pb-8 lg:px-8 lg:pt-8 lg:pb-10 text-center flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-text mb-2 whitespace-normal break-words">{exercise.name}</h3>
                      <p className="text-text-secondary mb-4 line-clamp-2">{exercise.description}</p>
                    </div>
                    <div className="flex items-center justify-center gap-3 mt-4">
                      <span className="text-sm font-medium text-yellow-700 bg-yellow-100 px-3 py-1.5 rounded-full">{exercise.level}</span>
                      <span className="text-sm font-medium text-text group-hover:text-primary-light transition">View Details &rarr;</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <ExerciseModal
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    </div>
  )
}
