import app, { ensureDb } from './app.js'

const PORT = process.env.PORT || 5000

ensureDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err)
    process.exit(1)
  })
