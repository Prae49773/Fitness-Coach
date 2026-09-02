export default function AuthField({ label, id, error, className = '', children }) {
  return (
    <div className={`auth-field ${className}`.trim()}>
      {label && (
        <label htmlFor={id} className="auth-field-label">
          {label}
        </label>
      )}
      {children}
      {error && <p className="auth-field-error">{error}</p>}
    </div>
  )
}
