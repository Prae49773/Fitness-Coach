export default function PageHeader({ title, subtitle, className = '' }) {
  return (
    <header className={`dashboard-header ${className}`}>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </header>
  )
}
