import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import AuthLayout from '../components/auth/AuthLayout'
import Input from '../components/ui/Input'
import PasswordInput from '../components/ui/PasswordInput'
import Select from '../components/ui/Select'
import FormAlert from '../components/ui/FormAlert'
import { IconActivity, IconEmail, IconRuler, IconUser } from '../components/ui/AuthIcons'

export default function Register() {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [exerciseType, setExerciseType] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const nextStep = () => {
    setError('')

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setStep(2)
  }

  const prevStep = () => {
    setError('')
    setStep(1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (step !== 2) {
      nextStep()
      return
    }

    if (!height || !weight || !exerciseType) {
      setError('Please fill in height, weight, and exercise type')
      return
    }

    setLoading(true)

    try {
      const response = await api.auth.register({
        name,
        email,
        password,
        height: parseFloat(height),
        weight: parseFloat(weight),
        exerciseType,
      })
      login(response.user, response.token)
      navigate('/onboarding')
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle={`Step ${step} of 2`}
      footer={
        <>
          Already have an account? <Link to="/login">Sign in</Link>
        </>
      }
    >
      <FormAlert>{error}</FormAlert>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="auth-form-fields"
          >
            <Input
              label="Username"
              icon={<IconUser />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              required
            />

            <Input
              label="Email address"
              type="email"
              icon={<IconEmail />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />

            <PasswordInput
              label="Password"
              id="register-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              autoComplete="new-password"
              required
            />

            <PasswordInput
              label="Confirm password"
              id="register-confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              required
            />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="auth-form-fields"
          >
            <Input
              label="Height in cm"
              type="number"
              icon={<IconRuler />}
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="Height (cm)"
              required
            />

            <Input
              label="Weight in kg"
              type="number"
              icon={<IconRuler />}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Weight (kg)"
              required
            />

            <Select
              label="Exercise type"
              icon={<IconActivity />}
              value={exerciseType}
              onChange={(e) => setExerciseType(e.target.value)}
              required
            >
              <option value="">Exercise type</option>
              <option value="cardio">Cardio</option>
              <option value="strength">Strength Training</option>
              <option value="yoga">Yoga</option>
              <option value="hiit">HIIT</option>
              <option value="mixed">Mixed</option>
            </Select>
          </motion.div>
        )}

        <div className={`auth-form-actions ${step === 1 ? 'auth-form-actions--single' : ''}`}>
          {step > 1 && (
            <button type="button" className="auth-secondary-btn" onClick={prevStep}>
              Back
            </button>
          )}
          {step < 2 ? (
            <button type="button" className="auth-submit-btn" onClick={nextStep}>
              Next
            </button>
          ) : (
            <button type="submit" disabled={loading} className="auth-submit-btn">
              {loading ? 'Please wait...' : 'Create account'}
            </button>
          )}
        </div>
      </form>
    </AuthLayout>
  )
}
