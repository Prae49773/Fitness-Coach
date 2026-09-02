import { useState } from 'react'
import AuthField from '../auth/AuthField'
import { IconEye, IconEyeOff, IconLock } from './AuthIcons'

export default function PasswordInput({
  label,
  id,
  error,
  className = '',
  icon = <IconLock />,
  ...props
}) {
  const [visible, setVisible] = useState(false)
  const fieldId = id || label?.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  return (
    <AuthField label={label} id={fieldId} error={error} className={className}>
      <div className="auth-field-wrap">
        {icon && <span className="auth-field-icon">{icon}</span>}
        <input
          id={fieldId}
          type={visible ? 'text' : 'password'}
          className="auth-glass-input has-icon pr-12"
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="auth-field-toggle auth-field-toggle--icon"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <IconEyeOff /> : <IconEye />}
        </button>
      </div>
    </AuthField>
  )
}
