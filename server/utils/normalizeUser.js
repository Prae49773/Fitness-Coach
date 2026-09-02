export function normalizeUserMetrics(row) {
  if (!row) return null
  return {
    ...row,
    weight: row.weight != null && row.weight !== '' ? Number(row.weight) : null,
    height: row.height != null && row.height !== '' ? Number(row.height) : null,
    age: row.age != null && row.age !== '' ? Number(row.age) : null,
  }
}
