import { motion } from 'framer-motion'
import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold text-text mb-4">Page Not Found</h2>
        <p className="text-text-secondary mb-8">The page you're looking for doesn't exist.</p>
        <Button to="/" size="md">
          Go Home
        </Button>
      </motion.div>
    </div>
  )
}
