import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import AuthLayout from '../components/auth/AuthLayout'
import Input from '../components/ui/Input'
import FormAlert from '../components/ui/FormAlert'
import { IconUser } from '../components/ui/AuthIcons'

export default function Onboarding() {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.name) setName(user.name)
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.auth.onboarding({ name, age })
      const updatedUser = { ...user, ...response.user, onboarding_completed: true }
      login(updatedUser, localStorage.getItem('token'))
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Could not save your profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Set up your profile"
      subtitle="Just a couple more details — your height, weight, and exercise type are already saved"
    >
      <FormAlert>{error}</FormAlert>

      <form onSubmit={handleSubmit} className="auth-form-fields">
        <Input
          label="Full name"
          type="text"
          icon={<IconUser />}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
        />

        <Input
          label="Age"
          type="number"
          icon={<IconUser />}
          required
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="Age"
        />

        <div className="auth-form-actions auth-form-actions--single">
          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? 'Please wait...' : 'Complete setup'}
          </button>
        </div>
      </form>
    </AuthLayout>
  )
}
