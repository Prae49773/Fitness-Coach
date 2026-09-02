export default function FormAlert({ children }) {
  if (!children) return null
  return (
    <div className="auth-glass-alert" role="alert">
      {children}
    </div>
  )
}
