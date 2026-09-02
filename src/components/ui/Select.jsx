import AuthField from '../auth/AuthField'

export default function Select({ label, id, error, className = '', icon, children, ...props }) {
  const fieldId = id || label?.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  return (
    <AuthField label={label} id={fieldId} error={error} className={className}>
      <div className="auth-select-wrap auth-field-wrap">
        {icon && <span className="auth-field-icon">{icon}</span>}
        <select id={fieldId} className={`auth-glass-input ${icon ? 'has-icon' : ''}`} {...props}>
          {children}
        </select>
        <span className="auth-select-chevron" aria-hidden="true">
          ▾
        </span>
      </div>
    </AuthField>
  )
}
