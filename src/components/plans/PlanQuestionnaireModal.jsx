import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../ui/Button'
import Select from '../ui/Select'

export default function PlanQuestionnaireModal({
  open,
  title,
  subtitle,
  questions,
  onClose,
  onSubmit,
  loading = false,
}) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})

  if (!open) return null

  const question = questions[step]
  const isLast = step === questions.length - 1
  const currentAnswer = answers[question.id]

  const handleNext = () => {
    if (!currentAnswer) return
    if (isLast) {
      onSubmit?.(answers)
    } else {
      setStep((s) => s + 1)
    }
  }

  const handleClose = () => {
    setStep(0)
    setAnswers({})
    onClose?.()
  }

  return (
    <div className="plan-modal-overlay" onClick={handleClose}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        className="plan-modal-card card-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="plan-modal-header">
          <p className="plan-modal-step">
            Question {step + 1} of {questions.length}
          </p>
          <h2 className="plan-modal-title">{title}</h2>
          {subtitle && <p className="plan-modal-subtitle">{subtitle}</p>}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            className="plan-modal-question"
          >
            <Select
              label={question.label}
              value={currentAnswer || ''}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
              required
            >
              <option value="" disabled>
                Select an option
              </option>
              {question.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </motion.div>
        </AnimatePresence>

        <div className="plan-modal-progress">
          <div
            className="plan-modal-progress-bar"
            style={{ width: `${((step + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="plan-modal-actions">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={step === 0 ? handleClose : () => setStep((s) => s - 1)}
            disabled={loading}
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>
          <Button type="button" size="md" onClick={handleNext} disabled={!currentAnswer || loading}>
            {loading ? 'Generating...' : isLast ? 'Generate Plan' : 'Next'}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
