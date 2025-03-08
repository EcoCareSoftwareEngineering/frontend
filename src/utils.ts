// Get SCSS variable by name
export const getCSSVariable = (variable: string) => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim()
}

// Returns base url for local or remote view
export const getLinkTopLevel = () => {
  return location.pathname.includes('local') ? '/local' : '/remote'
}

// Generate array of objects with Dates for all hour increments from start to end
export const generateAllDates = (startDate: Date, endDate: Date) => {
  const result = []
  const current = new Date(startDate)
  current.setHours(0, 0, 0, 0)

  while (current < endDate) {
    result.push(new Date(current).toISOString())
    current.setHours(current.getHours() + 1)
  }

  return result
}
