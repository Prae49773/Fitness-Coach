export function getCapacityState(item, { enrolled = false, enrolledField } = {}) {
  const isEnrolled = enrolled || (enrolledField ? Boolean(item[enrolledField]) : false)
  const raw = item?.spots_left ?? item?.capacity
  const spotsLeft = raw != null && raw !== '' ? Number(raw) : null
  const isFull = spotsLeft != null && spotsLeft <= 0 && !isEnrolled

  let spotsLabel = 'Open'
  if (isEnrolled) {
    spotsLabel = null
  } else if (isFull) {
    spotsLabel = 'Full'
  } else if (spotsLeft != null) {
    spotsLabel = `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left`
  }

  return { spotsLeft, isFull, spotsLabel, isEnrolled }
}
