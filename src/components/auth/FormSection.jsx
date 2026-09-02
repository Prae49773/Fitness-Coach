export default function FormSection({ title, children, className = '' }) {
  return (
    <section className={className}>
      {title && <div className="auth-glass-divider">{title}</div>}
      <div className="auth-form-fields">{children}</div>
    </section>
  )
}
