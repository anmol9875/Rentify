export const MAX_RENTAL_MONTHS = 3

export const normalizeDate = (date) => {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

export const getMaxRentalEndDate = (startDate) => {
  const maxEndDate = normalizeDate(startDate)
  maxEndDate.setMonth(maxEndDate.getMonth() + MAX_RENTAL_MONTHS)
  return maxEndDate
}

export const isRentalRangeLongerThanMax = (startDate, endDate) => {
  const start = normalizeDate(startDate)
  const end = normalizeDate(endDate)
  const maxEndDate = getMaxRentalEndDate(start)

  return end > maxEndDate
}

export const getOrderedRentalRange = (firstDate, secondDate) => {
  const first = normalizeDate(firstDate)
  const second = normalizeDate(secondDate)

  return first <= second
    ? { start: first, end: second }
    : { start: second, end: first }
}
