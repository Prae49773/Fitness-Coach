import { copyFileSync, mkdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const assets = path.resolve(root, '..', '..', '.cursor', 'projects', 'c-Users-Aetoros-projects-Prae', 'assets')

const files = {
  classes: ['morning-yoga.jpg', 'hiit-cardio.jpg', 'strength-training.jpg', 'evening-yoga.jpg'],
  events: ['marathon-training.jpg', 'summer-bootcamp.jpg', 'yoga-retreat.jpg', 'new-year-fitness.jpg'],
  challenges: ['step-challenge.jpg', 'plank-challenge.jpg', 'pushups-challenge.jpg', 'run-5k.jpg'],
}

for (const [folder, names] of Object.entries(files)) {
  const destDir = path.join(root, 'public', 'images', folder)
  mkdirSync(destDir, { recursive: true })
  for (const name of names) {
    const src = path.join(assets, name)
    const dest = path.join(destDir, name)
    if (!existsSync(src)) {
      console.warn(`Missing asset: ${src}`)
      continue
    }
    copyFileSync(src, dest)
    console.log(`Copied ${name} -> public/images/${folder}/`)
  }
}
