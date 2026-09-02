import { motion } from 'framer-motion'

export default function AuthLayout({ title, subtitle, children, footer, wide = false }) {
  return (
    <div className="auth-page flex flex-1 flex-col items-center justify-center px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={`auth-glass-card ${wide ? 'auth-glass-card--wide' : ''}`}
      >
        <div className="mb-8">
          <h1 className="auth-glass-title">{title}</h1>
          {subtitle && <p className="auth-glass-subtitle">{subtitle}</p>}
        </div>

        {children}

        {footer && <div className="auth-glass-footer">{footer}</div>}
      </motion.div>
    </div>
  )
}
