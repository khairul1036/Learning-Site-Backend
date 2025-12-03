function getSession(dateInput, months) {
  if (![1, 3, 6].includes(months)) {
    const error = new Error("Duration must be 1, 3 or 6 months")
    error.status = 400
    throw error
  }

  // Always work in UTC so there’s no timezone surprise:
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput)
  if (isNaN(d)) throw new Error("Invalid date")

  const month = d.getUTCMonth() // 0–11 (Jan = 0)
  const year = d.getUTCFullYear()

  if (months === 1) {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    return `${monthNames[month]}, ${year}`
  }

  if (months === 3) {
    // 4 possible quarters
    const quarters = [
      "January-March",
      "April-June",
      "July-September",
      "October-December",
    ]
    const label = quarters[Math.floor(month / 3)]
    return `${label} ${year}`
  }

  // months === 6: 2 possible halves
  return month < 6 ? `January-June ${year}` : `July-December ${year}`
}

module.exports = getSession
