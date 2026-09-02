import AuthField from '../auth/AuthField'

export default function Input({
  label,
  id,
  icon,
  error,
  className = '',
  as = 'input',
  ...props
}) {
  const fieldId = id || label?.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  return (
    <AuthField label={label} id={fieldId} error={error} className={className}>
      <div className="auth-field-wrap">
        {icon && <span className="auth-field-icon">{icon}</span>}
        {as === 'textarea' ? (
          <textarea
            id={fieldId}
            className={`auth-glass-input auth-glass-textarea ${icon ? 'has-icon' : ''}`}
            {...props}
          />
        ) : (
          <input
            id={fieldId}
            className={`auth-glass-input ${icon ? 'has-icon' : ''}`}
            {...props}
          />
        )}
      </div>
    </AuthField>
  )
}
