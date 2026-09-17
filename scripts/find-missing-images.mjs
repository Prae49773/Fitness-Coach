import fs from 'fs'
import path from 'path'

const root = process.cwd()
const exts = ['.js','.jsx','.sql','.md','.json','.html']

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  let files = []
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) files = files.concat(walk(p))
    else if (exts.includes(path.extname(e.name))) files.push(p)
  }
  return files
}

const files = walk(root)
const regex = /\/images\/[^'"\s\)\]]+/g
const refs = new Set()
for (const f of files) {
  try {
    const text = fs.readFileSync(f, 'utf8')
    const ms = text.matchAll(regex)
    for (const m of ms) refs.add(m[0].replace(/^\//, ''))
  } catch (e) {}
}

const existing = new Set()
function walkImages(dir) {
  if (!fs.existsSync(dir)) return
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walkImages(p)
    else existing.add(path.relative(root, p).replace(/\\/g, '/'))
  }
}
walkImages(path.join(root, 'public','images'))

const missing = [...refs].filter(r => !existing.has(r))
console.log('Referenced images:', [...refs].sort().join('\n'))
console.log('\nExisting images under public/images:', [...existing].sort().join('\n'))
console.log('\nMissing referenced images:')
for (const m of missing) console.log(m)
