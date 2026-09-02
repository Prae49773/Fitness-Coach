export const VENUE = {
  name: 'Central Rama 2 Gym',
  city: 'Bangkok',
  full: 'Central Rama 2 Gym, Bangkok',
}

export function formatVenue(item) {
  if (item?.venue && item?.city) return `${item.venue}, ${item.city}`
  if (item?.location) return item.location
  return VENUE.full
}
