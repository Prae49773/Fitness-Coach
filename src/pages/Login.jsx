import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import AuthLayout from '../components/auth/AuthLayout'
import Input from '../components/ui/Input'
import PasswordInput from '../components/ui/PasswordInput'
import FormAlert from '../components/ui/FormAlert'
import { IconEmail, IconLock } from '../components/ui/AuthIcons'

function safeNextPath(next) {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return null
  return next
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.auth.login({ email, password })
      login(response.user, response.token)
      const next = safeNextPath(searchParams.get('next'))
      if (!response.user.onboarding_completed) {
        navigate('/onboarding')
      } else {
        navigate(next || '/dashboard')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account"
      footer={
        <>
          Don&apos;t have an account? <Link to="/register">Sign up</Link>
        </>
      }
    >
      <FormAlert>{error}</FormAlert>

      <form onSubmit={handleSubmit} className="auth-form-fields">
        <Input
          label="Email address"
          type="email"
          icon={<IconEmail />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          autoComplete="email"
          required
        />

        <PasswordInput
          label="Password"
          id="login-password"
          icon={<IconLock />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="current-password"
          required
        />

        <div className="auth-form-actions auth-form-actions--single">
          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? 'Please wait...' : 'Sign in'}
          </button>
        </div>
      </form>
    </AuthLayout>
  )
}
